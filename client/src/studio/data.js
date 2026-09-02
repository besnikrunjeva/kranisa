// Static sample inventory for the Studio showcase. Not wired to the API —
// this UI is a look-and-feel exploration. Fields mirror the real offer
// shape plus the two "make the value prop visible" signals: savings vs
// booking direct, and how fresh the price is.

export function offerImage (seed, w = 800, h = 600) {
  return `https://picsum.photos/seed/kr-studio-${seed}/${w}/${h}`
}

export const OFFERS = [
  { id: 's1', destination: 'Sarandë', country: 'Shqipëri', agency: 'Adriatik Tours', stars: 4, board: 'Gjysmë-pension', nights: 5, from: '12 Kor', to: '17 Kor', price: 389, currency: '€', savings: 55, verifiedHours: 2, seed: 'saranda' },
  { id: 's2', destination: 'Ksamil', country: 'Shqipëri', agency: 'Jon Travel', stars: 4, board: 'Mëngjes', nights: 4, from: '20 Kor', to: '24 Kor', price: 315, currency: '€', savings: 40, verifiedHours: 5, seed: 'ksamil' },
  { id: 's3', destination: 'Antalya', country: 'Turqi', agency: 'Prima Travel', stars: 5, board: 'Ultra All Inclusive', nights: 7, from: '03 Gsh', to: '10 Gsh', price: 549, currency: '€', savings: 90, verifiedHours: 1, seed: 'antalya' },
  { id: 's4', destination: 'Dubrovnik', country: 'Kroaci', agency: 'Riviera Tours', stars: 4, board: 'Mëngjes', nights: 5, from: '15 Gsh', to: '20 Gsh', price: 472, currency: '€', savings: 35, verifiedHours: 8, seed: 'dubrovnik' },
  { id: 's5', destination: 'Santorini', country: 'Greqi', agency: 'Blue Coast', stars: 5, board: 'Mëngjes', nights: 4, from: '28 Kor', to: '01 Gsh', price: 611, currency: '€', savings: 70, verifiedHours: 3, seed: 'santorini' },
  { id: 's6', destination: 'Bodrum', country: 'Turqi', agency: 'Balkan Voyage', stars: 5, board: 'All Inclusive', nights: 7, from: '05 Gsh', to: '12 Gsh', price: 489, currency: '€', savings: 60, verifiedHours: 6, seed: 'bodrum' },
  { id: 's7', destination: 'Kretë', country: 'Greqi', agency: 'Sunny Days', stars: 4, board: 'All Inclusive', nights: 7, from: '18 Gsh', to: '25 Gsh', price: 429, currency: '€', savings: 45, verifiedHours: 4, seed: 'crete' },
  { id: 's8', destination: 'Hurghada', country: 'Egjipt', agency: 'Nova Travel', stars: 5, board: 'Ultra All Inclusive', nights: 7, from: '22 Sht', to: '29 Sht', price: 512, currency: '€', savings: 110, verifiedHours: 12, seed: 'hurghada' },
  { id: 's9', destination: 'Vlorë', country: 'Shqipëri', agency: 'Tirana Express', stars: 3, board: 'Vetëm-mëngjes', nights: 3, from: '10 Kor', to: '13 Kor', price: 149, currency: '€', savings: 20, verifiedHours: 7, seed: 'vlore' },
  { id: 's10', destination: 'Barcelona', country: 'Spanjë', agency: 'Iberia Trips', stars: 4, board: 'Mëngjes', nights: 4, from: '02 Tet', to: '06 Tet', price: 398, currency: '€', savings: 30, verifiedHours: 9, seed: 'barcelona' },
  { id: 's11', destination: 'Budapest', country: 'Hungari', agency: 'Danube Line', stars: 4, board: 'Mëngjes', nights: 3, from: '11 Tet', to: '14 Tet', price: 265, currency: '€', savings: 25, verifiedHours: 10, seed: 'budapest' },
  { id: 's12', destination: 'Prishtinë → Stamboll', country: 'Turqi', agency: 'Kosova Air Tours', stars: 4, board: 'Mëngjes', nights: 4, from: '19 Tet', to: '23 Tet', price: 342, currency: '€', savings: 48, verifiedHours: 3, seed: 'istanbul' }
]

export const POPULAR = [
  { name: 'Sarandë', country: 'Shqipëri', seed: 'pop-saranda' },
  { name: 'Antalya', country: 'Turqi', seed: 'pop-antalya' },
  { name: 'Santorini', country: 'Greqi', seed: 'pop-santorini' },
  { name: 'Dubrovnik', country: 'Kroaci', seed: 'pop-dubrovnik' },
  { name: 'Hurghada', country: 'Egjipt', seed: 'pop-hurghada' },
  { name: 'Barcelona', country: 'Spanjë', seed: 'pop-barcelona' }
]

export const FAQS = [
  { q: 'A është Kranisa falas?', a: 'Po — plotësisht falas, pa regjistrim dhe pa asnjë komision të fshehur. Rezervon dhe paguan direkt me agjencinë.' },
  { q: 'Si i verifikoni ofertat?', a: 'Çdo ofertë kontrollohet manualisht përpara se të publikohet, dhe ofertat e skaduara hiqen automatikisht nga kërkimi.' },
  { q: 'Sa shpesh përditësohen çmimet?', a: 'Vazhdimisht. Çdo kartë tregon sa orë më parë është verifikuar çmimi, që të mos ndjekësh oferta të vjetra.' },
  { q: 'Me kë e rezervoj në fund?', a: 'Direkt me agjencinë që publikon ofertën. Kranisa nuk ndërhyn në pagesë — vetëm të ndihmon të krahasosh në një vend.' }
]

export function offerById (id) {
  return OFFERS.find(o => o.id === id) || null
}
