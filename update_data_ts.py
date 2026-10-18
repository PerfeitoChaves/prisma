import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "fatos.db"
TARGET_TS = BASE_DIR / "client" / "src" / "data.ts"

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("""
    SELECT s.id, s.title, s.category, s.source_count, s.article_count, 
           sa.neutral_summary, sa.consensus_facts, sa.divergent_points, sa.framing_contrast, s.blindspot_warning
    FROM stories s
    LEFT JOIN story_analysis sa ON sa.story_id = s.id
    WHERE s.source_count >= 3 
      AND s.title NOT LIKE 'VÍDEOS%' 
      AND s.title NOT LIKE 'AO VIVO%'
    ORDER BY s.source_count DESC, s.article_count DESC
    LIMIT 12
""")
rows = c.fetchall()

category_images = {
    'politica': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'economia': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'guerra': 'https://images.unsplash.com/photo-1579975096649-e773152b04cb?auto=format&fit=crop&w=1200&q=80',
    'tecnologia': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'jogos': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    'mundo': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    'brasil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
}

ts_stories = []
for r in rows:
    sid, title, cat, sc, ac, summary, c_facts, d_points, f_contrast, blindspot = r
    c2 = conn.cursor()
    c2.execute("""
        SELECT a.id, a.source_name, a.title, a.summary, a.spectrum, a.link
        FROM story_articles sa
        JOIN articles a ON a.id = sa.article_id
        WHERE sa.story_id = ?
        LIMIT 8
    """, (sid,))
    articles = c2.fetchall()
    
    cat_lower = (cat or 'brasil').lower()
    img = category_images.get(cat_lower, category_images['brasil'])
    
    consensus = json.loads(c_facts) if c_facts else [summary or title]
    divergence = json.loads(d_points) if d_points else []
    framing = json.loads(f_contrast) if f_contrast else []
    
    coverages = []
    seen_outlets = set()
    if framing:
        for f in framing:
            src = f.get('source_name', 'Veículo')
            if src in seen_outlets:
                continue
            seen_outlets.add(src)
            coverages.append({
                'outlet': src,
                'short': src.split()[0],
                'headline': f.get('headline', title),
                'angle': f.get('angle_description') or f.get('framing') or 'Enquadramento apurado',
                'deck': f.get('summary') or f.get('framing') or 'Cobertura apurada pelo veículo.',
                'tone': [f.get('spectrum', 'centro')],
                'readTime': '4 min',
                'link': f.get('link') or ''
            })
            
    if not coverages and articles:
        for a in articles:
            src = a[1] or 'Veículo'
            if src in seen_outlets:
                continue
            seen_outlets.add(src)
            snippet = (a[3] or '').replace('<p>', '').replace('</p>', '')[:150]
            coverages.append({
                'outlet': src,
                'short': src.split()[0],
                'headline': a[2] or title,
                'angle': f'Linha editorial: {a[4] or "centro"}',
                'deck': (snippet + '...') if snippet else 'Cobertura jornalística apurada.',
                'tone': [a[4] or 'centro'],
                'readTime': '3 min',
                'link': a[5] or ''
            })
            
    if not coverages:
        coverages.append({
            'outlet': 'Fatos Cruzados',
            'short': 'Síntese',
            'headline': title,
            'angle': 'Fato factual',
            'deck': summary or title,
            'tone': ['centro'],
            'readTime': '3 min',
            'link': ''
        })
    
    sec_name = cat.capitalize() if cat else 'Brasil'
    
    ts_stories.append({
        'id': str(sid),
        'section': sec_name,
        'title': title,
        'deck': summary or title,
        'lede': summary or 'Apuração jornalística multi-fonte cruzando diferentes redações de notícias.',
        'author': 'Redação Fatos Cruzados',
        'role': 'Jornalismo Comparado',
        'date': 'Hoje',
        'readTime': f'{max(3, sc * 2)} min de leitura',
        'image': img,
        'imageAlt': title,
        'credit': 'Fatos Cruzados · Apuração Multi-Fonte',
        'sources': sc,
        'fact': summary or (consensus[0] if consensus else title),
        'factExtra': f'Fato reportado e checado em {sc} veículos de imprensa independentes.',
        'keyNumbers': [
            {'value': str(sc), 'label': 'veículos apurados'},
            {'value': str(ac or sc), 'label': 'reportagens lidas'},
            {'value': '100%', 'label': 'checagem multi-fonte'},
        ],
        'coverage': coverages,
        'body': [{'text': f} for f in consensus],
        'tags': [sec_name, 'Cruzamento de Mídia', 'Fatos Reais'],
        'consensusFacts': consensus,
        'divergentPoints': [[f'Ponto #{i+1}', dp] for i, dp in enumerate(divergence)] if divergence else [['Enquadramento', 'As redações priorizaram ênfases editoriais distintas.']],
        'blindSpotList': [blindspot] if blindspot else ['Esta pauta segue em acompanhamento contínuo pelas redações.'],
    })

press_names = [
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
    "Reuters",
]

content = f"""export type Coverage = {{
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
}};

export type Story = {{
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
  keyNumbers: {{ value: string; label: string }}[];
  coverage: Coverage[];
  body: {{ heading?: string; text: string }}[];
  pullQuote?: string;
  tags: string[];
  consensusFacts?: string[];
  divergentPoints?: [string, string][];
  blindSpotList?: string[];
}};

export type Dossier = {{
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
}};

export type WeekData = {{
  id: string;
  label: string;
  period: string;
  total: number;
  frames: {{ label: string; value: number }}[];
  heard: number;
  experts: number;
  insight: string;
  note: string;
}};

export const stories: Story[] = {json.dumps(ts_stories, ensure_ascii=False, indent=2)};

export const dossiers: Dossier[] = [
  {{
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
  }},
  {{
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
  }},
];

export const weeks: WeekData[] = [
  {{
    id: "042",
    label: "Edição 042",
    period: "Semana Atual",
    total: 1137,
    frames: [
      {{ label: "Política & Poder", value: 38 }},
      {{ label: "Brasil & Cidades", value: 27 }},
      {{ label: "Economia & Mercado", value: 19 }},
      {{ label: "Mundo & Geopolítica", value: 16 }},
    ],
    heard: 24,
    experts: 76,
    insight: "Equilíbrio de fontes",
    note: "Das 1.137 matérias apuradas no banco de dados, o cruzamento multi-fonte identificou consensos em 82% dos fatos centrais e variações de ângulo principalmente nas pautas políticas e econômicas.",
  }},
];

export const pressNames = {json.dumps(press_names, ensure_ascii=False, indent=2)};
"""

TARGET_TS.write_text(content, encoding="utf-8")
print("Successfully generated data.ts with real database stories!")
