/* =====================================================================
   WAYFARE · booking engine (traveller storefront, agent desk, admin panel)
   Data, pricing, view templates and routing. Motion lives in
   js/cinema.js, the 3D route globe in js/globe.js.
   ===================================================================== */
'use strict';

/* ---------- icons ---------- */
const I = {
  plane:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',
  planeFill:'<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',
  bed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V6M3 11h18v7M21 18v-4M7 11V8h5v3"/></svg>',
  pack:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
  swap:'<svg viewBox="0 0 24 24"><path d="M7 4v12M7 16l-3-3M7 16l3-3M17 20V8M17 8l3 3M17 8l-3 3"/></svg>',
  check:'<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  x:'<svg viewBox="0 0 24 24" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  ticket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  play:'<svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg>',
  starMark:'<svg class="star" viewBox="0 0 40 40"><path d="M20 0l3.2 16.8L40 20l-16.8 3.2L20 40l-3.2-16.8L0 20l16.8-3.2z"/></svg>'
};

/* ---------- airports & routes (lat/lng added for the globe) ---------- */
const AP = {
  YYZ:{c:'Toronto',     n:'Pearson Intl · 22 km from Brampton', cc:'Canada', tz:-4, lat:43.68, lng:-79.63},
  YVR:{c:'Vancouver',   n:'Vancouver Intl',         cc:'Canada',         tz:-7, lat:49.19, lng:-123.18},
  YUL:{c:'Montréal',    n:'Montréal-Trudeau Intl',  cc:'Canada',         tz:-4, lat:45.47, lng:-73.74},
  JFK:{c:'New York',    n:'John F. Kennedy Intl',   cc:'United States',  tz:-4, lat:40.64, lng:-73.78},
  LAX:{c:'Los Angeles', n:'Los Angeles Intl',       cc:'United States',  tz:-7, lat:33.94, lng:-118.41},
  LHR:{c:'London',      n:'Heathrow',               cc:'United Kingdom', tz:1,  lat:51.47, lng:-0.45},
  CDG:{c:'Paris',       n:'Charles de Gaulle',      cc:'France',         tz:2,  lat:49.01, lng:2.55},
  CUN:{c:'Cancún',      n:'Cancún Intl',            cc:'Mexico',         tz:-5, lat:21.04, lng:-86.87},
  DXB:{c:'Dubai',       n:'Dubai Intl',             cc:'UAE',            tz:4,  lat:25.25, lng:55.36},
  NRT:{c:'Tokyo',       n:'Narita Intl',            cc:'Japan',          tz:9,  lat:35.77, lng:140.39},
  SIN:{c:'Singapore',   n:'Changi',                 cc:'Singapore',      tz:8,  lat:1.36,  lng:103.99},
  DPS:{c:'Bali',        n:'Ngurah Rai Intl',        cc:'Indonesia',      tz:8,  lat:-8.75, lng:115.17}
};
const ROUTES = {
  'YYZ-LHR':{mins:430,  base:642,  via:['YUL','KEF','DUB','FRA'],       als:['AC','BA','WS','LH','AF']},
  'YYZ-CDG':{mins:445,  base:611,  via:['YUL','LHR','AMS'],             als:['AC','AF','BA','LH']},
  'YYZ-YVR':{mins:305,  base:248,  via:['YYC','YEG','YWG'],             als:['AC','WS','DL','UA']},
  'YYZ-CUN':{mins:235,  base:386,  via:['YUL','ATL','IAH'],             als:['AC','WS','AA','DL','UA']},
  'YYZ-DXB':{mins:790,  base:894,  via:['LHR','CDG','FRA','IST'],       als:['EK','AC','BA','LH','QR']},
  'YYZ-NRT':{mins:775,  base:948,  via:['YVR','ICN','SFO'],             als:['AC','UA','DL','SQ']},
  'YYZ-SIN':{mins:1180, base:1092, via:['DXB','NRT','ICN','FRA'],       als:['SQ','EK','QR','AC','LH']},
  'YYZ-DPS':{mins:1340, base:1186, via:['SIN','NRT','DXB'],             als:['SQ','EK','QR','AC']},
  'YVR-NRT':{mins:610,  base:782,  via:['SFO','LAX','ICN'],             als:['AC','UA','DL','SQ']},
  'YVR-LHR':{mins:565,  base:702,  via:['YYZ','YUL','KEF'],             als:['AC','BA','WS','LH']},
  'YUL-CDG':{mins:425,  base:596,  via:['YYZ','LHR','AMS'],             als:['AC','AF','LH','BA']},
  'JFK-LHR':{mins:420,  base:558,  via:['BOS','DUB','KEF'],             als:['BA','DL','UA','AA','AF']},
  'JFK-CDG':{mins:435,  base:585,  via:['BOS','LHR','AMS'],             als:['AF','DL','AA','LH']},
  'JFK-DXB':{mins:750,  base:846,  via:['LHR','IST','CDG'],             als:['EK','QR','BA','AA']},
  'LAX-LHR':{mins:635,  base:694,  via:['JFK','ORD','DUB'],             als:['BA','AA','UA','AF','LH']},
  'LAX-NRT':{mins:690,  base:812,  via:['SFO','ICN','HNL'],             als:['AA','UA','DL','SQ']},
  'LAX-CUN':{mins:305,  base:412,  via:['DFW','IAH','MEX'],             als:['AA','UA','DL','WS']},
  'YYZ-JFK':{mins:95,   base:189,  via:['YUL','BOS'],                   als:['AC','DL','UA','AA','WS']}
};
/* popular routes */
const DESTS = [
  {c:'London',   ap:'LHR', img:'assets/img/dest-london.jpg',  note:'5 carriers · 7h 10m nonstop'},
  {c:'New York', ap:'JFK', img:'assets/img/dest-newyork.jpg', note:'Hourly shuttle · 1h 35m'},
  {c:'Paris',    ap:'CDG', img:'assets/img/dest-paris.jpg',   note:'4 carriers · 7h 25m nonstop'},
  {c:'Tokyo',    ap:'NRT', img:'assets/img/dest-tokyo.jpg',   note:'Seasonal nonstop · 12h 55m'},
  {c:'Cancún',   ap:'CUN', img:'assets/img/dest-cancun.jpg',  note:'Daily nonstop · 3h 55m'},
  {c:'Dubai',    ap:'DXB', img:'assets/img/dest-dubai.jpg',   note:'1 stop via Europe · 13h 10m'}
];
const AIRLINES = [
  {code:'AC', name:'Air Canada',           bg:'#A8201C', tier:1.06, ndc:true },
  {code:'WS', name:'WestJet',              bg:'#1D4E89', tier:0.88, ndc:true },
  {code:'DL', name:'Delta Air Lines',      bg:'#0B2E63', tier:1.04, ndc:false},
  {code:'UA', name:'United Airlines',      bg:'#16406E', tier:1.02, ndc:false},
  {code:'AA', name:'American Airlines',    bg:'#7A2036', tier:1.00, ndc:false},
  {code:'BA', name:'British Airways',      bg:'#0F2C5C', tier:1.16, ndc:false},
  {code:'AF', name:'Air France',           bg:'#123A73', tier:1.12, ndc:false},
  {code:'LH', name:'Lufthansa',            bg:'#05164B', tier:1.14, ndc:true },
  {code:'EK', name:'Emirates',             bg:'#8E2420', tier:1.22, ndc:false},
  {code:'QR', name:'Qatar Airways',        bg:'#5C0F2E', tier:1.19, ndc:false},
  {code:'SQ', name:'Singapore Airlines',   bg:'#1E3A5F', tier:1.24, ndc:false}
];
const SUPPLIERS = ['Amadeus','Travelport','TBO','Direct NDC'];
const AIRCRAFT = ['Boeing 777-300ER','Airbus A350-900','Airbus A320neo','Boeing 787-9','Airbus A321neo','Boeing 737-8'];

/* ---------- hotels ---------- */
const HOTELS = [
  {id:'h1', n:'Meridian Creek Resort & Spa', city:'Dubai', area:'Jumeirah Beach Residence', star:5, score:9.1, rev:1284, rate:168, img:'assets/img/ht1.jpg', img2:'assets/img/ht1a.jpg', room:'Deluxe King · Sea view', board:'Breakfast included', free:true, sup:'Hotelbeds', tags:['Beachfront','Infinity pool','Airport transfer'], p:['#F2B06A','#E08640','#8C4A2F']},
  {id:'h2', n:'The Alcove, Palm Jumeirah', city:'Dubai', area:'Palm Jumeirah West', star:5, score:9.4, rev:842, rate:254, img:'assets/img/ht2.jpg', img2:'assets/img/ht2a.jpg', room:'Premier Suite · Private terrace', board:'Half board', free:true, sup:'TBO', tags:['Private beach','Spa','Butler service'], p:['#7FC4D6','#3E93B5','#1E5878']},
  {id:'h3', n:'Harbourline Boutique Hotel', city:'Dubai', area:'Business Bay', star:4, score:8.6, rev:2011, rate:105, img:'assets/img/ht3.jpg', img2:'assets/img/ht3a.jpg', room:'Executive Twin', board:'Room only', free:true, sup:'Amadeus', tags:['Metro 300 m','Rooftop bar','Co-working'], p:['#C9A9E0','#8F6FB8','#4B3572']},
  {id:'h4', n:'Sandbar Marina Apartments', city:'Dubai', area:'Dubai Marina', star:4, score:8.2, rev:1476, rate:87, img:'assets/img/ht4.jpg', img2:'assets/img/ht4a.jpg', room:'1-BR Apartment · Kitchenette', board:'Room only', free:false, sup:'TBO', tags:['Self-catering','Gym','Long-stay rates'], p:['#F4D06F','#D99A3E','#8A5A24']},
  {id:'h5', n:'Old Town Courtyard Inn', city:'Dubai', area:'Al Fahidi Historical District', star:3, score:8.0, rev:934, rate:54, img:'assets/img/ht5.jpg', img2:'assets/img/ht5a.jpg', room:'Standard Double', board:'Breakfast included', free:true, sup:'Hotelbeds', tags:['Heritage building','Souk 5 min','Family rooms'], p:['#E7A17A','#C4714B','#7A3C24']}
];

/* ---------- packages ---------- */
const PK = id => [`assets/img/${id}.jpg`, `assets/img/${id}a.jpg`, `assets/img/${id}b.jpg`];
const PACKAGES = [
  {id:'p1', n:'Dubai Desert & Skyline', dest:'Dubai, UAE', code:'DXB', img:'assets/img/pk1.jpg', g:PK('pk1'), vid:'desert', nights:5, days:6, from:459, was:549, rating:4.8, revs:312, cat:'Bestseller',
   incl:['Return flights','4★ hotel','Desert safari','Burj Khalifa L124','Airport transfers'],
   blurb:'Five nights split between a Marina high-rise and a desert camp, built around the two things guests actually book Dubai for: the skyline and the dunes.',
   itin:[
     {t:'Arrive Dubai · Marina check-in', d:'Meet-and-greet at DXB Terminal 3, private transfer to Dubai Marina. Evening dhow cruise with dinner along the creek.', a:['Private transfer','Dhow dinner cruise']},
     {t:'Burj Khalifa & Dubai Mall', d:'Level 124 + 125 observation deck on a timed slot, then Dubai Aquarium and the fountain show from the Waterfront Promenade.', a:['Skip-the-line entry','Aquarium pass']},
     {t:'Red dune desert safari', d:'Afternoon 4x4 dune bashing in the Lahbab red dunes, camel ride, henna, BBQ dinner and a live tanoura show at the Bedouin camp.', a:['4x4 safari','Overnight camp option']},
     {t:'Abu Dhabi day trip', d:'Sheikh Zayed Grand Mosque, Qasr Al Watan and Ferrari World entry. Return by early evening.', a:['Cross-emirate coach','3 entries']},
     {t:'Free day + Palm Jumeirah', d:'Morning at leisure. Afternoon monorail to Atlantis, The Palm and Aquaventure waterpark day pass.', a:['Aquaventure pass','Monorail']},
     {t:'Departure', d:'Checkout at 12:00, private transfer to DXB. Late-checkout upgrade available on request.', a:['Private transfer']}
   ]},
  {id:'p2', n:'Bali Honeymoon Retreat', dest:'Bali, Indonesia', code:'DPS', img:'assets/img/pk2.jpg', g:PK('pk2'), vid:'resort', nights:6, days:7, from:619, was:719, rating:4.9, revs:198, cat:'Honeymoon',
   incl:['Return flights','Pool villa 3N','Beach resort 3N','Candlelit dinner','Ubud day tour'],
   blurb:'Split-stay across Ubud jungle and Seminyak sand, with the honeymoon extras built into the rate rather than upsold at the desk.',
   itin:[
     {t:'Arrive Denpasar · Ubud villa', d:'Private transfer to a Ubud valley pool villa. Welcome flower bath and in-villa dinner on arrival night.', a:['Private transfer','Flower bath']},
     {t:'Ubud culture circuit', d:'Tegalalang rice terraces at sunrise, Tirta Empul water temple, Sacred Monkey Forest and a Balinese cooking class.', a:['Sunrise tour','Cooking class']},
     {t:'Mount Batur sunrise trek', d:'02:00 pickup for the Batur summit trek with a guide, breakfast cooked over volcanic steam, then a hot-spring soak.', a:['Guided trek','Hot springs']},
     {t:'Transfer to Seminyak', d:'Coastal transfer via Tanah Lot sea temple. Afternoon check-in at the beach resort, sunset at the beach club.', a:['Tanah Lot','Beach club']},
     {t:'Nusa Penida island day', d:'Fast boat to Nusa Penida for Kelingking Beach, Angel Billabong and Broken Beach with a private driver.', a:['Fast boat','Private driver']},
     {t:'Candlelit beach dinner', d:'Day at leisure, spa couples treatment in the afternoon and a private candlelit dinner on the sand.', a:['Couples spa','Private dinner']},
     {t:'Departure', d:'Late checkout at 14:00, transfer to DPS for the evening flight.', a:['Late checkout']}
   ]},
  {id:'p3', n:'Kerala Backwaters & Tea Hills', dest:'Kochi · Munnar · Alleppey', code:'COK', img:'assets/img/pk3.jpg', g:PK('pk3'), nights:4, days:5, from:259, was:299, rating:4.7, revs:441, cat:'Family',
   incl:['AC transport','Houseboat 1N','Tea estate stay','All breakfasts','Kathakali show'],
   blurb:'The classic Kerala loop at a pace families can actually keep - one houseboat night, two hill nights, and no day longer than four hours on the road.',
   itin:[
     {t:'Kochi arrival · Fort Kochi', d:'Airport pickup, Chinese fishing nets, Mattancherry Palace and St Francis Church. Evening Kathakali performance.', a:['Heritage walk','Kathakali show']},
     {t:'Drive to Munnar', d:'Four-hour drive through Cheeyappara and Valara falls. Check in to a working tea estate bungalow.', a:['Estate stay','Waterfall stops']},
     {t:'Munnar tea country', d:'Eravikulam National Park for the Nilgiri tahr, Tea Museum, Mattupetty Dam and Echo Point.', a:['Park permit','Tea museum']},
     {t:'Alleppey houseboat', d:'Board a private 2-bedroom kettuvallam at noon. Lunch, dinner and breakfast cooked onboard while cruising the Vembanad backwaters.', a:['Private houseboat','All meals']},
     {t:'Disembark · Kochi departure', d:'Disembark 09:00, drive to Kochi airport with a stop at the Alleppey coir village.', a:['Airport drop']}
   ]},
  {id:'p4', n:'Swiss Alps Rail Journey', dest:'Zurich · Interlaken · Zermatt', code:'ZRH', img:'assets/img/pk4.jpg', g:PK('pk4'), vid:'hero-alps', nights:7, days:8, from:1749, was:1990, rating:4.9, revs:126, cat:'Premium',
   incl:['Return flights','Swiss Travel Pass','Jungfraujoch','Glacier Express','4★ central hotels'],
   blurb:'Eight days on the Swiss Travel Pass with the two rail journeys worth the airfare - Jungfraujoch and the Glacier Express - booked in advance, not queued for.',
   itin:[
     {t:'Arrive Zurich', d:'Swiss Travel Pass activated at the airport station. Train to the old town hotel, evening Limmat river walk.', a:['Rail pass','City walk']},
     {t:'Zurich to Lucerne', d:'Chapel Bridge, Lion Monument and a Lake Lucerne steamer cruise included on the pass.', a:['Lake cruise']},
     {t:'Mount Pilatus circuit', d:'Golden Round Trip - cogwheel railway up, cable car and gondola down, boat back to Lucerne.', a:['Golden Round Trip']},
     {t:'To Interlaken', d:'Scenic Luzern-Interlaken Express through the Brünig Pass. Afternoon free at Höhematte.', a:['Scenic rail']},
     {t:'Jungfraujoch · Top of Europe', d:'Cogwheel to 3,454 m, Ice Palace, Sphinx observatory and the Aletsch Glacier viewpoint.', a:['Jungfrau ticket']},
     {t:'Glacier Express to Zermatt', d:'Eight hours in a panoramic first-class coach over the Oberalp Pass, lunch served at seat.', a:['1st class panoramic','Seat reservation']},
     {t:'Gornergrat & Matterhorn', d:'Gornergrat Bahn to 3,089 m for the Matterhorn face, afternoon in car-free Zermatt.', a:['Gornergrat Bahn']},
     {t:'Zermatt to Zurich · departure', d:'Morning rail to Zurich Airport, direct platform access to check-in.', a:['Rail transfer']}
   ]},
  {id:'p5', n:'Thailand Island Hopper', dest:'Phuket · Krabi · Phi Phi', code:'HKT', img:'assets/img/pk5.jpg', g:PK('pk5'), vid:'hero-ocean', nights:6, days:7, from:409, was:469, rating:4.6, revs:527, cat:'Bestseller',
   incl:['Return flights','Speedboat transfers','Phi Phi day trip','James Bond Island','Daily breakfast'],
   blurb:'Three bases, two speedboat days, no backtracking - routed so you only unpack when the island actually changes.',
   itin:[
     {t:'Arrive Phuket', d:'Transfer to Patong. Evening at Bangla Road and the night market.', a:['Transfer','Night market']},
     {t:'Phi Phi islands day', d:'Speedboat to Maya Bay, Pileh Lagoon, Viking Cave and Bamboo Island with snorkelling gear and lunch.', a:['Speedboat','Snorkel kit']},
     {t:'Phang Nga Bay', d:'James Bond Island, sea-cave canoeing at Hong Island and a floating Muslim village lunch at Koh Panyee.', a:['Sea canoe','Local lunch']},
     {t:'Transfer to Krabi', d:'Ferry to Ao Nang, check in to a cliffside resort. Sunset at Nopparat Thara beach.', a:['Ferry','Resort check-in']},
     {t:'Four Islands tour', d:'Longtail to Tup, Chicken, Poda and Phra Nang Cave beach with the sandbar walk at low tide.', a:['Longtail boat']},
     {t:'Railay & free day', d:'Morning at Railay West, afternoon free for Thai massage or the Tiger Cave temple climb.', a:['Railay transfer']},
     {t:'Departure', d:'Transfer to Krabi International for the return flight.', a:['Airport transfer']}
   ]},
  {id:'p6', n:'Singapore City Break', dest:'Singapore', code:'SIN', img:'assets/img/pk6.jpg', g:PK('pk6'), vid:'hero-city', nights:3, days:4, from:325, was:369, rating:4.7, revs:389, cat:'Short break',
   incl:['Return flights','4★ Orchard hotel','Universal Studios','Gardens by the Bay','Night Safari'],
   blurb:'A long-weekend build for the Friday-night departure - four days, five headline attractions, all within one MRT pass.',
   itin:[
     {t:'Arrive · Orchard Road', d:'Changi arrival, MRT pass issued, check in on Orchard Road. Evening at Clarke Quay.', a:['MRT pass','Clarke Quay']},
     {t:'Sentosa & Universal Studios', d:'Full day at Universal Studios Singapore with a one-day park pass, cable car return.', a:['USS pass','Cable car']},
     {t:'Gardens & Marina Bay', d:'Cloud Forest, Flower Dome and the Supertree Grove light show, then the Marina Bay Sands SkyPark.', a:['2 domes','SkyPark']},
     {t:'Night Safari · departure', d:'Morning at Chinatown and Little India, Night Safari tram before the late departure.', a:['Tram ride','Airport drop']}
   ]}
];

