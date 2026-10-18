# 📐 PRISMA — A Mesma História, Todos os Ângulos

O **PRISMA** (antigo *Fatos Cruzados*) é uma plataforma jornalística pessoal, sem anúncios e sem assinaturas, desenvolvida para combater o viés ideológico e o sensacionalismo midiático. O sistema agrega notícias em tempo real de **62 veículos do Brasil e do Mundo**, agrupa matérias sobre o mesmo acontecimento (clustering), analisa enquadramentos editoriais e expõe o consenso factual lado a lado.

---

## ✨ Funcionalidades Principais

1. **⚡ Giro Ultra-Rápido em 2 Linhas**:
   - Resumos objetivos focados em fatos centrais, percentuais e placares para leitura móvel em menos de 1 minuto.

2. **📺 Central Multimídia Ao Vivo (Lives & Rádios)**:
   - 6 canais de TV de notícias (BandNews, CNN Brasil, Record News, Jovem Pan News, TV Brasil, SBT News).
   - 7 rádios all-news (CBN SP/RJ, BandNews FM, Jovem Pan FM, Rádio Gaúcha, Bandeirantes, Eldorado).
   - **Mini-Player Flutuante Persistente (PiP)** que continua tocando sem interrupção enquanto você navega pelos feeds.

3. **⚡ Radar de Tendências do X (Twitter)**:
   - Monitoramento em tempo real de hashtags e termos mais comentados no Brasil com badges de volume.
   - Botão **"Cruzar com Notícias"**: pesquisa algorítmica instantânea correlacionando a pauta com matérias da imprensa.

4. **🎛️ Filtros Avançados e Ordenação Editorial**:
   - Ordenação rápida: *Mais Recentes*, *Maior Divergência*, *Mais Repercutidas* e *Consensuais*.
   - Filtro de Espectro Político e Pontos Cegos (identifica o que só a esquerda ou só a direita está noticiando).
   - Tags temáticas dinâmicas e clicáveis (#STF, #Dólar, #Copom, #IA, etc.).

5. **🔍 Busca Sob Demanda em Tempo Real**:
   - Pesquise por qualquer assunto (ex: `python`, `eleições`, `spacex`); o sistema coleta, sanitiza, agrupa e gera a análise de espectro em menos de 2 segundos.

6. **📰 62 Veículos Monitorados (7 Espectros)**:
   - Fontes nacionais e agências internacionais traduzidas (Reuters, AP, BBC, DW, Nexo, Poder360, G1, Folha, Estadão, etc.).

7. **📱 100% Mobile-First & GitHub Pages**:
   - Menu inferior ergonômico (*Thumb Navigation*).
   - Pacote `frontend/index.html` autossuficiente em arquivo único (`singlefile`), pronto para hospedar no GitHub Pages.

---

## 🚀 Como Executar

### Forma Rápida (Script de Inicialização)
Basta rodar no terminal:
```bash
./run.sh
```
O script criará o ambiente virtual `.venv`, instalará as dependências e abrirá a aplicação em:
👉 **`http://localhost:8000`**

---

### Execução Manual
```bash
cd /home/perfeito/.gemini/antigravity/scratch/fatos-cruzados

# Ativar ambiente virtual
source .venv/bin/activate

# Coletar notícias e agrupar
python3 -m backend.ingestion.collector
python3 -c "from backend.analysis.clustering import run_clustering; run_clustering()"

# Iniciar o servidor
python3 -m backend.main
```

---

## ⚙️ Personalização de Fontes

Você pode adicionar novos jornais ou ajustar as classificações de espectro editorial editando o arquivo:
`backend/ingestion/sources.json`

Exemplo de fonte cadastrada:
```json
{
  "id": "meu_jornal",
  "name": "Nome do Jornal",
  "url": "https://url-do-feed-rss.xml",
  "category": "brasil",
  "spectrum": "center",
  "spectrum_label": "Centro / Factual",
  "country": "BR",
  "language": "pt"
}
```

---

## 🧪 Testes Automatizados

Para rodar os testes da suíte:
```bash
source .venv/bin/activate
python3 -m unittest discover backend/tests
```
