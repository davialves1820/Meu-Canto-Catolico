import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { LiturgiaDiaria, LiturgiaInsights } from "@/types/liturgia";
import { getDb } from "@/lib/server/db";

const MODEL = "gemini-3.6-flash";

// Falhas não ficam guardadas (de propósito, para permitir nova tentativa depois) —
// mas sem alguma trava, cada visita durante uma instabilidade da API dispara uma
// chamada nova, o que rapidamente estoura o rate limit (429) e realimenta o ciclo.
// Este cooldown em memória evita bater na API de novo por um tempo após uma falha.
const COOLDOWN_MS = 5 * 60 * 1000;
const ultimaFalhaPorData = new Map<string, number>();

setInterval(() => {
  const agora = Date.now();
  for (const [data, timestamp] of ultimaFalhaPorData.entries()) {
    if (agora - timestamp >= COOLDOWN_MS) {
      ultimaFalhaPorData.delete(data);
    }
  }
}, COOLDOWN_MS);

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    contextoHistoricoCultural: {
      type: Type.STRING,
      description:
        "Explicação clara do contexto histórico, geográfico e cultural das leituras (costumes judaicos, geografia bíblica, Império Romano).",
    },
    conexoesTeologicas: {
      type: Type.STRING,
      description:
        "Como a Primeira Leitura e o Salmo se conectam tipologicamente ao Evangelho do dia.",
    },
    ecoPatristico: {
      type: Type.ARRAY,
      description:
        "Comentários dos Padres e Doutores da Igreja (Santo Agostinho, São Tomás de Aquino, São João Crisóstomo, São Jerônimo, etc.).",
      items: {
        type: Type.OBJECT,
        properties: {
          autor: { type: Type.STRING, description: "Nome do Padre ou Doutor da Igreja." },
          obraReferencia: { type: Type.STRING, description: "Obra de referência (opcional)." },
          citacaoOuResumo: { type: Type.STRING, description: "Citação direta ou resumo do comentário teológico." },
        },
        required: ["autor", "citacaoOuResumo"],
      },
    },
    aplicacaoPratica: {
      type: Type.ARRAY,
      description: "Perguntas de reflexão prática para exame de consciência e Lectio Divina.",
      items: { type: Type.STRING },
    },
  },
  required: ["contextoHistoricoCultural", "conexoesTeologicas", "ecoPatristico", "aplicacaoPratica"],
};

const SYSTEM_INSTRUCTION = `
Você é um exegeta e teólogo católico com profundo conhecimento na Patrística, no Magistério da Igreja e na hermenêutica bíblica católica.

Sua tarefa é analisar os textos litúrgicos fornecidos (Primeira Leitura, Salmo, Segunda Leitura se houver, e Evangelho) e gerar uma análise estruturada contendo:
1. Contexto histórico e cultural detalhado e fidedigno.
2. Harmonia e conexão teológica entre o Antigo e o Novo Testamento presentes nas leituras.
3. Comentários patrísticos (Santo Agostinho, São Tomás de Aquino, São João Crisóstomo, São Jerônimo, etc.).
4. Aplicação prática para o cotidiano dos fiéis.

Mantenha fidelidade doutrinária à tradição da Igreja Católica e retorne estritamente o JSON válido conforme o schema definido.
`.trim();

function montarPrompt(liturgia: LiturgiaDiaria): string {
  const partes = [
    `Data Litúrgica: ${liturgia.data} — ${liturgia.liturgia}`,
    `[PRIMEIRA LEITURA] ${liturgia.primeiraLeitura.referencia}\n${liturgia.primeiraLeitura.texto}`,
    `[SALMO RESPONSORIAL] ${liturgia.salmo.referencia}\n${liturgia.salmo.texto}`,
    liturgia.segundaLeitura?.texto
      ? `[SEGUNDA LEITURA] ${liturgia.segundaLeitura.referencia}\n${liturgia.segundaLeitura.texto}`
      : null,
    `[EVANGELHO] ${liturgia.evangelho.referencia}\n${liturgia.evangelho.texto}`,
  ];

  return partes.filter(Boolean).join("\n\n");
}

async function gerarInsights(liturgia: LiturgiaDiaria): Promise<LiturgiaInsights> {
  const ai = getClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: montarPrompt(liturgia),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
      // Sem isso, o SDK tenta até 5x com backoff exponencial (chega a ~90s) quando a
      // API do Gemini está instável — e essa espera bloqueia o carregamento da home
      // inteira por ser um enriquecimento opcional, não algo crítico. Mas o deadline
      // precisa ser generoso: é um JSON grande (contexto histórico, conexões
      // teológicas, comentários patrísticos e perguntas de aplicação prática) e 15s
      // não bastava — a própria API devolvia 504 DEADLINE_EXCEEDED antes de terminar
      // de gerar. Como a chamada roda dentro de um Suspense, não bloqueia a home.
      httpOptions: { timeout: 45_000, retryOptions: { attempts: 2 } },
    },
  });

  if (!response.text) {
    throw new Error("Resposta vazia da API do Gemini.");
  }

  return JSON.parse(response.text) as LiturgiaInsights;
}

async function buscarInsightsSalvos(db: NonNullable<ReturnType<typeof getDb>>, chaveData: string): Promise<LiturgiaInsights | null> {
  try {
    const [linha] = await db<{ insights: LiturgiaInsights | string }[]>`
      select insights from liturgia_insights where data = ${chaveData}
    `;
    if (!linha) return null;
    // O driver às vezes devolve a coluna jsonb como texto em vez de já parseada.
    return typeof linha.insights === "string" ? JSON.parse(linha.insights) : linha.insights;
  } catch (error) {
    console.error("[liturgiaInsights] Erro ao ler do banco:", error);
    return null;
  }
}

async function salvarInsights(db: NonNullable<ReturnType<typeof getDb>>, chaveData: string, insights: LiturgiaInsights): Promise<void> {
  try {
    await db`
      insert into liturgia_insights (data, insights)
      values (${chaveData}, ${JSON.stringify(insights)}::jsonb)
      on conflict (data) do update set insights = excluded.insights
    `;
  } catch (error) {
    console.error("[liturgiaInsights] Erro ao salvar no banco:", error);
  }
}

/**
 * Busca (ou gera, na primeira vez do dia) o contexto histórico e patrístico da liturgia.
 * As leituras de uma data específica não mudam de um ano para o outro dentro do ciclo já
 * gerado, então o resultado fica guardado no Postgres indefinidamente (sem banco, cada
 * visitante durante uma instabilidade da API disparava uma chamada nova ao Gemini).
 * Falhas não são salvas — para permitir nova tentativa depois —, mas ficam sob um
 * cooldown em memória para não martelar a API repetidamente.
 */
export async function getLiturgiaInsights(liturgia: LiturgiaDiaria): Promise<LiturgiaInsights | null> {
  const chaveData = liturgia.data.split("/").reverse().join("-");
  const db = getDb();

  if (db) {
    const salvo = await buscarInsightsSalvos(db, chaveData);
    if (salvo) return salvo;
  }

  const ultimaFalha = ultimaFalhaPorData.get(chaveData);
  if (ultimaFalha && Date.now() - ultimaFalha < COOLDOWN_MS) {
    return null;
  }

  try {
    const insights = await gerarInsights(liturgia);
    ultimaFalhaPorData.delete(chaveData);
    if (db) await salvarInsights(db, chaveData, insights);
    return insights;
  } catch (error) {
    console.error("[liturgiaInsights] Erro ao obter contexto histórico/patrístico:", error);
    ultimaFalhaPorData.set(chaveData, Date.now());
    return null;
  }
}