/* ---------- hero film reel ---------- */
const SCENES = [
  {v:'hero-clouds', t:'Above the clouds',  s:'YYZ → LHR · 7h 10m nonstop'},
  {v:'hero-ocean',  t:'Turquoise silence', s:'Bali · Phi Phi · Cancún'},
  {v:'canada-night', t:'Niagara Falls',    s:'Ontario · about 90 minutes from the branch'},
  {v:'hero-alps',   t:'Alpine light',      s:'Swiss Alps Rail Journey · 7 nights'}
];

/* ---------- reviews ---------- */
const REVIEWS = [
  {n:'Priya Raghavan', av:'#9E2B25', r:5, d:'12 Sep 2026', sub:'Dubai Desert & Skyline · 5N', ref:'WF-8841027', help:24,
   t:'Booked for four adults and two kids. The desert safari pickup was 20 minutes late but the operator called ahead, which mattered more than the delay. Burj Khalifa slots were pre-booked so we skipped a 40-minute queue. The Abu Dhabi day is long - leave it out if you have young children.'},
  {n:'Marcus Vieira', av:'#123A6B', r:5, d:'04 Sep 2026', sub:'YYZ → LHR · Air Canada · Business', ref:'WF-8829514', help:11,
   t:'Fare came back cheaper here than on the airline site for the same booking class, and the seat map was live rather than a static picture. Changed the return date two days out and the reissue fee quoted at checkout matched what was actually charged. That is rarer than it should be.'},
  {n:'Anita Deshmukh', av:'#0F5B4C', r:4, d:'28 Aug 2026', sub:'Kerala Backwaters · 4N', ref:'WF-8801663', help:38,
   t:'Houseboat and the tea estate stay were both better than the photos suggested. Marking it four rather than five only because the Munnar drive was billed as three hours and took closer to five with the roadworks. Support answered on WhatsApp within a few minutes each time.'},
  {n:'Daniel Okonjo', av:'#54307E', r:5, d:'21 Aug 2026', sub:'Thailand Island Hopper · 6N', ref:'WF-8778230', help:16,
   t:'The routing is the selling point - Phuket to Krabi by ferry instead of doubling back through the airport saved most of a day. Maya Bay was crowded by 10am, so take the early boat option if it is offered.'},
  {n:'Reena Kapoor', av:'#B4530B', r:3, d:'15 Aug 2026', sub:'YYZ → CUN · WestJet · Economy', ref:'WF-8752901', help:7,
   t:'The booking itself was quick and the fare breakdown was clear about what the convenience fee covered. Web check-in link arrived late though - about six hours before departure rather than the 48 hours the confirmation promised.',
   reply:'Thank you Reena - the check-in link is triggered by the airline\'s own T-48 push and WestJet released it late on that sector. We have since added a fallback that sends our own reminder at T-36 regardless of the carrier feed.'},
  {n:'Tomás Herrera', av:'#1B3A93', r:5, d:'09 Aug 2026', sub:'Swiss Alps Rail Journey · 7N', ref:'WF-8730118', help:52,
   t:'Glacier Express seat reservations were confirmed six weeks ahead, which is the whole reason to book a package rather than assemble it yourself. Jungfraujoch was clouded in on our slot and the team rebooked it to the following morning at no cost.'}
];

/* ---------- integrations ---------- */
const APIS = [
  {n:'Amadeus Self-Service', k:'Air search · fare rules · PNR create', st:'live', ms:412, up:'99.96%', s:[430,398,441,402,388,455,412,396,421,405,412]},
  {n:'Travelport Galileo',   k:'Air search · ticketing · EMD',        st:'live', ms:688, up:'99.81%', s:[640,702,671,733,688,655,712,690,668,701,688]},
  {n:'TBO Holidays',         k:'Air + hotel · static content',        st:'live', ms:544, up:'99.90%', s:[510,556,532,578,544,521,560,538,549,527,544]},
  {n:'Hotelbeds APItude',    k:'Hotel availability · booking',        st:'degraded', ms:1840, up:'98.42%', s:[620,700,910,1240,1520,1710,1840,1790,1880,1820,1840]},
  {n:'Moneris',              k:'Canadian acquiring · Interac · refunds', st:'live', ms:238, up:'99.99%', s:[244,231,250,228,239,242,233,247,236,241,238]},
  {n:'Stripe',               k:'3D Secure · multi-currency',          st:'live', ms:196, up:'99.99%', s:[188,203,194,210,191,199,186,204,193,200,196]},
  {n:'Zoho CRM',             k:'Lead · deal · contact sync',          st:'live', ms:355, up:'99.87%', s:[340,362,351,370,348,359,344,368,352,361,355]},
  {n:'WhatsApp Business',    k:'Itinerary + boarding pass delivery',  st:'live', ms:280, up:'99.94%', s:[271,288,277,294,283,275,290,279,286,274,280]},
  {n:'Sabre',                k:'Air search - secondary source',       st:'off',  ms:0,   up:'-',      s:[0,0,0,0,0,0,0,0,0,0,0]}
];
const PIPE = [
  {st:'New enquiry', n:48, who:['Website chat - 21','WhatsApp - 14','Phone - 13']},
  {st:'Quote sent', n:31, who:['Auto-quote - 19','Agent-built - 12']},
  {st:'Hold / option', n:12, who:['Air on TTL - 7','Hotel on option - 5']},
  {st:'Booked', n:19, who:['Paid in full - 15','Part payment - 4']},
  {st:'Post-travel', n:26, who:['Review requested - 26','Responded - 11']}
];
const LOGLINES = [
  ['12:04:18','ok','POST /v1/air/search','amadeus · YYZ-LHR · 14 offers · 412 ms'],
  ['12:04:19','ok','POST /v1/air/search','tbo · YYZ-LHR · 9 offers · 544 ms'],
  ['12:04:21','wr','POST /v1/hotel/avail','hotelbeds · retry 1/3 · upstream 1840 ms'],
  ['12:04:23','ok','POST /v1/hotel/avail','hotelbeds · 62 properties · served from cache'],
  ['12:06:02','ok','POST /v1/order/price','amadeus · fare confirmed · no change'],
  ['12:06:44','ok','POST /stripe/payment_intent','pi_3QxN82mK · USD 1,284.00 · created'],
  ['12:07:09','ok','WEBHOOK payment_intent.succeeded','pi_3QxN82mK · Visa · 3DS passed'],
  ['12:07:10','ok','POST /v1/order/create','amadeus · PNR JHK4TQ · TTL 2026-09-19 23:59'],
  ['12:07:12','ok','POST zoho/Deals','deal 4827741 · stage Booked · amount synced'],
  ['12:07:13','ok','POST wa/messages','template itinerary_v3 · delivered'],
  ['12:09:51','er','POST /v1/air/search','sabre · 401 credentials not configured'],
  ['12:11:30','ok','CRON fare-cache-warm','142 routes refreshed · 8.2 s']
];

/* ---------- b2b agent data ---------- */
const MARKUP_RULES = [
  {sup:'Amadeus',  scope:'All international air', type:'pct',  v:6,    comm:'1.2% IATA', active:true},
  {sup:'Direct NDC', scope:'AC / WS transborder', type:'flat', v:15,   comm:'$4.50 seg', active:true},
  {sup:'TBO',      scope:'Gulf sectors (DXB/AUH/DOH)', type:'pct', v:8, comm:'2.0%',   active:true},
  {sup:'Hotelbeds',scope:'All hotel bookings',    type:'pct',  v:12,   comm:'net rate', active:true},
  {sup:'Travelport',scope:'Europe long-haul',     type:'pct',  v:5,    comm:'0.9%',     active:false}
];
const AGENT_BOOKINGS = [
  {ref:'WF-8841027', pax:'R. Tremblay +3', item:'YYZ → LHR · AC 856', dt:'14 Oct', net:845, sell:896, st:'Ticketed', sup:'Amadeus'},
  {ref:'WF-8840912', pax:'S. Okafor +1', item:'Meridian Creek · 4N', dt:'19 Oct', net:670, sell:750, st:'Confirmed', sup:'Hotelbeds'},
  {ref:'WF-8840788', pax:'A. Khan',      item:'YYZ → CUN · WS 2312', dt:'02 Nov', net:294, sell:312, st:'On hold', sup:'Travelport'},
  {ref:'WF-8840651', pax:'D. Fernandes +5', item:'Thailand Island Hopper', dt:'11 Nov', net:2450, sell:2744, st:'Part paid', sup:'TBO'},
  {ref:'WF-8840502', pax:'N. Gupta +2',  item:'JFK → LHR · BA 178',  dt:'28 Nov', net:1820, sell:1929, st:'Ticketed', sup:'Amadeus'}
];

/* ---------- state ---------- */
const state = {
  mode:'b2c', tab:'search', cur:'USD', sub:null,
  trip:{type:'oneway', from:'YYZ', to:'LHR', dep:'2026-10-14', ret:'2026-10-21', adt:1, chd:0, cabin:'Economy'},
  hotelCity:'Dubai',
  results:[], hotels:HOTELS,
  filters:{stops:'any', als:[], sups:[], maxPrice:null, dep:'any', refundOnly:false},
  sort:'best', openCard:null,
  sel:null, addons:{seat:false, bag:false, ins:false, meal:false}, gw:'stripe',
  markup:{type:'pct', v:6},
  booking:null, pkg:null, revFilter:0
};
const RATES = {USD:{sym:'$', r:1, loc:'en-US'}, CAD:{sym:'C$', r:1.37, loc:'en-CA'}};

/* ---------- helpers ---------- */
const el = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function money(v, dp){
  const c = RATES[state.cur];
  return c.sym + (v * c.r).toLocaleString(c.loc, {minimumFractionDigits:dp||0, maximumFractionDigits:dp||0});
}
function hhmm(m){ m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0'); }
function dur(m){ return Math.floor(m/60) + 'h ' + String(m%60).padStart(2,'0') + 'm'; }
function hash(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rngOf(seed){ let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function pick(rnd, arr){ return arr[Math.floor(rnd() * arr.length)]; }
function pad(n, w){ return String(n).padStart(w, '0'); }
function fmtDate(iso){
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {weekday:'short', day:'2-digit', month:'short'});
}
function stars(n, max){
  max = max || 5; let out = '<span class="stars" aria-label="' + n + ' of ' + max + '">';
  for(let i=1;i<=max;i++) out += '<span class="' + (i<=Math.round(n)?'':'off') + '">' + I.star + '</span>';
  return out + '</span>';
}
function toast(msg, kind){
  const t = el('#toast');
  t.innerHTML = '<div class="toast"><span class="dot" style="color:' + (kind==='b2b'?'var(--b2b)':'var(--gold)') + '"></span><span>' + msg + '</span></div>';
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.innerHTML = ''; }, 3800);
}
/* sell = net + markup (agent mode) */
function sell(net){
  if(state.mode !== 'agent') return net;
  return state.markup.type === 'pct' ? Math.round(net * (1 + state.markup.v/100)) : net + state.markup.v;
}
function margin(net){ return sell(net) - net; }
const isAgent = () => state.mode === 'agent';
const priBtn = () => isAgent() ? 'btn-b2b' : 'btn-pri';

/* ---------- fare engine ---------- */
const FARE_FAMILIES = [
  {k:'saver', n:'Saver',    mult:1.00, bag:'Carry-on only',     cabin:'1 × 10 kg cabin', seat:false, meal:false, refund:false, chg:'$95 + fare difference'},
  {k:'flex',  n:'Flex',     mult:1.17, bag:'1 × 23 kg checked', cabin:'1 × 10 kg cabin', seat:true,  meal:true,  refund:true,  chg:'Free before T-24'},
  {k:'prem',  n:'Business', mult:2.84, bag:'2 × 32 kg checked', cabin:'2 × 10 kg cabin', seat:true,  meal:true,  refund:true,  chg:'Free · any time'}
];
function buildOffers(){
  const key = state.trip.from + '-' + state.trip.to;
  const rt = ROUTES[key] || {mins:480, base:640, via:['LHR','CDG','FRA'], als:['AC','BA','UA','LH','AF','DL']};
  const rnd = rngOf(hash(key + state.trip.dep + state.trip.cabin));
  const codes = rt.als || AIRLINES.map(a => a.code);
  const pool = AIRLINES.filter(a => codes.indexOf(a.code) > -1).sort(() => rnd() - 0.5).slice(0, 6);
  const offers = [];
  pool.forEach((al, i) => {
    const nCount = i < 3 ? 1 : 2;
    for(let j = 0; j < nCount; j++){
      const stops = (i === 0 || i === 1) ? 0 : (rnd() < 0.45 ? 0 : 1);
      const depMin = Math.floor(rnd() * 20) * 60 + Math.floor(rnd() * 12) * 5 + 60;
      const layover = stops ? 55 + Math.floor(rnd() * 26) * 10 : 0;
      const mins = rt.mins + (stops ? layover + 45 + Math.floor(rnd() * 60) : 0);
      const tzShift = (AP[state.trip.to] ? AP[state.trip.to].tz : 4) - (AP[state.trip.from] ? AP[state.trip.from].tz : 5.5);
      const arrRaw = depMin + mins + tzShift * 60;
      const timeFactor = depMin < 360 ? 0.90 : depMin > 1200 ? 0.94 : 1.06;
      const net = Math.round((rt.base * al.tier * timeFactor * (stops ? 0.86 : 1.09) * (0.96 + rnd() * 0.12)) / 10) * 10;
      offers.push({
        id: al.code + '-' + i + j,
        al, no: al.code + ' ' + (100 + Math.floor(rnd() * 880)),
        dep: depMin, arr: ((arrRaw % 1440) + 1440) % 1440,
        plus: Math.floor(arrRaw / 1440),
        mins, stops, via: stops ? pick(rnd, rt.via) : null, layover,
        net, sup: al.ndc && rnd() < 0.5 ? 'Direct NDC' : pick(rnd, SUPPLIERS.slice(0, 3)),
        seats: 1 + Math.floor(rnd() * 8),
        craft: pick(rnd, AIRCRAFT),
        rbd: pick(rnd, ['Y','M','B','K','L','Q']),
        onTime: 72 + Math.floor(rnd() * 25)
      });
    }
  });
  offers.forEach(o => {
    o.fares = FARE_FAMILIES.map((f, i) => ({...f, price: Math.round(o.net * f.mult / 10) * 10, best: i === 0}));
  });
  state.results = offers;
  state.filters.maxPrice = null;
}
function paxCount(){ return state.trip.adt + state.trip.chd; }
function routeFrom(to){
  const r = ROUTES[state.trip.from + '-' + to];
  return r ? Math.round(r.base * 0.92 / 5) * 5 : 640;
}
function visibleOffers(){
  const f = state.filters;
  let r = state.results.filter(o => {
    if(f.stops === '0' && o.stops !== 0) return false;
    if(f.stops === '1' && o.stops > 1) return false;
    if(f.als.length && !f.als.includes(o.al.code)) return false;
    if(f.sups.length && !f.sups.includes(o.sup)) return false;
    if(f.maxPrice != null && o.net > f.maxPrice) return false;
    if(f.dep === 'am' && !(o.dep >= 300 && o.dep < 720)) return false;
    if(f.dep === 'pm' && !(o.dep >= 720 && o.dep < 1080)) return false;
    if(f.dep === 'eve' && !(o.dep >= 1080 || o.dep < 300)) return false;
    return true;
  });
  const s = state.sort;
  r.sort((a, b) =>
    s === 'price' ? a.net - b.net :
    s === 'dur'   ? a.mins - b.mins :
    s === 'dep'   ? a.dep - b.dep :
    (a.net / 1000 + a.mins / 60 + a.stops * 3) - (b.net / 1000 + b.mins / 60 + b.stops * 3));
  return r;
}

