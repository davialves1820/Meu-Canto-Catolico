/** Um dos dois grandes blocos da História da Salvação. */
export type TimelineTestamento = "antigo" | "novo";

/**
 * Paleta suave usada para diferenciar visualmente os grupos de eventos na
 * esteira horizontal. Cada valor mapeia para tokens de cor já existentes no
 * tema (ex.: "cobalt" -> bg-cobalt/10, text-cobalt).
 */
export type TimelineCor = "gold" | "cobalt" | "emerald" | "crimson" | "violet";

export interface TimelineCitacao {
  /** Texto da citação bíblica, sem aspas — o card já as adiciona. */
  texto: string;
  /** Referência abreviada, ex.: "Gênesis 3, 15". */
  referencia: string;
}

/** Um evento específico e datável da narrativa bíblica (ex.: "Caim e Abel", "A Travessia do Mar Vermelho"). */
export interface TimelineEvento {
  /** Slug único, usado como âncora de scroll (id do card). */
  id: string;
  /** Posição cronológica na esteira, em ordem de exibição. */
  ordem: number;
  testamento: TimelineTestamento;
  /** Rótulo do grupo/aliança ao qual o evento pertence, ex.: "Patriarcas". Reaproveitado como alvo da navegação rápida por marco. */
  eraTag: string;
  titulo: string;
  /** Resumo objetivo em 1 a 2 frases, já incluindo a referência bíblica entre parênteses ao final. */
  resumo: string;
  /** Citação bíblica de destaque, reservada aos eventos mais marcantes. */
  citacao?: TimelineCitacao;
  cor: TimelineCor;
  /** Marca eventos centrais (ex.: Natividade, Eucaristia, Ressurreição, Pentecostes) para um tratamento visual especial. */
  destaque?: boolean;
}

export interface TimelineFiltro {
  /** "todos" | "antigo" | "novo" | o eraTag exato de um grupo de eventos. */
  id: string;
  label: string;
}
