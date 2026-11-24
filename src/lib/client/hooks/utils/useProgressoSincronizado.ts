"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  apagarLocal,
  gravarLocal,
  lerLocal,
  resolverProgresso,
  type ConfigProgresso,
  type RegistroProgresso,
} from "@/lib/client/progressoLocal";
import { lerProgressoRemoto, salvarProgressoRemoto } from "@/lib/client/progressoRemoto";

/**
 * Carrega e grava o progresso de uma devoção para quem está usando o site agora.
 * `config` precisa ser estável entre renders (useMemo ou constante) e `aoCarregar` recebe
 * null quando não há progresso.
 */
export function useProgressoSincronizado<T>(
  config: ConfigProgresso<T>,
  aoCarregar: (registro: RegistroProgresso<T> | null) => void
) {
  const { data: sessao, status } = useSession();
  const dono = sessao?.user?.id ?? null;
  const carregandoSessao = status === "loading";

  /** Enquanto false, gravar poderia sobrescrever um progresso que ainda não chegou da conta. */
  const [pronto, setPronto] = useState(false);
  const conheceConta = useRef(false);
  const aoCarregarRef = useRef(aoCarregar);
  useEffect(() => {
    aoCarregarRef.current = aoCarregar;
  });

  useEffect(() => {
    conheceConta.current = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setPronto(false);
    if (carregandoSessao) return;

    aoCarregarRef.current(lerLocal(config, dono));
    if (!dono) {
      setPronto(true);
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    let cancelado = false;
    lerProgressoRemoto<T>(dono, config.chave).then((leitura) => {
      if (cancelado) return;
      if (leitura.ok) {
        conheceConta.current = true;
        const anonimo = lerLocal(config, null);
        const { final, enviar } = resolverProgresso(
          { proprio: lerLocal(config, dono), anonimo, remoto: leitura.progresso },
          config.mesclar,
          Date.now()
        );
        if (final) {
          gravarLocal(config, dono, final);
          aoCarregarRef.current(final);
          if (enviar) salvarProgressoRemoto(dono, config.chave, final.dados, final.atualizadoEm);
        }
        if (anonimo?.anonimo) apagarLocal(config, null);
      }
      setPronto(true);
    });
    return () => {
      cancelado = true;
    };
  }, [config, dono, carregandoSessao]);

  const gravar = useCallback(
    (dados: T) => {
      const atualizadoEm = Date.now();
      if (dono) {
        const pendente = !conheceConta.current;
        gravarLocal(config, dono, { dados, atualizadoEm, ...(pendente ? { pendente } : {}) });
        // Sem conhecer a conta, espera a próxima carga para mesclar em vez de substituir.
        if (!pendente) salvarProgressoRemoto(dono, config.chave, dados, atualizadoEm);
        return;
      }
      // Um registro antigo, de dono desconhecido, continua só neste aparelho.
      const anterior = lerLocal(config, null);
      gravarLocal(config, null, { dados, atualizadoEm, anonimo: !anterior || !!anterior.anonimo });
    },
    [config, dono]
  );

  /** Sem login, recomeçar também descarta o que havia de antigo, de dono desconhecido. */
  const reiniciar = useCallback(
    (vazio: T) => {
      if (dono) gravar(vazio);
      else apagarLocal(config, null);
    },
    [config, dono, gravar]
  );

  return { pronto, gravar, reiniciar };
}
