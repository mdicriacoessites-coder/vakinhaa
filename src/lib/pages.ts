// Institutional content. Texts marked [A DEFINIR] need the owner's real information.
export const PAGES = {
  sobre: {
    title: "Sobre a Vakinha",
    body: [
      "A Vakinha é uma plataforma brasileira de arrecadação coletiva para causas pessoais, sociais, emergenciais e comunitárias.",
      "Nosso compromisso é com a transparência: os valores exibidos nas campanhas refletem apenas contribuições efetivamente confirmadas.",
    ],
  },
  ajuda: {
    title: "Central de ajuda",
    body: [
      "Como criar uma vaquinha: clique em \u201cCriar vaquinha\u201d, preencha as etapas e envie para análise. Após a aprovação, sua campanha fica pública.",
      "Por que minha campanha está em análise? Toda campanha passa por uma revisão antes de ser publicada, para proteger apoiadores e organizadores.",
      "Doações: o recebimento por PIX está em fase de configuração e será liberado em breve.",
    ],
  },
} as const;

export type PageSlug = keyof typeof PAGES;
