export type Coverage = {
  outlet: string;
  short: string;
  headline: string;
  angle: string;
  deck: string;
  emphasizes?: string[];
  misses?: string;
  tone?: string[];
  readTime?: string;
  link?: string;
};

export type Story = {
  id: string;
  section: string;
  title: string;
  deck: string;
  lede: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  credit: string;
  sources: number;
  fact: string;
  factExtra: string;
  keyNumbers: { value: string; label: string }[];
  coverage: Coverage[];
  body: { heading?: string; text: string }[];
  pullQuote?: string;
  tags: string[];
  consensusFacts?: string[];
  divergentPoints?: [string, string][];
  blindSpotList?: string[];
};

export type Dossier = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  vehicles: number;
  documents: number;
  chapters: string[];
  tag: string;
};

export type WeekData = {
  id: string;
  label: string;
  period: string;
  total: number;
  frames: { label: string; value: number }[];
  heard: number;
  experts: number;
  insight: string;
  note: string;
};

export const stories: Story[] = [
  {
    "id": "158",
    "section": "Mundo",
    "title": "Papa recebeu alta do hospital dias após cirurgia de câncer de pulmão",
    "deck": "Os médicos dizem que estão vendo uma “melhora contínua” depois que o papa nascido nos EUA teve um nódulo removido do pulmão na terça-feira.",
    "lede": "Os médicos dizem que estão vendo uma “melhora contínua” depois que o papa nascido nos EUA teve um nódulo removido do pulmão na terça-feira.",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Papa recebeu alta do hospital dias após cirurgia de câncer de pulmão",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Os médicos dizem que estão vendo uma “melhora contínua” depois que o papa nascido nos EUA teve um nódulo removido do pulmão na terça-feira.",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "8",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "Al Jazeera English",
        "short": "Al",
        "headline": "Papa Leão retorna ao Vaticano após cirurgia de câncer de pulmão",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Os médicos dizem que estão vendo uma “melhora contínua” depois que o papa nascido nos EUA teve um nódulo removido do pulmão na terça-feira.",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://www.aljazeera.com/news/2026/10/17/pope-leo-returns-to-vatican-after-lung-cancer-surgery?traffic_source=rss"
      },
      {
        "outlet": "NPR World",
        "short": "NPR",
        "headline": "Papa Leão XIV deixa o hospital dias após cirurgia de câncer de pulmão",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "O Papa deixou o Hospital Gemelli de Roma no sábado, dias depois de uma cirurgia para câncer de pulmão ter removido o lobo inferior do pulmão direito. Atualmente, ele está programado para viajar para a América Latina em novembro.",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://www.npr.org/2026/10/17/nx-s1-6006762/pope-leo-xiv-leaves-hospital-days-after-lung-cancer-surgery"
      },
      {
        "outlet": "BBC News (World)",
        "short": "BBC",
        "headline": "Papa recebeu alta do hospital dias após cirurgia de câncer de pulmão",
        "angle": "Tom descritivo / institucional",
        "deck": "O pontífice fará a tradicional oração e bênção do Angelus na Praça de São Pedro no domingo.",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.bbc.co.uk/news/articles/c5x2vkddrkrko?at_medium=RSS&at_campaign=rss"
      },
      {
        "outlet": "The Guardian",
        "short": "The",
        "headline": "Papa Leão recebe alta do hospital após operação contra câncer",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Os médicos dizem que o pontífice está “apto para receber alta” após a operação para remover um tumor cancerígeno do pulmão Cirurgia de câncer de pulmão do Papa Leão: que tipo de operação ele fez e o que acontece a seguir? O Papa Leão recebeu alta do hospital em Roma depois de ser submetido a uma operação para remover um tumor cancerígeno do pulmão. Leo, de 71 anos, foi considerado “apto para receber alta”, disseram seus médicos, Luigi Carbone e Stefano Margaritora, em comunicado publicado pelo Vaticano. Continuar lendo...",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://www.theguardian.com/world/2026/oct/17/pope-leo-discharged-from-hospital-after-cancer-operation"
      },
      {
        "outlet": "Fox News World",
        "short": "Fox",
        "headline": "Papa Leão XIV recebeu alta do hospital e retornará ao Vaticano após cirurgia para remoção de câncer de pulmão",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "O Papa Leão XIV fez exames de sangue e uma radiografia de tórax no Hospital Gemelli, confirmando que ele está bem o suficiente para retornar ao Vaticano após a cirurgia.",
        "tone": [
          "right"
        ],
        "readTime": "4 min",
        "link": "https://www.foxnews.com/world/pope-leo-xiv-discharged-hospital-return-vatican-surgery-remove-lung-cancer"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Papa recebeu alta do hospital dias após cirurgia de câncer de pulmão"
      },
      {
        "text": "Fato reportado e verificado por 8 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Mundo",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Papa recebeu alta do hospital dias após cirurgia de câncer de pulmão",
      "Fato reportado e verificado por 8 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Ponto #1",
        "Contraste de perspectiva: Foco editorial variado entre veículos conservadores (Fox News World) e progressistas (Al Jazeera English)."
      ]
    ],
    "blindSpotList": [
      "✅ Cobertura Plural: Pauta repercutida em veículos de ambos os polos políticos."
    ]
  },
  {
    "id": "9",
    "section": "Brasil",
    "title": "Atos de rua por Lula misturam fã-clubes, nativos digitais e mobilização fora de partidos",
    "deck": "A mobiliza��o da esquerda nas ruas no segundo turno da elei��o presidencial mexeu com o cen�rio da disputa entre Lula ( PT ) e Fl�vio Bolsonaro ( PL ) e surpreendeu o meio pol�tico ap�s uma campanha que parecia apagada ao longo do primeiro turno. Leia mais (10/17/2026 - 17h57)",
    "lede": "A mobiliza��o da esquerda nas ruas no segundo turno da elei��o presidencial mexeu com o cen�rio da disputa entre Lula ( PT ) e Fl�vio Bolsonaro ( PL ) e surpreendeu o meio pol�tico ap�s uma campanha que parecia apagada ao longo do primeiro turno. Leia mais (10/17/2026 - 17h57)",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Atos de rua por Lula misturam fã-clubes, nativos digitais e mobilização fora de partidos",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "A mobiliza��o da esquerda nas ruas no segundo turno da elei��o presidencial mexeu com o cen�rio da disputa entre Lula ( PT ) e Fl�vio Bolsonaro ( PL ) e surpreendeu o meio pol�tico ap�s uma campanha que parecia apagada ao longo do primeiro turno. Leia mais (10/17/2026 - 17h57)",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "6",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "UOL Notícias",
        "short": "UOL",
        "headline": "Atos de rua por Lula misturam fã-clubes, nativos digitais e mobilização fora de partidos",
        "angle": "Tom descritivo / institucional",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www1.folha.uol.com.br/poder/2026/10/atos-de-rua-por-lula-misturam-fa-clubes-nativos-digitais-e-mobilizacao-fora-de-partidos.shtml"
      },
      {
        "outlet": "Folha de S.Paulo",
        "short": "Folha",
        "headline": "Atos de rua por Lula misturam f�-clubes, nativos digitais e mobiliza��o fora de partidos",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "A mobiliza��o da esquerda nas ruas no segundo turno da elei��o presidencial mexeu com o cen�rio da disputa entre Lula ( PT ) e Fl�vio Bolsonaro ( PL ) e surpreendeu o meio pol�tico ap�s uma campanha que parecia apagada ao longo do primeiro turno. Leia mais (10/17/2026 - 17h57)",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://redir.folha.com.br/redir/online/emcimadahora/rss091/*https://www1.folha.uol.com.br/poder/2026/10/atos-de-rua-por-lula-misturam-fa-clubes-nativos-digitais-e-mobilizacao-fora-de-partidos.shtml"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Atos de rua por Lula misturam fã-clubes, nativos digitais e mobilização fora de partidos"
      },
      {
        "text": "Fato reportado e verificado por 6 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Atos de rua por Lula misturam fã-clubes, nativos digitais e mobilização fora de partidos",
      "Fato reportado e verificado por 6 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "ℹ️ Desbalanceamento: Predominância de veículos progressistas/esquerda. Pouca ou nenhuma repercussão na direita."
    ]
  },
  {
    "id": "4",
    "section": "Brasil",
    "title": "Ex-presidente José Sarney recebe alta hospitalar após nove dias de internação",
    "deck": "Paciente apresentou evolução clínica satisfatória e seguirá em tratamento ambulatorial",
    "lede": "Paciente apresentou evolução clínica satisfatória e seguirá em tratamento ambulatorial",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Ex-presidente José Sarney recebe alta hospitalar após nove dias de internação",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Paciente apresentou evolução clínica satisfatória e seguirá em tratamento ambulatorial",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "5",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "UOL Notícias",
        "short": "UOL",
        "headline": "Ex-presidente José Sarney recebe alta hospitalar após nove dias de internação",
        "angle": "Tom descritivo / institucional",
        "deck": "Paciente apresentou evolução clínica satisfatória e seguirá em tratamento ambulatorial",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.redetv.uol.com.br/jornalismo/geral/ex-presidente-jose-sarney-recebe-alta-hospitalar-apos-nove-dias-de-internac"
      },
      {
        "outlet": "Folha de S.Paulo",
        "short": "Folha",
        "headline": "Ex-presidente Jos� Sarney recebe alta ap�s cirurgia abdominal no Maranh�o",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "O ex-presidente Jos� Sarney recebeu alta hoje, em S�o Lu�s, ap�s passar por uma cirurgia abdominal para tratar uma obstru��o intestinal. Leia mais (10/17/2026 - 16h49)",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://redir.folha.com.br/redir/online/emcimadahora/rss091/*https://www1.folha.uol.com.br/poder/2026/10/ex-presidente-jose-sarney-recebe-alta-apos-cirurgia-abdominal-no-maranhao.shtml"
      },
      {
        "outlet": "CNN Brasil",
        "short": "CNN",
        "headline": "Sarney tem alta após passar por cirurgia para corrigir obstrução intestinal",
        "angle": "Tom descritivo / institucional",
        "deck": "Ex-presidente de 96 anos ficou nove dias hospitalizado em São Luís (MA) depois de apresentar um quadro de dores abdominais; boletim médico deste sábado (10) aponta boa evolução clínica",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.cnnbrasil.com.br/politica/sarney-tem-alta-apos-passar-por-cirurgia-para-corrigir-obstrucao-intestinal/"
      },
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "José Sarney recebe alta após cirurgia abdominal e nove dias internado",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Ex-presidente de 96 anos passou por procedimento para tratar obstrução intestinal em São Luís; boletim médico aponta evolução satisfatória",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/politica/jose-sarney-recebe-alta-apos-cirurgia-abdominal-aos-96-anos/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Ex-presidente José Sarney recebe alta hospitalar após nove dias de internação"
      },
      {
        "text": "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Ex-presidente José Sarney recebe alta hospitalar após nove dias de internação",
      "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Ponto #1",
        "Contraste de perspectiva: Foco editorial variado entre veículos conservadores (Estadão) e progressistas (Folha de S.Paulo)."
      ]
    ],
    "blindSpotList": [
      "✅ Cobertura Plural: Pauta repercutida em veículos de ambos os polos políticos."
    ]
  },
  {
    "id": "7",
    "section": "Brasil",
    "title": "'Quem provocar incêndios criminosos precisa responder com rigor da lei', diz governador após aumento de focos no Amazonas",
    "deck": "O governador do Amazonas, Roberto Cidade Tiago Correa/Secom O governador do Amazonas, Roberto Cidade (União Brasil), afirmou neste sábado (17) que pessoas suspeitas de provocar incêndios criminosos no estado devem responder com todo o rigor da lei. A declaração foi feita em meio ao agravamento da qualidade do ar em Manaus e em outras cidades do Amazonas, atingidas pela fumaça de queimadas e incêndios florestais. Por volta das 8h40, o índice de qualidade do ar em Manaus chegou a 657 pontos, segundo a plataforma internacional IQAir. A concentração de partículas finas (PM2.5) atingiu 404,3 microgramas por metro cúbico (µg/m³), o equivalente a 80,9 vezes a diretriz anual recomendada pela Organização Mundial da Saúde (OMS), de 5 µg/m³. Segundo Cidade, o estado enfrenta um dos períodos mais críticos da estiagem, intensificada pelo fenômeno El Niño. O governador também informou que convocou, em caráter de emergência, o Comitê Permanente de Enfrentamento a Eventos Climáticos e Ambientais (Copec) para definir novas medidas de combate aos incêndios florestais, reforçar a fiscalização e ampliar a proteção à população. 📲 Participe do canal do g1 AM no WhatsApp “O Amazonas enfrenta um dos momentos mais críticos desta estiagem. Há dez dias, nossa população sofre com a fumaça provocada por incêndios florestais, muitos deles criminosos, que ameaçam a saúde e a vida de milhares de famílias”, disse o governador. Além dos impactos à saúde, a fumaça reduziu a visibilidade e impediu operações aéreas de combate aos incêndios florestais neste sábado, segundo o Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (Ibama). A retomada ocorreu após a melhora das condições de visibilidade. SSP-AM intensifica monitoramento aéreo Nesta sexta-feira (16), a Secretaria de Segurança Pública do Amazonas (SSP-AM) informou que intensificou o monitoramento aéreo de áreas afetadas por queimadas e incêndios florestais. A operação utiliza um Veículo Aéreo Não Tripulado (Vant) e aeronaves do Departamento Integrado de Operações Aéreas (DIOA). De acordo com a secretaria, a iniciativa integra as ações de enfrentamento aos crimes ambientais realizadas em conjunto com órgãos de fiscalização. As imagens captadas durante os sobrevoos ajudam as equipes a identificar movimentações suspeitas, localizar possíveis responsáveis por incêndios criminosos e direcionar operações policiais nas áreas monitoradas. Até a última atualização desta reportagem, não havia informações sobre prisões de suspeitos de provocar incêndios florestais no estado. Focos de incêndio no Amazonas Dados do Painel do Fogo, consultados pelo g1 na tarde deste sábado (17), apontam aumento de mais de 190% nos focos de incêndio no Amazonas nos primeiros 17 dias de outubro, em comparação com o mesmo período do ano anterior. Segundo os dados informados, o estado registrou 651 focos ativos neste ano. No entanto, o número atribuído ao ano passado também aparece como 651, o que impede confirmar o percentual de crescimento. Os totais precisam ser conferidos antes da publicação. A distribuição dos focos por tipo de área também apresenta divergências nos números fornecidos. Os dados precisam ser revisados para identificar quantas ocorrências foram registradas em áreas públicas e privadas, assentamentos federais, unidades de conservação e terras indígenas. Qualidade do ar em Manaus A declaração de Cidade foi publicada no mesmo dia em que Manaus registrou níveis perigosos de poluição atmosférica provocada pela fumaça. Segundo a plataforma internacional IQAir, a concentração de partículas finas PM2.5 chegou a 59,2 vezes o valor recomendado pela Organização Mundial da Saúde (OMS) para a média anual desse poluente. Pela manhã, a Defesa Civil do Amazonas emitiu um alerta de risco severo, associando a poluição aos incêndios florestais em áreas não protegidas. Por volta das 6h, Manaus registrava 441 pontos no Índice de Qualidade do Ar (AQI), o pior resultado entre as capitais brasileiras naquele momento, segundo a IQAir. A concentração de material particulado fino era de 295,9 microgramas por metro cúbico (µg/m³). A situação piorou ao longo da manhã. Por volta das 8h40, o índice AQI+ subiu para 657 pontos, mantendo a classificação de qualidade do ar como “perigosa”. A concentração de PM2.5 chegou a 404,3 µg/m³, equivalente a 80,9 vezes a diretriz anual recomendada pela OMS, de 5 µg/m³. Entre 1º de junho e 16 de outubro, o Corpo de Bombeiros Militar do Amazonas (CBMAM) contabilizou 3.710 ocorrências relacionadas a incêndios urbanos e florestais e atuou no combate a 22.557 focos de incêndio em todo o estado. Desse total, 4.598 foram registrados em Manaus e 17.959 no interior. Cerca de mil profissionais, entre bombeiros militares e brigadistas, participam das operações. Moradores relatam fumaça intensa e dificuldade para respirar Nas redes sociais, moradores de Manaus relataram cheiro forte de fumaça, ardência nos olhos e dificuldade para respirar neste sábado. Algumas publicações descreveram o episódio como o pior já vivido na capital amazonense. “Mais um dia acordando com o fedor insuportável de fumaça. a qualidade do ar em manaus continua péssima e, mais uma vez, volto a dizer que sinto que estão tentando nos matar sufocados”, escreveu um usuário na rede social X. Outro morador afirmou que a fumaça prejudicava a visibilidade. “Hoje de longe o pior dia pra se estar em Manaus, a fumaça é tão forte, fedorenta e densa que até a visibilidade tá afetada”, publicou. “O pior limiar de todos os episódios de fumaça na cidade”, escreveu outra pessoa. Também houve relatos de ardência nos olhos mesmo dentro de casa e críticas à atuação das autoridades. “Arrisco dizer que hoje é o pior dia de Manaus no quesito poluição, os olhos ardem dentro de casa. E o pior: os governantes não estão levando o assunto tão a sério como deveria ser”, afirmou um usuário. Outras publicações apontaram uma piora progressiva da situação. “Parece que Manaus amanhece cada dia pior com essa fumaça”, escreveu outra pessoa. Manaus sofre efeitos da poluição do ar e queimadas mudam rotina na capital",
    "lede": "O governador do Amazonas, Roberto Cidade Tiago Correa/Secom O governador do Amazonas, Roberto Cidade (União Brasil), afirmou neste sábado (17) que pessoas suspeitas de provocar incêndios criminosos no estado devem responder com todo o rigor da lei. A declaração foi feita em meio ao agravamento da qualidade do ar em Manaus e em outras cidades do Amazonas, atingidas pela fumaça de queimadas e incêndios florestais. Por volta das 8h40, o índice de qualidade do ar em Manaus chegou a 657 pontos, segundo a plataforma internacional IQAir. A concentração de partículas finas (PM2.5) atingiu 404,3 microgramas por metro cúbico (µg/m³), o equivalente a 80,9 vezes a diretriz anual recomendada pela Organização Mundial da Saúde (OMS), de 5 µg/m³. Segundo Cidade, o estado enfrenta um dos períodos mais críticos da estiagem, intensificada pelo fenômeno El Niño. O governador também informou que convocou, em caráter de emergência, o Comitê Permanente de Enfrentamento a Eventos Climáticos e Ambientais (Copec) para definir novas medidas de combate aos incêndios florestais, reforçar a fiscalização e ampliar a proteção à população. 📲 Participe do canal do g1 AM no WhatsApp “O Amazonas enfrenta um dos momentos mais críticos desta estiagem. Há dez dias, nossa população sofre com a fumaça provocada por incêndios florestais, muitos deles criminosos, que ameaçam a saúde e a vida de milhares de famílias”, disse o governador. Além dos impactos à saúde, a fumaça reduziu a visibilidade e impediu operações aéreas de combate aos incêndios florestais neste sábado, segundo o Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (Ibama). A retomada ocorreu após a melhora das condições de visibilidade. SSP-AM intensifica monitoramento aéreo Nesta sexta-feira (16), a Secretaria de Segurança Pública do Amazonas (SSP-AM) informou que intensificou o monitoramento aéreo de áreas afetadas por queimadas e incêndios florestais. A operação utiliza um Veículo Aéreo Não Tripulado (Vant) e aeronaves do Departamento Integrado de Operações Aéreas (DIOA). De acordo com a secretaria, a iniciativa integra as ações de enfrentamento aos crimes ambientais realizadas em conjunto com órgãos de fiscalização. As imagens captadas durante os sobrevoos ajudam as equipes a identificar movimentações suspeitas, localizar possíveis responsáveis por incêndios criminosos e direcionar operações policiais nas áreas monitoradas. Até a última atualização desta reportagem, não havia informações sobre prisões de suspeitos de provocar incêndios florestais no estado. Focos de incêndio no Amazonas Dados do Painel do Fogo, consultados pelo g1 na tarde deste sábado (17), apontam aumento de mais de 190% nos focos de incêndio no Amazonas nos primeiros 17 dias de outubro, em comparação com o mesmo período do ano anterior. Segundo os dados informados, o estado registrou 651 focos ativos neste ano. No entanto, o número atribuído ao ano passado também aparece como 651, o que impede confirmar o percentual de crescimento. Os totais precisam ser conferidos antes da publicação. A distribuição dos focos por tipo de área também apresenta divergências nos números fornecidos. Os dados precisam ser revisados para identificar quantas ocorrências foram registradas em áreas públicas e privadas, assentamentos federais, unidades de conservação e terras indígenas. Qualidade do ar em Manaus A declaração de Cidade foi publicada no mesmo dia em que Manaus registrou níveis perigosos de poluição atmosférica provocada pela fumaça. Segundo a plataforma internacional IQAir, a concentração de partículas finas PM2.5 chegou a 59,2 vezes o valor recomendado pela Organização Mundial da Saúde (OMS) para a média anual desse poluente. Pela manhã, a Defesa Civil do Amazonas emitiu um alerta de risco severo, associando a poluição aos incêndios florestais em áreas não protegidas. Por volta das 6h, Manaus registrava 441 pontos no Índice de Qualidade do Ar (AQI), o pior resultado entre as capitais brasileiras naquele momento, segundo a IQAir. A concentração de material particulado fino era de 295,9 microgramas por metro cúbico (µg/m³). A situação piorou ao longo da manhã. Por volta das 8h40, o índice AQI+ subiu para 657 pontos, mantendo a classificação de qualidade do ar como “perigosa”. A concentração de PM2.5 chegou a 404,3 µg/m³, equivalente a 80,9 vezes a diretriz anual recomendada pela OMS, de 5 µg/m³. Entre 1º de junho e 16 de outubro, o Corpo de Bombeiros Militar do Amazonas (CBMAM) contabilizou 3.710 ocorrências relacionadas a incêndios urbanos e florestais e atuou no combate a 22.557 focos de incêndio em todo o estado. Desse total, 4.598 foram registrados em Manaus e 17.959 no interior. Cerca de mil profissionais, entre bombeiros militares e brigadistas, participam das operações. Moradores relatam fumaça intensa e dificuldade para respirar Nas redes sociais, moradores de Manaus relataram cheiro forte de fumaça, ardência nos olhos e dificuldade para respirar neste sábado. Algumas publicações descreveram o episódio como o pior já vivido na capital amazonense. “Mais um dia acordando com o fedor insuportável de fumaça. a qualidade do ar em manaus continua péssima e, mais uma vez, volto a dizer que sinto que estão tentando nos matar sufocados”, escreveu um usuário na rede social X. Outro morador afirmou que a fumaça prejudicava a visibilidade. “Hoje de longe o pior dia pra se estar em Manaus, a fumaça é tão forte, fedorenta e densa que até a visibilidade tá afetada”, publicou. “O pior limiar de todos os episódios de fumaça na cidade”, escreveu outra pessoa. Também houve relatos de ardência nos olhos mesmo dentro de casa e críticas à atuação das autoridades. “Arrisco dizer que hoje é o pior dia de Manaus no quesito poluição, os olhos ardem dentro de casa. E o pior: os governantes não estão levando o assunto tão a sério como deveria ser”, afirmou um usuário. Outras publicações apontaram uma piora progressiva da situação. “Parece que Manaus amanhece cada dia pior com essa fumaça”, escreveu outra pessoa. Manaus sofre efeitos da poluição do ar e queimadas mudam rotina na capital",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "'Quem provocar incêndios criminosos precisa responder com rigor da lei', diz governador após aumento de focos no Amazonas",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "O governador do Amazonas, Roberto Cidade Tiago Correa/Secom O governador do Amazonas, Roberto Cidade (União Brasil), afirmou neste sábado (17) que pessoas suspeitas de provocar incêndios criminosos no estado devem responder com todo o rigor da lei. A declaração foi feita em meio ao agravamento da qualidade do ar em Manaus e em outras cidades do Amazonas, atingidas pela fumaça de queimadas e incêndios florestais. Por volta das 8h40, o índice de qualidade do ar em Manaus chegou a 657 pontos, segundo a plataforma internacional IQAir. A concentração de partículas finas (PM2.5) atingiu 404,3 microgramas por metro cúbico (µg/m³), o equivalente a 80,9 vezes a diretriz anual recomendada pela Organização Mundial da Saúde (OMS), de 5 µg/m³. Segundo Cidade, o estado enfrenta um dos períodos mais críticos da estiagem, intensificada pelo fenômeno El Niño. O governador também informou que convocou, em caráter de emergência, o Comitê Permanente de Enfrentamento a Eventos Climáticos e Ambientais (Copec) para definir novas medidas de combate aos incêndios florestais, reforçar a fiscalização e ampliar a proteção à população. 📲 Participe do canal do g1 AM no WhatsApp “O Amazonas enfrenta um dos momentos mais críticos desta estiagem. Há dez dias, nossa população sofre com a fumaça provocada por incêndios florestais, muitos deles criminosos, que ameaçam a saúde e a vida de milhares de famílias”, disse o governador. Além dos impactos à saúde, a fumaça reduziu a visibilidade e impediu operações aéreas de combate aos incêndios florestais neste sábado, segundo o Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (Ibama). A retomada ocorreu após a melhora das condições de visibilidade. SSP-AM intensifica monitoramento aéreo Nesta sexta-feira (16), a Secretaria de Segurança Pública do Amazonas (SSP-AM) informou que intensificou o monitoramento aéreo de áreas afetadas por queimadas e incêndios florestais. A operação utiliza um Veículo Aéreo Não Tripulado (Vant) e aeronaves do Departamento Integrado de Operações Aéreas (DIOA). De acordo com a secretaria, a iniciativa integra as ações de enfrentamento aos crimes ambientais realizadas em conjunto com órgãos de fiscalização. As imagens captadas durante os sobrevoos ajudam as equipes a identificar movimentações suspeitas, localizar possíveis responsáveis por incêndios criminosos e direcionar operações policiais nas áreas monitoradas. Até a última atualização desta reportagem, não havia informações sobre prisões de suspeitos de provocar incêndios florestais no estado. Focos de incêndio no Amazonas Dados do Painel do Fogo, consultados pelo g1 na tarde deste sábado (17), apontam aumento de mais de 190% nos focos de incêndio no Amazonas nos primeiros 17 dias de outubro, em comparação com o mesmo período do ano anterior. Segundo os dados informados, o estado registrou 651 focos ativos neste ano. No entanto, o número atribuído ao ano passado também aparece como 651, o que impede confirmar o percentual de crescimento. Os totais precisam ser conferidos antes da publicação. A distribuição dos focos por tipo de área também apresenta divergências nos números fornecidos. Os dados precisam ser revisados para identificar quantas ocorrências foram registradas em áreas públicas e privadas, assentamentos federais, unidades de conservação e terras indígenas. Qualidade do ar em Manaus A declaração de Cidade foi publicada no mesmo dia em que Manaus registrou níveis perigosos de poluição atmosférica provocada pela fumaça. Segundo a plataforma internacional IQAir, a concentração de partículas finas PM2.5 chegou a 59,2 vezes o valor recomendado pela Organização Mundial da Saúde (OMS) para a média anual desse poluente. Pela manhã, a Defesa Civil do Amazonas emitiu um alerta de risco severo, associando a poluição aos incêndios florestais em áreas não protegidas. Por volta das 6h, Manaus registrava 441 pontos no Índice de Qualidade do Ar (AQI), o pior resultado entre as capitais brasileiras naquele momento, segundo a IQAir. A concentração de material particulado fino era de 295,9 microgramas por metro cúbico (µg/m³). A situação piorou ao longo da manhã. Por volta das 8h40, o índice AQI+ subiu para 657 pontos, mantendo a classificação de qualidade do ar como “perigosa”. A concentração de PM2.5 chegou a 404,3 µg/m³, equivalente a 80,9 vezes a diretriz anual recomendada pela OMS, de 5 µg/m³. Entre 1º de junho e 16 de outubro, o Corpo de Bombeiros Militar do Amazonas (CBMAM) contabilizou 3.710 ocorrências relacionadas a incêndios urbanos e florestais e atuou no combate a 22.557 focos de incêndio em todo o estado. Desse total, 4.598 foram registrados em Manaus e 17.959 no interior. Cerca de mil profissionais, entre bombeiros militares e brigadistas, participam das operações. Moradores relatam fumaça intensa e dificuldade para respirar Nas redes sociais, moradores de Manaus relataram cheiro forte de fumaça, ardência nos olhos e dificuldade para respirar neste sábado. Algumas publicações descreveram o episódio como o pior já vivido na capital amazonense. “Mais um dia acordando com o fedor insuportável de fumaça. a qualidade do ar em manaus continua péssima e, mais uma vez, volto a dizer que sinto que estão tentando nos matar sufocados”, escreveu um usuário na rede social X. Outro morador afirmou que a fumaça prejudicava a visibilidade. “Hoje de longe o pior dia pra se estar em Manaus, a fumaça é tão forte, fedorenta e densa que até a visibilidade tá afetada”, publicou. “O pior limiar de todos os episódios de fumaça na cidade”, escreveu outra pessoa. Também houve relatos de ardência nos olhos mesmo dentro de casa e críticas à atuação das autoridades. “Arrisco dizer que hoje é o pior dia de Manaus no quesito poluição, os olhos ardem dentro de casa. E o pior: os governantes não estão levando o assunto tão a sério como deveria ser”, afirmou um usuário. Outras publicações apontaram uma piora progressiva da situação. “Parece que Manaus amanhece cada dia pior com essa fumaça”, escreveu outra pessoa. Manaus sofre efeitos da poluição do ar e queimadas mudam rotina na capital",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "5",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "G1 (Globo)",
        "short": "G1",
        "headline": "'Quem provocar incêndios criminosos precisa responder com rigor da lei', diz governador após aumento de focos no Amazonas",
        "angle": "Tom descritivo / institucional",
        "deck": "O governador do Amazonas, Roberto Cidade Tiago Correa/Secom O governador do Amazonas, Roberto Cidade (União Brasil), afirmou neste sábado (17) que pessoas suspeitas de provocar incêndios criminosos no estado devem responder com todo o rigor da lei. A declaração foi feita em meio ao agravamento da qualidade do ar em Manaus e em outras cidades do Amazonas, atingidas pela fumaça de queimadas e incêndios florestais. Por volta das 8h40, o índice de qualidade do ar em Manaus chegou a 657 pontos, segundo a plataforma internacional IQAir. A concentração de partículas finas (PM2.5) atingiu 404,3 microgramas por metro cúbico (µg/m³), o equivalente a 80,9 vezes a diretriz anual recomendada pela Organização Mundial da Saúde (OMS), de 5 µg/m³. Segundo Cidade, o estado enfrenta um dos períodos mais críticos da estiagem, intensificada pelo fenômeno El Niño. O governador também informou que convocou, em caráter de emergência, o Comitê Permanente de Enfrentamento a Eventos Climáticos e Ambientais (Copec) para definir novas medidas de combate aos incêndios florestais, reforçar a fiscalização e ampliar a proteção à população. 📲 Participe do canal do g1 AM no WhatsApp “O Amazonas enfrenta um dos momentos mais críticos desta estiagem. Há dez dias, nossa população sofre com a fumaça provocada por incêndios florestais, muitos deles criminosos, que ameaçam a saúde e a vida de milhares de famílias”, disse o governador. Além dos impactos à saúde, a fumaça reduziu a visibilidade e impediu operações aéreas de combate aos incêndios florestais neste sábado, segundo o Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (Ibama). A retomada ocorreu após a melhora das condições de visibilidade. SSP-AM intensifica monitoramento aéreo Nesta sexta-feira (16), a Secretaria de Segurança Pública do Amazonas (SSP-AM) informou que intensificou o monitoramento aéreo de áreas afetadas por queimadas e incêndios florestais. A operação utiliza um Veículo Aéreo Não Tripulado (Vant) e aeronaves do Departamento Integrado de Operações Aéreas (DIOA). De acordo com a secretaria, a iniciativa integra as ações de enfrentamento aos crimes ambientais realizadas em conjunto com órgãos de fiscalização. As imagens captadas durante os sobrevoos ajudam as equipes a identificar movimentações suspeitas, localizar possíveis responsáveis por incêndios criminosos e direcionar operações policiais nas áreas monitoradas. Até a última atualização desta reportagem, não havia informações sobre prisões de suspeitos de provocar incêndios florestais no estado. Focos de incêndio no Amazonas Dados do Painel do Fogo, consultados pelo g1 na tarde deste sábado (17), apontam aumento de mais de 190% nos focos de incêndio no Amazonas nos primeiros 17 dias de outubro, em comparação com o mesmo período do ano anterior. Segundo os dados informados, o estado registrou 651 focos ativos neste ano. No entanto, o número atribuído ao ano passado também aparece como 651, o que impede confirmar o percentual de crescimento. Os totais precisam ser conferidos antes da publicação. A distribuição dos focos por tipo de área também apresenta divergências nos números fornecidos. Os dados precisam ser revisados para identificar quantas ocorrências foram registradas em áreas públicas e privadas, assentamentos federais, unidades de conservação e terras indígenas. Qualidade do ar em Manaus A declaração de Cidade foi publicada no mesmo dia em que Manaus registrou níveis perigosos de poluição atmosférica provocada pela fumaça. Segundo a plataforma internacional IQAir, a concentração de partículas finas PM2.5 chegou a 59,2 vezes o valor recomendado pela Organização Mundial da Saúde (OMS) para a média anual desse poluente. Pela manhã, a Defesa Civil do Amazonas emitiu um alerta de risco severo, associando a poluição aos incêndios florestais em áreas não protegidas. Por volta das 6h, Manaus registrava 441 pontos no Índice de Qualidade do Ar (AQI), o pior resultado entre as capitais brasileiras naquele momento, segundo a IQAir. A concentração de material particulado fino era de 295,9 microgramas por metro cúbico (µg/m³). A situação piorou ao longo da manhã. Por volta das 8h40, o índice AQI+ subiu para 657 pontos, mantendo a classificação de qualidade do ar como “perigosa”. A concentração de PM2.5 chegou a 404,3 µg/m³, equivalente a 80,9 vezes a diretriz anual recomendada pela OMS, de 5 µg/m³. Entre 1º de junho e 16 de outubro, o Corpo de Bombeiros Militar do Amazonas (CBMAM) contabilizou 3.710 ocorrências relacionadas a incêndios urbanos e florestais e atuou no combate a 22.557 focos de incêndio em todo o estado. Desse total, 4.598 foram registrados em Manaus e 17.959 no interior. Cerca de mil profissionais, entre bombeiros militares e brigadistas, participam das operações. Moradores relatam fumaça intensa e dificuldade para respirar Nas redes sociais, moradores de Manaus relataram cheiro forte de fumaça, ardência nos olhos e dificuldade para respirar neste sábado. Algumas publicações descreveram o episódio como o pior já vivido na capital amazonense. “Mais um dia acordando com o fedor insuportável de fumaça. a qualidade do ar em manaus continua péssima e, mais uma vez, volto a dizer que sinto que estão tentando nos matar sufocados”, escreveu um usuário na rede social X. Outro morador afirmou que a fumaça prejudicava a visibilidade. “Hoje de longe o pior dia pra se estar em Manaus, a fumaça é tão forte, fedorenta e densa que até a visibilidade tá afetada”, publicou. “O pior limiar de todos os episódios de fumaça na cidade”, escreveu outra pessoa. Também houve relatos de ardência nos olhos mesmo dentro de casa e críticas à atuação das autoridades. “Arrisco dizer que hoje é o pior dia de Manaus no quesito poluição, os olhos ardem dentro de casa. E o pior: os governantes não estão levando o assunto tão a sério como deveria ser”, afirmou um usuário. Outras publicações apontaram uma piora progressiva da situação. “Parece que Manaus amanhece cada dia pior com essa fumaça”, escreveu outra pessoa. Manaus sofre efeitos da poluição do ar e queimadas mudam rotina na capital",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://g1.globo.com/am/amazonas/noticia/2026/10/17/quem-provocar-incendios-criminosos-precisa-responder-com-rigor-da-lei-diz-governador-apos-aumento-de-focos-no-amazonas.ghtml"
      },
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "Defesa Civil alerta para qualidade do ar péssima em Manaus devido a fumaça de queimadas",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/brasil/defesa-civil-alerta-para-qualidade-do-ar-pessima-em-manaus-devido-a-fumaca-de-queimadas/"
      },
      {
        "outlet": "Jovem Pan News",
        "short": "Jovem",
        "headline": "Manaus amanhece coberta por fumaça de queimadas; prefeitura faz apelo",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Poluição decorrente das queimadas na região voltou a afetar a visibilidade, alterar a rotina da capital amazonense e acender o alerta para os impactos na saúde pública",
        "tone": [
          "right"
        ],
        "readTime": "4 min",
        "link": "https://jovempan.com.br/brasil/manaus-amanhece-coberta-por-fumaca-de-queimadas-prefeitura-faz-apelo/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: 'Quem provocar incêndios criminosos precisa responder com rigor da lei', diz governador após aumento de focos no Amazonas"
      },
      {
        "text": "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: 'Quem provocar incêndios criminosos precisa responder com rigor da lei', diz governador após aumento de focos no Amazonas",
      "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Ponto #1",
        "Divergência de tom: Enquanto G1 (Globo) optou por relato factual, G1 (Globo) utilizou linguagem valorativa (revoltante, inaceitável)."
      ]
    ],
    "blindSpotList": [
      "ℹ️ Desbalanceamento: Predominância de veículos conservadores/direita. Pouca ou nenhuma repercussão na esquerda."
    ]
  },
  {
    "id": "12",
    "section": "Brasil",
    "title": "João Fonseca toma decisão sobre sequência da temporada",
    "deck": "Tenista brasileiro optou por voltar às quadras apenas em 2027",
    "lede": "Tenista brasileiro optou por voltar às quadras apenas em 2027",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "João Fonseca toma decisão sobre sequência da temporada",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Tenista brasileiro optou por voltar às quadras apenas em 2027",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "5",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "Veja",
        "short": "Veja",
        "headline": "João Fonseca toma decisão sobre sequência da temporada",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Tenista brasileiro optou por voltar às quadras apenas em 2027",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://veja.abril.com.br/esporte/joao-fonseca-encerra-temporada-antecipadamente-e-explica-decisao/"
      },
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "João Fonseca encerra ano sem títulos, acumula lesões e vê rivais superá-lo",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/esportes/tenis/joao-fonseca-encerra-ano-sem-titulos-acumula-lesoes-e-ve-rivais-supera-lo/"
      },
      {
        "outlet": "Jovem Pan News",
        "short": "Jovem",
        "headline": "João Fonseca fala em priorizar saúde e só retorna ao circuito em 2027",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "A temporada 2026 foi marcada por uma série de lesões do principal tenista brasileiro",
        "tone": [
          "right"
        ],
        "readTime": "4 min",
        "link": "https://jovempan.com.br/esportes/joao-fonseca-fala-em-priorizar-saude-e-so-retorna-ao-circuito-em-2027/"
      },
      {
        "outlet": "CartaCapital",
        "short": "CartaCapital",
        "headline": "João Fonseca toma decisão definitiva sobre o fim da temporada de 2026",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Decisão visa recuperação completa após as dores no abdômen sentidas em Cincinatti e Montréal; João pode não ser cabeça de chave de grandes torneios em 2027",
        "tone": [
          "left"
        ],
        "readTime": "4 min",
        "link": "https://www.cartacapital.com.br/esporte/joao-fonseca-toma-decisao-definitiva-sobre-o-fim-da-temporada-de-2026/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: João Fonseca toma decisão sobre sequência da temporada"
      },
      {
        "text": "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: João Fonseca toma decisão sobre sequência da temporada",
      "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Ponto #1",
        "Contraste de perspectiva: Foco editorial variado entre veículos conservadores (Veja) e progressistas (CartaCapital)."
      ]
    ],
    "blindSpotList": [
      "✅ Cobertura Plural: Pauta repercutida em veículos de ambos os polos políticos."
    ]
  },
  {
    "id": "285",
    "section": "Brasil",
    "title": "Bayern goleia Leipzig e “rouba” liderança na Bundesliga",
    "deck": "Com goleada sobre o Leipzig, time bávaro iguala pontos do Dortmund e lidera pelo saldo de gols; Freiburg ainda pode surpreender",
    "lede": "Com goleada sobre o Leipzig, time bávaro iguala pontos do Dortmund e lidera pelo saldo de gols; Freiburg ainda pode surpreender",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Bayern goleia Leipzig e “rouba” liderança na Bundesliga",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Com goleada sobre o Leipzig, time bávaro iguala pontos do Dortmund e lidera pelo saldo de gols; Freiburg ainda pode surpreender",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "5",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "CNN Brasil",
        "short": "CNN",
        "headline": "Bayern goleia Leipzig e “rouba” liderança na Bundesliga",
        "angle": "Tom descritivo / institucional",
        "deck": "Com goleada sobre o Leipzig, time bávaro iguala pontos do Dortmund e lidera pelo saldo de gols; Freiburg ainda pode surpreender",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.cnnbrasil.com.br/esportes/futebol/futebol-internacional/futebol-alemao/bayern-goleia-leipzig-e-rouba-lideranca-na-bundesliga/"
      },
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "Bayern de Munique x RB Leipzig pela Bundesliga: onde assistir ao vivo, horário e escalação",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/esportes/futebol/bayern-de-munique-x-rb-leipzig-pela-bundesliga-onde-assistir-ao-vivo-horario-e-escalacao/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Bayern goleia Leipzig e “rouba” liderança na Bundesliga"
      },
      {
        "text": "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Bayern goleia Leipzig e “rouba” liderança na Bundesliga",
      "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "ℹ️ Desbalanceamento: Predominância de veículos conservadores/direita. Pouca ou nenhuma repercussão na esquerda."
    ]
  },
  {
    "id": "1376",
    "section": "Brasil",
    "title": "Colonos israelenses atacam comitiva de diplomatas europeus na Cisjordânia",
    "deck": "Colonos israelenses atacaram neste sábado (17) uma comitiva de diplomatas europeus que visitavam a Cisjordânia ocupada e agrediram um prefeito francês, relataram testemunhas e fontes diplomáticas.",
    "lede": "Colonos israelenses atacaram neste sábado (17) uma comitiva de diplomatas europeus que visitavam a Cisjordânia ocupada e agrediram um prefeito francês, relataram testemunhas e fontes diplomáticas.",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Colonos israelenses atacam comitiva de diplomatas europeus na Cisjordânia",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Colonos israelenses atacaram neste sábado (17) uma comitiva de diplomatas europeus que visitavam a Cisjordânia ocupada e agrediram um prefeito francês, relataram testemunhas e fontes diplomáticas.",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "5",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "UOL Notícias",
        "short": "UOL",
        "headline": "Colonos israelenses atacam comitiva de diplomatas europeus na Cisjordânia",
        "angle": "Tom descritivo / institucional",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www1.folha.uol.com.br/mundo/2026/10/colonos-israelenses-atacam-comitiva-de-diplomatas-europeus-na-cisjordania.shtml"
      },
      {
        "outlet": "Folha de S.Paulo",
        "short": "Folha",
        "headline": "Colonos israelenses atacam comitiva de diplomatas europeus na Cisjord�nia",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Colonos israelenses atacaram civis palestinos, diplomatas europeus e um prefeito franc�s neste s�bado (17) na Cisjord�nia ocupada, afirmou o ministro das Rela��es Exteriores da B�lgica . Um dia antes, colonos haviam agredido uma fotojornalista americana. Leia mais (10/17/2026 - 17h09)",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://redir.folha.com.br/redir/online/emcimadahora/rss091/*https://www1.folha.uol.com.br/mundo/2026/10/colonos-israelenses-atacam-comitiva-de-diplomatas-europeus-na-cisjordania.shtml"
      },
      {
        "outlet": "CNN Brasil",
        "short": "CNN",
        "headline": "Colonos de Israel atacam palestinos e diplomatas europeus na Cisjordânia",
        "angle": "Tom descritivo / institucional",
        "deck": "Chanceler belga acusou israelenses de atacarem autoridades francesas e polonesas, afirmando que a \"impunidade dos colonos violentos deve acabar\"",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.cnnbrasil.com.br/internacional/cisjordania-colonos-de-israel-atacam-palestinos-e-diplomatas-diz-belgica/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Colonos israelenses atacam comitiva de diplomatas europeus na Cisjordânia"
      },
      {
        "text": "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Colonos israelenses atacam comitiva de diplomatas europeus na Cisjordânia",
      "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "Esta pauta segue em acompanhamento contínuo pelas redações."
    ]
  },
  {
    "id": "2094",
    "section": "Brasil",
    "title": "Atlético-MG x Coritiba: escalações e onde assistir ao jogo do Brasileirão",
    "deck": "Equipes se enfrentam neste sábado (17), na Arena MRV, em Belo Horizonte, pela 31ª rodada da Série A do Campeonato Brasileiro; Galo vem de virada surpreendente contra o Santos, enquanto o Coxa empatou com o Botafogo",
    "lede": "Equipes se enfrentam neste sábado (17), na Arena MRV, em Belo Horizonte, pela 31ª rodada da Série A do Campeonato Brasileiro; Galo vem de virada surpreendente contra o Santos, enquanto o Coxa empatou com o Botafogo",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Atlético-MG x Coritiba: escalações e onde assistir ao jogo do Brasileirão",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Equipes se enfrentam neste sábado (17), na Arena MRV, em Belo Horizonte, pela 31ª rodada da Série A do Campeonato Brasileiro; Galo vem de virada surpreendente contra o Santos, enquanto o Coxa empatou com o Botafogo",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "5",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "CNN Brasil",
        "short": "CNN",
        "headline": "Atlético-MG x Coritiba: escalações e onde assistir ao jogo do Brasileirão",
        "angle": "Tom descritivo / institucional",
        "deck": "Equipes se enfrentam neste sábado (17), na Arena MRV, em Belo Horizonte, pela 31ª rodada da Série A do Campeonato Brasileiro; Galo vem de virada surpreendente contra o Santos, enquanto o Coxa empatou com o Botafogo",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.cnnbrasil.com.br/esportes/brasileirao/atletico-mg-x-coritiba-escalacoes-e-onde-assistir-ao-jogo-do-brasileirao/"
      },
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "Atlético-MG x Coritiba pelo Brasileirão: onde assistir ao vivo, horário e escalação",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/esportes/futebol/atletico-mg-x-coritiba-pelo-brasileirao-onde-assistir-ao-vivo-horario-e-escalacao/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Atlético-MG x Coritiba: escalações e onde assistir ao jogo do Brasileirão"
      },
      {
        "text": "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Atlético-MG x Coritiba: escalações e onde assistir ao jogo do Brasileirão",
      "Fato reportado e verificado por 5 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "ℹ️ Desbalanceamento: Predominância de veículos conservadores/direita. Pouca ou nenhuma repercussão na esquerda."
    ]
  },
  {
    "id": "2",
    "section": "Brasil",
    "title": "Datafolha: redução da maioridade penal tem apoio de 89% dos eleitores de Flávio e 70% dos de Lula",
    "deck": "Datafolha, 2º turno: Flávio Bolsonaro, 47%; Lula, 45% A redução da maioridade penal de 18 para 16 anos tem o apoio de oito em cada dez brasileiros, segundo pesquisa Datafolha divulgada neste sábado (17). O levantamento mostra que a opinião sobre a mudança varia conforme a preferência política e a intenção de voto para presidente nas eleições de 2026. Leia também: Datafolha: eleitores de Flávio dizem buscar mudança; os de Lula, proteção social Entre os eleitores que declaram voto em Lula (PT), o apoio à redução é de 70%. Entre os que dizem votar em Flávio Bolsonaro (PL), o índice chega a 89%. A pesquisa foi realizada presencialmente com 2.520 pessoas de 16 anos ou mais, em todo o Brasil, nos dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, no total da amostra, com nível de confiança de 95%. Nas questões políticas, a margem é de três pontos percentuais. Apesar de contar com o apoio da maioria dos brasileiros, a redução da maioridade penal está no menor patamar da série histórica do Datafolha, iniciada em 2003. O apoio à medida atingiu o pico em abril de 2015, quando 87% dos entrevistados se declararam favoráveis à redução. Na mesma pesquisa, 11% eram contrários à proposta e 1% não soube opinar. Apoio à redução varia conforme preferência política A preferência partidária também está associada à opinião sobre a redução da maioridade penal: Entre os que simpatizam com o PL, partido de Flávio, 93% apoiam a redução da maioridade penal. Entre os que declaram preferência pelo PT, de Lula, o percentual é de 73%. O resultado indica estabilidade em relação à pesquisa anterior sobre o tema, realizada em junho. Os percentuais de quem apoia a redução, é contrário à medida, se declara indiferente ou não sabe opinar variaram apenas um ponto percentual ou permaneceram iguais, dentro da margem de erro. A proporção de brasileiros contrários à redução passou de 17%, em junho, para 18%, em outubro. A diferença está dentro da margem de erro e indica estabilidade em relação ao levantamento anterior, embora o percentual mantenha a tendência de alta das opiniões contrárias registrada desde 2006. Outros 2% disseram não saber opinar, ante 3% em junho. Já 1% se declarou indiferente à proposta, mesmo percentual da pesquisa anterior. Flávio tem 51% dos votos válidos, e Lula, 49% A última pesquisa Datafolha, divulgada na quinta-feira (15), mostra que, a dez dias do 2º turno, Flávio Bolsonaro (PL) tem 47% das intenções de voto, e Lula (PT) tem 45%. Os dois candidatos estão em empate técnico dentro da margem de erro. Em votos válidos, que exclui brancos, nulos e indecisos, Flávio Bolsonaro tem 51% e Lula, 49%. O número de votos válidos é o que a Justiça Eleitoral usa para determinar os resultados das eleições. O levantamento foi encomendado pelo jornal Folha de S.Paulo. A margem de erro é de dois pontos percentuais, para mais ou para menos. Veja os números - votos totais: Flávio Bolsonaro (PL): 47% (eram 49% na pesquisa anterior) Lula (PT): 45% (eram 45%) Em branco/nulo/nenhum: 6% (eram 5%) Indecisos: 2% (era 1%) Datafolha, 2º turno: estimulada Arte/g1 Em relação à pesquisa anterior, da semana passada, Flávio Bolsonaro oscilou dois pontos para baixo, de 49% para 47%, e Lula manteve 45%. A diferença entre eles era de quatro pontos há uma semana, e agora é de dois pontos. Saiba mais: Página especial traz as pesquisas eleitorais com dados detalhados A pesquisa é a primeira do Datafolha após as manifestações de apoio a Lula ocorridas em diversas capitais do país. No domingo, o presidente discursou para apoiadores na Avenida Paulista, e desde então houve mobilizações de eleitores do petista no Rio de Janeiro, em Brasília e outras cidades. Flávio Bolsonaro (PL) e Lula (PT), que disputam o segundo turno presidencial no dia 25 de outubro. Wilton Junior/Estadão Conteúdo e Diego Herculano/Reuters O Datafolha ouviu 2.520 pessoas de 16 anos ou mais, entre os dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, e o nível de confiança é de 95%. O número de registro da pesquisa na Justiça Eleitoral é BR-00466/2026. Datafolha, 2º turno: votos válidos Arte/g1 Alguns destaques da pesquisa: Flávio Bolsonaro bate Lula no Sudeste, a região com o maior número de eleitores, por 51% a 41%. No segmento de classe média, que corresponde a 37% dos entrevistados, Flávio Bolsonaro supera Lula por 55% a 40%. O candidato do PL também lidera com folga na Região Sul (62% a 29%) e entre os evangélicos (62% a 29%), embora tenha oscilado sete pontos para baixo, dentro da margem de erro específica deste segmento, de quatro pontos percentuais. Lula supera Flávio Bolsonaro entre os eleitores mais pobres (53% a 38%). O petista vence o adversário também entre os católicos (52% a 42%) e entre os eleitores do Nordeste (61% a 32%). No eleitorado feminino, Lula tem vantagem de nove pontos (49% a 40%), enquanto Flávio Bolsonaro fica à frente entre os homens (52% a 40%). Rejeição O Datafolha mostra também que Lula tem uma rejeição de 46% (mesmo patamar da pesquisa anterior), enquanto a rejeição de Flávio Bolsonaro é de 44% (eram 43%). Segundo a pesquisa, 3% dos eleitores dizem rejeitar ambos, e 7% não rejeitam nenhum dos dois. Datafolha, 2º turno: rejeição Arte/g1 Aprovação do governo Lula Desaprovam: 50% (eram 49% na pesquisa anterior) Aprovam: 48% (eram 48%) Não sabe: 3% (eram 2%) Avaliação do governo Lula Ruim/péssimo: 41% (eram 40%) Ótimo/bom: 35% (eram 35%) Regular: 23% (eram 24%) Não sabe: 1% (era 1%)",
    "lede": "Datafolha, 2º turno: Flávio Bolsonaro, 47%; Lula, 45% A redução da maioridade penal de 18 para 16 anos tem o apoio de oito em cada dez brasileiros, segundo pesquisa Datafolha divulgada neste sábado (17). O levantamento mostra que a opinião sobre a mudança varia conforme a preferência política e a intenção de voto para presidente nas eleições de 2026. Leia também: Datafolha: eleitores de Flávio dizem buscar mudança; os de Lula, proteção social Entre os eleitores que declaram voto em Lula (PT), o apoio à redução é de 70%. Entre os que dizem votar em Flávio Bolsonaro (PL), o índice chega a 89%. A pesquisa foi realizada presencialmente com 2.520 pessoas de 16 anos ou mais, em todo o Brasil, nos dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, no total da amostra, com nível de confiança de 95%. Nas questões políticas, a margem é de três pontos percentuais. Apesar de contar com o apoio da maioria dos brasileiros, a redução da maioridade penal está no menor patamar da série histórica do Datafolha, iniciada em 2003. O apoio à medida atingiu o pico em abril de 2015, quando 87% dos entrevistados se declararam favoráveis à redução. Na mesma pesquisa, 11% eram contrários à proposta e 1% não soube opinar. Apoio à redução varia conforme preferência política A preferência partidária também está associada à opinião sobre a redução da maioridade penal: Entre os que simpatizam com o PL, partido de Flávio, 93% apoiam a redução da maioridade penal. Entre os que declaram preferência pelo PT, de Lula, o percentual é de 73%. O resultado indica estabilidade em relação à pesquisa anterior sobre o tema, realizada em junho. Os percentuais de quem apoia a redução, é contrário à medida, se declara indiferente ou não sabe opinar variaram apenas um ponto percentual ou permaneceram iguais, dentro da margem de erro. A proporção de brasileiros contrários à redução passou de 17%, em junho, para 18%, em outubro. A diferença está dentro da margem de erro e indica estabilidade em relação ao levantamento anterior, embora o percentual mantenha a tendência de alta das opiniões contrárias registrada desde 2006. Outros 2% disseram não saber opinar, ante 3% em junho. Já 1% se declarou indiferente à proposta, mesmo percentual da pesquisa anterior. Flávio tem 51% dos votos válidos, e Lula, 49% A última pesquisa Datafolha, divulgada na quinta-feira (15), mostra que, a dez dias do 2º turno, Flávio Bolsonaro (PL) tem 47% das intenções de voto, e Lula (PT) tem 45%. Os dois candidatos estão em empate técnico dentro da margem de erro. Em votos válidos, que exclui brancos, nulos e indecisos, Flávio Bolsonaro tem 51% e Lula, 49%. O número de votos válidos é o que a Justiça Eleitoral usa para determinar os resultados das eleições. O levantamento foi encomendado pelo jornal Folha de S.Paulo. A margem de erro é de dois pontos percentuais, para mais ou para menos. Veja os números - votos totais: Flávio Bolsonaro (PL): 47% (eram 49% na pesquisa anterior) Lula (PT): 45% (eram 45%) Em branco/nulo/nenhum: 6% (eram 5%) Indecisos: 2% (era 1%) Datafolha, 2º turno: estimulada Arte/g1 Em relação à pesquisa anterior, da semana passada, Flávio Bolsonaro oscilou dois pontos para baixo, de 49% para 47%, e Lula manteve 45%. A diferença entre eles era de quatro pontos há uma semana, e agora é de dois pontos. Saiba mais: Página especial traz as pesquisas eleitorais com dados detalhados A pesquisa é a primeira do Datafolha após as manifestações de apoio a Lula ocorridas em diversas capitais do país. No domingo, o presidente discursou para apoiadores na Avenida Paulista, e desde então houve mobilizações de eleitores do petista no Rio de Janeiro, em Brasília e outras cidades. Flávio Bolsonaro (PL) e Lula (PT), que disputam o segundo turno presidencial no dia 25 de outubro. Wilton Junior/Estadão Conteúdo e Diego Herculano/Reuters O Datafolha ouviu 2.520 pessoas de 16 anos ou mais, entre os dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, e o nível de confiança é de 95%. O número de registro da pesquisa na Justiça Eleitoral é BR-00466/2026. Datafolha, 2º turno: votos válidos Arte/g1 Alguns destaques da pesquisa: Flávio Bolsonaro bate Lula no Sudeste, a região com o maior número de eleitores, por 51% a 41%. No segmento de classe média, que corresponde a 37% dos entrevistados, Flávio Bolsonaro supera Lula por 55% a 40%. O candidato do PL também lidera com folga na Região Sul (62% a 29%) e entre os evangélicos (62% a 29%), embora tenha oscilado sete pontos para baixo, dentro da margem de erro específica deste segmento, de quatro pontos percentuais. Lula supera Flávio Bolsonaro entre os eleitores mais pobres (53% a 38%). O petista vence o adversário também entre os católicos (52% a 42%) e entre os eleitores do Nordeste (61% a 32%). No eleitorado feminino, Lula tem vantagem de nove pontos (49% a 40%), enquanto Flávio Bolsonaro fica à frente entre os homens (52% a 40%). Rejeição O Datafolha mostra também que Lula tem uma rejeição de 46% (mesmo patamar da pesquisa anterior), enquanto a rejeição de Flávio Bolsonaro é de 44% (eram 43%). Segundo a pesquisa, 3% dos eleitores dizem rejeitar ambos, e 7% não rejeitam nenhum dos dois. Datafolha, 2º turno: rejeição Arte/g1 Aprovação do governo Lula Desaprovam: 50% (eram 49% na pesquisa anterior) Aprovam: 48% (eram 48%) Não sabe: 3% (eram 2%) Avaliação do governo Lula Ruim/péssimo: 41% (eram 40%) Ótimo/bom: 35% (eram 35%) Regular: 23% (eram 24%) Não sabe: 1% (era 1%)",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Datafolha: redução da maioridade penal tem apoio de 89% dos eleitores de Flávio e 70% dos de Lula",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Datafolha, 2º turno: Flávio Bolsonaro, 47%; Lula, 45% A redução da maioridade penal de 18 para 16 anos tem o apoio de oito em cada dez brasileiros, segundo pesquisa Datafolha divulgada neste sábado (17). O levantamento mostra que a opinião sobre a mudança varia conforme a preferência política e a intenção de voto para presidente nas eleições de 2026. Leia também: Datafolha: eleitores de Flávio dizem buscar mudança; os de Lula, proteção social Entre os eleitores que declaram voto em Lula (PT), o apoio à redução é de 70%. Entre os que dizem votar em Flávio Bolsonaro (PL), o índice chega a 89%. A pesquisa foi realizada presencialmente com 2.520 pessoas de 16 anos ou mais, em todo o Brasil, nos dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, no total da amostra, com nível de confiança de 95%. Nas questões políticas, a margem é de três pontos percentuais. Apesar de contar com o apoio da maioria dos brasileiros, a redução da maioridade penal está no menor patamar da série histórica do Datafolha, iniciada em 2003. O apoio à medida atingiu o pico em abril de 2015, quando 87% dos entrevistados se declararam favoráveis à redução. Na mesma pesquisa, 11% eram contrários à proposta e 1% não soube opinar. Apoio à redução varia conforme preferência política A preferência partidária também está associada à opinião sobre a redução da maioridade penal: Entre os que simpatizam com o PL, partido de Flávio, 93% apoiam a redução da maioridade penal. Entre os que declaram preferência pelo PT, de Lula, o percentual é de 73%. O resultado indica estabilidade em relação à pesquisa anterior sobre o tema, realizada em junho. Os percentuais de quem apoia a redução, é contrário à medida, se declara indiferente ou não sabe opinar variaram apenas um ponto percentual ou permaneceram iguais, dentro da margem de erro. A proporção de brasileiros contrários à redução passou de 17%, em junho, para 18%, em outubro. A diferença está dentro da margem de erro e indica estabilidade em relação ao levantamento anterior, embora o percentual mantenha a tendência de alta das opiniões contrárias registrada desde 2006. Outros 2% disseram não saber opinar, ante 3% em junho. Já 1% se declarou indiferente à proposta, mesmo percentual da pesquisa anterior. Flávio tem 51% dos votos válidos, e Lula, 49% A última pesquisa Datafolha, divulgada na quinta-feira (15), mostra que, a dez dias do 2º turno, Flávio Bolsonaro (PL) tem 47% das intenções de voto, e Lula (PT) tem 45%. Os dois candidatos estão em empate técnico dentro da margem de erro. Em votos válidos, que exclui brancos, nulos e indecisos, Flávio Bolsonaro tem 51% e Lula, 49%. O número de votos válidos é o que a Justiça Eleitoral usa para determinar os resultados das eleições. O levantamento foi encomendado pelo jornal Folha de S.Paulo. A margem de erro é de dois pontos percentuais, para mais ou para menos. Veja os números - votos totais: Flávio Bolsonaro (PL): 47% (eram 49% na pesquisa anterior) Lula (PT): 45% (eram 45%) Em branco/nulo/nenhum: 6% (eram 5%) Indecisos: 2% (era 1%) Datafolha, 2º turno: estimulada Arte/g1 Em relação à pesquisa anterior, da semana passada, Flávio Bolsonaro oscilou dois pontos para baixo, de 49% para 47%, e Lula manteve 45%. A diferença entre eles era de quatro pontos há uma semana, e agora é de dois pontos. Saiba mais: Página especial traz as pesquisas eleitorais com dados detalhados A pesquisa é a primeira do Datafolha após as manifestações de apoio a Lula ocorridas em diversas capitais do país. No domingo, o presidente discursou para apoiadores na Avenida Paulista, e desde então houve mobilizações de eleitores do petista no Rio de Janeiro, em Brasília e outras cidades. Flávio Bolsonaro (PL) e Lula (PT), que disputam o segundo turno presidencial no dia 25 de outubro. Wilton Junior/Estadão Conteúdo e Diego Herculano/Reuters O Datafolha ouviu 2.520 pessoas de 16 anos ou mais, entre os dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, e o nível de confiança é de 95%. O número de registro da pesquisa na Justiça Eleitoral é BR-00466/2026. Datafolha, 2º turno: votos válidos Arte/g1 Alguns destaques da pesquisa: Flávio Bolsonaro bate Lula no Sudeste, a região com o maior número de eleitores, por 51% a 41%. No segmento de classe média, que corresponde a 37% dos entrevistados, Flávio Bolsonaro supera Lula por 55% a 40%. O candidato do PL também lidera com folga na Região Sul (62% a 29%) e entre os evangélicos (62% a 29%), embora tenha oscilado sete pontos para baixo, dentro da margem de erro específica deste segmento, de quatro pontos percentuais. Lula supera Flávio Bolsonaro entre os eleitores mais pobres (53% a 38%). O petista vence o adversário também entre os católicos (52% a 42%) e entre os eleitores do Nordeste (61% a 32%). No eleitorado feminino, Lula tem vantagem de nove pontos (49% a 40%), enquanto Flávio Bolsonaro fica à frente entre os homens (52% a 40%). Rejeição O Datafolha mostra também que Lula tem uma rejeição de 46% (mesmo patamar da pesquisa anterior), enquanto a rejeição de Flávio Bolsonaro é de 44% (eram 43%). Segundo a pesquisa, 3% dos eleitores dizem rejeitar ambos, e 7% não rejeitam nenhum dos dois. Datafolha, 2º turno: rejeição Arte/g1 Aprovação do governo Lula Desaprovam: 50% (eram 49% na pesquisa anterior) Aprovam: 48% (eram 48%) Não sabe: 3% (eram 2%) Avaliação do governo Lula Ruim/péssimo: 41% (eram 40%) Ótimo/bom: 35% (eram 35%) Regular: 23% (eram 24%) Não sabe: 1% (era 1%)",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "4",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "G1 (Globo)",
        "short": "G1",
        "headline": "Datafolha: redução da maioridade penal tem apoio de 89% dos eleitores de Flávio e 70% dos de Lula",
        "angle": "Tom descritivo / institucional",
        "deck": "Datafolha, 2º turno: Flávio Bolsonaro, 47%; Lula, 45% A redução da maioridade penal de 18 para 16 anos tem o apoio de oito em cada dez brasileiros, segundo pesquisa Datafolha divulgada neste sábado (17). O levantamento mostra que a opinião sobre a mudança varia conforme a preferência política e a intenção de voto para presidente nas eleições de 2026. Leia também: Datafolha: eleitores de Flávio dizem buscar mudança; os de Lula, proteção social Entre os eleitores que declaram voto em Lula (PT), o apoio à redução é de 70%. Entre os que dizem votar em Flávio Bolsonaro (PL), o índice chega a 89%. A pesquisa foi realizada presencialmente com 2.520 pessoas de 16 anos ou mais, em todo o Brasil, nos dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, no total da amostra, com nível de confiança de 95%. Nas questões políticas, a margem é de três pontos percentuais. Apesar de contar com o apoio da maioria dos brasileiros, a redução da maioridade penal está no menor patamar da série histórica do Datafolha, iniciada em 2003. O apoio à medida atingiu o pico em abril de 2015, quando 87% dos entrevistados se declararam favoráveis à redução. Na mesma pesquisa, 11% eram contrários à proposta e 1% não soube opinar. Apoio à redução varia conforme preferência política A preferência partidária também está associada à opinião sobre a redução da maioridade penal: Entre os que simpatizam com o PL, partido de Flávio, 93% apoiam a redução da maioridade penal. Entre os que declaram preferência pelo PT, de Lula, o percentual é de 73%. O resultado indica estabilidade em relação à pesquisa anterior sobre o tema, realizada em junho. Os percentuais de quem apoia a redução, é contrário à medida, se declara indiferente ou não sabe opinar variaram apenas um ponto percentual ou permaneceram iguais, dentro da margem de erro. A proporção de brasileiros contrários à redução passou de 17%, em junho, para 18%, em outubro. A diferença está dentro da margem de erro e indica estabilidade em relação ao levantamento anterior, embora o percentual mantenha a tendência de alta das opiniões contrárias registrada desde 2006. Outros 2% disseram não saber opinar, ante 3% em junho. Já 1% se declarou indiferente à proposta, mesmo percentual da pesquisa anterior. Flávio tem 51% dos votos válidos, e Lula, 49% A última pesquisa Datafolha, divulgada na quinta-feira (15), mostra que, a dez dias do 2º turno, Flávio Bolsonaro (PL) tem 47% das intenções de voto, e Lula (PT) tem 45%. Os dois candidatos estão em empate técnico dentro da margem de erro. Em votos válidos, que exclui brancos, nulos e indecisos, Flávio Bolsonaro tem 51% e Lula, 49%. O número de votos válidos é o que a Justiça Eleitoral usa para determinar os resultados das eleições. O levantamento foi encomendado pelo jornal Folha de S.Paulo. A margem de erro é de dois pontos percentuais, para mais ou para menos. Veja os números - votos totais: Flávio Bolsonaro (PL): 47% (eram 49% na pesquisa anterior) Lula (PT): 45% (eram 45%) Em branco/nulo/nenhum: 6% (eram 5%) Indecisos: 2% (era 1%) Datafolha, 2º turno: estimulada Arte/g1 Em relação à pesquisa anterior, da semana passada, Flávio Bolsonaro oscilou dois pontos para baixo, de 49% para 47%, e Lula manteve 45%. A diferença entre eles era de quatro pontos há uma semana, e agora é de dois pontos. Saiba mais: Página especial traz as pesquisas eleitorais com dados detalhados A pesquisa é a primeira do Datafolha após as manifestações de apoio a Lula ocorridas em diversas capitais do país. No domingo, o presidente discursou para apoiadores na Avenida Paulista, e desde então houve mobilizações de eleitores do petista no Rio de Janeiro, em Brasília e outras cidades. Flávio Bolsonaro (PL) e Lula (PT), que disputam o segundo turno presidencial no dia 25 de outubro. Wilton Junior/Estadão Conteúdo e Diego Herculano/Reuters O Datafolha ouviu 2.520 pessoas de 16 anos ou mais, entre os dias 13 e 14 de outubro. A margem de erro é de dois pontos percentuais, para mais ou para menos, e o nível de confiança é de 95%. O número de registro da pesquisa na Justiça Eleitoral é BR-00466/2026. Datafolha, 2º turno: votos válidos Arte/g1 Alguns destaques da pesquisa: Flávio Bolsonaro bate Lula no Sudeste, a região com o maior número de eleitores, por 51% a 41%. No segmento de classe média, que corresponde a 37% dos entrevistados, Flávio Bolsonaro supera Lula por 55% a 40%. O candidato do PL também lidera com folga na Região Sul (62% a 29%) e entre os evangélicos (62% a 29%), embora tenha oscilado sete pontos para baixo, dentro da margem de erro específica deste segmento, de quatro pontos percentuais. Lula supera Flávio Bolsonaro entre os eleitores mais pobres (53% a 38%). O petista vence o adversário também entre os católicos (52% a 42%) e entre os eleitores do Nordeste (61% a 32%). No eleitorado feminino, Lula tem vantagem de nove pontos (49% a 40%), enquanto Flávio Bolsonaro fica à frente entre os homens (52% a 40%). Rejeição O Datafolha mostra também que Lula tem uma rejeição de 46% (mesmo patamar da pesquisa anterior), enquanto a rejeição de Flávio Bolsonaro é de 44% (eram 43%). Segundo a pesquisa, 3% dos eleitores dizem rejeitar ambos, e 7% não rejeitam nenhum dos dois. Datafolha, 2º turno: rejeição Arte/g1 Aprovação do governo Lula Desaprovam: 50% (eram 49% na pesquisa anterior) Aprovam: 48% (eram 48%) Não sabe: 3% (eram 2%) Avaliação do governo Lula Ruim/péssimo: 41% (eram 40%) Ótimo/bom: 35% (eram 35%) Regular: 23% (eram 24%) Não sabe: 1% (era 1%)",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://g1.globo.com/politica/eleicoes/2026/pesquisa-eleitoral/noticia/2026/10/17/datafolha-reducao-da-maioridade-penal-tem-apoio-de-89percent-dos-eleitores-de-flavio-e-70percent-dos-de-lula.ghtml"
      },
      {
        "outlet": "CNN Brasil",
        "short": "CNN",
        "headline": "Veritá: Flávio tem 51,1% dos votos válidos no 2º turno; Lula, 48,9%",
        "angle": "Tom descritivo / institucional",
        "deck": "Pesquisa divulgada neste sábado (17) ouviu 15.554 pessoas entre os dias 12 e 16 de outubro; margem de é de um ponto percentual, para mais ou para menos, e o nível de confiança é de 95%",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.cnnbrasil.com.br/eleicoes/verita-flavio-tem-511-dos-votos-validos-no-2o-turno-lula-489/"
      },
      {
        "outlet": "CartaCapital",
        "short": "CartaCapital",
        "headline": "Pesquisa aponta empate técnico entre Flávio Bolsonaro e Lula a oito dias do 2º turno",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Levantamento Ipespe/Abrapel registra que o senador do PL tem 51,2% dos votos válidos enquanto Lula anota 48,8%",
        "tone": [
          "left"
        ],
        "readTime": "4 min",
        "link": "https://www.cartacapital.com.br/cartaexpressa/pesquisa-aponta-empate-tecnico-entre-flavio-bolsonaro-e-lula-a-oito-dias-do-2o-turno/"
      },
      {
        "outlet": "Jovem Pan News",
        "short": "Jovem",
        "headline": "Pesquisa Ipespe: Flávio tem 51,2% e Lula 48,8%; vantagem de senador cai 3 pontos",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Em votos totais, Flávio oscilou de 49% para 48%, enquanto Lula foi de 44% para 46%",
        "tone": [
          "right"
        ],
        "readTime": "4 min",
        "link": "https://jovempan.com.br/politica/pesquisa-ipespe-flavio-tem-512-e-lula-488-vantagem-de-senador-cai-3-pontos/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Datafolha: redução da maioridade penal tem apoio de 89% dos eleitores de Flávio e 70% dos de Lula"
      },
      {
        "text": "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Datafolha: redução da maioridade penal tem apoio de 89% dos eleitores de Flávio e 70% dos de Lula",
      "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Ponto #1",
        "Contraste de perspectiva: Foco editorial variado entre veículos conservadores (Jovem Pan News) e progressistas (CartaCapital)."
      ]
    ],
    "blindSpotList": [
      "✅ Cobertura Plural: Pauta repercutida em veículos de ambos os polos políticos."
    ]
  },
  {
    "id": "5",
    "section": "Brasil",
    "title": "Ceará x Juventude: horário e onde assistir ao jogo da Série B do Brasileiro",
    "deck": "Equipes se enfrentam neste sábado (17), na Arena Castelão, em Fortaleza, em duelo válido pela 34ª rodada da competição de pontos corridos",
    "lede": "Equipes se enfrentam neste sábado (17), na Arena Castelão, em Fortaleza, em duelo válido pela 34ª rodada da competição de pontos corridos",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Ceará x Juventude: horário e onde assistir ao jogo da Série B do Brasileiro",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Equipes se enfrentam neste sábado (17), na Arena Castelão, em Fortaleza, em duelo válido pela 34ª rodada da competição de pontos corridos",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "4",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "Ceará x Juventude pela Série B: onde assistir ao vivo, horário e escalação",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/esportes/futebol/ceara-x-juventude-pela-serie-b-onde-assistir-ao-vivo-horario-e-escalacao/"
      },
      {
        "outlet": "CNN Brasil",
        "short": "CNN",
        "headline": "Ceará x Juventude: horário e onde assistir ao jogo da Série B do Brasileiro",
        "angle": "Tom descritivo / institucional",
        "deck": "Equipes se enfrentam neste sábado (17), na Arena Castelão, em Fortaleza, em duelo válido pela 34ª rodada da competição de pontos corridos",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://www.cnnbrasil.com.br/esportes/brasileirao/ceara-x-juventude-horario-e-onde-assistir-ao-jogo-da-serie-b-do-brasileiro/"
      },
      {
        "outlet": "Veja",
        "short": "Veja",
        "headline": "São Paulo x Vasco no Brasileirão: onde assistir, horário e escalações",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Equipes se enfrentam neste sábado, 17, no Morumbis, pela 31ª rodada do campeonato",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://veja.abril.com.br/esporte/sao-paulo-x-vasco-no-brasileirao-onde-assistir-horario-e-escalacoes/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Ceará x Juventude: horário e onde assistir ao jogo da Série B do Brasileiro"
      },
      {
        "text": "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Ceará x Juventude: horário e onde assistir ao jogo da Série B do Brasileiro",
      "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "ℹ️ Desbalanceamento: Predominância de veículos conservadores/direita. Pouca ou nenhuma repercussão na esquerda."
    ]
  },
  {
    "id": "281",
    "section": "Brasil",
    "title": "Galaxy S26 Ultra, Claude Code e mais: revista elege melhores invenções de 2026",
    "deck": "Mensagens do celular do dono do Banco Master mostram a articulação do advogado com o banqueiro",
    "lede": "Mensagens do celular do dono do Banco Master mostram a articulação do advogado com o banqueiro",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Galaxy S26 Ultra, Claude Code e mais: revista elege melhores invenções de 2026",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Mensagens do celular do dono do Banco Master mostram a articulação do advogado com o banqueiro",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "4",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "Estadão",
        "short": "Estadão",
        "headline": "Galaxy S26 Ultra, Claude Code e mais: revista elege melhores invenções de 2026",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Cobertura apurada pelo veículo.",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://www.estadao.com.br/tecmundo/produto-e-review/galaxy-s26-ultra-claude-code-e-mais-revista-elege-melhores-invencoes-de-2026/"
      },
      {
        "outlet": "Veja",
        "short": "Veja",
        "headline": "Nelson Wilians ofereceu duas bets ‘relativamente regularizadas’ a Daniel Vorcaro em 2024",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Mensagens do celular do dono do Banco Master mostram a articulação do advogado com o banqueiro",
        "tone": [
          "center-right"
        ],
        "readTime": "4 min",
        "link": "https://veja.abril.com.br/brasil/nelson-wilians-ofereceu-duas-bets-a-daniel-vorcaro/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Galaxy S26 Ultra, Claude Code e mais: revista elege melhores invenções de 2026"
      },
      {
        "text": "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Brasil",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Galaxy S26 Ultra, Claude Code e mais: revista elege melhores invenções de 2026",
      "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "⚠️ Ponto Cego: Cobertura exclusiva de veículos de direita / centro-direita. Veículos de esquerda e agências de centro não noticiaram."
    ]
  },
  {
    "id": "1283",
    "section": "Tecnologia",
    "title": "Tesla recorre à tecnologia de acrobacias de 50 anos enquanto tenta o Roadster novamente",
    "deck": "Acontece que o Roadster 2 é uma merda e um golpe.",
    "lede": "Acontece que o Roadster 2 é uma merda e um golpe.",
    "author": "Redação Fatos Cruzados",
    "role": "Jornalismo Comparado",
    "date": "Hoje",
    "readTime": "10 min de leitura",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Tesla recorre à tecnologia de acrobacias de 50 anos enquanto tenta o Roadster novamente",
    "credit": "Fatos Cruzados · Apuração Multi-Fonte",
    "sources": 5,
    "fact": "Acontece que o Roadster 2 é uma merda e um golpe.",
    "factExtra": "Fato reportado e checado em 5 veículos de imprensa independentes.",
    "keyNumbers": [
      {
        "value": "5",
        "label": "veículos apurados"
      },
      {
        "value": "4",
        "label": "reportagens lidas"
      },
      {
        "value": "100%",
        "label": "checagem multi-fonte"
      }
    ],
    "coverage": [
      {
        "outlet": "WIRED",
        "short": "WIRED",
        "headline": "Veja exatamente como a Tesla fez seu novo carro de 230 mph ‘voar’",
        "angle": "Enquadramento padrão com ênfase factual",
        "deck": "Acontece que o Roadster 2 é uma merda e um golpe.",
        "tone": [
          "center-left"
        ],
        "readTime": "4 min",
        "link": "https://www.wired.com/story/how-tesla-made-its-new-230-mph-car-fly/"
      },
      {
        "outlet": "Ars Technica",
        "short": "Ars",
        "headline": "Tesla recorre à tecnologia de acrobacias de 50 anos enquanto tenta o Roadster novamente",
        "angle": "Tom descritivo / institucional",
        "deck": "Se você quiser fazer um carro girar no ar, o gás comprimido é uma boa maneira de fazer isso.",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://arstechnica.com/cars/2026/10/tesla-turns-to-50-year-old-stunt-technology-as-it-tries-to-roadster-again/"
      },
      {
        "outlet": "TechCrunch",
        "short": "TechCrunch",
        "headline": "Tesla revela Roadster com motor SpaceX que voa e cai com estilo",
        "angle": "Tom descritivo / institucional",
        "deck": "O novo carro usou propulsores para saltar sobre um Cybercab, Cybertruck, Tesla Semi, Modelo Y e Modelo 3 em uma demonstração no Texas.",
        "tone": [
          "center"
        ],
        "readTime": "4 min",
        "link": "https://techcrunch.com/2026/10/15/tesla-reveals-spacex-powered-roadster-that-flies-and-falls-with-style/"
      }
    ],
    "body": [
      {
        "text": "Acontecimento central: Tesla recorre à tecnologia de acrobacias de 50 anos enquanto tenta o Roadster novamente"
      },
      {
        "text": "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
      }
    ],
    "tags": [
      "Tecnologia",
      "Cruzamento de Mídia",
      "Fatos Reais"
    ],
    "consensusFacts": [
      "Acontecimento central: Tesla recorre à tecnologia de acrobacias de 50 anos enquanto tenta o Roadster novamente",
      "Fato reportado e verificado por 4 veículos de comunicação com múltiplos ângulos de cobertura."
    ],
    "divergentPoints": [
      [
        "Enquadramento",
        "As redações priorizaram ênfases editoriais distintas."
      ]
    ],
    "blindSpotList": [
      "ℹ️ Desbalanceamento: Predominância de veículos progressistas/esquerda. Pouca ou nenhuma repercussão na direita."
    ]
  }
];

