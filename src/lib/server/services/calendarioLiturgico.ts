import path from "path";
import fs from "fs/promises";
import { DateTime } from "luxon";
import { type EntradaDiaJson } from "@/types/calendario";

/** Anos com arquivo de calendário disponível em src/data/Calendario. */
const ANOS_DISPONIVEIS = [2026, 2027, 2028, 2029, 2030];

let cachedJson: Record<string, EntradaDiaJson[]> | null = null;

/** Lê e mescla todos os anos disponíveis num único mapa "YYYY-MM-DD" -> entradas. */
export async function getCalendarioLiturgico(): Promise<Record<string, EntradaDiaJson[]>> {
  if (cachedJson) {
    return cachedJson;
  }

  const porAno = await Promise.all(
    ANOS_DISPONIVEIS.map(async (ano) => {
      const jsonPath = path.join(process.cwd(), "data", "Calendario", `calendario-${ano}.json`);
      const raw = await fs.readFile(jsonPath, "utf8");
      return JSON.parse(raw) as Record<string, EntradaDiaJson[]>;
    })
  );

  cachedJson = Object.assign({}, ...porAno);
  return cachedJson!;
}

/** Cor litúrgica (ex.: "ROXO", "VERDE") do dia atual, para tematizar a interface. */
export async function getCorLiturgicaHoje(): Promise<string | null> {
  try {
    const calendario = await getCalendarioLiturgico();
    const chave = DateTime.now().setZone("America/Sao_Paulo").toFormat("yyyy-MM-dd");
    return calendario[chave]?.[0]?.cor ?? null;
  } catch (error) {
    console.error("[calendarioLiturgico] Erro ao obter cor litúrgica do dia:", error);
    return null;
  }
}