/* ---------- tabs ---------- */
const TABS = {
  b2c:  [['search','Search'],['packages','Packages'],['reviews','Reviews'],['mobile','Mobile app']],
  agent:[['desk','Agent desk'],['search','Search & book'],['bookings','Bookings'],['markup','Markup rules']],
  ops:  [['dash','Dashboard'],['abook','Bookings'],['cust','Customers'],['aagents','Agents'],
         ['apkg','Packages'],['pay','Payments'],['ops','Integrations'],['settings','Settings']]
};
const SLATE = {search:'Search', flights:'Flights', hotels:'Hotels', checkout:'Checkout', confirm:'Confirmed', packages:'Packages', package:'Itinerary', reviews:'Reviews', mobile:'Mobile app', desk:'Agent desk', bookings:'Bookings', markup:'Markup rules', dash:'Dashboard', abook:'Bookings', cust:'Customers', aagents:'Agents', apkg:'Packages', pay:'Payments', ops:'Integrations', settings:'Settings'};
function renderTabs(){
  const list = TABS[state.mode];
  el('#tabs').innerHTML = list.map(([k, label]) =>
    '<button class="tab" role="tab" data-act="tab" data-tab="' + k + '" aria-selected="' + (state.tab === k) + '">' + label + '</button>'
  ).join('') + '<span class="tabs-ink" aria-hidden="true"></span>';
  document.querySelectorAll('.modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === state.mode));
  const who = el('#who');
  who.textContent = state.mode === 'agent' ? 'HT' : state.mode === 'ops' ? 'AD' : 'ND';
  who.className = 'avatar' + (state.mode === 'agent' ? ' b2b' : state.mode === 'ops' ? ' ops' : '');
  el('#curBtn').textContent = state.cur === 'USD' ? 'USD $' : 'CAD C$';
  el('.modes').classList.toggle('is-agent', isAgent());
  el('.tabs').classList.toggle('is-agent', isAgent());
  document.body.classList.toggle('is-agent-mode', isAgent());
  document.body.dataset.mode = state.mode;
  if(window.Cinema) Cinema.syncInk();
}

/* ---------- shared view chrome ---------- */
function banner(o){
  const media = o.video
    ? `<video muted loop playsinline preload="none" data-src="assets/video/${o.video}.mp4" poster="assets/video/${o.video}.jpg"></video>`
    : `<img ${o.id ? `id="${o.id}" ` : ''}src="${o.img}" alt="" decoding="async">`;
  return `<section class="pbanner${o.short ? ' short' : ''}" data-tone="${o.tone || ''}">
    <div class="pb-media" data-banner-media>${media}</div>
    <div class="pb-scrim"></div>
    ${o.extra || ''}
    <div class="wrap pb-in">
      <span class="kicker">${o.kicker}</span>
      <h1 class="pb-title" data-split>${o.title}</h1>
      ${o.sub ? `<p class="pb-sub" data-fade>${o.sub}</p>` : ''}
      ${o.meta ? `<div class="pb-meta" data-fade>${o.meta}</div>` : ''}
    </div>
    ${o.after || ''}
  </section>`;
}
const tone = () => state.mode === 'agent' ? 'b2b' : state.mode === 'ops' ? 'ops' : '';
const body = inner => `<div class="vbody" data-patch="body"><div class="wrap">${inner}</div></div>`;
function secH(eyebrow, title, p, right){
  return `<div class="sec-h"><div><span class="eyebrow">${eyebrow}</span><h2 data-split>${title}</h2>${p ? `<p>${p}</p>` : ''}</div>${right || ''}</div>`;
}

/* ---------- search (home) ---------- */
function apField(which){
  const code = state.trip[which], a = AP[code];
  return `<div class="field">
    <label for="ap-${which}">${which === 'from' ? 'From' : 'To'}</label>
    <select id="ap-${which}" data-act="trip" data-k="${which}">
      ${Object.keys(AP).map(c => `<option value="${c}"${c === code ? ' selected' : ''}>${AP[c].c} (${c})</option>`).join('')}
    </select>
    <div class="sub">${esc(a.n)}</div>
  </div>`;
}
function searchForm(){
  const stab = state.stab || 'flights';
  const t = state.trip;
  if(stab === 'hotels') return `
    <div class="triptype"><span class="chip src">Hotelbeds · TBO static content · 62 properties in ${esc(state.hotelCity)}</span></div>
    <div class="fields" style="grid-template-columns:1.6fr .9fr .9fr 1fr auto">
      <div class="field"><label for="hc">Destination</label><select id="hc" data-act="trip" data-k="hotelCity">${['Dubai','Singapore','Bangkok','London'].map(c => `<option${c === state.hotelCity ? ' selected' : ''}>${c}</option>`).join('')}</select><div class="sub">City, area or property name</div></div>
      <div class="field"><label for="ci">Check in</label><input id="ci" type="date" value="2026-10-14"><div class="sub">${fmtDate('2026-10-14')}</div></div>
      <div class="field"><label for="co">Check out</label><input id="co" type="date" value="2026-10-18"><div class="sub">4 nights</div></div>
      <div class="field"><label for="ro">Rooms &amp; guests</label><select id="ro"><option>1 room · 2 adults</option><option>2 rooms · 4 adults</option><option>1 room · 2 adults, 1 child</option></select><div class="sub">Age of children at check-in</div></div>
      <button class="btn ${priBtn()} go" data-act="searchHotels" data-magnetic>${I.search}<span>Search</span></button>
    </div>`;
  if(stab === 'packages') return `
    <div class="triptype"><span class="chip src">Contracted packages · in-house operations</span></div>
    <div class="fields" style="grid-template-columns:1.6fr 1fr 1fr 1fr auto">
      <div class="field"><label for="pd">Destination</label><select id="pd"><option>Any destination</option>${PACKAGES.map(p => `<option>${esc(p.dest)}</option>`).join('')}</select><div class="sub">6 packages live</div></div>
      <div class="field"><label for="pm">Month</label><select id="pm"><option>October 2026</option><option>November 2026</option><option>December 2026</option></select><div class="sub">Departure month</div></div>
      <div class="field"><label for="pn">Duration</label><select id="pn"><option>Any</option><option>3-4 nights</option><option>5-6 nights</option><option>7+ nights</option></select><div class="sub">Nights on tour</div></div>
      <div class="field"><label for="pb">Budget per person</label><select id="pb"><option>Any</option><option>Under $500</option><option>$500 - $1,200</option><option>$1,200+</option></select><div class="sub">Excludes visa fees</div></div>
      <button class="btn ${priBtn()} go" data-act="tab" data-tab="packages" data-magnetic>${I.search}<span>Browse</span></button>
    </div>`;
  return `
    <div class="triptype">
      ${[['oneway','One way'],['return','Round trip'],['multi','Multi-city']].map(([v, l]) =>
        `<label class="radio"><input type="radio" name="tt" value="${v}" data-act="triptype"${t.type === v ? ' checked' : ''}>${l}</label>`).join('')}
    </div>
    <div class="fields">
      ${apField('from')}
      <button class="swap" data-act="swap" title="Swap origin and destination" aria-label="Swap origin and destination">${I.swap}</button>
      ${apField('to')}
      <div class="field"><label for="dep">Depart</label><input id="dep" type="date" value="${t.dep}" data-act="trip" data-k="dep"><div class="sub">${fmtDate(t.dep)}</div></div>
      <div class="field"><label for="ret">Return</label><input id="ret" type="date" value="${t.ret}" data-act="trip" data-k="ret"${t.type === 'oneway' ? ' disabled' : ''}><div class="sub">${t.type === 'oneway' ? 'One way' : fmtDate(t.ret)}</div></div>
      <div class="field"><label for="pax">Travellers &amp; cabin</label>
        <select id="pax" data-act="trip" data-k="adt">${[1,2,3,4,5,6].map(n => `<option value="${n}"${t.adt === n ? ' selected' : ''}>${n} adult${n > 1 ? 's' : ''}</option>`).join('')}</select>
        <div class="sub">${esc(t.cabin)} · ${t.chd} child</div>
      </div>
      <button class="btn ${priBtn()} go" data-act="searchFlights" data-magnetic>${I.search}<span>Search</span></button>
    </div>`;
}
function heroCopy(){
  if(state.mode === 'agent') return {
    k:'Horizon Travels · agent desk · net rates unlocked',
    t:'Net fares. <em>Your</em> margin.',
    s:'Every fare below is repriced live against your markup rules before your customer sees it - air, hotel and packages from Amadeus, Travelport, TBO and direct NDC in one booking flow.'};
  if(state.mode === 'ops') return {
    k:'Wayfare Travel · back office booking',
    t:'One engine. <em>Every</em> source.',
    s:'Live air, hotel and package inventory from Amadeus, Travelport, TBO and direct NDC connections - priced, marked up and ticketed through a single booking flow for retail customers and sub-agents alike.'};
  return {
    k:'Wayfare Travel · Brampton, Ontario',
    t:'The world, <em>beautifully</em> booked.',
    s:'Flights, hotels and holiday packages at live fares, with a Brampton travel team behind every booking. Compare airlines in one search, hold your fare for 20 minutes and pay in CAD or USD.'};
}
function heroStats(){
  if(state.mode === 'b2c') return [
    [Object.keys(ROUTES).length, 'Routes from Toronto'],
    [PACKAGES.length, 'Curated packages'],
    [(REVIEWS.reduce((s, r) => s + r.r, 0) / REVIEWS.length).toFixed(1) + '/5', 'Traveller rating', true],
    ['7 days', 'Brampton support', true]];
  return [[4, 'Supply sources'], [3, 'Payment gateways'], ['&lt;900ms', 'Median search', true], ['2-way', 'CRM sync', true]];
}
function routeRows(){
  return DESTS.map((d, i) => {
    const here = d.ap === state.trip.from;
    return `<li><button class="rrow${here ? ' here' : ''}" data-act="dest" data-ap="${d.ap}" data-globe="${d.ap}"${here ? ' tabindex="-1" aria-disabled="true"' : ''}>
      <span class="ri">${pad(i + 1, 2)}</span>
      <span class="rc"><b>${esc(d.c)}</b><small>${state.trip.from} → ${d.ap} · ${esc(d.note)}</small></span>
      <span class="rp">${here ? '<small>You are here</small>' : `<small>from</small>${money(sell(routeFrom(d.ap)))}`}</span>
      <span class="ra" aria-hidden="true">→</span></button></li>`;
  }).join('');
}
function destCap(d){
  const here = d.ap === state.trip.from;
  return `<span class="dc-cap" data-patch="dcap-${d.ap}">
    <span class="dc-route mono">${state.trip.from} → ${d.ap}</span>
    <b class="dc-city">${esc(d.c)}</b>
    <span class="dc-note">${esc(d.note)}</span>
    <span class="dc-price">${here ? 'You are here' : 'from ' + money(sell(routeFrom(d.ap))) + ' →'}</span>
  </span>`;
}
const MARQUEE = [['London','LHR'],['Paris','CDG'],['Tokyo','NRT'],['Dubai','DXB'],['Bali','DPS'],['Zermatt','ZRH'],['Cancún','CUN'],['Singapore','SIN'],['New York','JFK'],['Phuket','HKT'],['Kochi','COK'],['Vancouver','YVR']];

function viewSearch(){
  const stab = state.stab || 'flights';
  const h = heroCopy();
  const pubs = PACKAGES.filter(p => !state.pkgPub || state.pkgPub[p.id] !== false);
  const mq = MARQUEE.map(([c, code]) => `<span class="mq-item">${c}<sup>${code}</sup>${I.starMark}</span>`).join('');
  return `
  <section class="hero" data-hero>
    <div class="hero-reel" data-hero-reel>
      ${SCENES.map((s, i) => `<video class="hero-vid${i === 0 ? ' on' : ''}" data-i="${i}" muted playsinline preload="${i === 0 ? 'auto' : 'none'}" ${i === 0 ? 'src' : 'data-hsrc'}="assets/video/${s.v}.mp4" poster="assets/video/${s.v}.jpg"></video>`).join('')}
    </div>
    <div class="hero-scrim"></div>
    <div class="wrap hero-in">
      <span class="kicker" data-fade>${h.k}</span>
      <h1 class="hero-title" data-split>${h.t}</h1>
      <p class="hero-sub" data-fade>${h.s}</p>
      <div class="hero-cta" data-fade>
        <button class="btn ${priBtn()} btn-lg" data-act="scrollSearch" data-magnetic>Start your journey <span aria-hidden="true">→</span></button>
        <button class="btn btn-ghost btn-lg" data-film-open><span class="play">${I.play}</span>Watch the video</button>
      </div>
    </div>
    <div class="wrap hero-foot">
      <div class="stats" data-fade>
        ${heroStats().map(([v, l, plain]) => `<div><b${plain ? '' : ' data-count'}>${v}</b><span>${l}</span></div>`).join('')}
      </div>
      <div class="scenes" role="group" aria-label="Hero videos">
        ${SCENES.map((s, i) => `<button class="scene${i === 0 ? ' on' : ''}" data-scene="${i}"><span class="sbar"><i></i></span><small>${pad(i + 1, 2)}</small><span>${s.t}</span></button>`).join('')}
      </div>
    </div>
  </section>

  <section class="console-wrap" id="search" aria-label="Search">
    <div class="wrap">
      <div class="console" data-reveal>
        <div class="console-top">
          <div class="seg" role="group" aria-label="Product" data-on="${stab}">
            <span class="seg-ink" aria-hidden="true"></span>
            ${[['flights','Flights',I.plane],['hotels','Hotels',I.bed],['packages','Packages',I.pack]].map(([k, l, ic]) => `<button data-act="stab" data-stab="${k}" aria-pressed="${stab === k}">${ic}<span>${l}</span></button>`).join('')}
          </div>
          <span class="chip src live-src"><i></i>Searching Amadeus · Travelport · TBO · NDC</span>
        </div>
        <div class="sform" data-patch="sform">${searchForm()}</div>
      </div>
    </div>
  </section>

  <section class="marquee" aria-hidden="true"><div class="mq-track" data-marquee>${mq}${mq}</div></section>

  <section class="sec routes">
    <div class="wrap routes-grid">
      <div class="globe-stage" id="globeStage" data-cursor="Drag">
        <span class="globe-ring"></span><span class="globe-ring r2"></span>
        <div class="globe-fallback"></div>
        <canvas id="globe" aria-label="3D globe showing live routes from ${esc(AP[state.trip.from].c)}" role="img"></canvas>
        <div class="globe-labels" id="globeLabels"></div>
        <div class="globe-hud"><span>LIVE ROUTE MAP</span><span>ORIGIN <b data-patch="g-orig">${state.trip.from} · ${esc(AP[state.trip.from].c).toUpperCase()}</b></span><span>DRAG TO ROTATE</span></div>
      </div>
      <div class="routes-copy">
        <span class="eyebrow">Live fares from <span data-patch="orig-city">${esc(AP[state.trip.from].c)}</span></span>
        <h2 class="h-display" data-split>Where people <em>are flying</em></h2>
        <p>Cheapest published fare on each sector, refreshed from the cache every 15 minutes. Tap one to run a live search.</p>
        <ol class="rlist" data-patch="rlist">${routeRows()}</ol>
      </div>
    </div>
  </section>

  <section class="hstrip" data-hstrip>
    <div class="hs-pin">
      <div class="wrap hs-head">
        <div><span class="eyebrow" style="color:var(--gold)">Destinations of the season</span><h2 class="h-display" data-split>Six cities, <em>one tap</em> away.</h2></div>
        <span class="hs-count"><b data-hs-n>01</b>/ ${pad(DESTS.length, 2)}</span>
      </div>
      <div class="hs-track" data-hs-track>
        ${DESTS.map((d, i) => `<button class="dcard" data-act="dest" data-ap="${d.ap}" data-cursor="Fly">
          <span class="dc-media"><img src="${d.img}" alt="${esc(d.c)}" loading="lazy" decoding="async"></span>
          <span class="dc-n">${pad(i + 1, 2)}</span>
          ${destCap(d)}
        </button>`).join('')}
        <div class="dcard dc-end">
          <span class="eyebrow">Any city · any source</span>
          <h3>18 sectors.<br><em>One</em> search.</h3>
          <p class="muted">Amadeus, Travelport, TBO and direct NDC queried in parallel, deduplicated and ranked in under a second.</p>
          <button class="btn ${priBtn()}" data-act="scrollSearch">Plan a route →</button>
        </div>
      </div>
    </div>
  </section>

  <section class="maskfilm" data-maskfilm aria-label="Ocean video interlude">
    <div class="mf-pin">
      <video muted loop playsinline preload="none" data-src="assets/video/waves.mp4" poster="assets/video/waves.jpg"></video>
      <div class="mf-mask" aria-hidden="true"><span>ESCAPE</span></div>
      <div class="mf-scrim" aria-hidden="true"></div>
      <div class="mf-cap wrap">
        <div><span class="kicker">Contracted inventory</span><p>Holidays the agency runs <em>end to end</em>, not resold third-party tours.</p></div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${secH('Holiday packages', 'Travel <em>packages</em>', 'Holidays our Brampton team plans and runs end to end, with flights, hotels and transfers already arranged.',
        `<button class="btn btn-out" data-act="tab" data-tab="packages">All ${PACKAGES.length} packages →</button>`)}
      <div class="pk-grid editorial" data-patch="pkgrid">${pubs.slice(0, 6).map(pkgCard).join('')}</div>
    </div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="wrap">
      ${secH('Travel inspiration', 'Life in <em>motion</em>', 'Every picture below is a trip you can book from this page. Tap one to go straight to it.')}
      <div class="bento">
        <button class="bt bt-a" data-act="pkg" data-id="p1">
          <video muted loop playsinline preload="none" data-src="assets/video/desert.mp4" poster="assets/video/desert.jpg"></video>
          <span class="btc"><small>DUBAI · 5 NIGHTS</small><b>Dunes at golden hour</b><span>Dubai Desert &amp; Skyline · from ${money(sell(459))}</span></span>
        </button>
        <figure class="bt bt-b"><img src="assets/img/ed-balloons.jpg" alt="Hot-air balloons over Cappadocia at sunrise" loading="lazy"><figcaption><small>CAPPADOCIA · DAWN</small><b>Rise before the sun</b></figcaption></figure>
        <button class="bt bt-c" data-act="searchHotels">
          <video muted loop playsinline preload="none" data-src="assets/video/resort.mp4" poster="assets/video/resort.jpg"></video>
          <span class="btc"><small>HOTELS · HOTELBEDS + TBO</small><b>Stays from ${money(sell(54))} a night</b></span>
        </button>
        <figure class="bt bt-d"><img src="assets/img/ed-santorini.jpg" alt="Santorini white houses and blue domes at dusk" loading="lazy"><figcaption><small>AEGEAN</small><b>Blue hour</b></figcaption></figure>
        <button class="bt bt-e" data-act="searchFlights">
          <video muted loop playsinline preload="none" data-src="assets/video/hero-city.mp4" poster="assets/video/hero-city.jpg"></video>
          <span class="btc"><small>FLIGHTS · ${Object.keys(ROUTES).length} SECTORS LIVE</small><b>Night arrivals</b><span>${state.trip.from} → ${state.trip.to} · tap to search</span></span>
        </button>
        <figure class="bt bt-f"><img src="assets/img/ed-maldives.jpg" alt="Overwater villas above a turquoise lagoon" loading="lazy"><figcaption><small>INDIAN OCEAN</small><b>Overwater mornings</b></figcaption></figure>
        <figure class="bt bt-g"><img src="assets/img/ed-moraine.jpg" alt="Turquoise mountain lake in the Canadian Rockies" loading="lazy"><figcaption><small>CANADIAN ROCKIES</small><b>Closer to home</b></figcaption></figure>
        <button class="bt bt-h" data-act="tab" data-tab="mobile">
          <video muted loop playsinline preload="none" data-src="assets/video/traveller.mp4" poster="assets/video/traveller.jpg"></video>
          <span class="btc"><small>WEB · APP · AGENT DESK</small><b>Booked once. <em>Serviced</em> everywhere.</b><span>The same booking API powers the website, the iOS + Android app and the agent desk.</span></span>
        </button>
      </div>
    </div>
  </section>

  <section class="sec branch">
    <div class="wrap branch-grid">
      <div class="branch-copy">
        <span class="eyebrow" style="color:var(--gold)">Your branch</span>
        <h2 data-split>Wayfare Travel, <em>Brampton</em></h2>
        <p>Walk-in counter at the Four Corners, open seven days. Every booking made here - web, app or agent desk - is serviced by the Brampton team.</p>
        <div class="addr">
          <div><b>24 Queen Street East</b><span>Brampton, ON&nbsp; L6V 1A3</span></div>
          <div><b>+1 905 555 0142</b><span>Mon-Sat 9:00-19:00 · Sun 11:00-17:00</span></div>
        </div>
        <div class="row" style="flex-wrap:wrap">
          <span class="chip good">22 min to Pearson T1</span>
          <span class="chip">TICO licence no. goes here</span>
          <span class="chip">English · French · Spanish · Dutch</span>
        </div>
      </div>
      <div class="collage">
        <figure class="bc bc-1"><img src="assets/img/br1.jpg" alt="Rose Theatre, downtown Brampton" loading="lazy" data-parallax><figcaption>ROSE THEATRE · DOWNTOWN BRAMPTON</figcaption></figure>
        <figure class="bc bc-2"><img src="assets/img/br2.jpg" alt="Brampton City Hall" loading="lazy" data-parallax><figcaption>CITY HALL</figcaption></figure>
        <figure class="bc bc-3"><img src="assets/img/br3.jpg" alt="Gage Park, Brampton" loading="lazy" data-parallax><figcaption>GAGE PARK</figcaption></figure>
        <figure class="bc bc-4"><img src="assets/img/br4.jpg" alt="Toronto Pearson Terminal 1 and control tower" loading="lazy" data-parallax><figcaption>PEARSON T1</figcaption></figure>
        <div class="badge-rot" aria-hidden="true">
          <svg viewBox="0 0 128 128"><defs><path id="bcirc" d="M64,64 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"/></defs><text><textPath href="#bcirc" textLength="306" lengthAdjust="spacing">WAYFARE · BRAMPTON · ONTARIO · CANADA ·</textPath></text></svg>
          <b>22<small>MIN TO YYZ</small></b>
        </div>
      </div>
    </div>
    <div class="band-film">
      <video muted loop playsinline preload="none" data-src="assets/video/canada.mp4" poster="assets/video/canada.jpg" data-parallax></video>
      <div class="wrap">
        <span class="kicker">Proudly Canadian</span>
        <h3 data-split>From the Four Corners to <em>anywhere</em>.</h3>
        <p class="muted" style="max-width:46ch">Settlement in CAD, Interac through Moneris, TICO-registered and serviced in four languages from downtown Brampton.</p>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${secH('Verified after travel', 'What travellers <em>said</em>', 'Reviews are tied to a real booking reference and can only be left once the return sector has flown.',
        `<button class="btn btn-out" data-act="tab" data-tab="reviews">All ${REVIEWS.length} reviews →</button>`)}
      <div class="rev-shell">
        <div class="panel glass"><div class="panel-b">${reviewSummary()}</div></div>
        <div class="quotes"><div class="q-track">${quoteCards()}${quoteCards(true)}</div></div>
      </div>
    </div>
  </section>

  <section class="finale">
    <video muted loop playsinline preload="none" data-src="assets/video/hero-ocean.mp4" poster="assets/video/hero-ocean.jpg"></video>
    <div class="wrap finale-in">
      <span class="kicker nolead">Ready when you are</span>
      <h2 class="h-giant" data-split>Your next trip <em>starts here</em>.</h2>
      <p class="lede" style="text-align:center">Search four sources at once, hold the fare for twenty minutes, pay in USD or CAD.</p>
      <div class="cta-row">
        <button class="btn ${priBtn()} btn-lg" data-act="scrollSearch" data-magnetic>Search flights →</button>
        <button class="btn btn-ghost btn-lg" data-act="tab" data-tab="packages">Explore packages</button>
      </div>
    </div>
  </section>`;
}
function quoteCards(dup){
  return REVIEWS.map(r => `<article class="qcard${dup ? ' dup' : ''}"${dup ? ' aria-hidden="true"' : ''}>
    ${stars(r.r)}
    <q>${esc(r.t.length > 210 ? r.t.slice(0, r.t.lastIndexOf(' ', 205)) + '…' : r.t)}</q>
    <div class="qwho"><span class="rv-av" style="background:${r.av}">${r.n.split(' ').map(w => w[0]).join('')}</span><div><b>${esc(r.n)}</b><small>${esc(r.sub)}</small></div></div>
  </article>`).join('');
}

/* ---------- flight results ---------- */
function markupBar(label){
  if(state.mode !== 'agent') return '';
  const m = state.markup;
  return `<div class="mkbar"><div class="panel-b">
      <div><span class="eyebrow" style="color:var(--b2b)">Live markup engine</span>
        <div style="font-size:14px;font-weight:600;margin-top:4px">${label || 'Applied to all ' + visibleOffers().length + ' fares below'}</div></div>
      <div class="pillrow">
        <button class="pill" data-act="mkType" data-t="pct" aria-pressed="${m.type === 'pct'}">Percentage</button>
        <button class="pill" data-act="mkType" data-t="flat" aria-pressed="${m.type === 'flat'}">Flat fee</button>
      </div>
      <div class="grow" style="min-width:200px">
        <input type="range" min="0" max="${m.type === 'pct' ? 25 : 250}" step="${m.type === 'pct' ? 0.5 : 5}" value="${m.v}" data-act="mkVal" aria-label="Markup value">
        <div class="between" style="font-size:11px;color:var(--text-3);margin-top:2px"><span>0</span><span>${m.type === 'pct' ? '25%' : money(250)}</span></div>
      </div>
      <div style="text-align:right"><span class="eyebrow">Your markup</span>
        <div id="mkOut" class="mk-out">${m.type === 'pct' ? m.v + '%' : money(m.v)}</div></div>
    </div></div>`;
}
function filterRail(){
  const f = state.filters;
  const alCounts = {}; state.results.forEach(o => alCounts[o.al.code] = (alCounts[o.al.code] || 0) + 1);
  const lo = Math.min(...state.results.map(o => o.net)), hi = Math.max(...state.results.map(o => o.net));
  const cur = f.maxPrice == null ? hi : f.maxPrice;
  return `<aside class="panel rail">
    <div class="panel-h"><h3>Filters</h3><button class="btn btn-sm btn-out" data-act="clearF">Clear</button></div>
    <div class="fgrp"><span class="eyebrow">Stops</span><div class="pillrow">
      ${[['any','Any'],['0','Non-stop'],['1','1 stop']].map(([v, l]) => `<button class="pill" data-act="fStops" data-v="${v}" aria-pressed="${f.stops === v}">${l}</button>`).join('')}
    </div></div>
    <div class="fgrp"><span class="eyebrow">Departure window</span><div class="pillrow">
      ${[['any','Any'],['am','05-12'],['pm','12-18'],['eve','18-05']].map(([v, l]) => `<button class="pill" data-act="fDep" data-v="${v}" aria-pressed="${f.dep === v}">${l}</button>`).join('')}
    </div></div>
    <div class="fgrp"><span class="eyebrow">Max fare · <span id="fpOut" style="color:var(--gold-2)">${money(cur)}</span></span>
      <input type="range" min="${lo}" max="${hi}" step="100" value="${cur}" data-act="fPrice" aria-label="Maximum fare">
      <div class="between" style="font-size:11px;color:var(--text-3)"><span>${money(lo)}</span><span>${money(hi)}</span></div>
    </div>
    <div class="fgrp"><span class="eyebrow">Airline</span><div>
      ${Object.keys(alCounts).map(c => {
        const al = AIRLINES.find(a => a.code === c);
        return `<label class="check"><input type="checkbox" data-act="fAl" data-v="${c}"${f.als.includes(c) ? ' checked' : ''}><span>${esc(al.name)}</span><span class="c">${alCounts[c]}</span></label>`;
      }).join('')}
    </div></div>
    <div class="fgrp"><span class="eyebrow">Supply source</span><div>
      ${SUPPLIERS.map(s => {
        const n = state.results.filter(o => o.sup === s).length;
        return n ? `<label class="check"><input type="checkbox" data-act="fSup" data-v="${s}"${f.sups.includes(s) ? ' checked' : ''}><span>${s}</span><span class="c">${n}</span></label>` : '';
      }).join('')}
    </div></div>
  </aside>`;
}
function routeLine(o){
  return `<div class="route">
    <div class="tpoint"><b>${hhmm(o.dep)}</b><span>${state.trip.from}</span></div>
    <div class="line"><div class="dur">${dur(o.mins)}</div><div class="bar">${o.stops ? '<span class="stop"></span>' : ''}<span class="plane">${I.planeFill}</span></div>
      <div class="stops${o.stops ? '' : ' ns'}">${o.stops ? o.via + ' · ' + dur(o.layover) + ' layover' : 'Non-stop'}</div></div>
    <div class="tpoint r"><b>${hhmm(o.arr)}${o.plus ? '<sup>+' + o.plus + '</sup>' : ''}</b><span>${state.trip.to}</span></div>
  </div>`;
}
function offerCard(o){
  const open = state.openCard === o.id;
  const price = sell(o.net);
  return `<article class="fcard${open ? ' open' : ''}">
    <div class="fcard-main">
      <div class="al"><span class="al-mark" style="background:${o.al.bg}">${o.al.code}</span>
        <span class="grow"><span class="al-name">${esc(o.al.name)}</span><span class="al-no mono">${o.no} · ${o.rbd} · ${esc(o.craft)}</span></span></div>
      ${routeLine(o)}
      <div class="fprice">
        <div><div class="amt">${money(price)}</div>
          <div class="per">per adult${isAgent() ? ' · net ' + money(o.net) : ''}</div>
          ${isAgent() ? `<div class="per" style="color:var(--b2b);font-weight:600">You earn ${money(margin(o.net) * paxCount())}</div>` : ''}</div>
        <button class="btn ${priBtn()} btn-sm" data-act="openFares" data-id="${o.id}">${open ? 'Hide fares' : 'View fares'}</button>
      </div>
    </div>
    <div class="fmeta">
      <span class="chip src">${o.sup}</span>
      <span class="chip good">${o.onTime}% on time</span>
      ${o.seats <= 4 ? `<span class="chip warn">Only ${o.seats} left at this fare</span>` : ''}
      ${o.al.ndc ? '<span class="chip acc">NDC direct</span>' : ''}
    </div>
    <div class="fexp">
      <div class="between" style="margin-bottom:14px"><span class="eyebrow">Fare families · ${state.trip.cabin}</span><span class="chip src">Priced live · held 20 min</span></div>
      <div class="fares">${o.fares.map(f => `
        <div class="fare${f.best ? ' best' : ''}">
          <div class="fare-h"><b>${f.n}</b><span class="p">${money(sell(f.price))}</span></div>
          <ul>
            <li class="y">${I.check}${f.bag}</li>
            <li class="y">${I.check}${f.cabin}</li>
            <li class="${f.seat ? 'y' : 'n'}">${f.seat ? I.check : I.x}Seat selection</li>
            <li class="${f.meal ? 'y' : 'n'}">${f.meal ? I.check : I.x}Meal included</li>
            <li class="${f.refund ? 'y' : 'n'}">${f.refund ? I.check : I.x}${f.refund ? 'Refundable' : 'Non-refundable'}</li>
            <li class="${f.refund ? 'y' : 'n'}">${f.refund ? I.check : I.x}Change: ${f.chg}</li>
          </ul>
          <button class="btn ${priBtn()} btn-sm" style="width:100%" data-act="selFare" data-id="${o.id}" data-f="${f.k}">Select ${f.n}</button>
        </div>`).join('')}</div>
    </div>
  </article>`;
}
function routeArc(){
  return `<svg class="pb-route" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path class="base" d="M640 300 Q 900 -10 1160 170"/>
    <path class="live" d="M640 300 Q 900 -10 1160 170" data-draw/>
    <g class="plane" data-plane><path d="M0-7 L3 2 L10 6 L10 8 L3 6 L2 11 L4 13 L4 14 L0 13 L-4 14 L-4 13 L-2 11 L-3 6 L-10 8 L-10 6 L-3 2 Z"/></g>
  </svg>`;
}
function viewFlights(){
  const list = visibleOffers();
  const t = state.trip;
  return banner({
    video:'takeoff', kicker:'Step 1 of 3 · live fares from 4 sources',
    title:`${esc(AP[t.from].c)} <em>→</em> ${esc(AP[t.to].c)}`,
    extra: routeArc(),
    meta:`<div><span class="eyebrow">Route</span><b class="mono">${t.from} → ${t.to}</b></div>
      <div><span class="eyebrow">Departure</span><b>${fmtDate(t.dep)}</b></div>
      <div><span class="eyebrow">Travellers</span><b>${t.adt} adult${t.adt > 1 ? 's' : ''} · ${esc(t.cabin)}</b></div>
      <div><span class="eyebrow">Offers</span><b>${state.results.length} returned · 842 ms</b></div>
      <button class="btn btn-ghost btn-sm" data-act="tab" data-tab="search">Modify search</button>`
  }) + body(`
    ${markupBar()}
    <div class="split">
      ${filterRail()}
      <div>
        <div class="sortbar"><span class="eyebrow">Sort</span>
          ${[['best','Best value'],['price','Cheapest'],['dur','Fastest'],['dep','Earliest']].map(([v, l]) => `<button class="pill" data-act="sort" data-v="${v}" aria-pressed="${state.sort === v}">${l}</button>`).join('')}
          <span class="dim" style="margin-left:auto;font-size:12px">${list.length} of ${state.results.length} offers</span></div>
        ${list.length ? `<div class="stack" data-stagger>${list.map(offerCard).join('')}</div>`
          : `<div class="panel"><div class="empty"><b>No fares match those filters.</b><p style="margin-top:6px">Widen the fare ceiling or clear the airline filter to see all ${state.results.length} offers.</p><button class="btn btn-out btn-sm" style="margin-top:14px" data-act="clearF">Clear filters</button></div></div>`}
      </div>
    </div>`);
}

/* ---------- hotels ---------- */
function viewHotels(){
  return banner({
    video:'resort', kicker:'Hotelbeds · TBO · deduplicated on property ID',
    title:`Stays in <em>${esc(state.hotelCity)}</em>`,
    sub:'Net rates from two suppliers, deduplicated on property ID so the same hotel never appears twice at different prices.',
    meta:`<div><span class="eyebrow">Check in</span><b>${fmtDate('2026-10-14')}</b></div><div><span class="eyebrow">Nights</span><b>4 · 1 room, 2 adults</b></div><div><span class="eyebrow">Properties</span><b>62 found · ${HOTELS.length} shown</b></div><button class="btn btn-ghost btn-sm" data-act="tab" data-tab="search">Modify search</button>`
  }) + body(`
    ${markupBar('Applied to all ' + HOTELS.length + ' room rates below')}
    <div class="stack" data-stagger>${HOTELS.map(h => `
      <article class="fcard hcard"><div class="fcard-main">
        <div class="hgal">
          <div class="plate" style="--p1:${h.p[0]};--p3:${h.p[2]}">
            <img src="${h.img}" alt="${esc(h.area)}, ${esc(h.city)}" loading="lazy" decoding="async">
            <span class="scrim"></span><span class="code">${esc(h.area).toUpperCase()}</span></div>
          <div class="plate" style="--p1:${h.p[1]};--p3:${h.p[2]}">
            <img src="${h.img2}" alt="Inside ${esc(h.n)}" loading="lazy" decoding="async"></div>
          <div class="plate" style="--p1:${h.p[2]};--p3:${h.p[0]}">
            <img src="${h.img}" alt="" loading="lazy" decoding="async" style="object-position:80% 50%;transform:scale(1.6)"></div>
        </div>
        <div style="padding:8px 0">
          <div class="row" style="flex-wrap:wrap;gap:12px">${stars(h.star)}<span class="chip src">${h.sup}</span></div>
          <h3 class="hname" style="margin-top:10px">${esc(h.n)}</h3>
          <p class="muted" style="font-size:13px;margin-top:4px">${esc(h.area)} · ${esc(h.city)}</p>
          <div class="row" style="margin-top:12px;flex-wrap:wrap">
            <span class="chip good"><b>${h.score}</b> ${h.score >= 9 ? 'Exceptional' : 'Very good'}</span>
            <span class="dim" style="font-size:12px">${h.rev.toLocaleString('en-IN')} verified reviews</span></div>
          <div style="margin-top:14px;font-size:13.5px"><b>${esc(h.room)}</b><div class="muted" style="font-size:12.5px">${esc(h.board)}</div></div>
          <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:6px">
            ${h.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}
            <span class="chip ${h.free ? 'good' : 'bad'}">${h.free ? 'Free cancellation to 48h' : 'Non-refundable'}</span></div>
        </div>
        <div class="fprice"><div>
          <span class="eyebrow">Per night</span>
          <div class="amt" style="margin-top:6px">${money(sell(h.rate))}</div><div class="per">excl. taxes</div>
          <div class="per">${money(sell(h.rate) * 4)} for 4 nights</div>
          ${isAgent() ? `<div class="per" style="color:var(--b2b);font-weight:600">You earn ${money(margin(h.rate) * 4)}</div>` : ''}</div>
          <button class="btn ${priBtn()} btn-sm" data-act="selHotel" data-id="${h.id}">Select room →</button></div>
      </div></article>`).join('')}</div>`);
}

/* ---------- quote ---------- */
const ADDONS = [
  {k:'seat', n:'Seat selection',        d:'Pick your seat now instead of at check-in', p:34},
  {k:'bag',  n:'Second checked bag',    d:'Cheaper pre-paid than at the airport desk', p:58},
  {k:'ins',  n:'Trip protection',       d:'Cancellation, delay and medical cover',     p:79},
  {k:'meal', n:'Pre-booked meal',       d:'Hot meal on board, dietary options',        p:26}
];
function quote(){
  const s = state.sel;
  if(!s) return null;
  const pax = paxCount();
  const lines = [];
  let base, label;
  if(s.kind === 'air'){
    base = s.fare.price * pax;
    label = `${s.fare.n} fare × ${pax} traveller${pax > 1 ? 's' : ''}`;
  } else {
    base = s.hotel.rate * s.nights;
    label = `Room rate × ${s.nights} nights`;
  }
  lines.push([label, base]);
  const air = s.kind === 'air';
  const yq = air ? Math.round(base * 0.18) : 0;
  if(yq) lines.push(['Carrier surcharges (YQ/YR)', yq]);
  const govt = air ? Math.round((base + yq) * 0.09) : Math.round(base * 0.14);
  lines.push([air ? 'Government taxes (GST/HST, transportation)' : 'Lodging tax + municipal levy (14%)', govt]);
  const atsc = air ? 20 * pax : 0;
  if(atsc) lines.push(['Air Travellers Security Charge', atsc]);
  const aif = air ? 35 * pax : 0;
  if(aif) lines.push(['Airport improvement fee', aif]);
  let addon = 0;
  ADDONS.forEach(a => {
    if(state.addons[a.k]){
      const amt = a.k === 'ins' ? a.p * pax : a.p;
      addon += amt; lines.push([a.n, amt]);
    }
  });
  const conv = 15;
  lines.push(['Booking fee', conv]);
  const net = base + yq + govt + atsc + aif + addon + conv;
  const mk = state.mode === 'agent' ? (state.markup.type === 'pct' ? Math.round((base + yq) * state.markup.v / 100) : state.markup.v) : 0;
  return {lines, net, mk, total: net + mk};
}

/* ---------- checkout ---------- */
const GATEWAYS = [
  {k:'stripe',   n:'Stripe',   d:'Cards · Apple Pay · Google Pay', fee:'2.9% + $0.30'},
  {k:'moneris',  n:'Moneris',  d:'Canadian acquiring · Interac',   fee:'2.4% + $0.25'},
  {k:'paypal',   n:'PayPal',   d:'Express checkout · buyer cover', fee:'3.4% + $0.30'},
  {k:'wallet',   n:'Agent wallet', d:'Credit line · instant ticketing', fee:'No gateway fee', b2b:true}
];
function steps(n){
  const s = ['Choose','Review & pay','Ticketed'];
  return `<div class="steps">${s.map((l, i) => `${i ? '<span class="step-line"></span>' : ''}<span class="step${i + 1 < n ? ' done' : i + 1 === n ? ' on' : ''}"><i>${i + 1 < n ? '✓' : i + 1}</i>${l}</span>`).join('')}</div>`;
}
function viewCheckout(){
  const s = state.sel, q = quote();
  if(!s) return banner({img:'assets/img/ed-passport.jpg', short:true, kicker:'Checkout', title:'Nothing <em>selected</em> yet'}) +
    body(`<div class="panel"><div class="empty"><b>Pick a fare or a room first.</b><p style="margin-top:12px"><button class="btn btn-out btn-sm" data-act="tab" data-tab="search">Start a search</button></p></div></div>`);
  const gws = GATEWAYS.filter(g => !g.b2b || isAgent());
  const head = s.kind === 'air'
    ? `<div class="row" style="flex-wrap:wrap;gap:14px">
         <span class="al-mark" style="background:${s.offer.al.bg}">${s.offer.al.code}</span>
         <div class="grow"><b style="font-size:15px">${esc(s.offer.al.name)} ${s.offer.no}</b>
           <div class="muted" style="font-size:12.5px">${AP[state.trip.from].c} ${hhmm(s.offer.dep)} → ${AP[state.trip.to].c} ${hhmm(s.offer.arr)} · ${dur(s.offer.mins)} · ${s.offer.stops ? '1 stop ' + s.offer.via : 'Non-stop'}</div></div>
         <span class="chip acc">${s.fare.n}</span><span class="chip src">${s.offer.sup}</span></div>
       <div style="margin-top:18px">${routeLine(s.offer)}</div>`
    : `<div class="row" style="flex-wrap:wrap;gap:14px"><img src="${s.hotel.img}" alt="" style="width:120px;height:80px;object-fit:cover;border-radius:12px"><div class="grow"><b style="font-family:var(--serif);font-size:24px;font-weight:500">${esc(s.hotel.n)}</b>
         <div class="muted" style="font-size:12.5px">${esc(s.hotel.room)} · ${s.nights} nights · ${esc(s.hotel.board)}</div></div>
         <span class="chip src">${s.hotel.sup}</span></div>`;
  return banner({
    img:'assets/img/ed-passport.jpg', short:true,
    kicker:`Step 2 of 3 · fare held for <span class="hold" data-countdown="1182">19:42</span>`,
    title:'Review <em>and pay</em>',
    meta:`<button class="btn btn-ghost btn-sm" data-act="back">← Back to results</button>`
  }) + body(`
    ${steps(2)}
    <div class="co">
      <div class="stack">
        <div class="panel"><div class="panel-b">${head}</div></div>
        <div class="panel"><div class="panel-h"><h3>Traveller 1 · Adult</h3><span class="chip">Must match passport</span></div>
          <div class="panel-b stack">
            <div class="frow">
              <label class="inp"><span>Title</span><select><option>Mr</option><option>Ms</option><option>Mrs</option><option>Dr</option></select></label>
              <label class="inp"><span>Given name</span><input value="Navdeep" autocomplete="given-name"></label>
              <label class="inp"><span>Surname</span><input value="Singh" autocomplete="family-name"></label>
            </div>
            <div class="frow">
              <label class="inp"><span>Date of birth</span><input type="date" value="1991-04-22"></label>
              <label class="inp"><span>Nationality</span><select><option>Canada</option><option>United States</option><option>United Kingdom</option><option>France</option></select></label>
              <label class="inp"><span>Passport number</span><input value="Z4471882" class="mono"></label>
              <label class="inp"><span>Passport expiry</span><input type="date" value="2031-08-14"></label>
            </div>
            <div class="frow">
              <label class="inp"><span>Email for e-ticket</span><input type="email" value="navdeep.singh@example.com"></label>
              <label class="inp"><span>Mobile · WhatsApp</span><input value="+1 905 555 0142" class="mono"></label>
              <label class="inp"><span>Frequent flyer</span><input placeholder="Optional" class="mono"></label>
            </div>
            <div class="securebar">${I.shield}<span>Passport details are tokenised before they reach the GDS. Nothing sensitive is stored in the booking record.</span></div>
          </div></div>
        <div class="panel"><div class="panel-h"><h3>Add-ons</h3><span class="chip">Priced per booking unless marked</span></div>
          <div class="panel-b"><div class="frow">${ADDONS.map(a => `
            <label class="addon${state.addons[a.k] ? ' on' : ''}"><input type="checkbox" data-act="addon" data-k="${a.k}"${state.addons[a.k] ? ' checked' : ''}>
              <span class="grow"><b>${a.n}</b><small>${a.d}</small></span>
              <b class="num">${money(a.k === 'ins' ? a.p * paxCount() : a.p)}</b></label>`).join('')}</div></div></div>
        <div class="panel"><div class="panel-h"><h3>Payment</h3><span class="chip warn">Test mode · no live charge</span></div>
          <div class="panel-b stack">
            <div class="gw">${gws.map(g => `<button class="gwo" data-act="gw" data-k="${g.k}" aria-pressed="${state.gw === g.k}"><b>${g.n}</b><small>${g.d}</small><small style="color:var(--text-3)">${g.fee}</small></button>`).join('')}</div>
            ${state.gw === 'wallet' ? `<div class="wallet">
                <div class="between"><span style="font-weight:600">Wallet balance</span><b class="num" style="color:var(--b2b);font-family:var(--serif);font-size:24px;font-weight:500">${money(62500)}</b></div>
                <div class="between" style="margin-top:6px;font-size:12.5px"><span class="muted">Credit line used</span><span class="num muted">${money(38000)} of ${money(95000)}</span></div>
                <div class="meter"><i style="width:39%"></i></div>
                <p class="muted" style="font-size:12px;margin-top:9px">Ticketing is instant against wallet. Settlement runs on a 7-day cycle.</p></div>`
              : `<div class="frow">
                  <label class="inp" style="grid-column:span 2"><span>Card number (test card)</span><input id="payCard" value="4111 1111 1111 1111" class="mono" readonly aria-readonly="true"></label>
                  <label class="inp"><span>Expiry</span><input id="payExp" value="04 / 29" class="mono" readonly aria-readonly="true"></label>
                  <label class="inp"><span>CVV</span><input id="payCvv" value="•••" class="mono" readonly aria-readonly="true"></label>
                </div>
                <p class="dim" style="font-size:11.5px">Sample checkout: these fields are locked to the gateway sandbox test card, and nothing is charged or sent. The redirect below simulates a 3D Secure challenge and returns a signed webhook.</p>`}
            <label class="check" style="font-size:12.5px"><input type="checkbox" checked><span>I accept the fare rules, baggage policy and cancellation terms shown above.</span></label>
          </div></div>
      </div>
      <aside class="panel rail"><div class="panel-h"><h3>Fare breakdown</h3><span class="chip src">${state.cur}</span></div>
        <div class="panel-b">
          <div class="kv">
            ${q.lines.map(([l, v]) => `<div><span>${esc(l)}</span><b>${money(v)}</b></div>`).join('')}
            ${q.mk ? `<div class="cr"><span>Agent markup (${state.markup.type === 'pct' ? state.markup.v + '%' : 'flat'})</span><b>+ ${money(q.mk)}</b></div>` : ''}
            <div class="tot"><span>${isAgent() ? 'Customer pays' : 'Total payable'}</span><b>${money(q.total)}</b></div>
            ${q.mk ? `<div class="cr"><span>Your margin on this booking</span><b>${money(q.mk)}</b></div>` : ''}
          </div>
          <button class="btn ${priBtn()} btn-lg" style="width:100%;margin-top:16px" data-act="pay" data-magnetic>
            ${state.gw === 'wallet' ? 'Ticket against wallet' : 'Pay ' + money(q.total)}</button>
          <div class="securebar" style="margin-top:12px">${I.shield}<span>PCI-DSS SAQ-A · card data never touches the platform</span></div>
          <p class="dim" style="font-size:11.5px;margin-top:12px">On capture the platform creates the PNR, issues the e-ticket, pushes the deal to Zoho CRM and sends the itinerary over WhatsApp.</p>
        </div></aside>
    </div>`);
}

/* ---------- confirmation ---------- */
function makePNR(){ const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; let s = ''; for(let i=0;i<6;i++) s += a[Math.floor(Math.random()*a.length)]; return s; }
function barcode(seed){
  const rnd = rngOf(hash(seed));
  let out = '';
  for(let i=0;i<64;i++) out += `<i style="height:${60 + Math.floor(rnd()*40)}%;width:${rnd() < 0.3 ? 3 : 2}px"></i>`;
  return `<div class="barcode" aria-hidden="true">${out}</div>`;
}
function viewConfirm(){
  const b = state.booking;
  if(!b) return banner({video:'hero-clouds', short:true, kicker:'Confirmation', title:'No booking <em>yet</em>'}) +
    body(`<div class="panel"><div class="empty">No booking in this session.</div></div>`);
  const air = b.kind === 'air';
  return banner({
    video:'hero-clouds', kicker: air ? 'Step 3 of 3 · e-ticket issued' : 'Step 3 of 3 · voucher issued',
    title:'You’re <em>booked</em>.',
    sub: air ? `${esc(AP[state.trip.from].c)} to ${esc(AP[state.trip.to].c)} on ${fmtDate(state.trip.dep)} · ${esc(b.o.al.name)} ${b.o.no}` : `${esc(b.h.n)} · ${b.nights} nights`
  }) + `<div class="vbody"><div class="wrap confirm-wrap">
    ${steps(3)}
    <div class="row" style="margin-bottom:18px;flex-wrap:wrap" data-stagger>
      <span class="chip good"><span class="dot"></span>Payment captured</span>
      <span class="chip good"><span class="dot"></span>${air ? 'PNR created' : 'Voucher issued'}</span>
      <span class="chip good"><span class="dot"></span>CRM synced</span>
      <span class="chip good"><span class="dot"></span>WhatsApp sent</span></div>
    <div class="ticket" data-tilt="4">
      <span class="stamp">CONFIRMED</span>
      <div class="ticket-top">
        <div><span class="eyebrow">${air ? 'Airline booking reference' : 'Hotel voucher reference'}</span>
          <div class="pnr">${b.pnr}</div>
          <div class="mono" style="font-size:11.5px;color:var(--text-3);margin-top:4px">Wayfare ref ${b.ref}</div></div>
        ${barcode(b.pnr)}
      </div>
      <div class="perf"></div>
      <div class="panel-b" style="padding:24px 28px">
        ${air ? `<div style="margin-bottom:22px">${routeLine(b.o)}</div>` : `<div style="margin-bottom:20px"><b style="font-size:26px;font-family:var(--serif);font-weight:500">${esc(b.h.n)}</b><div class="muted">${esc(b.h.room)} · ${b.nights} nights · ${esc(b.h.board)}</div></div>`}
        <div class="tbl-wrap"><table><tbody>
          <tr><td class="dim">Passenger</td><td><b>SINGH / NAVDEEP MR</b></td><td class="dim">Ticket number</td><td class="mono">${b.etkt}</td></tr>
          ${air ? `<tr><td class="dim">Flight</td><td><b>${b.o.al.code} ${b.o.no.split(' ')[1]}</b> · ${esc(b.o.craft)}</td><td class="dim">Booking class</td><td class="mono">${b.o.rbd} · ${esc(b.fare.n)}</td></tr>` : ''}
          <tr><td class="dim">Baggage</td><td>${air ? esc(b.fare.bag) + ' · ' + esc(b.fare.cabin) : 'n/a'}</td><td class="dim">Ticketing deadline</td><td class="mono">${b.ttl}</td></tr>
          <tr><td class="dim">Amount paid</td><td><b style="color:var(--gold-2)">${money(b.total)}</b></td><td class="dim">Method</td><td>${esc(b.gw)} · <span class="mono">${b.txn}</span></td></tr>
        </tbody></table></div>
      </div>
      <div class="panel-b" style="border-top:1px solid var(--line);background:var(--field);padding:22px 28px">
        <span class="eyebrow">Integration events fired on capture</span>
        <div class="log" style="margin-top:12px" data-typelog>${[
          ['ok', 'payment.captured', `${b.txn} · ${esc(b.gw)} · signature verified`],
          ['ok', air ? 'order.create' : 'hotel.book', `${b.sup} · ${air ? 'PNR ' + b.pnr : 'voucher ' + b.pnr} · confirmed`],
          ['ok', 'zoho.deal.update', `deal ${4800000 + Math.floor(Math.random()*90000)} · stage Booked`],
          ['ok', 'whatsapp.send', 'template itinerary_v3 · delivered'],
          ['ok', 'email.send', 'e-ticket PDF attached · queued']
        ].map(([k, ev, d]) => `<span class="ln"><span class="t">${b.clock}</span>  <span class="${k}">●</span> <b>${ev}</b>  ${d}</span>`).join('\n')}</div>
      </div>
    </div>
    <div class="row" style="margin-top:22px;flex-wrap:wrap">
      <button class="btn ${priBtn()}" data-act="tab" data-tab="search">Book another trip</button>
      <button class="btn btn-out" data-act="toastOnly" data-msg="E-ticket PDF queued to navdeep.singh@example.com">Email e-ticket</button>
      <button class="btn btn-out" data-act="toastOnly" data-msg="Itinerary re-sent on WhatsApp to +1 905 555 0142">Resend on WhatsApp</button>
      ${isAgent() ? `<button class="btn btn-out" data-act="tab" data-tab="bookings">View in agent desk</button>` : ''}
    </div>
  </div></div>`;
}

/* ---------- packages ---------- */
function pkgCard(p){
  const off = Math.round((1 - p.from / p.was) * 100);
  return `<button class="pcard" data-act="pkg" data-id="${p.id}" data-tilt data-cursor="${p.vid ? 'Play' : 'View'}"${p.vid ? ` data-hover-video="assets/video/${p.vid}.mp4"` : ''}>
    <span class="pc-media">
      <img src="${p.img}" alt="${esc(p.dest)}" loading="lazy" decoding="async">
      ${p.vid ? `<video muted loop playsinline preload="none"></video><span class="pc-play" aria-hidden="true">${I.play}</span>` : ''}
      <span class="pc-scrim"></span>
      <span class="pc-code">${p.code} · ${p.nights}N / ${p.days}D</span>
      <span class="pc-tag">${esc(p.cat)}</span>
    </span>
    <span class="pc-body">
      <span><span class="pc-where">${esc(p.dest)}</span><h3 class="pc-title">${esc(p.n)}</h3></span>
      <span class="pc-rate">${stars(p.rating)}<span>${p.rating} · ${p.revs} reviews</span></span>
      <span class="pc-incl">${p.incl.slice(0, 3).map(i => `<span class="chip">${esc(i)}</span>`).join('')}${p.incl.length > 3 ? `<span class="chip">+${p.incl.length - 3} more</span>` : ''}</span>
      <span class="pc-foot">
        <span><span class="eyebrow">From · per person</span>
          <span class="row" style="gap:0;margin-top:6px;align-items:baseline"><span class="amt">${money(sell(p.from))}</span><s>${money(p.was)}</s></span></span>
        <span class="pc-off">−${off}%</span>
      </span>
    </span>
    <span class="glare" aria-hidden="true"></span>
  </button>`;
}
function viewPackages(){
  const list = PACKAGES.filter(p => (!state.pkgPub || state.pkgPub[p.id] !== false) && (!state.pkgCat || state.pkgCat === 'All' || p.cat === state.pkgCat));
  return banner({
    video:'hero-ocean', kicker:`In-house product · ${PACKAGES.length} live`,
    title:'Travel <em>packages</em>',
    sub:'Each package is a contracted rate the agency controls - flights sourced live at booking time, land arrangements held on allocation.'
  }) + body(`
    <div class="sortbar" style="margin-bottom:22px"><span class="eyebrow">Category</span>
      ${['All','Bestseller','Honeymoon','Family','Premium','Short break'].map(c => `<button class="pill" aria-pressed="${(state.pkgCat || 'All') === c}" data-act="pkgCat" data-v="${c}">${c}</button>`).join('')}
      <span class="dim" style="margin-left:auto;font-size:12px">${list.length} shown</span></div>
    ${markupBar('Applied to all ' + PACKAGES.length + ' package rates below')}
    ${list.length ? `<div class="pk-grid${list.length >= 3 ? ' editorial' : ''}" data-stagger>${list.map(pkgCard).join('')}</div>`
      : `<div class="panel"><div class="empty"><b>No packages in that category.</b></div></div>`}`);
}
function viewPackage(){
  const p = PACKAGES.find(x => x.id === state.pkg);
  if(!p) return viewPackages();
  const pax = 2, total = sell(p.from) * pax;
  return banner({
    img:p.g[0], id:'galMain',
    kicker:`${esc(p.dest)} · ${p.nights} nights / ${p.days} days`,
    title:esc(p.n),
    meta:`<div><span class="eyebrow">Rating</span><b class="row" style="gap:8px">${stars(p.rating)} ${p.rating}</b></div><div><span class="eyebrow">Verified travellers</span><b>${p.revs}</b></div><div><span class="eyebrow">From · per person</span><b style="color:var(--gold-2)">${money(sell(p.from))}</b></div><button class="btn btn-ghost btn-sm" data-act="tab" data-tab="packages">← All packages</button>
      <div class="pb-thumbs">${p.g.map((src, i) => `<button class="gt" data-act="gal" data-src="${src}" aria-pressed="${i === 0}" aria-label="View photo ${i + 1}"><img src="${src}" alt="" decoding="async"></button>`).join('')}</div>`
  }) + body(`
    <div class="pd-grid">
      <div class="stack" style="gap:22px">
        <div>
          <p class="pd-blurb">${esc(p.blurb)}</p>
          <div class="pd-incl">${p.incl.map(i => `<span class="chip good">${I.check}${esc(i)}</span>`).join('')}</div>
        </div>
        <div class="panel"><div class="panel-h"><h3>Day by day</h3><span class="chip src">${p.days} days · ${p.itin.reduce((n, d) => n + d.a.length, 0)} inclusions</span></div>
          <div class="panel-b"><div class="itin" data-itin><span class="itin-line"></span>${p.itin.map((d, i) => `
            <div class="day"><div class="day-n">DAY ${pad(i + 1, 2)}</div>
              <div><h4>${esc(d.t)}</h4><p>${esc(d.d)}</p>
                <div class="acts">${d.a.map(a => `<span class="chip">${esc(a)}</span>`).join('')}</div></div></div>`).join('')}</div></div></div>
        <div class="panel"><div class="panel-h"><h3>Not included</h3></div><div class="panel-b">
          <div class="row" style="flex-wrap:wrap">${['Visa fees','Travel insurance','Personal expenses','Anything not listed above','Peak-date surcharges'].map(x => `<span class="chip">${I.x}${x}</span>`).join('')}</div>
          <p class="dim" style="font-size:12px;margin-top:12px">Cancellation: full refund to 30 days before departure, 50% to 15 days, non-refundable inside 15 days. Land portion is held on allocation and confirmed within 24 hours of booking.</p></div></div>
      </div>
      <aside class="panel rail"><div class="panel-h"><h3>Book this package</h3><span class="chip acc">${esc(p.cat)}</span></div><div class="panel-b">
        <div class="kv">
          <div><span>Per person (twin share)</span><b>${money(sell(p.from))}</b></div>
          <div><span>Travellers</span><b>2 adults</b></div>
          ${isAgent() ? `<div class="cr"><span>Your margin</span><b>${money(margin(p.from) * pax)}</b></div>` : ''}
          <div class="tot"><span>Total</span><b>${money(total)}</b></div>
        </div>
        <label class="inp" style="margin-top:14px"><span>Departure date</span>
          <select><option>14 Oct 2026 · confirmed</option><option>21 Oct 2026 · confirmed</option><option>04 Nov 2026 · on request</option><option>18 Nov 2026 · confirmed</option></select></label>
        <button class="btn ${priBtn()} btn-lg" style="width:100%;margin-top:14px" data-act="toastOnly" data-msg="Package held for 48 hours · enquiry pushed to Zoho CRM as a new deal" data-magnetic>Hold for 48 hours</button>
        <button class="btn btn-out" style="width:100%;margin-top:8px" data-act="toastOnly" data-msg="Quote PDF generated and sent on WhatsApp">Send quote on WhatsApp</button>
        <p class="dim" style="font-size:11.5px;margin-top:12px">Holding creates a CRM deal at the <b>Hold / option</b> stage and schedules a follow-up task for the assigned agent.</p>
      </div></aside>
    </div>`);
}

/* ---------- reviews ---------- */
function reviewStats(){
  const dist = [0, 0, 0, 0, 0];
  REVIEWS.forEach(r => dist[r.r - 1]++);
  const avg = (REVIEWS.reduce((s, r) => s + r.r, 0) / REVIEWS.length);
  return {dist, avg};
}
function reviewSummary(){
  const {dist, avg} = reviewStats();
  return `<div class="rev-top">
    <div class="score"><span class="eyebrow">Average rating</span><b data-count>${avg.toFixed(1)}</b>${stars(avg)}
      <div class="dim" style="font-size:12px">${REVIEWS.length} verified reviews</div></div>
    <div class="bars">${[5,4,3,2,1].map(n => {
      const c = dist[n - 1], pct = Math.round(c / REVIEWS.length * 100);
      return `<div class="b"><span class="muted">${n} star</span><div class="track"><div class="fill" style="width:${pct}%"></div></div><span class="mono dim">${pct}%</span></div>`;
    }).join('')}</div>
    <div class="row" style="flex-wrap:wrap;gap:6px">
      <span class="chip good">${I.shield}Booking-verified only</span>
      <span class="chip">Median response 4h</span>
      <span class="chip">92% answered</span></div>
  </div>`;
}
function viewReviews(){
  const list = state.revFilter ? REVIEWS.filter(r => r.r === state.revFilter) : REVIEWS;
  return banner({
    img:'assets/img/ed-traveller.jpg', kicker:'Post-travel feedback',
    title:'Reviews <em>&amp; ratings</em>',
    sub:'A review can only be submitted against a flown booking reference, and the agency reply is published in the same thread.'
  }) + body(`
    <div class="rev-shell" style="grid-template-columns:360px 1fr;align-items:start">
      <div class="panel glass rail"><div class="panel-b">${reviewSummary()}</div></div>
      <div>
        <div class="sortbar">
          <span class="eyebrow">Filter</span>
          <button class="pill" data-act="revF" data-v="0" aria-pressed="${state.revFilter === 0}">All</button>
          ${[5,4,3].map(n => `<button class="pill" data-act="revF" data-v="${n}" aria-pressed="${state.revFilter === n}">${n} star</button>`).join('')}
          <span class="dim" style="margin-left:auto;font-size:12px">${list.length} shown</span></div>
        <div class="panel"><div class="panel-b" data-stagger>
          ${list.length ? list.map(r => `
            <article class="review">
              <div class="rv-h"><span class="rv-av" style="background:${r.av}">${r.n.split(' ').map(w => w[0]).join('')}</span>
                <div class="grow"><b style="font-size:14px">${esc(r.n)}</b>
                  <div class="dim" style="font-size:11.5px">${esc(r.sub)} · ${r.d}</div></div>
                ${stars(r.r)}</div>
              <p>“${esc(r.t)}”</p>
              <div class="row" style="flex-wrap:wrap;gap:6px"><span class="chip good">${I.shield}Verified · ${r.ref}</span>
                <span class="chip">${r.help} found this helpful</span></div>
              ${r.reply ? `<div class="reply"><div class="row" style="margin-bottom:6px"><span class="chip acc">Wayfare Travel · agency reply</span></div>
                <p style="font-size:13px" class="muted">${esc(r.reply)}</p></div>` : ''}
            </article>`).join('')
          : `<div class="empty">No reviews at that rating yet.</div>`}
        </div></div>
      </div>
    </div>`);
}

/* ---------- agent desk ---------- */
function viewDesk(){
  const gross = AGENT_BOOKINGS.reduce((s, b) => s + b.sell, 0);
  const net = AGENT_BOOKINGS.reduce((s, b) => s + b.net, 0);
  return banner({
    video:'hero-city', short:true, tone:tone(),
    kicker:'Horizon Travels · Brampton, ON · agency ID WF-AG-2214 · tier Gold',
    title:'Agent <em>desk</em>',
    sub:'Wallet, credit line, markup rules and sub-agent activity. Every fare in the search is repriced against these rules before it is shown to your customer.',
    meta:`<button class="btn btn-b2b btn-sm" data-act="tab" data-tab="search">New booking →</button>`
  }) + body(`
    <div class="tiles" data-stagger>
      <div class="tile lead"><span class="eyebrow">Wallet balance</span><b data-count>${money(62500)}</b><small>Available for instant ticketing</small>
        <div class="meter"><i style="width:61%"></i></div></div>
      <div class="tile"><span class="eyebrow">Credit line used</span><b data-count>${money(313800)}</b><small>of ${money(800000)} · settles in 4 days</small>
        <div class="meter"><i style="width:39%;background:var(--warn)"></i></div></div>
      <div class="tile"><span class="eyebrow">Gross sales · Sep</span><b data-count>${money(gross)}</b><small>${AGENT_BOOKINGS.length} bookings this month</small></div>
      <div class="tile"><span class="eyebrow">Margin earned · Sep</span><b style="color:var(--b2b)" data-count>${money(gross - net)}</b><small>${((gross - net) / net * 100).toFixed(1)}% blended margin</small></div>
    </div>
    <div class="split" style="margin-top:18px;grid-template-columns:1fr 340px">
      <div class="panel"><div class="panel-h"><h3>Recent bookings</h3><button class="btn btn-out btn-sm" data-act="tab" data-tab="bookings">Open full ledger</button></div>
        <div class="tbl-wrap"><table>
          <thead><tr><th>Reference</th><th>Customer</th><th>Item</th><th>Travel</th><th class="n">Net</th><th class="n">Sell</th><th class="n">Margin</th><th>Status</th></tr></thead>
          <tbody>${AGENT_BOOKINGS.map(b => `<tr>
            <td class="mono">${b.ref}</td><td>${esc(b.pax)}</td>
            <td><div>${esc(b.item)}</div><span class="chip src" style="margin-top:4px">${b.sup}</span></td>
            <td class="mono">${b.dt}</td>
            <td class="n mono">${money(b.net)}</td><td class="n mono">${money(b.sell)}</td>
            <td class="n mono" style="color:var(--b2b);font-weight:600">${money(b.sell - b.net)}</td>
            <td><span class="chip ${b.st === 'Ticketed' || b.st === 'Confirmed' ? 'good' : b.st === 'On hold' ? 'warn' : ''}">${b.st}</span></td>
          </tr>`).join('')}</tbody>
        </table></div></div>
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>Sub-agents</h3><span class="chip b2b">4 active</span></div><div class="panel-b stack" style="gap:12px">
          ${[['Coastline Holidays','Mississauga',10400,'12%'],['Meridian Tours','Caledon',6400,'9%'],['Skyway Travel Desk','Vaughan',3700,'10%'],['Nomad Corporate','Milton',14900,'6%']].map(([n, c, v, m]) => `
            <div class="between" style="font-size:13px"><div><b>${n}</b><div class="dim" style="font-size:11.5px">${c} · override ${m}</div></div>
              <b class="num">${money(v)}</b></div>`).join('')}
        </div></div>
        <div class="panel"><div class="panel-h"><h3>Needs attention</h3></div><div class="panel-b stack" style="gap:14px">
          <div class="attn"><span class="chip warn">TTL</span><div><b>WF-8840788 ticketing deadline</b><div class="dim">Expires in 6h 12m · WS 2312 · A. Khan</div></div></div>
          <div class="attn"><span class="chip bad">Payment</span><div><b>WF-8840651 part payment</b><div class="dim">${money(1225)} outstanding · due 22 Sep</div></div></div>
          <div class="attn"><span class="chip">Docs</span><div><b>2 passports expiring inside 6 months</b><div class="dim">Blocks UAE entry · notify customer</div></div></div>
        </div></div>
      </div>
    </div>`);
}
function viewBookings(){
  return banner({
    video:'hero-city', short:true, tone:tone(), kicker:'Ledger', title:'<em>Bookings</em>',
    sub:'Net, sell and margin on every transaction, reconciled against supplier invoices and gateway settlements.',
    meta:`<button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Ledger exported to CSV · 5 rows">Export CSV</button>
      <button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Settlement report queued for 22 Sep cycle" style="margin-left:0">Settlement report</button>`
  }) + body(`
    <div class="panel"><div class="tbl-wrap"><table>
      <thead><tr><th>Reference</th><th>Customer</th><th>Item</th><th>Supplier</th><th>Travel</th><th class="n">Net</th><th class="n">Sell</th><th class="n">Margin</th><th class="n">Margin %</th><th>Status</th></tr></thead>
      <tbody>${AGENT_BOOKINGS.map(b => `<tr>
        <td class="mono">${b.ref}</td><td>${esc(b.pax)}</td><td>${esc(b.item)}</td><td><span class="chip src">${b.sup}</span></td>
        <td class="mono">${b.dt}</td><td class="n mono">${money(b.net)}</td><td class="n mono">${money(b.sell)}</td>
        <td class="n mono" style="color:var(--b2b);font-weight:600">${money(b.sell - b.net)}</td>
        <td class="n mono">${((b.sell - b.net) / b.net * 100).toFixed(1)}%</td>
        <td><span class="chip ${b.st === 'Ticketed' || b.st === 'Confirmed' ? 'good' : b.st === 'On hold' ? 'warn' : ''}">${b.st}</span></td>
      </tr>`).join('')}</tbody>
    </table></div></div>`);
}
function viewMarkup(){
  return banner({
    video:'hero-city', short:true, tone:tone(), kicker:'Pricing engine', title:'Markup <em>rules</em>',
    sub:'Rules are evaluated top down at search time. The first matching rule wins, so order the narrow ones above the catch-alls.',
    meta:`<button class="btn btn-b2b btn-sm" data-act="toastOnly" data-msg="Rule builder opens here in the production build">Add rule</button>`
  }) + body(`
    ${markupBar('Session override · the rules below apply when this is left at default')}
    <div class="panel"><div class="tbl-wrap"><table>
      <thead><tr><th>#</th><th>Supply source</th><th>Applies to</th><th>Markup</th><th>Commission</th><th>Status</th><th></th></tr></thead>
      <tbody>${MARKUP_RULES.map((r, i) => `<tr>
        <td class="mono dim">${pad(i + 1, 2)}</td><td><span class="chip src">${r.sup}</span></td><td>${esc(r.scope)}</td>
        <td class="mono"><b>${r.type === 'pct' ? r.v + '%' : money(r.v)}</b></td>
        <td class="mono dim">${esc(r.comm)}</td>
        <td><span class="chip ${r.active ? 'good' : ''}">${r.active ? 'Active' : 'Paused'}</span></td>
        <td class="n"><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Rule ${pad(i + 1, 2)} editor · ${esc(r.sup)}">Edit</button></td>
      </tr>`).join('')}</tbody>
    </table></div></div>
    <p class="dim" style="font-size:12px;margin-top:14px">Sub-agent overrides stack on top of these rules and are capped at the tier ceiling (Gold: 15%). Fare-family level rules can override the sector rule for premium cabins.</p>`);
}

/* ---------- operations ---------- */
function spark(vals, color){
  const max = Math.max(...vals, 1), min = Math.min(...vals);
  const w = 92, h = 22, pad = 2;
  const pts = vals.map((v, i) => {
    const x = pad + i * (w - pad * 2) / (vals.length - 1);
    const y = h - pad - (max === min ? h / 2 : ((v - min) / (max - min)) * (h - pad * 2));
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${pts[pts.length - 1][0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h} Z`;
  const last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${w} ${h + 4}" style="color:${color}" aria-hidden="true">
    <path d="${area}" fill="currentColor" opacity=".13"/>
    <path class="ln" d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.2" fill="currentColor"/>
  </svg>`;
}
function viewOps(){
  const live = APIS.filter(a => a.st === 'live').length;
  const tot = PIPE.reduce((s, p) => s + p.n, 0);
  return banner({
    img:'assets/img/ed-airport.jpg', short:true, tone:tone(),
    kicker:'Integration layer · last 60 minutes', title:'Connected <em>services</em>',
    sub:'Every outbound call runs through one adapter interface, so a supplier can be added, throttled or failed over without touching the booking flow.',
    meta:`<button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Health check re-run across 9 adapters">Re-run health check</button>`
  }) + body(`
    <div class="tiles" style="margin-bottom:18px" data-stagger>
      <div class="tile"><span class="eyebrow">Adapters live</span><b data-count>${live} / ${APIS.length}</b><small>1 degraded · 1 not configured</small></div>
      <div class="tile"><span class="eyebrow">Searches today</span><b data-count>18,402</b><small>Cache hit rate 61%</small></div>
      <div class="tile"><span class="eyebrow">Look-to-book</span><b data-count>212:1</b><small>87 bookings created today</small></div>
      <div class="tile"><span class="eyebrow">Failed webhooks</span><b style="color:var(--warn)" data-count>3</b><small>All retried and cleared</small></div>
    </div>
    <div class="panel"><div class="panel-h"><h3>Adapter status</h3><span class="chip src">p95 response time</span></div>
      ${APIS.map(a => `<div class="api">
        <div class="api-n"><b>${esc(a.n)}</b><small>${esc(a.k)}</small></div>
        ${a.st === 'off' ? '<span class="spark"></span>' : spark(a.s, a.st === 'degraded' ? '#EDBC5B' : '#6BD9A3')}
        <div style="text-align:right;min-width:118px">
          <span class="chip ${a.st === 'live' ? 'good' : a.st === 'degraded' ? 'warn' : ''}"><span class="dot"></span>${a.st === 'live' ? 'Live' : a.st === 'degraded' ? 'Degraded' : 'Not configured'}</span>
          <div class="mono dim" style="font-size:11px;margin-top:4px">${a.ms ? a.ms + ' ms · ' + a.up : 'credentials pending'}</div></div>
      </div>`).join('')}</div>
    <p class="dim" style="font-size:12px;margin-top:14px">Hotelbeds is degraded - the adapter has tripped its circuit breaker and is serving cached availability with a 15-minute TTL. Bookings still confirm against live rates before payment is taken.</p>

    <div style="margin-top:70px">
    ${secH('Zoho CRM · two-way sync every 90 seconds', 'Customer <em>pipeline</em>', 'Enquiries from the website, WhatsApp and phone land as CRM leads with source attribution. Booking events move the deal stage automatically.',
      `<button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Sync triggered · 136 records reconciled with Zoho">Force sync</button>`)}
    <div class="panel"><div class="panel-h"><h3>This week · ${tot} records</h3><span class="chip good"><span class="dot"></span>Last sync 41s ago</span></div>
      <div class="panel-b"><div class="pipe" data-stagger>${PIPE.map((p, i) => `
        <div class="stage"><span class="eyebrow">${i + 1}. ${esc(p.st)}</span><b data-count>${p.n}</b>
          <div class="who">${p.who.map(w => `<span><span class="dot"></span>${esc(w)}</span>`).join('')}</div></div>`).join('')}</div>
        <div class="row" style="margin-top:16px;flex-wrap:wrap">
          <span class="chip">Enquiry → quote median 22 min</span>
          <span class="chip">Quote → booking conversion 24%</span>
          <span class="chip good">Auto-quote covers 61% of enquiries</span></div>
      </div></div>
    <div class="split" style="margin-top:18px;grid-template-columns:1fr 1fr">
      <div class="panel"><div class="panel-h"><h3>Field mapping</h3><span class="chip src">Wayfare → Zoho</span></div>
        <div class="tbl-wrap"><table><thead><tr><th>Platform field</th><th>CRM field</th><th>Direction</th></tr></thead><tbody>
          ${[['booking.reference','Deal_Name','→'],['traveller.email','Contact.Email','↔'],['booking.total','Amount','→'],['booking.status','Stage','→'],['enquiry.source','Lead_Source','→'],['agent.id','Owner','↔'],['crm.note','booking.note','←']].map(([a, b, d]) =>
            `<tr><td class="mono">${a}</td><td class="mono">${b}</td><td class="mono" style="color:var(--gold)">${d}</td></tr>`).join('')}
        </tbody></table></div></div>
      <div class="panel"><div class="panel-h"><h3>Automations</h3></div><div class="panel-b stack" style="gap:14px">
        ${[['Abandoned checkout','Fare held but unpaid after 30 min → WhatsApp nudge + CRM task','Active'],
           ['Post-travel review','48h after return sector flies → review request email','Active'],
           ['Passport expiry','Travel inside 6 months of expiry → block + agent alert','Active'],
           ['Repeat traveller','3rd booking → move to Loyalty segment, 5% voucher','Active'],
           ['Price drop watch','Watched route drops 8% → notify lead','Paused']].map(([n, d, s]) => `
          <div class="between" style="align-items:flex-start;gap:12px"><div><b style="font-size:13px">${n}</b><div class="dim" style="font-size:11.5px;max-width:42ch">${d}</div></div>
            <span class="chip ${s === 'Active' ? 'good' : ''}">${s}</span></div>`).join('')}
      </div></div>
    </div>
    </div>

    <div style="margin-top:70px">
    ${secH('Structured event stream', 'Event <em>log</em>', 'Every supplier call, payment webhook and CRM push is logged with a correlation ID so a single booking can be traced end to end.',
      `<div class="row"><span class="chip good"><span class="dot"></span>Streaming</span>
      <button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Log filtered to correlation ID cid_8841027">Trace a booking</button></div>`)}
    <div class="panel"><div class="panel-b">
      <div class="log" data-typelog>${LOGLINES.map(([t, k, ev, d]) =>
        `<span class="ln"><span class="t">${t}</span>  <span class="${k}">${k === 'ok' ? '●' : k === 'wr' ? '▲' : '✕'}</span>  <b>${ev}</b>  ${d}</span>`).join('\n')}</div>
      <div class="row" style="margin-top:14px;flex-wrap:wrap">
        <span class="chip good">10 succeeded</span><span class="chip warn">1 retried</span><span class="chip bad">1 failed</span>
        <span class="chip src">retention 90 days</span></div>
    </div></div>
    </div>`);
}

/* ---------- mobile app ---------- */
function phoneTabs(active){
  const items = [['Search', I.search], ['Trips', I.ticket], ['Saved', I.heart], ['Account', I.user]];
  return `<div class="ptab">${items.map(([l, ic], i) => `<div class="${i === active ? 'on' : ''}">${ic}<span>${l}</span></div>`).join('')}</div>`;
}
function phone(cap, active, bodyHtml){
  return `<div class="phone-w"><div class="phone" data-phone><div class="screen"><div class="notch"></div>
    <div class="statusbar"><span>09:41</span><span>5G ▮▮▮ 86%</span></div>
    <div class="pbody">${bodyHtml}</div>${phoneTabs(active)}</div></div>
    <div class="phone-cap">${cap}</div></div>`;
}
function viewMobile(){
  const screenSearch = `
    <div style="position:relative;height:120px;flex:none;margin:-14px -14px 0;overflow:hidden"><img src="assets/img/dest-london.jpg" alt="" style="width:100%;height:100%;object-fit:cover"><span style="position:absolute;inset:0;background:linear-gradient(180deg,transparent,var(--bg))"></span>
      <div style="position:absolute;left:14px;bottom:8px"><div class="eyebrow" style="color:var(--gold)">Good morning, Navdeep</div><h3 style="font-size:24px;margin-top:2px">Where to <em>next?</em></h3></div></div>
    <div class="panel"><div class="panel-b" style="padding:11px;display:flex;flex-direction:column;gap:8px">
      <div class="row" style="gap:6px"><span class="chip acc">Flights</span><span class="chip">Hotels</span><span class="chip">Packages</span></div>
      <div class="field" style="padding:6px 9px"><label>From</label><div style="font-weight:600;font-size:14px">Toronto (YYZ)</div></div>
      <div class="field" style="padding:6px 9px"><label>To</label><div style="font-weight:600;font-size:14px">London (LHR)</div></div>
      <div class="row" style="gap:6px"><div class="field grow" style="padding:6px 9px"><label>Depart</label><div style="font-weight:600;font-size:13px">Tue 14 Oct</div></div>
        <div class="field grow" style="padding:6px 9px"><label>Pax</label><div style="font-weight:600;font-size:13px">1 adult</div></div></div>
      <button class="btn btn-pri btn-sm" style="width:100%">Search 4 sources</button>
    </div></div>
    <div><span class="eyebrow">Price alerts</span>
      <div class="panel" style="margin-top:6px"><div class="panel-b" style="padding:10px">
        <div class="between"><div><b style="font-size:12.5px">YYZ → CUN</b><div class="dim" style="font-size:10.5px">Watching since 2 Sep</div></div>
          <span class="chip good">↓ 11%</span></div></div></div></div>`;
  const screenResults = `
    <div class="between"><div><b style="font-size:13px">YYZ → LHR</b><div class="dim" style="font-size:10.5px">Tue 14 Oct · 1 adult</div></div><span class="chip">Filter</span></div>
    ${state.results.slice(0, 3).map(f => `
      <div class="panel"><div class="panel-b" style="padding:11px">
        <div class="row" style="margin-bottom:8px"><span class="al-mark" style="background:${f.al.bg};width:24px;height:24px;font-size:9px;border-radius:7px">${f.al.code}</span>
          <span style="font-size:11.5px;font-weight:600" class="grow">${esc(f.al.name)}</span><span class="chip src" style="font-size:9px;padding:2px 6px">${f.sup}</span></div>
        <div class="route" style="gap:8px">
          <div class="tpoint"><b style="font-size:17px">${hhmm(f.dep)}</b><span style="font-size:9px">YYZ</span></div>
          <div class="line"><div class="dur" style="font-size:9.5px">${dur(f.mins)}</div><div class="bar">${f.stops ? '<span class="stop"></span>' : ''}</div>
            <div class="stops${f.stops ? '' : ' ns'}" style="font-size:8.5px">${f.stops ? f.via : 'Non-stop'}</div></div>
          <div class="tpoint r"><b style="font-size:17px">${hhmm(f.arr)}</b><span style="font-size:9px">LHR</span></div></div>
        <div class="between" style="margin-top:9px;border-top:1px solid var(--line);padding-top:8px">
          <span class="dim" style="font-size:10px">${f.seats <= 4 ? f.seats + ' seats left' : 'Saver fare'}</span>
          <b style="font-family:var(--serif);font-size:18px;font-weight:500;color:var(--gold-2)">${money(f.net)}</b></div>
      </div></div>`).join('')}`;
  const screenPass = `
    <div><span class="eyebrow">Boarding pass</span><h3 style="font-size:20px">Toronto <em>→</em> London</h3></div>
    <div class="ticket" style="box-shadow:none">
      <div class="ticket-top" style="padding:13px;flex-direction:row"><div><span class="eyebrow">PNR</span>
        <div class="pnr" style="font-size:20px">JHK4TQ</div></div>
        <div style="text-align:right"><span class="eyebrow">Gate</span><div style="font-family:var(--serif);font-size:22px;font-weight:500">A12</div></div></div>
      <div class="perf" style="height:14px"></div>
      <div style="padding:13px">
        <div class="route" style="gap:8px;margin-bottom:11px">
          <div class="tpoint"><b style="font-size:18px">21:20</b><span style="font-size:9px">YYZ T1</span></div>
          <div class="line"><div class="dur" style="font-size:9.5px">7h 10m</div><div class="bar"></div><div class="stops ns" style="font-size:8.5px">AC 856</div></div>
          <div class="tpoint r"><b style="font-size:18px">09:30<sup>+1</sup></b><span style="font-size:9px">LHR T2</span></div></div>
        <div class="between" style="font-size:11px"><div><div class="dim" style="font-size:9px">SEAT</div><b class="mono">14A</b></div>
          <div><div class="dim" style="font-size:9px">ZONE</div><b class="mono">2</b></div>
          <div><div class="dim" style="font-size:9px">BOARDS</div><b class="mono">03:45</b></div>
          <div><div class="dim" style="font-size:9px">BAG</div><b class="mono">23 kg</b></div></div>
        <div style="margin-top:11px">${barcode('JHK4TQ')}</div>
      </div></div>
    <div class="row" style="gap:6px"><span class="chip good">Added to Wallet</span><span class="chip">Offline ready</span></div>`;
  return banner({
    img:'assets/img/ed-window.jpg', kicker:'React Native · one codebase, iOS + Android',
    title:'The <em>app</em>',
    sub:'The app runs against the same booking API as the website, so fares, markup rules and CRM events stay identical across channels. Boarding passes are cached for offline access and pushed to Apple Wallet and Google Wallet.'
  }) + body(`
    <div class="app-hero"><span class="app-glow"></span>
      <div class="phones" data-phones>
        ${phone('Search · 4 sources', 0, screenSearch)}
        ${phone('Results · live fares', 0, screenResults)}
        ${phone('Trips · offline pass', 1, screenPass)}
      </div>
      <div class="row" style="justify-content:center;flex-wrap:wrap;margin-top:28px;gap:8px">
        <span class="chip">Push price alerts</span><span class="chip">Biometric login</span><span class="chip">Offline boarding pass</span>
        <span class="chip">Apple / Google Wallet</span><span class="chip">In-app Apple Pay</span><span class="chip">Deep-link from WhatsApp</span></div>
    </div>`);
}

/* ---------- admin panel data ---------- */
const MONTHS = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
const REVENUE = [84200,96500,132400,71800,68900,88300,102600,118400,141200,168900,152300,127800];
const CHANNELS = [
  {n:'Website',            v:412800, b:284},
  {n:'Mobile app',         v:268400, b:196},
  {n:'Agent desk · B2B',   v:486200, b:171},
  {n:'Walk-in · Brampton', v:186900, b:98}
];
const ADMIN_BOOKINGS = [
  {ref:'WF-8841027', cust:'Navdeep Singh',   item:'YYZ → LHR · AC 856',      dep:'14 Oct', ch:'Website',   gross:896,  st:'Ticketed',  pay:'Paid'},
  {ref:'WF-8841002', cust:'M. Oyelaran',     item:'Dubai Desert & Skyline',  dep:'19 Oct', ch:'Agent desk',gross:1836, st:'Confirmed', pay:'Paid'},
  {ref:'WF-8840974', cust:'L. Bertrand',     item:'YYZ → CDG · AF 349',      dep:'22 Oct', ch:'Mobile app',gross:742,  st:'Ticketed',  pay:'Paid'},
  {ref:'WF-8840912', cust:'S. Okafor +1',    item:'Meridian Creek · 4N',     dep:'19 Oct', ch:'Agent desk',gross:750,  st:'Confirmed', pay:'Paid'},
  {ref:'WF-8840889', cust:'R. Dhaliwal +3',  item:'Thailand Island Hopper',  dep:'11 Nov', ch:'Walk-in',   gross:1636, st:'On hold',   pay:'Part paid'},
  {ref:'WF-8840851', cust:'J. Whitfield',    item:'YYZ → JFK · AC 712',      dep:'03 Nov', ch:'Website',   gross:264,  st:'Ticketed',  pay:'Paid'},
  {ref:'WF-8840788', cust:'A. Khan',         item:'YYZ → CUN · WS 2312',     dep:'02 Nov', ch:'Agent desk',gross:312,  st:'On hold',   pay:'Unpaid'},
  {ref:'WF-8840742', cust:'P. Nakamura',     item:'YVR → NRT · AC 003',      dep:'08 Nov', ch:'Mobile app',gross:918,  st:'Ticketed',  pay:'Paid'},
  {ref:'WF-8840698', cust:'C. Mensah +2',    item:'Singapore City Break',    dep:'27 Nov', ch:'Website',   gross:975,  st:'Confirmed', pay:'Paid'},
  {ref:'WF-8840651', cust:'D. Fernandes +5', item:'Swiss Alps Rail Journey', dep:'04 Dec', ch:'Agent desk',gross:8745, st:'Part paid', pay:'Part paid'},
  {ref:'WF-8840604', cust:'H. Aluko',        item:'YYZ → LHR · BA 100',      dep:'12 Dec', ch:'Website',   gross:688,  st:'Cancelled', pay:'Refunded'},
  {ref:'WF-8840502', cust:'N. Gupta +2',     item:'JFK → LHR · BA 178',      dep:'28 Nov', ch:'Mobile app',gross:1929, st:'Ticketed',  pay:'Paid'}
];
const CUSTOMERS = [
  {n:'Navdeep Singh',  em:'navdeep.singh@example.com', city:'Brampton',    trips:6, ltv:8420, last:'14 Oct 2026', seg:'Loyalty'},
  {n:'D. Fernandes',   em:'d.fernandes@example.com',   city:'Mississauga', trips:4, ltv:14260,last:'04 Dec 2026', seg:'High value'},
  {n:'M. Oyelaran',    em:'m.oyelaran@example.com',    city:'Brampton',    trips:3, ltv:5180, last:'19 Oct 2026', seg:'Loyalty'},
  {n:'L. Bertrand',    em:'l.bertrand@example.com',    city:'Caledon',     trips:2, ltv:2140, last:'22 Oct 2026', seg:'Returning'},
  {n:'A. Khan',        em:'a.khan@example.com',        city:'Brampton',    trips:1, ltv:312,  last:'02 Nov 2026', seg:'New'},
  {n:'C. Mensah',      em:'c.mensah@example.com',      city:'Vaughan',     trips:2, ltv:1890, last:'27 Nov 2026', seg:'Returning'},
  {n:'P. Nakamura',    em:'p.nakamura@example.com',    city:'Milton',      trips:5, ltv:9640, last:'08 Nov 2026', seg:'High value'}
];
const SUBAGENTS = [
  {n:'Coastline Holidays',  city:'Mississauga', ytd:10400, mk:'12%', credit:12000, used:4200,  st:'Active'},
  {n:'Meridian Tours',      city:'Caledon',     ytd:6400,  mk:'9%',  credit:8000,  used:1150,  st:'Active'},
  {n:'Skyway Travel Desk',  city:'Vaughan',     ytd:3700,  mk:'10%', credit:5000,  used:4850,  st:'Near limit'},
  {n:'Nomad Corporate',     city:'Milton',      ytd:14900, mk:'6%',  credit:25000, used:9300,  st:'Active'},
  {n:'Peel Journeys',       city:'Brampton',    ytd:0,     mk:'-',   credit:0,     used:0,     st:'Pending approval'}
];
const REFUNDS = [
  {ref:'WF-8840604', cust:'H. Aluko',    amt:688, reason:'Carrier cancelled BA 100', gw:'Stripe',  age:'2 d', st:'Awaiting approval'},
  {ref:'WF-8840318', cust:'T. Grewal',   amt:214, reason:'Customer cancel · Flex fare', gw:'Moneris', age:'4 d', st:'Awaiting approval'},
  {ref:'WF-8840107', cust:'S. Bianchi',  amt:1120,reason:'Hotel overbooked · supplier', gw:'Stripe',  age:'6 d', st:'Approved · processing'}
];
const SETTLE = [
  {gw:'Stripe',  gross:284600, fee:8254, net:276346, date:'22 Sep', st:'Scheduled'},
  {gw:'Moneris', gross:196400, fee:4713, net:191687, date:'22 Sep', st:'Scheduled'},
  {gw:'PayPal',  gross:41800,  fee:1421, net:40379,  date:'19 Sep', st:'Settled'},
  {gw:'Agent wallet', gross:486200, fee:0, net:486200, date:'25 Sep', st:'On cycle'}
];
const PERMS = ['Dashboard','Bookings','Refunds','Customers','Agents','Packages','Payments','Settings'];
const ROLES = {
  'Owner':    [1,1,1,1,1,1,1,1],
  'Manager':  [1,1,1,1,1,1,1,0],
  'Counter staff':[1,1,0,1,0,0,0,0],
  'Accounts': [1,1,1,0,0,0,1,0],
  'Support':  [1,1,0,1,0,0,0,0]
};
const STAFF = [
  {n:'Amrita Kaur',   role:'Owner',        em:'amrita@wayfare.example',  last:'2 min ago'},
  {n:'Jason Mehta',   role:'Manager',      em:'jason@wayfare.example',   last:'18 min ago'},
  {n:'Fatima Noor',   role:'Counter staff',em:'fatima@wayfare.example',  last:'1 h ago'},
  {n:'Greg Lalonde',  role:'Accounts',     em:'greg@wayfare.example',    last:'Yesterday'},
  {n:'Priya Raman',   role:'Support',      em:'priya@wayfare.example',   last:'3 d ago'}
];

/* chart helpers */
function shortMoney(v){
  const c = RATES[state.cur], n = v * c.r;
  return c.sym + (n >= 1000 ? Math.round(n/1000) + 'k' : Math.round(n));
}
function barChart(vals, labels){
  const W = 760, H = 230, padL = 50, padR = 6, padT = 22, padB = 26;
  const peak = Math.max(...vals);
  const max = Math.ceil(peak / 25000) * 25000 || 1;
  const iw = W - padL - padR, ih = H - padT - padB;
  const slot = iw / vals.length, bw = Math.max(6, slot - 12);
  const hi = vals.indexOf(peak);
  let out = `<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13365F"/><stop offset="1" stop-color="#3E6FA8" stop-opacity=".55"/></linearGradient></defs>`;
  for(let i = 0; i <= 4; i++){
    const y = padT + ih - (ih * i / 4);
    out += `<line class="gl" x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}"/>`
         + `<text class="ax" x="${padL - 8}" y="${(y + 3.4).toFixed(1)}" text-anchor="end">${shortMoney(max * i / 4)}</text>`;
  }
  vals.forEach((v, i) => {
    const h = ih * v / max;
    const x = padL + i * slot + (slot - bw) / 2;
    const y = padT + ih - h;
    const r = Math.min(5, bw / 2, h);
    const d = `M${x.toFixed(1)},${(y + r).toFixed(1)} q0,${-r} ${r},${-r} h${(bw - 2 * r).toFixed(1)} q${r},0 ${r},${r} v${(h - r).toFixed(1)} h${(-bw).toFixed(1)} z`;
    out += `<g class="cbar"><title>${labels[i]} · ${money(v)}</title>`
         + `<path d="${d}"/>`
         + `<text class="vl${i === hi ? ' on' : ''}" x="${(x + bw / 2).toFixed(1)}" y="${(y - 7).toFixed(1)}" text-anchor="middle">${shortMoney(v)}</text></g>`
         + `<text class="ax" x="${(x + bw / 2).toFixed(1)}" y="${H - 7}" text-anchor="middle">${labels[i]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gross bookings by month, last 12 months. Peak ${labels[hi]} at ${money(peak)}.">${out}</svg>`;
}
const opsBanner = (o) => banner(Object.assign({img:'assets/img/ed-airport.jpg', short:true, tone:'ops'}, o));

/* dashboard */
function viewDash(){
  const gross = CHANNELS.reduce((s, c) => s + c.v, 0);
  const bookings = CHANNELS.reduce((s, c) => s + c.b, 0);
  const cmax = Math.max(...CHANNELS.map(c => c.v));
  return opsBanner({
    kicker:'Wayfare Travel · Brampton, ON · fiscal year to date', title:'<em>Dashboard</em>',
    sub:'Everything the front desk and the owner look at each morning - sales, what needs a decision today, and where the money came from.',
    meta:`<button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Report exported · 12 months, all channels">Export report</button>`
  }) + body(`
    <div class="tiles" data-stagger>
      <div class="tile"><span class="eyebrow">Gross bookings</span><b data-count>${money(gross)}</b><small>${bookings} bookings · 12 months</small></div>
      <div class="tile lead"><span class="eyebrow">Net margin</span><b style="color:var(--b2b)" data-count>${money(Math.round(gross * 0.114))}</b><small>11.4% blended</small></div>
      <div class="tile"><span class="eyebrow">Average booking</span><b data-count>${money(Math.round(gross / bookings))}</b><small>Up 8% year on year</small></div>
      <div class="tile"><span class="eyebrow">Refund rate</span><b data-count>2.1%</b><small>${REFUNDS.length} awaiting a decision</small></div>
    </div>
    <div class="split" style="margin-top:18px;grid-template-columns:1fr 360px">
      <div class="panel"><div class="panel-h"><h3>Gross bookings by month</h3><span class="chip src">${state.cur} · hover a bar</span></div>
        <div class="panel-b"><div class="chart-wrap">${barChart(REVENUE, MONTHS)}</div>
          <p class="dim" style="font-size:11.5px;margin-top:10px">July peaks on summer long-haul; January is the post-holiday trough. Both are normal for a GTA retail agency.</p></div></div>
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>Needs a decision</h3><span class="chip warn">${REFUNDS.length + 2}</span></div><div class="panel-b stack" style="gap:14px">
          <div class="attn"><span class="chip bad">Refund</span><div><b>${REFUNDS.length} refunds awaiting approval</b><div class="dim">Oldest is 6 days · ${money(REFUNDS.reduce((s, r) => s + r.amt, 0))} total</div></div></div>
          <div class="attn"><span class="chip warn">Agent</span><div><b>Peel Journeys awaiting approval</b><div class="dim">Sub-agent application · submitted 2 days ago</div></div></div>
          <div class="attn"><span class="chip warn">Credit</span><div><b>Skyway Travel Desk near limit</b><div class="dim">${money(4850)} of ${money(5000)} used</div></div></div>
        </div></div>
        <div class="panel"><div class="panel-h"><h3>Where it came from</h3></div><div class="panel-b">
          <div class="chan">${CHANNELS.map(c => `
            <div class="crow"><span class="cn">${esc(c.n)}</span>
              <div class="ct"><i style="width:${Math.round(c.v / cmax * 100)}%"></i></div>
              <b class="num">${money(c.v)}</b><span class="cb num">${c.b}</span></div>`).join('')}</div>
          <div class="between" style="margin-top:12px;font-size:11px"><span class="dim">Revenue</span><span class="dim">Bookings</span></div>
        </div></div>
      </div>
    </div>`);
}

/* bookings */
function viewABook(){
  const f = state.abFilter || 'All';
  const list = f === 'All' ? ADMIN_BOOKINGS : ADMIN_BOOKINGS.filter(b => b.st === f);
  const states = ['All','Ticketed','Confirmed','On hold','Part paid','Cancelled'];
  return opsBanner({
    kicker:'Back office', title:'All <em>bookings</em>',
    sub:'Every booking across web, app, agent desk and walk-in, in one ledger. Staff actions are permission-gated - only Owner, Manager and Accounts can issue a refund.',
    meta:`<button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Ledger exported · ${ADMIN_BOOKINGS.length} rows to CSV">Export</button>
      <button class="btn btn-pri btn-sm" data-act="tab" data-tab="search" style="margin-left:0">New booking</button>`
  }) + body(`
    <div class="sortbar"><span class="eyebrow">Status</span>
      ${states.map(v => `<button class="pill" data-act="abF" data-v="${v}" aria-pressed="${f === v}">${v}</button>`).join('')}
      <span class="dim" style="margin-left:auto;font-size:12px">${list.length} of ${ADMIN_BOOKINGS.length}</span></div>
    <div class="panel" style="margin-top:12px"><div class="tbl-wrap"><table>
      <thead><tr><th>Reference</th><th>Customer</th><th>Item</th><th>Departs</th><th>Channel</th><th class="n">Gross</th><th>Status</th><th>Payment</th><th></th></tr></thead>
      <tbody>${list.length ? list.map(b => `<tr>
        <td class="mono">${b.ref}</td><td>${esc(b.cust)}</td><td>${esc(b.item)}</td><td class="mono">${b.dep}</td>
        <td><span class="chip">${b.ch}</span></td><td class="n mono">${money(b.gross)}</td>
        <td><span class="chip ${b.st === 'Ticketed' || b.st === 'Confirmed' ? 'good' : b.st === 'Cancelled' ? 'bad' : 'warn'}">${b.st}</span></td>
        <td><span class="chip ${b.pay === 'Paid' ? 'good' : b.pay === 'Refunded' ? '' : 'warn'}">${b.pay}</span></td>
        <td class="n"><div class="row" style="gap:5px;justify-content:flex-end">
          <button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Opening ${b.ref} · ${esc(b.cust)}">View</button>
          ${b.st !== 'Cancelled' ? `<button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Refund of ${money(b.gross)} queued for approval · ${b.ref}">Refund</button>` : ''}
        </div></td></tr>`).join('') : '<tr><td colspan="9"><div class="empty">No bookings at that status.</div></td></tr>'}</tbody>
    </table></div></div>`);
}

/* customers */
function viewCust(){
  const ltv = CUSTOMERS.reduce((s, c) => s + c.ltv, 0);
  return opsBanner({
    kicker:'Synced both ways with Zoho CRM', title:'<em>Customers</em>',
    sub:'One record per traveller, merged on email across every channel. Segments drive the marketing automations on the CRM tab.',
    meta:`<button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Segment pushed to Zoho · 7 contacts">Push segment to CRM</button>`
  }) + body(`
    <div class="tiles" style="margin-bottom:16px" data-stagger>
      <div class="tile"><span class="eyebrow">Customers</span><b data-count>${CUSTOMERS.length}</b><small>2 new this month</small></div>
      <div class="tile"><span class="eyebrow">Lifetime value</span><b data-count>${money(ltv)}</b><small>${money(Math.round(ltv / CUSTOMERS.length))} average</small></div>
      <div class="tile"><span class="eyebrow">Repeat rate</span><b data-count>71%</b><small>2 or more trips booked</small></div>
      <div class="tile lead"><span class="eyebrow">Brampton customers</span><b data-count>${CUSTOMERS.filter(c => c.city === 'Brampton').length}</b><small>Home catchment</small></div>
    </div>
    <div class="panel"><div class="tbl-wrap"><table>
      <thead><tr><th>Customer</th><th>Email</th><th>City</th><th class="n">Trips</th><th class="n">Lifetime value</th><th>Last travel</th><th>Segment</th><th></th></tr></thead>
      <tbody>${CUSTOMERS.map(c => `<tr>
        <td><div class="row" style="gap:10px"><span class="rv-av" style="width:30px;height:30px;font-size:10.5px;background:hsl(${hash(c.n) % 360} 45% 32%)">${c.n.split(/[ .]+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2)}</span><b>${esc(c.n)}</b></div></td><td class="mono dim">${esc(c.em)}</td><td>${esc(c.city)}</td>
        <td class="n mono">${c.trips}</td><td class="n mono">${money(c.ltv)}</td><td class="mono">${c.last}</td>
        <td><span class="chip ${c.seg === 'High value' ? 'b2b' : c.seg === 'Loyalty' ? 'acc' : ''}">${c.seg}</span></td>
        <td class="n"><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Opening CRM record for ${esc(c.n)}">Open</button></td>
      </tr>`).join('')}</tbody>
    </table></div></div>`);
}

/* agents */
function viewAAgents(){
  return opsBanner({
    kicker:'B2B network', title:'Sub-<em>agents</em>',
    sub:'Approve applications, set credit limits and commission overrides. A sub-agent books at your net rate plus their own markup, capped by their tier.',
    meta:`<button class="btn btn-b2b btn-sm" data-act="toastOnly" data-msg="Invitation sent · onboarding link valid 7 days">Invite agent</button>`
  }) + body(`
    <div class="panel"><div class="tbl-wrap"><table>
      <thead><tr><th>Agency</th><th>City</th><th class="n">Sales YTD</th><th>Override</th><th class="n">Credit used</th><th>Utilisation</th><th>Status</th><th></th></tr></thead>
      <tbody>${SUBAGENTS.map(a => {
        const pct = a.credit ? Math.round(a.used / a.credit * 100) : 0;
        return `<tr>
        <td><b>${esc(a.n)}</b></td><td>${esc(a.city)}</td>
        <td class="n mono">${a.ytd ? money(a.ytd) : '-'}</td><td class="mono">${a.mk}</td>
        <td class="n mono">${a.credit ? money(a.used) + ' / ' + money(a.credit) : '-'}</td>
        <td style="min-width:130px">${a.credit ? `<div class="meter" style="margin:0"><i style="width:${pct}%;background:${pct > 90 ? 'var(--bad)' : pct > 70 ? 'var(--warn)' : 'var(--b2b)'}"></i></div><span class="dim mono" style="font-size:10.5px">${pct}%</span>` : '<span class="dim">-</span>'}</td>
        <td><span class="chip ${a.st === 'Active' ? 'good' : a.st === 'Near limit' ? 'warn' : 'acc'}">${a.st}</span></td>
        <td class="n">${a.st === 'Pending approval'
          ? `<div class="row" style="gap:5px;justify-content:flex-end"><button class="btn btn-b2b btn-sm" data-act="toastOnly" data-msg="${esc(a.n)} approved · credit line ${money(5000)} opened">Approve</button><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Application declined · applicant notified">Decline</button></div>`
          : `<button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Editing limits for ${esc(a.n)}">Limits</button>`}</td>
      </tr>`; }).join('')}</tbody>
    </table></div></div>`);
}

/* packages admin */
function viewAPkg(){
  if(!state.pkgPub) state.pkgPub = {};
  return opsBanner({
    kicker:'Inventory &amp; content', title:'Package <em>studio</em>',
    sub:'Add, price and publish the agency\'s own product. Unpublishing pulls it from the storefront and the app immediately - no redeploy.',
    meta:`<button class="btn btn-pri btn-sm" data-act="toastOnly" data-msg="Package builder opens here - itinerary, inclusions, pricing, photos">Add package</button>`
  }) + body(`
    <div class="panel"><div class="tbl-wrap"><table>
      <thead><tr><th>Package</th><th>Destination</th><th class="n">Nights</th><th class="n">From</th><th class="n">Was</th><th>Category</th><th class="n">Rating</th><th>Live</th><th></th></tr></thead>
      <tbody>${PACKAGES.map(p => {
        const live = state.pkgPub[p.id] !== false;
        return `<tr>
        <td><div class="row" style="gap:12px"><img src="${p.img}" alt="" style="width:64px;height:42px;object-fit:cover;border-radius:8px;flex:none;${live ? '' : 'filter:grayscale(1);opacity:.5'}" loading="lazy"><b>${esc(p.n)}</b></div></td>
        <td>${esc(p.dest)}</td><td class="n mono">${p.nights}</td>
        <td class="n mono">${money(p.from)}</td><td class="n mono dim">${money(p.was)}</td>
        <td><span class="chip acc">${esc(p.cat)}</span></td><td class="n mono">${p.rating}</td>
        <td><button class="pill" data-act="pubToggle" data-id="${p.id}" aria-pressed="${live}">${live ? 'Published' : 'Draft'}</button></td>
        <td class="n"><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Editing ${esc(p.n)} - itinerary, inclusions, photos">Edit</button></td>
      </tr>`; }).join('')}</tbody>
    </table></div></div>
    <p class="dim" style="font-size:12px;margin-top:14px">Storefront shows <b style="color:var(--text)">${PACKAGES.filter(p => state.pkgPub[p.id] !== false).length} of ${PACKAGES.length}</b> packages right now. Toggle one and check the Traveller tab.</p>`);
}

/* payments */
function viewPay(){
  const pend = REFUNDS.filter(r => r.st === 'Awaiting approval');
  return opsBanner({
    kicker:'Money in, money out', title:'Payments <em>&amp; refunds</em>',
    sub:'Gateway settlements reconciled against bookings, and a refund queue that needs a human before anything leaves the account.',
    meta:`<button class="btn btn-ghost btn-sm" data-act="toastOnly" data-msg="Reconciliation run · 4 gateways, 0 unmatched">Reconcile now</button>`
  }) + body(`
    <div class="panel" style="margin-bottom:18px"><div class="panel-h"><h3>Refund queue</h3><span class="chip ${pend.length ? 'warn' : 'good'}">${pend.length} awaiting approval</span></div>
      <div class="tbl-wrap"><table>
        <thead><tr><th>Booking</th><th>Customer</th><th class="n">Amount</th><th>Reason</th><th>Gateway</th><th>Waiting</th><th>Status</th><th></th></tr></thead>
        <tbody>${REFUNDS.map(r => `<tr>
          <td class="mono">${r.ref}</td><td>${esc(r.cust)}</td><td class="n mono"><b>${money(r.amt)}</b></td>
          <td>${esc(r.reason)}</td><td><span class="chip src">${r.gw}</span></td><td class="mono">${r.age}</td>
          <td><span class="chip ${r.st === 'Awaiting approval' ? 'warn' : 'good'}">${r.st}</span></td>
          <td class="n">${r.st === 'Awaiting approval'
            ? `<div class="row" style="gap:5px;justify-content:flex-end"><button class="btn btn-pri btn-sm" data-act="toastOnly" data-msg="Refund of ${money(r.amt)} approved · ${r.gw} will return it in 5-10 days">Approve</button><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Refund declined · note added to ${r.ref}">Decline</button></div>`
            : '<span class="dim">In flight</span>'}</td>
        </tr>`).join('')}</tbody>
      </table></div></div>
    <div class="panel"><div class="panel-h"><h3>Gateway settlements</h3><span class="chip src">Next cycle 22 Sep</span></div>
      <div class="tbl-wrap"><table>
        <thead><tr><th>Gateway</th><th class="n">Gross</th><th class="n">Fees</th><th class="n">Net to bank</th><th>Settles</th><th>Status</th></tr></thead>
        <tbody>${SETTLE.map(x => `<tr>
          <td><b>${x.gw}</b></td><td class="n mono">${money(x.gross)}</td>
          <td class="n mono" style="color:var(--bad)">${x.fee ? '-' + money(x.fee) : '-'}</td>
          <td class="n mono"><b>${money(x.net)}</b></td><td class="mono">${x.date}</td>
          <td><span class="chip ${x.st === 'Settled' ? 'good' : ''}">${x.st}</span></td>
        </tr>`).join('')}</tbody>
      </table></div></div>`);
}

/* settings */
function viewSettings(){
  return opsBanner({
    kicker:'Configuration', title:'<em>Settings</em>',
    sub:'Staff access, supplier credentials and the pricing defaults every search inherits.'
  }) + body(`
    <div class="split" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>Staff</h3><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Invite sent · the new user sets their own password">Invite</button></div>
          <div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Last active</th><th></th></tr></thead>
            <tbody>${STAFF.map(u => `<tr>
              <td><b>${esc(u.n)}</b><div class="dim mono" style="font-size:10.5px">${esc(u.em)}</div></td>
              <td><span class="chip ${u.role === 'Owner' ? 'acc' : ''}">${u.role}</span></td>
              <td class="mono dim">${u.last}</td>
              <td class="n"><button class="btn btn-out btn-sm" data-act="toastOnly" data-msg="Editing access for ${esc(u.n)}">Edit</button></td>
            </tr>`).join('')}</tbody></table></div></div>
        <div class="panel"><div class="panel-h"><h3>Pricing defaults</h3></div><div class="panel-b stack" style="gap:12px">
          <div class="between"><span class="muted">Retail markup - air</span><b class="mono">6.0%</b></div>
          <div class="between"><span class="muted">Retail markup - hotel</span><b class="mono">12.0%</b></div>
          <div class="between"><span class="muted">Booking fee</span><b class="mono">${money(15)}</b></div>
          <div class="between"><span class="muted">Display currency</span><b class="mono">${state.cur}</b></div>
          <div class="between"><span class="muted">Fare hold window</span><b class="mono">20 min</b></div>
        </div></div>
      </div>
      <div class="stack">
        <div class="panel"><div class="panel-h"><h3>Roles &amp; permissions</h3><span class="chip src">${Object.keys(ROLES).length} roles</span></div>
          <div class="tbl-wrap"><table><thead><tr><th>Role</th>${PERMS.map(p => `<th class="n" style="font-size:8.5px;padding:12px 8px">${p}</th>`).join('')}</tr></thead>
            <tbody>${Object.keys(ROLES).map(r => `<tr><td><b>${r}</b></td>
              ${ROLES[r].map(v => `<td class="n" style="padding:13px 8px">${v ? '<span style="color:var(--good);font-weight:700">✓</span>' : '<span class="dim">·</span>'}</td>`).join('')}
            </tr>`).join('')}</tbody></table></div></div>
        <div class="panel"><div class="panel-h"><h3>Supplier credentials</h3><span class="chip good">Encrypted at rest</span></div>
          <div class="panel-b stack" style="gap:12px">
            ${[['Amadeus','API key','•••••••••••• 4f2a'],['Travelport','Branch code','••••••••  P7714'],['TBO','Agency login','••••••••  WF-CA'],['Hotelbeds','API key','••••••••••••  9c1d'],['Stripe','Secret key','sk_live_••••••  a83e'],['Moneris','Store ID','••••••••  MON42'],['Zoho CRM','OAuth token','Connected · renews 14 Nov']].map(([n, k, v]) => `
              <div class="between" style="font-size:13px"><div><b>${n}</b><div class="dim" style="font-size:11px">${k}</div></div>
                <span class="mono dim" style="font-size:11.5px">${v}</span></div>`).join('')}
            <button class="btn btn-out btn-sm" style="align-self:flex-start" data-act="toastOnly" data-msg="Credential rotation requires Owner re-authentication">Rotate credentials</button>
          </div></div>
      </div>
    </div>`);
}

/* ---------- router ---------- */
const PARENT = {flights:'search', hotels:'search', checkout:'search', confirm:'search', package:'packages'};
const VIEWS = {
  search:viewSearch, flights:viewFlights, hotels:viewHotels, checkout:viewCheckout, confirm:viewConfirm,
  packages:viewPackages, package:viewPackage, reviews:viewReviews, mobile:viewMobile,
  desk:viewDesk, bookings:viewBookings, markup:viewMarkup,
  ops:viewOps,
  dash:viewDash, abook:viewABook, cust:viewCust, aagents:viewAAgents,
  apkg:viewAPkg, pay:viewPay, settings:viewSettings
};

/* Re-render only the regions marked data-patch when the page structure is unchanged,
   so videos, the globe and the hero reel keep playing while filters/prices update. */
function patchView(view, html){
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const top = root => [...root.querySelectorAll('[data-patch]')].filter(n => !(n.parentElement && n.parentElement.closest('[data-patch]')));
  const fresh = top(tpl.content), live = top(view);
  if(!fresh.length || fresh.length !== live.length) return false;
  const map = new Map(live.map(n => [n.dataset.patch, n]));
  if(fresh.some(n => !map.has(n.dataset.patch))) return false;
  const replaced = [];
  fresh.forEach(n => { const old = map.get(n.dataset.patch); if(old.outerHTML !== n.outerHTML){ old.replaceWith(n); replaced.push(n); } });
  if(window.Cinema) Cinema.patched(replaced);
  return true;
}
function syncTabState(){
  const active = PARENT[state.tab] || state.tab;
  document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === active));
  document.querySelectorAll('.modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === state.mode));
  if(window.Cinema) Cinema.syncInk();
}
function render(keepScroll){
  const view = el('#view');
  const html = (VIEWS[state.tab] || viewSearch)();
  if(keepScroll && view.dataset.view === state.tab && view.dataset.mode === state.mode && patchView(view, html)){
    syncTabState();
    if(window.Cinema) Cinema.afterPatch();
    return;
  }
  const y = window.scrollY;
  if(window.Cinema) Cinema.unmount(view);
  view.innerHTML = html;
  view.dataset.view = state.tab;
  view.dataset.mode = state.mode;
  syncTabState();
  if(window.Cinema) Cinema.scrollTo(keepScroll ? y : 0);
  else window.scrollTo(0, keepScroll ? y : 0);
  if(window.Cinema) Cinema.mount(view, {instant: !!keepScroll});
}
function go(tab){
  const run = () => { state.tab = tab; renderTabs(); render(); };
  if(window.Cinema) Cinema.cut(SLATE[tab] || tab, Object.keys(SLATE).indexOf(tab) + 1, run);
  else run();
}

/* ---------- interaction ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if(!t) return;
  const a = t.dataset.act;
  switch(a){
    case 'mode': {
      if(state.mode === t.dataset.mode) break;
      const next = t.dataset.mode;
      const run = () => {
        state.mode = next;
        state.tab = TABS[state.mode][0][0];
        state.openCard = null;
        renderTabs(); render();
        toast(state.mode === 'agent' ? 'Signed in as <b>Horizon Travels</b> - net rates and markup controls unlocked'
            : state.mode === 'ops' ? 'Admin panel - bookings, refunds, customers, agents, content and settings'
            : 'Traveller storefront - public retail pricing', state.mode === 'agent' ? 'b2b' : '');
      };
      if(window.Cinema) Cinema.cut(next === 'agent' ? 'Agent desk' : next === 'ops' ? 'Admin panel' : 'Traveller', 0, run); else run();
      break;
    }
    case 'home': go(TABS[state.mode][0][0]); break;
    case 'tab': go(t.dataset.tab); break;
    case 'stab': {
      state.stab = t.dataset.stab;
      const seg = t.closest('.seg');
      if(seg){ seg.dataset.on = state.stab; seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === t)); }
      render(true); break;
    }
    case 'scrollSearch': {
      if(state.tab !== 'search'){ go('search'); setTimeout(() => window.Cinema && Cinema.scrollToEl('#search'), 900); }
      else if(window.Cinema) Cinema.scrollToEl('#search'); else el('#search').scrollIntoView({behavior:'smooth'});
      break;
    }
    case 'swap': { const f = state.trip.from; state.trip.from = state.trip.to; state.trip.to = f; render(true); break; }
    case 'searchFlights':
      buildOffers();
      state.openCard = null;
      go('flights');
      toast('Queried <b>4 sources</b> · ' + state.results.length + ' offers returned in 842 ms');
      break;
    case 'searchHotels': go('hotels'); toast('Hotelbeds + TBO · 62 properties, deduplicated to ' + HOTELS.length + ' shown'); break;
    case 'openFares': state.openCard = state.openCard === t.dataset.id ? null : t.dataset.id; render(true); break;
    case 'selFare': {
      const o = state.results.find(x => x.id === t.dataset.id);
      const f = o.fares.find(x => x.k === t.dataset.f);
      state.sel = {kind:'air', offer:o, fare:f};
      if(state.gw === 'wallet' && state.mode !== 'agent') state.gw = 'stripe';
      go('checkout');
      toast('Fare confirmed against ' + o.sup + ' · held for 20 minutes');
      break;
    }
    case 'selHotel': {
      const h = HOTELS.find(x => x.id === t.dataset.id);
      state.sel = {kind:'hotel', hotel:h, nights:4};
      go('checkout');
      toast('Rate re-checked against ' + h.sup + ' · available');
      break;
    }
    case 'gw': state.gw = t.dataset.k; render(true); break;
    case 'back': go(state.sel && state.sel.kind === 'hotel' ? 'hotels' : 'flights'); break;
    case 'pay': {
      const q = quote();
      t.disabled = true; t.textContent = 'Contacting gateway…';
      const gwName = (GATEWAYS.find(g => g.k === state.gw) || {}).n;
      toast(state.gw === 'wallet' ? 'Debiting agent wallet…' : gwName + ' · 3D Secure challenge passed');
      setTimeout(() => {
        const s = state.sel;
        const now = new Date();
        state.booking = {
          kind:s.kind, o:s.offer, fare:s.fare, h:s.hotel, nights:s.nights,
          pnr: makePNR(), ref: 'WF-88' + (40000 + Math.floor(Math.random() * 9999)),
          etkt: s.kind === 'air' ? '176-' + pad(Math.floor(Math.random() * 1e10), 10) : 'VCH-' + pad(Math.floor(Math.random() * 1e8), 8),
          ttl: '19 Sep 2026 23:59',
          total: q.total, gw: gwName, sup: s.kind === 'air' ? s.offer.sup : s.hotel.sup,
          txn: (state.gw === 'stripe' ? 'pi_' : state.gw === 'moneris' ? 'mnrs_' : state.gw === 'paypal' ? 'PAYID-' : 'wlt_') + Math.random().toString(36).slice(2, 12).toUpperCase(),
          clock: pad(now.getHours(), 2) + ':' + pad(now.getMinutes(), 2) + ':' + pad(now.getSeconds(), 2)
        };
        go('confirm');
        toast('Payment captured · PNR <b>' + state.booking.pnr + '</b> issued · CRM and WhatsApp fired');
      }, 1400);
      break;
    }
    case 'sort': state.sort = t.dataset.v; render(true); break;
    case 'fStops': state.filters.stops = t.dataset.v; render(true); break;
    case 'fDep': state.filters.dep = t.dataset.v; render(true); break;
    case 'clearF': state.filters = {stops:'any', als:[], sups:[], maxPrice:null, dep:'any', refundOnly:false}; render(true); break;
    case 'mkType': state.markup.type = t.dataset.t; state.markup.v = t.dataset.t === 'pct' ? 6 : 25; render(true); break;
    case 'pkg': state.pkg = t.dataset.id; go('package'); break;
    case 'gal': {
      const m = el('#galMain');
      if(m && m.getAttribute('src') !== t.dataset.src){
        m.style.opacity = '0';
        setTimeout(() => { m.onload = () => { m.style.opacity = '1'; }; m.src = t.dataset.src; }, 300);
      }
      document.querySelectorAll('.gt').forEach(b => b.setAttribute('aria-pressed', b === t));
      break;
    }
    case 'dest': {
      if(t.dataset.ap === state.trip.from) break;
      state.trip.to = t.dataset.ap;
      if(state.trip.from === state.trip.to) state.trip.from = 'YYZ';
      buildOffers(); state.openCard = null; go('flights');
      toast('Searching <b>' + AP[state.trip.from].c + ' → ' + AP[state.trip.to].c + '</b> across 4 sources');
      break;
    }
    case 'pkgCat': state.pkgCat = t.dataset.v; render(true); break;
    case 'revF': state.revFilter = +t.dataset.v; render(true); break;
    case 'abF': state.abFilter = t.dataset.v; render(true); break;
    case 'pubToggle': {
      if(!state.pkgPub) state.pkgPub = {};
      const id = t.dataset.id;
      state.pkgPub[id] = state.pkgPub[id] === false;
      const p = PACKAGES.find(x => x.id === id);
      render(true);
      toast('<b>' + esc(p.n) + '</b> is now ' + (state.pkgPub[id] === false ? 'a draft - pulled from the storefront and app' : 'published - live on the storefront and app'));
      break;
    }
    case 'cur':
      state.cur = state.cur === 'USD' ? 'CAD' : 'USD';
      renderTabs(); render(true);
      toast('Display currency switched to <b>' + state.cur + '</b> · supplier settlement stays in CAD');
      break;
    case 'toastOnly': toast(t.dataset.msg); break;
  }
});
document.addEventListener('change', e => {
  const t = e.target.closest('[data-act]');
  if(!t) return;
  const a = t.dataset.act;
  if(a === 'trip'){
    const k = t.dataset.k;
    if(k === 'hotelCity'){ state.hotelCity = t.value; render(true); return; }
    state.trip[k] = (k === 'adt' || k === 'chd') ? +t.value : t.value;
    if(state.trip.from === state.trip.to){
      const alt = Object.keys(AP).find(c => c !== state.trip.from);
      state.trip[t.dataset.k === 'from' ? 'to' : 'from'] = alt;
    }
    render(true);
  }
  if(a === 'triptype'){ state.trip.type = t.value; render(true); }
  if(a === 'addon'){ state.addons[t.dataset.k] = t.checked; render(true); }
  if(a === 'fAl'){
    const v = t.dataset.v, s = state.filters.als;
    t.checked ? s.push(v) : s.splice(s.indexOf(v), 1);
    render(true);
  }
  if(a === 'fSup'){
    const v = t.dataset.v, s = state.filters.sups;
    t.checked ? s.push(v) : s.splice(s.indexOf(v), 1);
    render(true);
  }
});
/* sliders: update label while dragging, render on release */
document.addEventListener('input', e => {
  const t = e.target.closest('[data-act]');
  if(!t) return;
  if(t.dataset.act === 'fPrice'){
    state.filters.maxPrice = +t.value;
    const out = el('#fpOut'); if(out) out.textContent = money(+t.value);
  }
  if(t.dataset.act === 'mkVal'){
    state.markup.v = +t.value;
    const out = el('#mkOut'); if(out) out.textContent = state.markup.type === 'pct' ? state.markup.v + '%' : money(state.markup.v);
  }
});
document.addEventListener('change', e => {
  const t = e.target.closest('[data-act]');
  if(!t) return;
  if(t.dataset.act === 'fPrice' || t.dataset.act === 'mkVal'){
    render(true);
    const again = document.querySelector('[data-act="' + t.dataset.act + '"]');
    if(again) again.focus();
  }
});

/* ---------- public surface for cinema.js / globe.js ---------- */
window.WF = {state, AP, DESTS, SCENES, ROUTES, money, sell, routeFrom, go, render};

/* ---------- init ---------- */
state.stab = 'flights';
buildOffers();
renderTabs();
render();
