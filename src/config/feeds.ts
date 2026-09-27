export const FEEDS = {
    vaticannews: {
        url: "https://www.vaticannews.va/pt.rss.xml",
        label: "Vatican News",
    },
    cnbb: {
        url: "https://www.cnbb.org.br/feed/",
        label: "CNBB",
    },
    // Para adicionar uma nova fonte: basta acrescentar aqui.
    // O tipo FonteNoticia é derivado automaticamente via keyof typeof FEEDS.
    //
    // fides: {
    //   url: "https://www.fides.org/pt/rss",
    //   label: "Agência Fides",
    // },
} as const;

export type FonteNoticia = keyof typeof FEEDS;

/** Todas as fontes cadastradas — usado pelos callers que querem misturar tudo. */
export const TODAS_AS_FONTES = Object.keys(FEEDS) as FonteNoticia[];