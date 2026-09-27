import { Noticia } from "@/types/noticias";
import { FEEDS, FonteNoticia } from "@/config/feeds";
import { XMLParser } from "fast-xml-parser";

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

interface RssItem {
  title?: unknown;
  link?: unknown;
  description?: unknown;
  "content:encoded"?: unknown;
  pubDate?: unknown;
  "dc:date"?: unknown;
  category?: unknown;
  "media:content"?: RssMediaAttr | RssMediaAttr[];
  "media:thumbnail"?: RssMediaAttr | RssMediaAttr[];
  enclosure?: RssMediaAttr | RssMediaAttr[];
}

interface RssMediaAttr {
  "@_url"?: string;
}

function texto(valor: unknown): string {
  if (valor === undefined || valor === null) {
    return "";
  }

  let str = "";
  if (typeof valor === "object") {
    const valObj = valor as Record<string, unknown>;
    str =
      typeof valObj["#text"] === "string"
        ? valObj["#text"]
        : JSON.stringify(valor);
  } else {
    str = String(valor);
  }
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extrairUrlMidia(
  campo: RssMediaAttr | RssMediaAttr[] | undefined
): string | undefined {
  if (!campo) {
    return undefined;
  }
  return Array.isArray(campo) ? campo[0]?.["@_url"] : campo["@_url"];
}

function parsearItem(item: RssItem, fonte: FonteNoticia): Noticia | null {
  const titulo = item.title;
  const link = item.link;
  const desc = item.description ?? item["content:encoded"] ?? "";
  const pubDate = item.pubDate ?? item["dc:date"];
  // Feeds com múltiplas tags <category> (ex.: CNBB) viram array no fast-xml-parser —
  // usamos só a primeira, como já era o comportamento implícito com uma fonte só.
  const categoria = Array.isArray(item.category) ? item.category[0] : item.category;

  if (!titulo || !link) {
    return null;
  }

  const imagemUrl =
    extrairUrlMidia(item["media:content"]) ??
    extrairUrlMidia(item["media:thumbnail"]) ??
    extrairUrlMidia(item.enclosure) ??
    (typeof desc === "string"
      ? desc.match(/<img[^>]+src="([^"]+)"/)?.[1]
      : undefined);

  const resumoLimpo = texto(desc ?? "").slice(0, 240);
  const resumo =
    resumoLimpo.length === 240
      ? resumoLimpo.slice(0, resumoLimpo.lastIndexOf(" ")) + "…"
      : resumoLimpo;

  return {
    id: Buffer.from(texto(link)).toString("base64"),
    titulo: texto(titulo),
    resumo,
    url: texto(link),
    imagem: imagemUrl ? texto(imagemUrl) : undefined,
    categoria: categoria
      ? typeof categoria === "string"
        ? texto(categoria)
        : texto((categoria as Record<string, unknown>)["#text"] ?? "")
      : undefined,
    publicadoEm: pubDate
      ? new Date(texto(pubDate)).toISOString()
      : new Date().toISOString(),
    fonte,
    fonteLabel: FEEDS[fonte].label,
  };
}

async function fetchRssFeed(fonte: FonteNoticia): Promise<string> {
  const res = await fetch(FEEDS[fonte].url, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "MeuCantoCatolico/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Feed ${fonte} retornou ${res.status}`);
  }

  // Verifica Content-Length antes de ler o body
  const contentLength = res.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > TAMANHO_MAXIMO_BYTES) {
    throw new Error(`Feed ${fonte} excede o limite de tamanho (${contentLength} bytes)`);
  }

  // Lê com limite aplicado via streaming manual
  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error(`Feed ${fonte}: body ilegível`);
  }

  let totalBytes = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    totalBytes += value.byteLength;
    if (totalBytes > TAMANHO_MAXIMO_BYTES) {
      reader.cancel();
      throw new Error(`Feed ${fonte} excede ${TAMANHO_MAXIMO_BYTES / 1024 / 1024}MB durante leitura`);
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(
    chunks.reduce((acc, chunk) => {
      const merged = new Uint8Array(acc.length + chunk.length);
      merged.set(acc);
      merged.set(chunk, acc.length);
      return merged;
    }, new Uint8Array(0))
  );
}

export async function buscarNoticias(
  fontes: FonteNoticia[] = ["vaticannews"],
  limite = 12
): Promise<Noticia[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: false,
  });

  const resultados = await Promise.allSettled(
    fontes.map(async (fonte) => {
      const xml = await fetchRssFeed(fonte);

      let obj: ReturnType<XMLParser["parse"]>;
      try {
        obj = parser.parse(xml);
      } catch (parseErr) {
        throw new Error(`Feed ${fonte}: XML inválido — ${parseErr}`);
      }

      const channel = obj.rss?.channel;
      if (!channel) {
        return [];
      }

      const rawItems = channel.item;
      const items: RssItem[] = Array.isArray(rawItems)
        ? rawItems
        : rawItems
          ? [rawItems]
          : [];

      return items
        .map((item) => parsearItem(item, fonte))
        .filter((n): n is Noticia => n !== null)
        .slice(0, limite);
    })
  );

  const todas = resultados
    .flatMap((r) => {
      if (r.status === "rejected") {
        console.error("[buscarNoticias]", r.reason);
        return [];
      }
      return r.value;
    })
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));

  const unique = Array.from(new Map(todas.map((n) => [n.url, n])).values());
  return unique.slice(0, limite * fontes.length);
}

export function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Teto de itens buscados por fonte para listagem/paginação e para a busca. */
export const LIMITE_MAXIMO = 60;

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Filtra notícias já carregadas por título/resumo — a busca cobre só o que foi
 * buscado nos feeds (RSS não tem histórico completo, é sempre "as mais recentes"). */
export function filtrarNoticias(noticias: Noticia[], busca: string): Noticia[] {
  const q = normalizar(busca.trim());
  if (!q) return noticias;
  return noticias.filter(
    (n) => normalizar(n.titulo).includes(q) || normalizar(n.resumo).includes(q)
  );
}
