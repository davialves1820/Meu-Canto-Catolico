// Mapeamento de abreviações e variações para os nomes exatos usados em bibliaAveMaria.json
const LIVROS: Record<string, string> = {
  // Antigo Testamento
  "gn": "Gênesis", "gen": "Gênesis", "gênesis": "Gênesis",
  "ex": "Êxodo", "exo": "Êxodo", "êxodo": "Êxodo",
  "lv": "Levítico", "lev": "Levítico", "levítico": "Levítico",
  "nm": "Números", "num": "Números", "números": "Números",
  "dt": "Deuteronômio", "deu": "Deuteronômio", "deuteronômio": "Deuteronômio",
  "js": "Josué", "jos": "Josué", "josué": "Josué",
  "jz": "Juízes", "jui": "Juízes", "juízes": "Juízes",
  "rt": "Rute", "rute": "Rute",
  "1sm": "I Samuel", "1sam": "I Samuel", "1samuel": "I Samuel",
  "2sm": "II Samuel", "2sam": "II Samuel", "2samuel": "II Samuel",
  "1rs": "I Reis", "1rei": "I Reis", "1reis": "I Reis",
  "2rs": "II Reis", "2rei": "II Reis", "2reis": "II Reis",
  "1cr": "I Crônicas", "1cro": "I Crônicas", "1crônicas": "I Crônicas",
  "2cr": "II Crônicas", "2cro": "II Crônicas", "2crônicas": "II Crônicas",
  "ed": "Esdras", "esd": "Esdras", "esdras": "Esdras",
  "ne": "Neemias", "nee": "Neemias", "neemias": "Neemias",
  "tb": "Tobias", "tob": "Tobias", "tobias": "Tobias",
  "jdt": "Judite", "judite": "Judite",
  "est": "Ester", "ester": "Ester",
  "1mc": "I Macabeus", "1macabeus": "I Macabeus",
  "2mc": "II Macabeus", "2macabeus": "II Macabeus",
  "jó": "Jó",
  "sl": "Salmos", "sal": "Salmos", "ps": "Salmos", "salmo": "Salmos", "salmos": "Salmos",
  "pr": "Provérbios", "pro": "Provérbios", "provérbios": "Provérbios",
  "ecl": "Eclesiastes", "eclesiastes": "Eclesiastes",
  "ct": "Cântico dos Cânticos", "cânticos": "Cântico dos Cânticos",
  "sb": "Sabedoria", "sab": "Sabedoria", "sabedoria": "Sabedoria",
  "si": "Eclesiástico", "eclo": "Eclesiástico", "eclesiástico": "Eclesiástico", "sirácida": "Eclesiástico",
  "is": "Isaías", "isa": "Isaías", "isaías": "Isaías",
  "jr": "Jeremias", "jer": "Jeremias", "jeremias": "Jeremias",
  "lm": "Lamentações", "lamentações": "Lamentações",
  "br": "Baruc", "bar": "Baruc", "baruc": "Baruc",
  "ez": "Ezequiel", "eze": "Ezequiel", "ezequiel": "Ezequiel",
  "dn": "Daniel", "dan": "Daniel", "daniel": "Daniel",
  "os": "Oséias", "ose": "Oséias", "oséias": "Oséias", "oseias": "Oséias",
  "jl": "Joel", "joel": "Joel",
  "am": "Amós", "amós": "Amós",
  "ab": "Abdias", "ob": "Abdias", "abdias": "Abdias",
  "jn": "Jonas", "jon": "Jonas", "jonas": "Jonas",
  "mq": "Miquéias", "mic": "Miquéias", "miquéias": "Miquéias", "miqueias": "Miquéias",
  "na": "Naum", "naum": "Naum",
  "hc": "Habacuc", "hab": "Habacuc", "habacuc": "Habacuc",
  "sf": "Sofonias", "sof": "Sofonias", "sofonias": "Sofonias",
  "ag": "Ageu", "ageu": "Ageu",
  "zc": "Zacarias", "zac": "Zacarias", "zacarias": "Zacarias",
  "ml": "Malaquias", "mal": "Malaquias", "malaquias": "Malaquias",
  // Novo Testamento
  "mt": "São Mateus", "mat": "São Mateus", "mateus": "São Mateus",
  "mc": "São Marcos", "mar": "São Marcos", "marcos": "São Marcos",
  "lc": "São Lucas", "luc": "São Lucas", "lucas": "São Lucas",
  "jo": "São João", "joão": "São João",
  "at": "Atos dos Apóstolos", "atos": "Atos dos Apóstolos",
  "rm": "Romanos", "rom": "Romanos", "romanos": "Romanos",
  "1co": "I Coríntios", "1cor": "I Coríntios", "1coríntios": "I Coríntios",
  "2co": "II Coríntios", "2cor": "II Coríntios", "2coríntios": "II Coríntios",
  "gl": "Gálatas", "gal": "Gálatas", "gálatas": "Gálatas",
  "ef": "Efésios", "efe": "Efésios", "efésios": "Efésios",
  "fl": "Filipenses", "fil": "Filipenses", "filipenses": "Filipenses",
  "cl": "Colossenses", "col": "Colossenses", "colossenses": "Colossenses",
  "1ts": "I Tessalonicenses", "1tes": "I Tessalonicenses", "1tessalonicenses": "I Tessalonicenses",
  "2ts": "II Tessalonicenses", "2tes": "II Tessalonicenses", "2tessalonicenses": "II Tessalonicenses",
  "1tm": "I Timóteo", "1tim": "I Timóteo", "1timóteo": "I Timóteo",
  "2tm": "II Timóteo", "2tim": "II Timóteo", "2timóteo": "II Timóteo",
  "tt": "Tito", "tit": "Tito", "tito": "Tito",
  "fm": "Filêmon", "flm": "Filêmon", "filêmon": "Filêmon", "filemon": "Filêmon",
  "hb": "Hebreus", "heb": "Hebreus", "hebreus": "Hebreus",
  "tg": "São Tiago", "tia": "São Tiago", "tiago": "São Tiago",
  "1pe": "I São Pedro", "1pd": "I São Pedro", "1pedro": "I São Pedro",
  "2pe": "II São Pedro", "2pd": "II São Pedro", "2pedro": "II São Pedro",
  "1jo": "I São João", "1joão": "I São João",
  "2jo": "II São João", "2joão": "II São João",
  "3jo": "III São João", "3joão": "III São João",
  "jd": "São Judas", "judas": "São Judas",
  "ap": "Apocalipse", "apo": "Apocalipse", "apocalipse": "Apocalipse",
};

function removerAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Índice com as chaves originais e suas versões sem acento (sem sobrescrever:
// "jo" continua sendo São João mesmo com "jó" → "jo")
const INDICE_LIVROS = new Map<string, string>(Object.entries(LIVROS));
for (const [chave, livro] of Object.entries(LIVROS)) {
  const semAcento = removerAcentos(chave);
  if (!INDICE_LIVROS.has(semAcento)) {
    INDICE_LIVROS.set(semAcento, livro);
  }
}

export interface ReferenciaBiblica {
  livro: string;
  capitulo: number;
  versiculo?: number;
}

export function parsearReferencia(input: string): ReferenciaBiblica | null {
  const texto = input.trim().toLowerCase().normalize("NFC");

  // Ex: "Jo 3,16", "1 Co 13:4", "Mateus 5", "sao joao 3 16"
  const match = texto.match(
    /^([1-3])?\s*(?:s[aã]o\s+)?(\p{L}+)\.?\s*(\d+)(?:\s*[,;:.\s]\s*(\d+))?/u
  );

  if (!match) {
    return null;
  }

  const [, prefixo, nome, capStr, verStr] = match;
  const abrev = (prefixo ?? "") + nome;

  const livro = INDICE_LIVROS.get(abrev) ?? INDICE_LIVROS.get(removerAcentos(abrev));
  if (!livro) {
    return null;
  }

  const capitulo = parseInt(capStr, 10);
  const versiculo = verStr ? parseInt(verStr, 10) : undefined;

  if (isNaN(capitulo) || capitulo < 1) {
    return null;
  }

  return { livro, capitulo, versiculo };
}

export function urlDaReferencia(ref: ReferenciaBiblica): string {
  const base = `/biblia/${encodeURIComponent(ref.livro)}/${ref.capitulo}`;
  return ref.versiculo ? `${base}?v=${ref.versiculo}` : base;
}

// Alias mantido por compatibilidade com imports existentes
export type Referenciabiblica = ReferenciaBiblica;
