import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CartaoNovena from "@/components/novena/CartaoNovena";
import { getNovenasResumo } from "@/lib/server/services/novenas";
import { formatarDiaMes, hojeEmBrasilia, novenasDeHoje } from "@/lib/shared/novenas";

const LIMITE = 4;

/** Seção da home: novenas em andamento hoje, completada pelas que começam em breve. */
export default async function NovenasDoDia() {
  const { emAndamento, emBreve } = novenasDeHoje(await getNovenasResumo(), hojeEmBrasilia());

  const cartoes = [
    ...emAndamento.map(({ novena, dia }) => ({
      novena,
      diaAtual: dia ?? undefined,
      detalhe: dia ? `Dia ${dia} de ${novena.totalDias}` : "Domingo: não se conta",
    })),
    ...emBreve.map(({ novena, inicio }) => ({
      novena,
      diaAtual: undefined,
      detalhe: `Começa em ${formatarDiaMes(inicio)}`,
    })),
  ].slice(0, LIMITE);

  if (cartoes.length === 0) {
    return null;
  }

  return (
    <section className="px-5 md:px-16 py-12">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 border-b border-[#d0c4be] pb-4">
        <div>
          <span className="text-[12px] font-semibold text-primary uppercase tracking-[0.3em] mb-2 block">Novenae</span>
          <h2 className="font-heading text-4xl text-primary">
            {emAndamento.length > 0 ? "Novenas de Hoje" : "Próximas Novenas"}
          </h2>
        </div>
        <Link
          href="/novenas"
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4d4540] hover:text-primary flex items-center gap-2 mt-4 md:mt-0 transition-colors"
        >
          Ver todas as novenas <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {cartoes.map((c) => (
          <CartaoNovena key={c.novena.slug} novena={c.novena} detalhe={c.detalhe} diaAtual={c.diaAtual} />
        ))}
      </div>
    </section>
  );
}
