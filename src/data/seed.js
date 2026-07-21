// Seed-Daten für „Angelurlaub Schweden 2026" (Trip-Code RYSSBY26).
// Koordinaten sind Näherungswerte – auf der Karte anpassbar.

export const DEFAULT_TRIP_CODE = 'RYSSBY26'

export function seedTrip() {
  const now = new Date().toISOString()
  return {
    trip: {
      name: 'Angelurlaub Schweden 2026',
      tripCode: DEFAULT_TRIP_CODE,
      startDate: '2026-07-28',
      endDate: '2026-08-01',
      location: 'Ryssby, Ljungby kommun, Småland',
      lat: 56.867,
      lng: 14.086,
      houseAddress: 'Haus am Ryssbysjön – genaue Adresse hier eintragen (wichtig für 112)!',
      houseHasSauna: true,
      boatRented: false,
      hospital: 'Lasarett Ljungby (Krankenhaus), Ljungby – ca. 15 min',
      createdAt: now,
      settings: {},
    },
    collections: {
      schedule: [
        {
          date: '2026-07-28',
          entries: [
            { time: '06:00', title: 'Abfahrt in Deutschland', icon: '🚗' },
            { time: '10:00', title: 'Fähre / Öresundbrücke', icon: '⛴️' },
            { time: '16:00', title: 'Ankunft, Haus beziehen', icon: '🏡' },
            { time: '18:30', title: 'Erster Wurf vom Steg', icon: '🎣' },
            { time: '20:30', title: 'Grillen & Lagerfeuer', icon: '🔥' },
          ],
        },
        {
          date: '2026-07-29',
          entries: [
            { time: '04:30', title: 'Dämmerungs-Session Hecht', icon: '🎣' },
            { time: '09:00', title: 'Frühstück', icon: '🍳' },
            { time: '11:00', title: 'Einkauf Ljungby + Systembolaget', icon: '🛒' },
            { time: '17:00', title: 'Abend-Angeln', icon: '🐟' },
            { time: '20:00', title: 'Grillen', icon: '🥩' },
            { time: '21:30', title: 'Sauna & See-Sprung', icon: '🧖' },
          ],
        },
        {
          date: '2026-07-30',
          entries: [
            { time: '04:30', title: 'Frühschicht am Wasser', icon: '🎣' },
            { time: '09:30', title: 'Frühstück', icon: '🍳' },
            { time: '12:00', title: 'Bootstour / Spots erkunden', icon: '🛥️' },
            { time: '19:00', title: 'Grillen', icon: '🔥' },
            { time: '22:00', title: 'Bierpong & Karten', icon: '🍻' },
          ],
        },
        {
          date: '2026-07-31',
          entries: [
            { time: '05:00', title: 'Letzte große Session', icon: '🎣' },
            { time: '10:00', title: 'Frühstück', icon: '🍳' },
            { time: '14:00', title: 'Ausflug (Växjö / Elchpark)', icon: '🫎' },
            { time: '19:00', title: 'Abschluss-Grillen', icon: '🥩' },
            { time: '21:00', title: 'Sauna-Finale + Lagerfeuer', icon: '🔥' },
          ],
        },
        {
          date: '2026-08-01',
          entries: [
            { time: '08:00', title: 'Packen & Haus übergeben', icon: '🧹' },
            { time: '10:00', title: 'Abfahrt Richtung Heimat', icon: '🚗' },
          ],
        },
      ],
      tasks: [
        { title: 'Fähre buchen (Rostock–Trelleborg o. Öresund)', assignedTo: null, status: 'open', category: 'Anreise', dueDate: '2026-07-10' },
        { title: 'Fiskekort für Ryssbysjön kaufen (iFiske-App)', assignedTo: null, status: 'open', category: 'Angeln', dueDate: '2026-07-25' },
        { title: 'Bootsmiete anfragen (Motorboot)', assignedTo: null, status: 'open', category: 'Boot', dueDate: '2026-07-15' },
        { title: 'Hausadresse & Schlüsselübergabe klären', assignedTo: null, status: 'open', category: 'Unterkunft', dueDate: '2026-07-20' },
        { title: 'Alkohol-Großeinkauf in Deutschland (billiger!)', assignedTo: null, status: 'open', category: 'Einkauf', dueDate: '2026-07-27' },
        { title: 'Passat-Check: Öl, Reifen, Warnwesten', assignedTo: null, status: 'open', category: 'Anreise', dueDate: '2026-07-26' },
        { title: 'Playlist für die Fahrt bauen', assignedTo: null, status: 'open', category: 'Party', dueDate: '2026-07-27' },
      ],
      packing: [
        { name: 'Ruten (Spinn + Ansitz)', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Rollen + Ersatzschnur', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Köderboxen (Gummifische, Wobbler, Blinker)', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Stahlvorfächer (Hecht!)', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Kescher (groß)', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Zange / Lösezange / Seitenschneider', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Maßband & Fischwaage', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Echolot + Powerbank', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Wathose', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Mückenspray', category: 'Angeln', assignedTo: null, packed: false },
        { name: 'Grill + Rost', category: 'Grillen', assignedTo: null, packed: false },
        { name: 'Kohle / Gas', category: 'Grillen', assignedTo: null, packed: false },
        { name: 'Grillzange + Besteck', category: 'Grillen', assignedTo: null, packed: false },
        { name: 'Gewürze & Marinade', category: 'Grillen', assignedTo: null, packed: false },
        { name: 'Kühlbox (groß)', category: 'Grillen', assignedTo: null, packed: false },
        { name: 'Musikbox (JBL o.ä.)', category: 'Party', assignedTo: null, packed: false },
        { name: 'Bierpong-Set + Becher', category: 'Party', assignedTo: null, packed: false },
        { name: 'Kartenspiele', category: 'Party', assignedTo: null, packed: false },
        { name: 'Spirituosen (aus DE mitbringen!)', category: 'Party', assignedTo: null, packed: false },
        { name: 'Campingstühle', category: 'Party', assignedTo: null, packed: false },
        { name: 'Regenjacke', category: 'Kleidung', assignedTo: null, packed: false },
        { name: 'Hoodies (abends kühl!)', category: 'Kleidung', assignedTo: null, packed: false },
        { name: 'Badehose', category: 'Kleidung', assignedTo: null, packed: false },
        { name: 'Handtücher (auch Sauna)', category: 'Kleidung', assignedTo: null, packed: false },
        { name: 'Feste Schuhe + Gummistiefel', category: 'Kleidung', assignedTo: null, packed: false },
      ],
      shopping: [
        { name: 'Bier (aus DE mitbringen!)', quantity: 5, unit: 'Kästen', category: 'Getränke', claimedBy: null, bought: false, estimatedCost: 60 },
        { name: 'Wasser', quantity: 30, unit: 'L', category: 'Getränke', claimedBy: null, bought: false, estimatedCost: 12 },
        { name: 'Softdrinks / Mischgetränke', quantity: 12, unit: 'L', category: 'Getränke', claimedBy: null, bought: false, estimatedCost: 18 },
        { name: 'Grillfleisch (Nacken, Steaks)', quantity: 8, unit: 'kg', category: 'Grillgut', claimedBy: null, bought: false, estimatedCost: 90 },
        { name: 'Bratwürste', quantity: 3, unit: 'Pack', category: 'Grillgut', claimedBy: null, bought: false, estimatedCost: 15 },
        { name: 'Beilagen (Kartoffelsalat, Brot, Mais)', quantity: 1, unit: 'Ladung', category: 'Grillgut', claimedBy: null, bought: false, estimatedCost: 30 },
        { name: 'Frühstück (Brot, Eier ×30, Bacon, Käse)', quantity: 1, unit: 'Ladung', category: 'Frühstück', claimedBy: null, bought: false, estimatedCost: 45 },
        { name: 'Kaffee', quantity: 1, unit: 'kg', category: 'Frühstück', claimedBy: null, bought: false, estimatedCost: 10 },
        { name: 'Snacks & Chips', quantity: 10, unit: 'Tüten', category: 'Snacks', claimedBy: null, bought: false, estimatedCost: 25 },
        { name: 'Grillkohle', quantity: 2, unit: 'Säcke', category: 'Grillgut', claimedBy: null, bought: false, estimatedCost: 16 },
        { name: 'Müllbeutel, Spüli, Küchenrolle', quantity: 1, unit: 'Set', category: 'Haushalt', claimedBy: null, bought: false, estimatedCost: 10 },
      ],
      spots: [
        { name: 'Unser Haus am See', type: 'unterkunft', lat: 56.867, lng: 14.086, notes: 'Basis-Lager. Position anpassen, sobald Adresse feststeht!', addedBy: null },
        { name: 'Schilfkante Ryssbysjön', type: 'angelspot', lat: 56.872, lng: 14.097, notes: 'Hechtrevier: Schilfgürtel, morgens & abends mit Gummifisch/Spinner.', addedBy: null },
        { name: 'Tiefe Rinne (Zander)', type: 'angelspot', lat: 56.878, lng: 14.104, notes: 'Zander im Sommer tief & nachtaktiv – abends mit Echolot suchen.', addedBy: null },
        { name: 'Bootsanleger Ryssby', type: 'bootsstelle', lat: 56.869, lng: 14.091, notes: 'Slipstelle / Anleger fürs Mietboot.', addedBy: null },
        { name: 'ICA Nära Ryssby', type: 'supermarkt', lat: 56.866, lng: 14.083, notes: 'Kleiner Laden im Ort – Basics. Achtung: nur Folköl (max 3,5%).', addedBy: null },
        { name: 'ICA Maxi Ljungby', type: 'supermarkt', lat: 56.836, lng: 13.947, notes: 'Großeinkauf, ca. 15 min mit dem Auto.', addedBy: null },
        { name: 'Systembolaget Ljungby', type: 'systembolaget', lat: 56.833, lng: 13.941, notes: 'Einziger Laden für Bier >3,5% & Schnaps. Sa nur vormittags, So GESCHLOSSEN!', addedBy: null },
        { name: 'Circle K Ljungby', type: 'tankstelle', lat: 56.838, lng: 13.936, notes: 'Tanken vor Bootstouren.', addedBy: null },
        { name: 'Lasarett Ljungby', type: 'notfall', lat: 56.832, lng: 13.933, notes: 'Nächstes Krankenhaus. Notruf: 112.', addedBy: null },
        { name: 'Växjö (Dom & Altstadt)', type: 'sehenswuerdigkeit', lat: 56.877, lng: 14.809, notes: 'Ausflugsziel, ca. 45 min. Schlechtwetter-Option.', addedBy: null },
        { name: 'Grönåsen Älgpark (Elch-Safari)', type: 'sehenswuerdigkeit', lat: 56.844, lng: 15.393, notes: 'Elche garantiert. Ca. 1h Fahrt Richtung Kosta.', addedBy: null },
      ],
      chat: [
        {
          userId: null,
          userName: 'Norrfångst',
          text: 'Willkommen im Trip-Chat! 🎣🔥 Hier landet alles: Fang-Alarm, Grill-Koordination, Sauna-Beschimpfungen.',
          createdAt: now,
        },
      ],
      meta: [],
      members: [],
      catches: [],
      expenses: [],
    },
  }
}

// Leerer Trip für unbekannte Codes (neue Trips in Folgejahren)
export function blankTrip(code) {
  return {
    trip: {
      name: `Trip ${code}`,
      tripCode: code,
      startDate: '',
      endDate: '',
      location: '',
      lat: 56.867,
      lng: 14.086,
      houseAddress: '',
      houseHasSauna: false,
      boatRented: false,
      hospital: '',
      createdAt: new Date().toISOString(),
      settings: {},
    },
    collections: { schedule: [], tasks: [], packing: [], shopping: [], spots: [], chat: [], meta: [], members: [], catches: [], expenses: [] },
  }
}
