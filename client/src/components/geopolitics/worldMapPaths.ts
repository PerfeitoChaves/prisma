/**
 * PRISMA — Cartografia Vetorial do Mapa Tático Global (Plate Carrée 1000x500)
 * Milestone M7: Caminhos poligonais vetoriais otimizados dos continentes e corredores marítimos estratégicos
 */

export interface ContinentPath {
  id: string;
  name: string;
  d: string;
}

export interface ChokepointLine {
  id: string;
  name: string;
  path: string;
}

/**
 * Massas continentais projetadas em Plate Carrée no canvas 1000x500
 * Longitude: [-180, +180] -> X: [0, 1000]
 * Latitude:  [+90, -90]   -> Y: [0, 500]
 */
export const CONTINENTS: ContinentPath[] = [
  // 1. América do Norte e Groenlândia
  {
    id: "north_america",
    name: "América do Norte",
    d: `
      M 75 75
      L 95 62 L 125 58 L 155 52 L 200 48 L 245 50 L 285 58 L 320 70 L 340 90
      L 330 115 L 305 130 L 290 120 L 280 135 L 295 150 L 285 165 L 260 170
      L 245 190 L 255 205 L 270 215 L 285 228 L 275 235 L 255 225 L 235 210
      L 215 195 L 195 180 L 175 160 L 155 145 L 140 125 L 120 115 L 95 105
      L 80 90 Z
      M 320 28
      L 350 25 L 390 32 L 415 45 L 400 70 L 370 82 L 340 75 L 325 55 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 2. América Central e Caribe (ilhas principais)
  {
    id: "central_america",
    name: "América Central & Caribe",
    d: `
      M 245 195
      L 260 198 L 272 210 L 288 224 L 298 235 L 290 240 L 275 230 L 260 218
      L 245 205 Z
      M 292 210
      L 310 212 L 315 218 L 300 220 Z
      M 315 218
      L 335 220 L 332 225 L 316 223 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 3. América do Sul (incluindo Essequibo na costa norte)
  {
    id: "south_america",
    name: "América do Sul",
    d: `
      M 290 240
      L 310 232 L 330 230 L 350 235 L 375 245 L 400 265 L 405 285 L 390 310
      L 370 340 L 350 375 L 335 410 L 325 425 L 315 415 L 318 385 L 310 350
      L 305 315 L 295 285 L 285 260 L 280 248 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 4. Europa (Ocidental, Central, Nórdica e Mediterrânea)
  {
    id: "europe",
    name: "Europa",
    d: `
      M 470 148
      L 485 138 L 478 120 L 490 110 L 510 102 L 530 105 L 545 92 L 550 75
      L 570 70 L 585 85 L 575 105 L 595 100 L 610 108 L 600 125 L 585 132
      L 570 130 L 560 142 L 545 145 L 535 158 L 520 152 L 505 155 L 490 162
      L 472 160 Z
      M 478 102
      L 490 92 L 495 100 L 488 112 L 476 110 Z
      M 465 100
      L 474 96 L 475 108 L 468 110 Z
      M 495 62
      L 510 58 L 525 65 L 518 78 L 500 75 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 5. África (Sahel, Maghreb, Chifre da África, África Austral e Madagascar)
  {
    id: "africa",
    name: "África",
    d: `
      M 472 165
      L 505 162 L 535 165 L 565 170 L 595 175 L 610 190 L 625 210 L 642 225
      L 630 245 L 615 270 L 600 300 L 585 335 L 565 370 L 545 372 L 535 340
      L 525 305 L 515 275 L 495 255 L 475 248 L 452 238 L 450 215 L 455 190
      L 468 175 Z
      M 622 280
      L 632 275 L 638 310 L 628 325 L 620 300 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 6. Eurásia / Ásia Continental (Rússia, Oriente Médio, Ásia Central, Índia, China)
  {
    id: "asia",
    name: "Ásia & Oriente Médio",
    d: `
      M 595 100
      L 620 85 L 660 75 L 710 68 L 770 65 L 830 70 L 890 80 L 940 95 L 975 110
      L 960 130 L 920 135 L 880 142 L 855 138 L 848 152 L 860 162 L 845 175
      L 820 185 L 805 210 L 780 235 L 765 220 L 745 195 L 725 180 L 705 188
      L 690 220 L 675 200 L 665 175 L 645 180 L 630 195 L 610 190 L 598 170
      L 590 145 L 605 135 L 612 118 L 598 108 Z
      M 865 135
      L 885 125 L 898 140 L 885 155 L 870 150 Z
      M 830 180
      L 840 180 L 842 192 L 832 190 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 7. Sudeste Asiático, Indonésia e Filipinas
  {
    id: "southeast_asia",
    name: "Sudeste Asiático & Arquipélagos",
    d: `
      M 765 225
      L 775 238 L 782 255 L 775 260 L 768 245 Z
      M 770 268
      L 805 272 L 830 270 L 820 278 L 780 276 Z
      M 825 255
      L 850 250 L 855 265 L 830 268 Z
      M 845 205
      L 858 200 L 860 220 L 848 230 Z
    `.replace(/\s+/g, " ").trim(),
  },

  // 8. Oceania (Austrália e Nova Zelândia)
  {
    id: "oceania",
    name: "Oceania",
    d: `
      M 820 290
      L 850 282 L 885 285 L 915 305 L 920 335 L 905 360 L 870 365 L 840 355
      L 818 330 L 815 305 Z
      M 955 350
      L 970 345 L 975 365 L 960 380 L 950 365 Z
    `.replace(/\s+/g, " ").trim(),
  },
];

/**
 * Corredores marítimos táticos (Chokepoints globais):
 * Conectam os principais estreitos e rotas de energia do mundo
 */
export const CHOKEPOINT_CORRIDORS: ChokepointLine[] = [
  // Rota de Energia Eurasiática: Ormuz -> Golfo de Áden / Mar Vermelho -> Suez -> Mediterrâneo -> Gibraltar
  {
    id: "energy_corridor_west",
    name: "Corredor de Energia Oriente Médio — Europa",
    path: "M 656 176 L 638 198 L 621 213 L 602 185 L 596 163 L 560 162 L 490 165 L 468 165",
  },
  // Rota de Semicondutores e Petróleo Ásia: Ormuz -> Malaca -> Taiwan -> Coreia / Japão
  {
    id: "energy_corridor_east",
    name: "Corredor Ásia-Pacífico (Malaca — Taiwan — Coreia)",
    path: "M 656 176 L 710 215 L 775 260 L 810 230 L 835 183 L 854 144 L 880 140",
  },
  // Corredor Atlântico-Caribe: Golfo da Guiné / Sahel -> Atlântico Tropical -> Essequibo / Canal do Panamá
  {
    id: "atlantic_essequibo_corridor",
    name: "Corredor Estratégico Atlântico — Essequibo",
    path: "M 572 210 L 510 225 L 440 235 L 375 235 L 336 232 L 290 235",
  },
  // Eixo Báltico / Mar Negro / Leste Europeu (Ucrânia ao Mediterrâneo)
  {
    id: "black_sea_corridor",
    name: "Eixo Mar Negro — Bósforo — Mediterrâneo Oriental",
    path: "M 588 114 L 592 138 L 596 163",
  },
];