export const dossiers: Dossier[] = [
  {
    id: "arquivo-morto",
    number: "01",
    title: "O arquivo morto",
    subtitle: "Quem apaga a memória da internet?",
    description:
      "Links que morrem, páginas apagadas por decreto e reportagens que desaparecem sem aviso. Um dossiê sobre a memória frágil da web brasileira.",
    image:
      "https://images.pexels.com/photos/16986346/pexels-photo-16986346.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    imageAlt: "Interior de uma biblioteca com estantes altas em preto e branco.",
    vehicles: 11,
    documents: 24,
    chapters: [
      "O dia em que o Brasil apagou 3 mil páginas",
      "Arquivos sem testemunhas",
      "Como reconstruir uma notícia perdida",
      "As regras invisíveis do Wayback Machine",
      "Memória como serviço público",
    ],
    tag: "Investigação",
  },
  {
    id: "conta-invisivel",
    number: "02",
    title: "A conta invisível do clima",
    subtitle: "Quem paga pela transição?",
    description:
      "Seguimos o dinheiro prometido para a adaptação climática desde o anúncio até a calçada. O que os relatórios oficiais não contam sobre um país em transformação.",
    image:
      "https://images.pexels.com/photos/10617932/pexels-photo-10617932.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    imageAlt: "Pessoas caminhando em um leito de rio seco por terra rachada.",
    vehicles: 9,
    documents: 17,
    chapters: [
      "Os US$ 10 bilhões em quatro escalas",
      "O fundo que ainda não existe",
      "Cidades comprando tempo",
      "Quem financia a adaptação do agronegócio",
      "Três mapas para entender a conta",
    ],
    tag: "Clima",
  },
];

export const weeks: WeekData[] = [
  {
    id: "042",
    label: "Edição 042",
    period: "Semana Atual",
    total: 1137,
    frames: [
      { label: "Política & Poder", value: 38 },
      { label: "Brasil & Cidades", value: 27 },
      { label: "Economia & Mercado", value: 19 },
      { label: "Mundo & Geopolítica", value: 16 },
    ],
    heard: 24,
    experts: 76,
    insight: "Equilíbrio de fontes",
    note: "Das 1.137 matérias apuradas no banco de dados, o cruzamento multi-fonte identificou consensos em 82% dos fatos centrais e variações de ângulo principalmente nas pautas políticas e econômicas.",
  },
];

export const pressNames = [
  "Folha de S.Paulo",
  "Estadão",
  "G1 (Globo)",
  "CNN Brasil",
  "Poder360",
  "Metrópoles",
  "BBC News Brasil",
  "UOL Notícias",
  "CartaCapital",
  "Gazeta do Povo",
  "Valor Econômico",
  "The Guardian",
  "Al Jazeera English",
  "Reuters"
];
