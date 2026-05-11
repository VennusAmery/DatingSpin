const cheerio = require('cheerio');

const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(cors());

// Nueva ruta para Guatemala.com
app.get('/events/guatecom', async (req, res) => {
  try {
    const { data } = await axios.get('https://eventos.guatemala.com/calendario');
    const $ = cheerio.load(data);
    const eventos = [];

    // Buscamos cada tarjeta de evento en la página
    $('.event-item').each((i, el) => {
      eventos.push({
        id: i,
        title: $(el).find('.title').text().trim(),
        date: $(el).find('.date').text().trim(), 
        location: $(el).find('.location').text().trim(),
        description: $(el).find('.excerpt').text().trim(),
        image: $(el).find('img').attr('src'),
        url: $(el).find('a').attr('href'),
        category: { name: 'Arts' } 
      });
    });

    res.json(eventos);
  } catch (error) {
    res.status(500).send("Error extrayendo datos");
  }
});


// ── Cache persistente en archivo ──────────────────────────────────────────────
const CACHE_FILE = path.join(__dirname, 'geocache.json');
let coordCache = {};
try { coordCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); console.log(`Loaded ${Object.keys(coordCache).length} cached locations`); }
catch { coordCache = {}; }

const saveCache = () => { try { fs.writeFileSync(CACHE_FILE, JSON.stringify(coordCache, null, 2)); } catch {} };

const geocode = async (address) => {
  if (!address) return null;

  const known = findKnownCoords(address);
  if (known) return known;

  for (const [name, coords] of Object.entries(manualCoords)) {
    if (address.toLowerCase().includes(name.toLowerCase())) return coords;
  }

  if (coordCache[address] !== undefined) return coordCache[address];

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
        params: { q, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'SpinDocky/1.0' },
        timeout: 5000,
      });
      if (data.length > 0) {
        const coords = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        coordCache[address] = coords;
        saveCache();
        return coords;
      }
    } catch { continue; }
  }
  coordCache[address] = null;
  saveCache();
  logMissing(address);
  return null;
};

// ── Coordenadas hardcodeadas de lugares frecuentes ───────────────
const KNOWN_COORDS = {
  'Rock\' Ol Vuh':          { latitude: 14.6419, longitude: -90.5133 },
  'Rock\'Ol Vuh':           { latitude: 14.6419, longitude: -90.5133 },
  'Trovajazz':              { latitude: 14.6089, longitude: -90.5147 },
  'Trova Rock':             { latitude: 14.6419, longitude: -90.5133 },
  'Centro Cultural de España': { latitude: 14.6393, longitude: -90.5138 },
  'Catafixia':              { latitude: 14.6447, longitude: -90.5133 },
  'Conservatorio Nacional': { latitude: 14.6447, longitude: -90.5120 },
  'Teatro Manuel Galich':   { latitude: 14.6453, longitude: -90.5123 },
  'Universidad Rafael Landívar': { latitude: 14.5892, longitude: -90.4956 },
  'Palacio Nacional':       { latitude: 14.6424, longitude: -90.5133 },
  'Museo de la Universidad de San Carlos': { latitude: 14.6447, longitude: -90.5127 },
  'Biblioteca Nacional':    { latitude: 14.6431, longitude: -90.5140 },
  'La Teca':                { latitude: 14.6447, longitude: -90.5133 },
  'La Casona':              { latitude: 14.6469, longitude: -90.5120 },
  'La Popular':             { latitude: 14.6089, longitude: -90.5147 },
  'La Guarida':             { latitude: 14.6089, longitude: -90.5138 },
  'La Resortera':           { latitude: 14.5961, longitude: -90.5072 },
  'Museo Miraflores':       { latitude: 14.6119, longitude: -90.5344 },
  'Universidad Del Valle':  { latitude: 14.5892, longitude: -90.4956 },
  'Hotel Royal Palace':     { latitude: 14.6431, longitude: -90.5133 },
  'Hotel Hilton Garden':    { latitude: 14.5961, longitude: -90.5147 },
  'Sexta Avenida':          { latitude: 14.6419, longitude: -90.5133 },
  'El Portal de la Sexta':  { latitude: 14.6424, longitude: -90.5133 },
  'Cines Capitol':          { latitude: 14.6397, longitude: -90.5138 },
  '502 Pizza':              { latitude: 14.6453, longitude: -90.5120 },
  'Pizza 502':              { latitude: 14.6453, longitude: -90.5120 },
  'Restaurante Aida':       { latitude: 14.6089, longitude: -90.5147 },
  'Perjura Proyecto':       { latitude: 14.5744, longitude: -90.5344 },
  'Teatro Dick Smith':      { latitude: 14.6089, longitude: -90.5147 },
  'Parque Intercultural de Xela': { latitude: 14.8444, longitude: -91.5183 },
  'Interplaza Xela':        { latitude: 14.8278, longitude: -91.5347 },
  'Interplaza, Escuintla':  { latitude: 14.3047, longitude: -90.7861 },
  'Parque Central de Huehuetenango': { latitude: 15.3197, longitude: -91.4733 },
  'Santo Domingo del Cerro': { latitude: 14.5583, longitude: -90.7344 },
  'Rocamadour':             { latitude: 14.5583, longitude: -90.7294 },
  'Parque de la Paz':       { latitude: 14.5744, longitude: -90.5483 },
  'Gran Teatro Delirio':    { latitude: 14.5892, longitude: -90.4956 },
};

