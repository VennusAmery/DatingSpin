// Corre este script UNA VEZ para geocodificar todas las direcciones:
// node precache.js

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const GCAL_ID  = '527b8ffbf3338d1f66779692c7407df180d198177e35e2b0a1acca4afc91c069@group.calendar.google.com';
const GCAL_KEY = 'AIzaSyDJPAWkBQLyzbZZ121wjod0SCbcegjwtQs';
const CACHE_FILE = path.join(__dirname, 'geocache.json');

let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}

const geocode = async (address) => {
  if (!address) return null;
  if (cache[address] !== undefined) return cache[address];

  // Genera variantes de la dirección, de más simple a más compleja
  const clean = address
    .replace(/CIUDAD DE GUATEMALA/gi, 'Guatemala City')
    .replace(/LA ANTIGUA GUATEMALA/gi, 'Antigua Guatemala')
    .replace(/DEPARTAMENTO DE GUATEMALA/gi, 'Guatemala')
    .replace(/QUETZALTENANGO/gi, 'Quetzaltenango Guatemala')
    .replace(/ESCUINTLA/gi, 'Escuintla Guatemala')
    .replace(/HUEHUETENANGO/gi, 'Huehuetenango Guatemala');

  const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
  const queries = [
    parts.slice(-2).join(', '),         
    parts.slice(-3).join(', '),       
    clean,                              
  ].filter(Boolean);

  for (const q of queries) {
    try {
      await new Promise(r => setTimeout(r, 800));
      const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q, format: 'json', limit: 1 }, // sin countrycodes
        headers: { 'User-Agent': 'SpinDocky/1.0' },
        timeout: 8000,
      });
      if (data.length > 0) {
        const coords = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        cache[address] = coords;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        console.log(`✅ ${address.substring(0, 50)} → ${coords.latitude}, ${coords.longitude}`);
        return coords;
      }
    } catch { continue; }
  }
  cache[address] = null;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`❌ ${address.substring(0, 50)}`);
  return null;
};

(async () => {
  console.log('Fetching events from Google Calendar...');
  let allItems = [], pageToken = null;
  do {
    const params = new URLSearchParams({ key: GCAL_KEY, timeMin: new Date().toISOString(), orderBy: 'startTime', singleEvents: 'true', maxResults: '250', ...(pageToken ? { pageToken } : {}) });
    const { data } = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events?${params}`);
    if (data.items) allItems = [...allItems, ...data.items];
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  const locations = [...new Set(allItems.map(e => e.location).filter(Boolean))];
  const toGeocode = locations.filter(l => cache[l] === undefined);
  console.log(`Total: ${locations.length} | Ya en cache: ${locations.length - toGeocode.length} | Por geocodificar: ${toGeocode.length}`);

  for (let i = 0; i < toGeocode.length; i++) {
    const addr = toGeocode[i];
    const result = await geocode(addr);
    console.log(`[${i+1}/${toGeocode.length}] ${result ? '✅' : '❌'} ${addr.substring(0, 60)}`);
  }

  console.log(`\n✅ Listo! Cache guardado con ${Object.keys(cache).length} direcciones.`);
})();