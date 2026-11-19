/**
 * Santo (slug em santos.json, vindo da Wikipédia) -> novenas (slug em novenas.json).
 * Os nomes das duas fontes não batem ("Dom Bosco" x "São João Bosco"), por isso a lista é
 * explícita. O teste em lib/shared/novenas.test.ts confere se todos os slugs existem.
 */
export const NOVENAS_POR_SANTO: Record<string, string[]> = {
  afonso_ligorio: ["santo-afonso-maria-de-ligorio"],
  // antonio_padua primeiro: é o verbete com data de festa, o que a novena indica.
  antonio_padua: ["santo-antonio"],
  antonio_de_lisboa: ["santo-antonio"],
  apresentacao_de_nossa_senhora: ["apresentacao-de-nossa-senhora"],
  atanasio: ["santo-atanasio-diacono"],
  bento_de_nursia: ["sao-bento-abade", "transito-de-sao-bento"],
  carlo_acutis: ["sao-carlo-acutis"],
  catarina_de_siena: ["santa-catarina-de-sena"],
  cristovao_da_licia: ["sao-cristovao"],
  dom_bosco: ["sao-joao-bosco"],
  exaltacao_da_santa_cruz: ["exaltacao-da-santa-cruz"],
  filipe_neri: ["sao-filipe-neri"],
  francisco_de_sales: ["sao-francisco-de-sales"],
  frei_galvao: ["sao-frei-galvao"],
  gianna_beretta_molla: ["santa-gianna-beretta-molla"],
  imaculada_conceicao: ["imaculada-conceicao"],
  inacio_de_loyola: ["santo-inacio-de-loyola"],
  irma_dulce: ["santa-dulce-dos-pobres"],
  isabel_da_hungria_e_da_turingia: ["santa-isabel-da-hungria"],
  joao_da_cruz: ["sao-joao-da-cruz"],
  joao_de_deus: ["sao-joao-de-deus"],
  joao_maria_vianney: ["sao-joao-vianney"],
  joaquim_e_ana: ["sant-ana-e-sao-joaquim"],
  josemaria_escriva_de_balaguer: ["sao-josemaria-escriva"],
  marta_maria_e_lazaro_de_betania: ["santa-marta"],
  nossa_senhora_da_conceicao_aparecida: ["nossa-senhora-aparecida"],
  nossa_senhora_das_dores: ["nossa-senhora-das-dores"],
  nossa_senhora_das_gracas: ["nossa-senhora-das-gracas"],
  nossa_senhora_de_guadalupe: ["nossa-senhora-de-guadalupe"],
  nossa_senhora_do_carmo: ["nossa-senhora-do-carmo"],
  nossa_senhora_do_rosario: ["nossa-senhora-do-rosario"],
  pedro_de_alcantara: ["sao-pedro-de-alcantara"],
  santa_catarina_de_alexandria: ["santa-catarina-de-alexandria"],
  santa_cecilia: ["santa-cecilia"],
  santa_clara_de_assis: ["santa-clara-de-assis"],
  santa_edwiges: ["santa-edwiges"],
  santa_faustina_kowalska: ["santa-faustina-kowalska"],
  santa_luzia: ["santa-luzia"],
  santa_margarida_maria_alacoque: ["santa-margarida-maria-alacoque"],
  santa_maria_madalena: ["santa-maria-madalena"],
  santa_monica: ["santa-monica"],
  santa_rita_de_cassia: ["santa-rita-de-cassia"],
  santa_teresa_de_avila: ["santa-teresa-de-avila"],
  santa_teresinha_de_lisieux: ["santa-teresinha"],
  santo_expedito: ["santo-expedito"],
  santo_inacio_de_antioquia: ["sao-inacio-de-antioquia"],
  sao_cosme_e_sao_damiao: ["sao-cosme-e-sao-damiao"],
  sao_francisco_de_assis: ["sao-francisco-de-assis"],
  sao_joao_paulo_ii: ["sao-joao-paulo-ii"],
  sao_jorge: ["sao-jorge"],
  sao_judas_tadeu: ["sao-judas-tadeu"],
  sao_maximiliano_kolbe: ["sao-maximiliano-kolbe"],
  sao_miguel_arcanjo: ["sao-miguel-arcanjo", "quaresma-de-sao-miguel-arcanjo"],
  sao_paulo: ["sao-pedro-e-sao-paulo"],
  sao_pio_de_pietrelcina: ["sao-pio-de-pietrelcina"],
  tomas_de_aquino: ["santo-tomas-de-aquino"],
};

/** Novena -> santo cuja vida a página da novena indica (o primeiro da lista, se houver mais de um). */
export const SANTO_POR_NOVENA: Record<string, string> = Object.entries(NOVENAS_POR_SANTO).reduce<Record<string, string>>(
  (acc, [santo, novenas]) => {
    for (const n of novenas) acc[n] ??= santo;
    return acc;
  },
  {}
);