const findKnownCoords = (address) => {
  if (!address) return null;
  for (const [name, coords] of Object.entries(KNOWN_COORDS)) {
    if (address.toLowerCase().includes(name.toLowerCase())) return coords;
  }
  return null;
};

// ── Coords manuales para lugares que Nominatim no encuentra ──────────────────
// Agrega aquí cualquier lugar nuevo que falle: 'Nombre del lugar': { latitude: X, longitude: Y }
const MANUAL_COORDS = {};
const MANUAL_FILE = path.join(__dirname, 'manual_coords.json');
let manualCoords = {};
try { manualCoords = JSON.parse(fs.readFileSync(MANUAL_FILE, 'utf8')); } catch {}

// ── Log de lugares sin coordenadas (para saber cuáles agregar manualmente) ───
const MISSING_FILE = path.join(__dirname, 'missing.json');
let missing = {};
try { missing = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf8')); } catch {}
const logMissing = (address) => {
  missing[address] = (missing[address] || 0) + 1;
  try { fs.writeFileSync(MISSING_FILE, JSON.stringify(missing, null, 2)); } catch {}
};
const GCAL_ID  = '527b8ffbf3338d1f66779692c7407df180d198177e35e2b0a1acca4afc91c069@group.calendar.google.com';
const GCAL_KEY = 'AIzaSyDJPAWkBQLyzbZZ121wjod0SCbcegjwtQs';

app.get('/events/archivogt', async (req, res) => {
  try {
    let allItems = [], pageToken = null;
    do {
      const params = {
        key: GCAL_KEY,
        timeMin: new Date().toISOString(),
        orderBy: 'startTime',
        singleEvents: 'true',
        maxResults: '250',
        ...(pageToken ? { pageToken } : {}),
      };
      const { data } = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events`,
        { params }
      );
      if (data.items) allItems = [...allItems, ...data.items];
      pageToken = data.nextPageToken || null;
    } while (pageToken);

    console.log(`Fetched ${allItems.length} events from Google Calendar`);

    const locations = [...new Set(allItems.map(e => e.location).filter(Boolean))];
    const coordMap = {};
    for (const addr of locations) {
      coordMap[addr] = await geocode(addr);
    }

    const events = allItems.map(e => ({
      id:          e.id,
      title:       e.summary,
      date:        e.start?.dateTime || e.start?.date,
      start:       { local: e.start?.dateTime || e.start?.date },
      end:         { local: e.end?.dateTime || e.end?.date },
      location:    e.location || null,
      description: e.description || null,
      url:         e.htmlLink,
      coords:      e.location ? (coordMap[e.location] || null) : null,
    }));

    res.json(events);
  } catch (err) {
    console.error('ArchivoGT error:', err.message);
    res.json([]);
  }
});

app.listen(3001, () => {
  console.log('Server on :3001');
  precacheAll();
});

async function precacheAll() {
  try {
    console.log('Pre-caching locations in background...');
    let allItems = [], pageToken = null;
    do {
      const params = { key: GCAL_KEY, timeMin: new Date().toISOString(), orderBy: 'startTime', singleEvents: 'true', maxResults: '250', ...(pageToken ? { pageToken } : {}) };
      const { data } = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events`, { params });
      if (data.items) allItems = [...allItems, ...data.items];
      pageToken = data.nextPageToken || null;
    } while (pageToken);

    const locations = [...new Set(allItems.map(e => e.location).filter(Boolean))];
    const toGeocode = locations.filter(l => coordCache[l] === undefined);
    console.log(`Locations: ${locations.length} total, ${toGeocode.length} need geocoding`);

    for (let i = 0; i < toGeocode.length; i++) {
      const coords = await geocode(toGeocode[i]);
      console.log(`[${i+1}/${toGeocode.length}] ${coords ? '✅' : '❌'} ${toGeocode[i].substring(0, 50)}`);
    }
    console.log('✅ Pre-cache complete!');
  } catch (err) {
    console.error('Pre-cache error:', err.message);
  }
}