/**
 * Progresso das devoções no navegador, separado por dono: cada conta tem a própria chave e
 * quem não está logado usa a chave anônima. Assim o progresso de uma pessoa nunca sobe para
 * a conta de outra que entre no mesmo aparelho.
 */

/** Id do usuário, ou null para quem não está logado. */
export type Dono = string | null;

export interface RegistroProgresso<T> {
  dados: T;
  /** Epoch em ms. */
  atualizadoEm: number;
  /** Feito sem login depois que os registros passaram a ter dono: pode ir para a conta. */
  anonimo?: boolean;
  /** Feito sem conhecer o que havia na conta (ex.: offline): precisa ser mesclado, não substituir. */
  pendente?: boolean;
}

export interface ConfigProgresso<T> {
  /** Chave no servidor, ex.: "novena:santo-antonio:principal". */
  chave: string;
  /** Chave no localStorage; a de cada conta acrescenta "@<id>". */
  base: string;
  /** Lê os formatos gravados antes de existir dono; null se não reconhecer. */
  converterAntigo: (bruto: unknown) => RegistroProgresso<T> | null;
  /** Une dois progressos que não se conhecem. */
  mesclar: (a: RegistroProgresso<T>, b: RegistroProgresso<T>) => T;
}

const chaveLocal = (base: string, dono: Dono) => (dono ? `${base}@${dono}` : base);

export function lerLocal<T>(config: ConfigProgresso<T>, dono: Dono): RegistroProgresso<T> | null {
  try {
    const bruto = localStorage.getItem(chaveLocal(config.base, dono));
    if (!bruto) return null;
    const salvo = JSON.parse(bruto) as unknown;
    if (salvo && typeof salvo === "object" && "dados" in salvo) return salvo as RegistroProgresso<T>;
    return config.converterAntigo(salvo);
  } catch {
    // localStorage indisponível ou dado corrompido — como se não houvesse progresso
    return null;
  }
}

export function gravarLocal<T>(config: ConfigProgresso<T>, dono: Dono, registro: RegistroProgresso<T>): void {
  try {
    localStorage.setItem(chaveLocal(config.base, dono), JSON.stringify(registro));
  } catch {
    // armazenamento cheio/indisponível — o progresso segue em memória
  }
}

export function apagarLocal<T>(config: ConfigProgresso<T>, dono: Dono): void {
  try {
    localStorage.removeItem(chaveLocal(config.base, dono));
  } catch {
    // ignora
  }
}

function maisRecente<T>(a: RegistroProgresso<T> | null, b: RegistroProgresso<T> | null) {
  if (!a || !b) return a ?? b;
  return b.atualizadoEm > a.atualizadoEm ? b : a;
}

interface Origens<T> {
  proprio: RegistroProgresso<T> | null;
  anonimo: RegistroProgresso<T> | null;
  remoto: RegistroProgresso<T> | null;
}

/**
 * Decide o progresso de uma conta a partir do que há no aparelho e no servidor. Vale o mais
 * recente, exceto o que foi feito sem conhecer a conta (anônimo ou pendente), que é mesclado.
 */
export function resolverProgresso<T>(
  { proprio, anonimo, remoto }: Origens<T>,
  mesclar: ConfigProgresso<T>["mesclar"],
  agora: number
): { final: RegistroProgresso<T> | null; enviar: boolean } {
  const unir = (
    a: RegistroProgresso<T> | null,
    b: RegistroProgresso<T> | null
  ): RegistroProgresso<T> | null =>
    a && b
      ? // Com o relógio do aparelho atrasado, "agora" pode ser anterior ao que está na conta.
        { dados: mesclar(a, b), atualizadoEm: Math.max(agora, a.atualizadoEm + 1, b.atualizadoEm + 1) }
      : (a ?? b);

  let final = proprio?.pendente ? unir(remoto, proprio) : maisRecente(remoto, proprio);
  // Registros antigos, sem dono conhecido, não entram: podem ser de outra pessoa.
  if (anonimo?.anonimo) final = unir(final, anonimo);
  if (!final) return { final: null, enviar: false };

  const limpo = { dados: final.dados, atualizadoEm: final.atualizadoEm };
  return { final: limpo, enviar: !remoto || limpo.atualizadoEm > remoto.atualizadoEm };
}
