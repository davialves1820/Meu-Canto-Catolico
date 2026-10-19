import { Settings, List, Home, Hash, Superscript } from "lucide-react";
import Link from "next/link";
import type { TokensTema } from "@/types/biblia";
import BotaoBarraFerramentas from "@/components/biblia/leitor-biblia/BotaoBarraFerramentas";

interface Props {
  t: TokensTema;
  titulo: string;
  inicio: number;
  fim: number;
  exibirSumario: boolean;
  exibirIrPara: boolean;
  exibirConfiguracoes: boolean;
  exibirNotas: boolean;
  aoAlternarSumario: () => void;
  aoAlternarIrPara: () => void;
  aoAlternarConfiguracoes: () => void;
  aoAlternarNotas: () => void;
}

export default function BarraFerramentasCatecismo({
  t,
  titulo,
  inicio,
  fim,
  exibirSumario,
  exibirIrPara,
  exibirConfiguracoes,
  exibirNotas,
  aoAlternarSumario,
  aoAlternarIrPara,
  aoAlternarConfiguracoes,
  aoAlternarNotas,
}: Props) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b sticky top-0 z-40 backdrop-blur-md ${t.barraFerramentas}`}>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          <BotaoBarraFerramentas
            onClick={aoAlternarSumario}
            active={exibirSumario}
            label={exibirSumario ? "Fechar sumário" : "Abrir sumário do Catecismo"}
          >
            <List size={18} aria-hidden="true" />
          </BotaoBarraFerramentas>

          <Link
            href="/catecismo"
            aria-label="Voltar para o Catecismo"
            title="Voltar para o Catecismo"
            className={`p-2.5 rounded-xl transition-all hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${t.muted}`}
          >
            <Home size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="hidden sm:block w-px h-6 mx-2 opacity-10 bg-primary" aria-hidden="true" />

        <div className="min-w-0">
          <p className={`font-heading font-medium text-base sm:text-lg leading-tight truncate ${t.texto}`}>{titulo}</p>
          <p className={`text-[10px] font-body font-bold uppercase tracking-widest opacity-60 ${t.muted}`}>
            §{inicio}–{fim}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <BotaoBarraFerramentas
          onClick={aoAlternarIrPara}
          active={exibirIrPara}
          label={exibirIrPara ? "Fechar ir para parágrafo" : "Ir para parágrafo"}
        >
          <Hash size={18} aria-hidden="true" />
        </BotaoBarraFerramentas>

        <BotaoBarraFerramentas
          onClick={aoAlternarNotas}
          active={exibirNotas}
          label={exibirNotas ? "Ocultar notas de rodapé" : "Mostrar notas de rodapé"}
        >
          <Superscript size={18} aria-hidden="true" />
        </BotaoBarraFerramentas>

        <BotaoBarraFerramentas
          onClick={aoAlternarConfiguracoes}
          active={exibirConfiguracoes}
          label={exibirConfiguracoes ? "Fechar configurações" : "Configurações de leitura"}
        >
          <Settings size={18} aria-hidden="true" />
        </BotaoBarraFerramentas>
      </div>
    </div>
  );
}
