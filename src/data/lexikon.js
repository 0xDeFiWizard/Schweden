// Fischarten-Lexikon für die Region (Seen um Ryssby, Småland)

export const ARTEN = [
  {
    name: 'Hecht',
    emoji: '🐊',
    schwierigkeit: 'Gut fangbar',
    sommer: 'Top in der Dämmerung an Schilfkanten und Krautfeldern. Mittags eher tiefer stehen.',
    koeder: ['Gummifisch 12–20 cm', 'Spinnerbait', 'Jerkbait', 'Blinker', 'Köderfisch'],
    zeit: 'Morgen- & Abenddämmerung',
    tipp: 'IMMER Stahlvorfach! Große Hechte stützen und schnell zurücksetzen.',
  },
  {
    name: 'Barsch',
    emoji: '🐟',
    schwierigkeit: 'Gut fangbar',
    sommer: 'Jagt im Sommer oft in Trupps an Kanten, Steinen und Stegen. Aktive Suche lohnt.',
    koeder: ['Kleiner Gummifisch 5–8 cm', 'Dropshot', 'Spinner', 'Crankbait', 'Wurm'],
    zeit: 'Früher Morgen & Abend, bei Wolken ganztags',
    tipp: 'Rauborste Barschberge findet man mit dem Echolot – wo einer ist, sind viele.',
  },
  {
    name: 'Zander',
    emoji: '🦈',
    schwierigkeit: 'Schwierig im Hochsommer',
    sommer: 'Steht tief und ist überwiegend nachtaktiv. Realistisch: späte Abend-/Nachtsession an der tiefen Rinne.',
    koeder: ['Gummifisch 8–12 cm am Jigkopf', 'Wobbler flach nachts', 'Köderfisch am Grund'],
    zeit: 'Späte Dämmerung bis Nacht',
    tipp: 'Ryssbysjön gilt auch als Zandergewässer – Geduld mitbringen, Echolot nutzen.',
  },
  {
    name: 'Forelle',
    emoji: '🎣',
    schwierigkeit: 'Je nach Gewässer',
    sommer: 'In warmen Sommern in tieferen, kühleren Zonen. Eher Beifang in den Seen hier.',
    koeder: ['Spinner', 'Kleiner Blinker', 'Bienenmade'],
    zeit: 'Morgens',
    tipp: 'Schonzeiten beachten – Legal-Check im Fangbuch nutzen.',
  },
]

export const SURVIVAL_TIPPS = [
  { icon: '🫎', title: 'Elch-Warnung', text: 'In der Dämmerung langsam fahren – Wildwechsel! Ein Elch gewinnt jeden Aufprall.' },
  { icon: '🦟', title: 'Mücken', text: 'Abends lange Kleidung + Spray. Lagerfeuer-Rauch hilft tatsächlich.' },
  { icon: '💧', title: 'Wasser', text: 'Seewasser nicht ungefiltert trinken. Leitungswasser in Schweden ist top.' },
  { icon: '🔥', title: 'Feuer', text: 'Allemansrätten erlaubt viel, aber: bei Trockenheit gilt oft Feuerverbot (eldningsförbud) – vorher checken.' },
  { icon: '🛶', title: 'Boot', text: 'Kleine Motorboote ohne Führerschein ok. Westen an, Wetter checken, Handy wasserdicht.' },
  { icon: '🍺', title: 'Promille', text: 'Schweden: 0,2‰ am Steuer – de facto Nullgrenze. Fahrer trinkt nicht.' },
]
