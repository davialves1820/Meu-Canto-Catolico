"use client";

import { useState, useMemo, useEffect } from "react";
import { DateTime } from "luxon";
import { type EstadoCalendario, type ModoVisualizacao, type DadosDiaLiturgico } from "@/types/calendario";
import { liturgicalSeasons, type TempoId } from "@/lib/shared/anoLiturgico";
import { NOMES_TEMPOS } from "@/lib/shared/buscaCalendario";

function ehTempoValido(valor: string | null): valor is TempoId {
  return !!valor && valor in NOMES_TEMPOS;
}

/** Mês a exibir ao filtrar por um tempo: o próximo período dele no ano (ou o primeiro, se já passaram). */
function inicioDoTempo(tempo: TempoId, ano: number): DateTime {
  const hoje = DateTime.now().toISODate()!;
  const periodos = liturgicalSeasons(ano).filter((p) => p.tempo === tempo);
  const periodo = periodos.find((p) => p.fim >= hoje) ?? periodos[0];
  return DateTime.fromISO(periodo.inicio);
}

export function useCalendario(calendarioInicial: Record<string, DadosDiaLiturgico[]>): EstadoCalendario {
  const [estaMontado, setEstaMontado] = useState(false);
  const [dataAtual, setDataAtual] = useState<DateTime>(() => DateTime.now().startOf("month"));
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>("lista");
  const [tempoFiltro, setTempoFiltro] = useState<TempoId | null>(null);
  const [diaDestacado, setDiaDestacado] = useState<string | null>(null);

  const anosDisponiveis = useMemo(
    () => [...new Set(Object.keys(calendarioInicial).map((d) => Number(d.slice(0, 4))))].sort(),
    [calendarioInicial],
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sincronizarModo = () => setModoVisualizacao(media.matches ? "grade" : "lista");

    const handle = requestAnimationFrame(() => {
      // Filtro compartilhável pela URL: ?tempo=quaresma&ano=2027
      const params = new URLSearchParams(window.location.search);
      const tempo = params.get("tempo");
      const anoUrl = Number(params.get("ano"));
      const ano = anosDisponiveis.includes(anoUrl) ? anoUrl : DateTime.now().year;

      setEstaMontado(true);
      if (ehTempoValido(tempo)) {
        setTempoFiltro(tempo);
        setDataAtual(inicioDoTempo(tempo, ano));
      } else {
        setDataAtual(DateTime.now().set({ year: ano }));
      }
      sincronizarModo();
    });

    media.addEventListener("change", sincronizarModo);
    return () => {
      cancelAnimationFrame(handle);
      media.removeEventListener("change", sincronizarModo);
    };
  }, [anosDisponiveis]);

  useEffect(() => {
    if (!estaMontado) return;
    const params = new URLSearchParams(window.location.search);
    if (tempoFiltro) params.set("tempo", tempoFiltro);
    else params.delete("tempo");
    if (tempoFiltro || dataAtual.year !== DateTime.now().year) params.set("ano", String(dataAtual.year));
    else params.delete("ano");

    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [estaMontado, tempoFiltro, dataAtual.year]);

  // O destaque de uma busca some sozinho depois de alguns segundos.
  useEffect(() => {
    if (!diaDestacado) return;
    const timer = setTimeout(() => setDiaDestacado(null), 4000);
    return () => clearTimeout(timer);
  }, [diaDestacado]);

  const rotuloMes = dataAtual.toFormat("MMMM yyyy", { locale: "pt-BR" });

  const diasNoMes = useMemo(() => {
    const inicio = dataAtual.startOf("month");
    const preenchimentoInicio = inicio.weekday === 7 ? 0 : inicio.weekday;
    const dias: { data: DateTime; ehMesAtual: boolean }[] = [];

    for (let i = preenchimentoInicio - 1; i >= 0; i--) {
      dias.push({ data: inicio.minus({ days: i + 1 }), ehMesAtual: false });
    }
    for (let i = 0; i < inicio.daysInMonth!; i++) {
      dias.push({ data: inicio.plus({ days: i }), ehMesAtual: true });
    }

    return dias;
  }, [dataAtual]);

  const listaDias = useMemo(() => {
    const inicio = dataAtual.startOf("month");
    return Array.from({ length: inicio.daysInMonth! }, (_, i) =>
      inicio.plus({ days: i }),
    );
  }, [dataAtual]);

  const dadosSelecionados = diaSelecionado ? (calendarioInicial[diaSelecionado] ?? null) : null;

  const irAnterior = () => setDataAtual((d) => d.minus({ months: 1 }));
  const irProximo = () => setDataAtual((d) => d.plus({ months: 1 }));
  const irHoje = () => {
    const hoje = DateTime.now();
    setDataAtual(hoje);
    setDiaSelecionado(hoje.toISODate());
  };
  const selecionarDia = (dateStr: string) => {
    if (calendarioInicial[dateStr]) {
      setDiaSelecionado(dateStr);
    }
  };
  const limparDia = () => setDiaSelecionado(null);

  const selecionarTempo = (tempo: TempoId | null) => {
    setTempoFiltro(tempo);
    if (tempo) setDataAtual(inicioDoTempo(tempo, dataAtual.year));
  };

  const mudarAno = (ano: number) => {
    setDataAtual(tempoFiltro ? inicioDoTempo(tempoFiltro, ano) : dataAtual.set({ year: ano }));
  };

  const irParaMes = (dateStr: string) => setDataAtual(DateTime.fromISO(dateStr));

  const irParaData = (dateStr: string) => {
    setTempoFiltro(null);
    setDataAtual(DateTime.fromISO(dateStr));
    setDiaDestacado(dateStr);
    // No mobile o detalhe do dia abre como gaveta e cobriria a data destacada.
    if (window.matchMedia("(min-width: 1024px)").matches) selecionarDia(dateStr);
  };

  return {
    dataAtual,
    diaSelecionado,
    modoVisualizacao,
    estaMontado,
    tempoFiltro,
    diaDestacado,
    anosDisponiveis,
    rotuloMes,
    diasNoMes,
    listaDias,
    dadosSelecionados,
    irAnterior,
    irProximo,
    irHoje,
    selecionarDia,
    limparDia,
    setModoVisualizacao,
    selecionarTempo,
    mudarAno,
    irParaMes,
    irParaData,
  };
}
