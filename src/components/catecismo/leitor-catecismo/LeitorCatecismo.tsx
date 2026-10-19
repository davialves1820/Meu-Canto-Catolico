"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { TEMAS } from "@/types/biblia";
import type { CapituloComContexto, ItemCabecalho as TipoItemCabecalho, ResumoParte } from "@/types/catecismo";
import { usePreferenciasLeitor } from "@/lib/client/hooks/biblia/usePreferenciasLeitor";
import { useDestaqueVersiculo } from "@/lib/client/hooks/biblia/useDestaqueVersiculo";
import { useNavegacaoCatecismo } from "@/lib/client/hooks/catecismo/useNavegacaoCatecismo";
import PainelConfiguracoes from "@/components/biblia/leitor-biblia/PainelConfiguracoes";
import BarraProgressoLeitor from "@/components/biblia/leitor-biblia/BarraProgressoLeitor";
import BarraFerramentasCatecismo from "./BarraFerramentasCatecismo";
import SumarioCatecismo from "./SumarioCatecismo";
import IrParaParagrafo from "./IrParaParagrafo";
import ItemCabecalho from "./ItemCabecalho";
import ItemParagrafo from "./ItemParagrafo";

const CHAVE_NOTAS = "catecismo-exibir-notas";

interface Props {
  dados: CapituloComContexto;
  indice: ResumoParte[];
  totalParagrafos: number;
  paragrafoDestaque?: number;
}

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function LeitorCatecismo({ dados, indice, totalParagrafos, paragrafoDestaque }: Props) {
  const { capitulo, parte, anterior, proximo } = dados;
  const router = useRouter();

  const [exibirSumario, setExibirSumario] = useState(false);
  const [exibirIrPara, setExibirIrPara] = useState(false);
  const [exibirConfiguracoes, setExibirConfiguracoes] = useState(false);
  const [exibirNotas, setExibirNotas] = useState(false);

  const { tamanhoFonte, tema, setTamanhoFonte, setTema } = usePreferenciasLeitor();
  const { versiculoDestaque, destacarVersiculo, refsVersiculo } = useDestaqueVersiculo(paragrafoDestaque, 0);
  const { direcaoEntrada, navegar, manipuladoresToque } = useNavegacaoCatecismo({ anterior, proximo });

  const todosCapitulos = indice.flatMap((p) => p.capitulos);
  const posicao = todosCapitulos.findIndex((c) => c.slug === capitulo.slug);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setExibirNotas(localStorage.getItem(CHAVE_NOTAS) === "1");
  }, []);

  const alternarNotas = () => {
    setExibirNotas((v) => {
      localStorage.setItem(CHAVE_NOTAS, v ? "0" : "1");
      return !v;
    });
  };

  const irParaParagrafo = (numero: number) => {
    setExibirIrPara(false);
    if (numero >= capitulo.inicio && numero <= capitulo.fim) {
      destacarVersiculo(numero);
    } else {
      router.push(`/catecismo/paragrafo/${numero}`);
    }
  };

  // O cabeçalho do leitor já mostra a parte e o capítulo — evita repeti-los nos títulos da fonte
  const repetidos = new Set([parte.rotulo, parte.titulo, capitulo.titulo].filter(Boolean).map(normalizar));
  const semRepetidos = (itens: TipoItemCabecalho[] = []) =>
    itens.filter((item) => !(item.tipo === "titulo" && repetidos.has(normalizar(item.texto))));

  const criarRefParagrafo = (numero: number) => (el: HTMLElement | null) => {
    if (el) refsVersiculo.current.set(numero, el);
    else refsVersiculo.current.delete(numero);
  };

  const t = TEMAS[tema];

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border shadow-xl transition-colors duration-500 ${t.borda}`}
      style={{ background: t.bg }}
      {...manipuladoresToque}
    >
      <BarraProgressoLeitor atual={posicao} total={todosCapitulos.length} />

      <BarraFerramentasCatecismo
        t={t}
        titulo={capitulo.titulo}
        inicio={capitulo.inicio}
        fim={capitulo.fim}
        exibirSumario={exibirSumario}
        exibirIrPara={exibirIrPara}
        exibirConfiguracoes={exibirConfiguracoes}
        exibirNotas={exibirNotas}
        aoAlternarSumario={() => setExibirSumario((v) => !v)}
        aoAlternarIrPara={() => setExibirIrPara((v) => !v)}
        aoAlternarConfiguracoes={() => setExibirConfiguracoes((v) => !v)}
        aoAlternarNotas={alternarNotas}
      />

      <IrParaParagrafo t={t} estaAberto={exibirIrPara} totalParagrafos={totalParagrafos} aoIrPara={irParaParagrafo} />

      <SumarioCatecismo
        t={t}
        indice={indice}
        slugAtual={capitulo.slug}
        estaAberto={exibirSumario}
        aoFechar={() => setExibirSumario(false)}
      />

      <PainelConfiguracoes
        t={t}
        estaAberto={exibirConfiguracoes}
        tamanhoFonte={tamanhoFonte}
        tema={tema}
        bg={t.bg}
        aoMudarTamanhoFonte={setTamanhoFonte}
        aoMudarTema={setTema}
      />

      <div className="relative min-h-[70vh] px-3 py-12 sm:px-12 sm:py-16" style={{ fontSize: `${tamanhoFonte}px` }}>
        <motion.div
          className="max-w-2xl mx-auto"
          initial={direcaoEntrada ? { x: direcaoEntrada * 36, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.26, ease: "easeInOut" }}
        >
          <header className="text-center mb-12">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.4em] mb-4 text-primary opacity-80">
              {parte.rotulo ? `${parte.rotulo} · ${parte.titulo}` : "Catecismo da Igreja Católica"}
            </p>
            <h1 className={`font-heading text-4xl lg:text-6xl font-medium ${t.texto}`}>{capitulo.titulo}</h1>
            <p className={`mt-4 font-body text-xs font-bold uppercase tracking-[0.2em] ${t.muted} opacity-70`}>
              Parágrafos {capitulo.inicio} a {capitulo.fim}
            </p>
            <div className="sacred-divider" aria-hidden="true">
              <Sparkles size={16} />
            </div>
          </header>

          {capitulo.paragrafos.map((p) => (
            <section key={p.numero} id={`s-${p.numero}`} className="scroll-mt-28">
              {semRepetidos(p.cabecalho).map((item, i) => (
                <ItemCabecalho key={i} item={item} idNotas={`nota-${p.numero}`} t={t} exibirNotas={exibirNotas} />
              ))}
              <ItemParagrafo
                paragrafo={p}
                t={t}
                exibirNotas={exibirNotas}
                estaDestacado={p.numero === versiculoDestaque}
                refParagrafo={criarRefParagrafo(p.numero)}
              />
            </section>
          ))}

          {semRepetidos(capitulo.apendice).map((item, i) => (
            <ItemCabecalho key={i} item={item} idNotas="nota-apendice" t={t} exibirNotas={exibirNotas} />
          ))}
        </motion.div>
      </div>

      <nav
        aria-label="Navegação entre capítulos"
        className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t sticky bottom-0 backdrop-blur-md z-30 ${t.barraFerramentas}`}
      >
        <button
          onClick={() => navegar(-1)}
          disabled={!anterior}
          aria-label={anterior ? `Capítulo anterior: ${anterior.titulo}` : "Sem capítulo anterior"}
          title={anterior?.titulo}
          className={`group flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-0 sm:w-[40%] ${t.borda} ${
            anterior ? `${t.muted} hover:border-primary/50` : "opacity-10 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={16} aria-hidden="true" className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span className="min-w-0">
            <span className="block text-[10px] font-body font-bold uppercase tracking-widest opacity-70">Anterior</span>
            {anterior && <span className={`hidden md:block font-heading text-sm truncate ${t.texto}`}>{anterior.titulo}</span>}
          </span>
        </button>

        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <p className={`text-[10px] font-bold font-body uppercase tracking-[0.2em] ${t.muted} opacity-60`}>
            {posicao + 1} de {todosCapitulos.length}
          </p>
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => {
              const idx = Math.floor((i / 12) * todosCapitulos.length);
              return (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: idx <= posicao ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                />
              );
            })}
          </div>
        </div>

        <button
          onClick={() => navegar(1)}
          disabled={!proximo}
          aria-label={proximo ? `Próximo capítulo: ${proximo.titulo}` : "Sem próximo capítulo"}
          title={proximo?.titulo}
          className={`group flex items-center justify-end gap-3 px-4 sm:px-5 py-3 rounded-xl border text-right transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-0 sm:w-[40%] ${t.borda} ${
            proximo ? `${t.muted} hover:border-primary/50` : "opacity-10 cursor-not-allowed"
          }`}
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-body font-bold uppercase tracking-widest opacity-70">Próximo</span>
            {proximo && <span className={`hidden md:block font-heading text-sm truncate ${t.texto}`}>{proximo.titulo}</span>}
          </span>
          <ChevronRight size={16} aria-hidden="true" className="shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      <p
        className="md:hidden text-center py-4 text-[10px] font-body font-bold uppercase tracking-[0.2em] select-none"
        style={{ color: "hsl(var(--primary)/0.3)" }}
        aria-hidden="true"
      >
        ← deslize para navegar →
      </p>
    </div>
  );
}
