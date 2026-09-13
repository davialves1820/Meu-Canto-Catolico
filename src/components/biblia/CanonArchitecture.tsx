import { LayoutGrid } from "lucide-react";

interface CategoriaCanon {
  label: string;
  quantidade: string;
}

const ANTIGO_TESTAMENTO: CategoriaCanon[] = [
  { label: "Pentateuco (A Lei da Aliança)", quantidade: "5 livros" },
  { label: "Históricos (Josué a 2 Macabeus)", quantidade: "16 livros" },
  { label: "Sapienciais (Salmos a Eclesiástico)", quantidade: "7 livros" },
  { label: "Profetas Maiores e Menores", quantidade: "18 livros" },
];

const NOVO_TESTAMENTO: CategoriaCanon[] = [
  { label: "Quatro Evangelhos (Mt, Mc, Lc, Jo)", quantidade: "4 livros" },
  { label: "Histórico Apostólico (Atos)", quantidade: "1 livro" },
  { label: "Epístolas Paulinas e Hebreus", quantidade: "14 epístolas" },
  { label: "Epístolas Católicas Universais", quantidade: "7 epístolas" },
  { label: "Profético (Apocalipse de São João)", quantidade: "1 livro" },
];

/** Visão geral da estrutura do cânon católico de 73 livros, exibida na página da Bíblia. */
export function CanonArchitecture() {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-8 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutGrid size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-headline-sm text-on-surface">A Arquitetura do Cânon Católico</h2>
          <p className="font-body-sm text-[13px] text-on-surface-variant">73 livros canônicos fixados pela Igreja</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div>
          <div className="flex items-center justify-between border-b border-border pb-2 mb-1">
            <h3 className="font-headline-sm text-sm text-primary">Antigo Testamento</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-label-sm bg-primary/10 text-primary">46 Livros</span>
          </div>
          {ANTIGO_TESTAMENTO.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-0">
              <span className="font-body-sm text-[13px] text-on-surface-variant">{cat.label}</span>
              <span className="font-body-sm text-[13px] font-semibold text-on-surface shrink-0">{cat.quantidade}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-border pb-2 mb-1">
            <h3 className="font-headline-sm text-sm text-primary">Novo Testamento</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-label-sm bg-primary/10 text-primary">27 Livros</span>
          </div>
          {NOVO_TESTAMENTO.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-0">
              <span className="font-body-sm text-[13px] text-on-surface-variant">{cat.label}</span>
              <span className="font-body-sm text-[13px] font-semibold text-on-surface shrink-0">{cat.quantidade}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
