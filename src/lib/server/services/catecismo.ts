import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';

import {
  CapituloComContexto,
  DadosCatecismo,
  ResultadoBuscaCatecismo,
  ResumoCapitulo,
  ResumoParte,
} from "@/types/catecismo";
import { montarDivisoes } from "@/lib/shared/catecismo";

const NOME_ARQUIVO_CATECISMO = 'catecismo.json';
const CAMINHO_CATECISMO = process.cwd().endsWith('src') ? path.join(process.cwd(), 'data', NOME_ARQUIVO_CATECISMO) : path.join(process.cwd(), 'src', 'data', NOME_ARQUIVO_CATECISMO);

const LIMITE_RESULTADOS = 50;
const TAMANHO_TRECHO = 260;

export const getDadosCatecismo = cache(async (): Promise<DadosCatecismo> => {
  const content = await fs.readFile(CAMINHO_CATECISMO, 'utf-8');
  return JSON.parse(content);
});

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugCapitulo(titulo: string): string {
  return normalize(titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** "Primeira Parte — A Profissão da Fé" → { rotulo: "Primeira Parte", titulo: "A Profissão da Fé" } */
function separarTituloParte(titulo: string): { rotulo: string; titulo: string } {
  const [rotulo, resto] = titulo.split(' — ');
  return resto ? { rotulo, titulo: resto } : { rotulo: '', titulo };
}

/**
 * Fórmulas catequéticas do quadro dos Dez Mandamentos, por ordinal:
 * "Primeiro: Adorar a Deus…" → { primeiro: "Adorar a Deus…" }
 */
function formulasDosMandamentos(data: DadosCatecismo): Map<string, string> {
  const formulas = new Map<string, string>();
  for (const parte of data.partes) {
    for (const cap of parte.capitulos) {
      for (const item of cap.apendice ?? []) {
        if (item.tipo !== 'tabela' || !item.colunas) {
          continue;
        }
        const coluna = item.colunas.indexOf('Fórmula Catequética');
        if (coluna === -1) {
          continue;
        }
        for (const linha of item.linhas) {
          // A última célula também traz o resumo final ("Estes dez mandamentos resumem-se…") — fica só a 1ª linha
          const m = linha[coluna]?.split('\n')[0].match(/^(\p{L}+):\s*(.+)$/u);
          if (m) {
            formulas.set(normalize(m[1]), m[2]);
          }
        }
      }
    }
  }
  return formulas;
}

/** Sumário leve (sem texto) — usado no índice, no leitor e no sitemap. */
export const getIndiceCatecismo = cache(async (): Promise<ResumoParte[]> => {
  const data = await getDadosCatecismo();
  const formulas = formulasDosMandamentos(data);

  return data.partes.map((parte) => ({
    numero: parte.numero,
    ...separarTituloParte(parte.titulo),
    capitulos: parte.capitulos.map((cap) => ({
      slug: slugCapitulo(cap.titulo),
      titulo: cap.titulo,
      inicio: cap.paragrafos[0].numero,
      fim: cap.paragrafos[cap.paragrafos.length - 1].numero,
      divisoes: montarDivisoes(cap.paragrafos).map((divisao) => {
        const ordinal = normalize(divisao.titulo).match(/^o (\S+) mandamento$/)?.[1];
        const descricao = ordinal ? formulas.get(ordinal) : undefined;
        return descricao ? { ...divisao, descricao } : divisao;
      }),
    })),
  }));
});

export async function getCapituloCatecismo(slug: string): Promise<CapituloComContexto | undefined> {
  const [data, indice] = await Promise.all([getDadosCatecismo(), getIndiceCatecismo()]);
  const todos = indice.flatMap((parte) => parte.capitulos.map((cap) => ({ parte, cap })));
  const pos = todos.findIndex(({ cap }) => cap.slug === slug);
  if (pos === -1) {
    return undefined;
  }

  const { parte, cap } = todos[pos];
  const dadosParte = data.partes.find((p) => p.numero === parte.numero)!;
  const capitulo = dadosParte.capitulos.find((c) => slugCapitulo(c.titulo) === slug)!;

  return {
    capitulo: { ...capitulo, ...cap },
    parte,
    anterior: todos[pos - 1]?.cap ?? null,
    proximo: todos[pos + 1]?.cap ?? null,
  };
}

export async function getCapituloDoParagrafo(numero: number): Promise<ResumoCapitulo | undefined> {
  const indice = await getIndiceCatecismo();
  return indice
    .flatMap((parte) => parte.capitulos)
    .find((cap) => numero >= cap.inicio && numero <= cap.fim);
}

const VOGAIS = 'aeiou';

/**
 * Normaliza para busca guardando, para cada caractere normalizado, a posição no texto original.
 * Além de minúsculas/sem acento, remove as consoantes mudas da grafia europeia do texto
 * (baptismo → batismo, acto → ato, acção → acao, Egipto → Egito), para que buscas
 * em português do Brasil encontrem os parágrafos. A regra é aplicada à busca e ao texto.
 */
function normalizarParaBusca(text: string): { norm: string; mapa: number[] } {
  const chars: string[] = [];
  const mapa: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const base = text[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    for (const c of base) {
      const ultimo = chars[chars.length - 1];
      const penultimo = chars[chars.length - 2];
      if ((c === 't' || c === 'c') && (ultimo === 'p' || ultimo === 'c') && penultimo && VOGAIS.includes(penultimo)) {
        chars.pop();
        mapa.pop();
      }
      chars.push(c);
      mapa.push(i);
    }
  }
  return { norm: chars.join(''), mapa };
}

interface ParagrafoFlat {
  numero: number;
  slug: string;
  capitulo: string;
  text: string;
  normalizedText: string;
}

const getIndexFlat = cache(async (): Promise<ParagrafoFlat[]> => {
  const data = await getDadosCatecismo();
  const index: ParagrafoFlat[] = [];

  for (const parte of data.partes) {
    for (const cap of parte.capitulos) {
      const slug = slugCapitulo(cap.titulo);
      for (const p of cap.paragrafos) {
        // Remove marcadores de nota para não atrapalhar a busca nem o trecho exibido
        const text = p.texto.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ');
        index.push({ numero: p.numero, slug, capitulo: cap.titulo, text, normalizedText: normalizarParaBusca(text).norm });
      }
    }
  }

  return index;
});

/**
 * Recorta o texto em volta da primeira ocorrência para o resultado caber no card
 * e devolve as posições (no trecho) de todas as ocorrências, para destacar no cliente.
 */
function montarResultado(p: ParagrafoFlat, normalizedQuery: string): ResultadoBuscaCatecismo {
  const { norm, mapa } = normalizarParaBusca(p.text);
  const ocorrencias: [number, number][] = [];
  if (normalizedQuery) {
    for (let pos = norm.indexOf(normalizedQuery); pos !== -1; pos = norm.indexOf(normalizedQuery, pos + normalizedQuery.length)) {
      ocorrencias.push([mapa[pos], mapa[pos + normalizedQuery.length - 1] + 1]);
    }
  }

  let inicio = 0;
  let fim = p.text.length;
  if (p.text.length > TAMANHO_TRECHO) {
    const [ini, end] = ocorrencias[0] ?? [0, 0];
    inicio = Math.max(0, Math.min(ini - Math.floor((TAMANHO_TRECHO - (end - ini)) / 2), p.text.length - TAMANHO_TRECHO));
    fim = inicio + TAMANHO_TRECHO;
  }

  const prefixo = inicio > 0 ? '…' : '';
  const destaques = ocorrencias
    .filter(([ini, end]) => ini >= inicio && end <= fim)
    .map(([ini, end]): [number, number] => [ini - inicio + prefixo.length, end - inicio + prefixo.length]);

  return {
    numero: p.numero,
    slug: p.slug,
    capitulo: p.capitulo,
    trecho: `${prefixo}${p.text.slice(inicio, fim)}${fim < p.text.length ? '…' : ''}`,
    destaques,
  };
}

export async function pesquisarCatecismo(query: string): Promise<ResultadoBuscaCatecismo[]> {
  const index = await getIndexFlat();
  const results: ResultadoBuscaCatecismo[] = [];

  // "1234" ou "§1234" vai direto ao parágrafo
  const numero = query.trim().match(/^§?\s*(\d{1,4})$/);
  if (numero) {
    const p = index.find((item) => item.numero === Number(numero[1]));
    if (p) {
      results.push(montarResultado(p, ''));
    }
    return results;
  }

  const normalizedQuery = normalizarParaBusca(query.trim()).norm;
  // Full-text só compensa a partir de 3 letras
  if (normalizedQuery.length < 3) {
    return results;
  }

  for (const p of index) {
    if (p.normalizedText.includes(normalizedQuery)) {
      results.push(montarResultado(p, normalizedQuery));
      if (results.length >= LIMITE_RESULTADOS) {
        break;
      }
    }
  }

  return results;
}
