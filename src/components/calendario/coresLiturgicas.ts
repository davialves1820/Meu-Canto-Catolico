/** Classes Tailwind de fundo por cor litúrgica (aceita "ROXO" do JSON ou "roxo" do cálculo). */
const CLASSES_FUNDO: Record<string, string> = {
  verde: "bg-green-700",
  vermelho: "bg-red-700",
  roxo: "bg-purple-700",
  branco: "bg-white border border-outline-variant/30",
  preto: "bg-black",
  rosa: "bg-pink-400",
};

/** Classes de borda, usadas na faixa do card do tempo litúrgico. */
const CLASSES_BORDA: Record<string, string> = {
  verde: "border-green-700",
  vermelho: "border-red-700",
  roxo: "border-purple-700",
  branco: "border-amber-300",
  preto: "border-black",
  rosa: "border-pink-400",
};

export function classeFundoCor(cor: string | undefined): string {
  return CLASSES_FUNDO[(cor ?? "").toLowerCase()] ?? "bg-outline-variant";
}

export function classeBordaCor(cor: string | undefined): string {
  return CLASSES_BORDA[(cor ?? "").toLowerCase()] ?? "border-outline-variant";
}
