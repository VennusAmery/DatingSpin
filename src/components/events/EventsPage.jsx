import React, { useState, useEffect, useCallback } from 'react';
import { C } from '../../utils/theme';
import { useGeolocation } from '../../hooks';

const API      = 'http://localhost:3001';
const GCAL_ID  = '527b8ffbf3338d1f66779692c7407df180d198177e35e2b0a1acca4afc91c069@group.calendar.google.com';
const GCAL_KEY = 'AIzaSyDJPAWkBQLyzbZZ121wjod0SCbcegjwtQs';

const CATEGORY_COLORS = {
  'Music':            { bg:'#FFB3C1', emoji:'🎵' },
  'Food & Drink':     { bg:'#FFE4A0', emoji:'🍷' },
  'Arts':             { bg:'#C5B8E8', emoji:'🎨' },
  'Film & Media':     { bg:'#A8C4FF', emoji:'🎬' },
  'Sports & Fitness': { bg:'#B5DEC8', emoji:'🏃' },
  'Performing Arts':  { bg:'#FFB085', emoji:'🎭' },
  'Nightlife':        { bg:'#C5B8E8', emoji:'🌙' },
  'default':          { bg:'#EDE0C4', emoji:'📅' },
};

function extractPrice(description) {
  if (!description) return null;
  const lower = description.toLowerCase();
  if (lower.includes('gratis') || lower.includes('entrada libre') ||
      lower.includes('entrada gratuita') || lower.includes('sin costo') ||
      lower.includes('precio: libre') || lower.includes('precio libre') ||
      lower.includes('acceso libre') || lower.includes('ingreso libre'))
    return 'gratis';
  const match = description.match(/Q\.?\s*\d+|\d+\s*quetzales|\$\s*\d+/i);
  return match ? match[0] : null;
}

function getCat(event) {
  return CATEGORY_COLORS[event.category?.name || ''] || CATEGORY_COLORS.default;
}

function distKm(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lat2) return null;
  const R = 6371, dL = (lat2-lat1)*Math.PI/180, dN = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dN/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toLocaleDateString('es-GT', { weekday:'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return dateStr; }
}

function formatDateShort(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toLocaleDateString('es-GT', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); }
  catch { return dateStr; }
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toLocaleTimeString('es-GT', { hour:'2-digit', minute:'2-digit' }); }
  catch { return null; }
}

// ── Event Detail Modal ────────────────────────────────────────────────────────
function EventDetailModal({ event, userLocation, onClose }) {
  const cat      = getCat(event);
  const venueLat = event.venue?.latitude;
  const venueLng = event.venue?.longitude;
  const dist     = userLocation && venueLat
    ? distKm(userLocation.lat, userLocation.lng, parseFloat(venueLat), parseFloat(venueLng))
    : null;
  const directionsUrl = userLocation && venueLat
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${venueLat},${venueLng}&travelmode=driving`
    : (userLocation && event.location)
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(event.location)}&travelmode=driving`
      : null;

  const image         = event.logo?.url || event.image || null;
  const title         = event.name?.text || event.title || 'Sin título';
  const desc          = event.description?.text || event.summary || null;
  const start         = formatDate(event.start?.local || event.date);
  const end           = event.end?.local ? formatTime(event.end.local) : null;
  const venue         = event.venue?.name || event.location || null;
  const address       = event.venue?.address?.localized_address_display || null;
  const url           = event.url || event.link;
  const category      = event.category?.name || null;
  const capacity      = event.capacity || null;
  const tags          = event.tags || [];
  const ebPrice       = event.ticket_availability?.minimum_ticket_price?.display || null;
  const detectedPrice = event.detected_price || null;
  const price         = ebPrice || (detectedPrice !== 'gratis' ? detectedPrice : null);
  const isFree        = event.is_free || detectedPrice === 'gratis';

  return (
    <div onClick={e => { if(e.target===e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'white', border:'3px solid #1A1A1A', borderRadius:22, width:'100%', maxWidth:480, maxHeight:'90dvh', display:'flex', flexDirection:'column', boxShadow:'0 10px 0 #1A1A1A', animation:'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both', overflow:'hidden' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          {image
            ? <img src={image} alt={title} style={{ width:'100%', height:180, objectFit:'cover' }}/>
            : <div style={{ width:'100%', height:100, background:cat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>{cat.emoji}</div>
          }
          <button onClick={onClose} style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.5)', border:'2px solid white', borderRadius:20, color:'white', width:32, height:32, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>×</button>
          <div style={{ position:'absolute', bottom:10, left:12, display:'flex', gap:6, flexWrap:'wrap' }}>
            {isFree && <span style={{ background:'#B5DEC8', border:'1.5px solid #1A1A1A', fontFamily:'Nunito', fontWeight:800, fontSize:10, padding:'3px 10px', borderRadius:20 }}>GRATIS</span>}
            {dist && <span style={{ background:'white', border:'1.5px solid #1A1A1A', fontFamily:'Nunito', fontWeight:800, fontSize:10, padding:'3px 10px', borderRadius:20 }}>📍 {dist} km</span>}
          </div>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            {category && <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{cat.emoji} {category}</div>}
            <div style={{ fontFamily:'Fredoka One', fontSize:22, color:'#1A1A1A', lineHeight:1.2 }}>{title}</div>
          </div>
          {start && (
            <div style={{ background:'#EEF5FF', border:'2px solid #A8C4FF', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#2255CC', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>📅 Fecha y hora</div>
              <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:14, color:'#1A1A1A' }}>{start}</div>
              {end && <div style={{ fontFamily:'Nunito', fontSize:12, color:'#888', marginTop:3 }}>Termina: {end}</div>}
            </div>
          )}
          {(venue || address) && (
            <div style={{ background:'#EDFAF3', border:'2px solid #B5DEC8', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#2A7A4A', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>📍 Lugar</div>
              {venue   && <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:14, color:'#1A1A1A' }}>{venue}</div>}
              {address && <div style={{ fontFamily:'Nunito', fontSize:12, color:'#888', marginTop:3 }}>{address}</div>}
            </div>
          )}
          {(price || isFree) && (
            <div style={{ background:'#FFF8EC', border:'2px solid #FFE4A0', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:24 }}>{isFree ? '🤲' : '🎟️'}</span>
              <div>
                <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#B8860B', textTransform:'uppercase', letterSpacing:'0.08em' }}>Precio</div>
                <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:14, color:'#1A1A1A' }}>{isFree ? 'Entrada gratuita' : price || 'Ver detalles'}</div>
              </div>
            </div>
          )}
          {desc && (
            <div>
              <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>📝 Descripción</div>
              <p style={{ fontFamily:'Nunito', fontSize:13, color:'#555', lineHeight:1.7, margin:0 }}>{desc.length > 500 ? desc.slice(0, 500) + '...' : desc}</p>
            </div>
          )}
          {capacity && <div style={{ fontFamily:'Nunito', fontSize:12, color:'#AAA' }}>👥 Capacidad: {capacity} personas</div>}
          {tags.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {tags.map((t,i) => <span key={i} style={{ background:'#F5F0EB', border:`1.5px solid ${C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:10, padding:'3px 9px', color:'#888' }}>{t.display_name || t}</span>)}
            </div>
          )}
        </div>
        <div style={{ padding:'14px 20px', borderTop:`2px solid ${C.grayLt}`, display:'flex', gap:8, flexShrink:0 }}>
          {(directionsUrl || venue) && (
            <a href={directionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`}
              target="_blank" rel="noopener noreferrer" className="btn3d"
              style={{ flex:1, background:'#7EC8E3', color:'#1A1A1A', fontSize:13, padding:'11px', textDecoration:'none', justifyContent:'center' }}>
              🗺 Cómo llegar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Unsplash image by keyword ─────────────────────────────────────────────────
function getUnsplashImage(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('cine') || t.includes('película') || t.includes('film'))       return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=60';
  if (t.includes('música') || t.includes('concierto') || t.includes('music'))   return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=60';
  if (t.includes('arte') || t.includes('exposición') || t.includes('galería'))  return 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=60';
  if (t.includes('teatro') || t.includes('obra') || t.includes('danza'))        return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500&q=60';
  if (t.includes('festival') || t.includes('feria') || t.includes('celebr'))    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=60';
  if (t.includes('comida') || t.includes('gastro') || t.includes('food'))       return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=60';
  if (t.includes('deporte') || t.includes('running') || t.includes('maratón'))  return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=60';
  if (t.includes('charla') || t.includes('conferencia') || t.includes('taller'))return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=60';
  if (t.includes('noche') || t.includes('bar') || t.includes('club'))           return 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=500&q=60';
  return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&q=60';
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, userLocation, idx, onClick }) {
  const [hovered, setHovered] = useState(false);
  const cat      = getCat(event);
  const venueLat = event.venue?.latitude;
  const venueLng = event.venue?.longitude;
  const dist     = userLocation && venueLat ? distKm(userLocation.lat, userLocation.lng, parseFloat(venueLat), parseFloat(venueLng)) : null;
  const title    = event.name?.text || event.title || 'Sin título';
  const dateStr  = formatDateShort(event.start?.local || event.date);
  const venue    = event.venue?.name || event.location || null;
  const address  = event.venue?.address?.localized_address_display || null;
  const isFree   = event.is_free || event.detected_price === 'gratis';
  const price    = event.detected_price && event.detected_price !== 'gratis' ? event.detected_price : null;
  const bgImage  = getUnsplashImage(title);

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:'white', border:`2px solid ${hovered?C.ink:C.grayLt}`, borderRadius:16, overflow:'hidden', cursor:'pointer', boxShadow:hovered?`0 4px 0 ${C.ink}`:`0 2px 0 ${C.grayLt}`, transition:'all 0.18s', transform:hovered?'translateY(-2px)':'none', animation:`popIn 0.35s ease ${idx*0.05}s both`, display:'flex', flexDirection:'column', minHeight:220 }}>
      <div style={{ position:'relative', width:'100%', height:160, overflow:'hidden', flexShrink:0 }}>
        <img src={bgImage} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'blur(3px) brightness(0.65)', transform:'scale(1.1)' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 55%)' }}/>
        <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
          <div style={{ fontFamily:'Fredoka One', fontSize:16, color:'white', lineHeight:1.3, textShadow:'0 2px 6px rgba(0,0,0,0.8)' }}>{title}</div>
          {dateStr && <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.9)', marginTop:4, textShadow:'0 1px 4px rgba(0,0,0,0.8)' }}>📅 {dateStr}</div>}
        </div>
        {isFree  && <div style={{ position:'absolute', top:10, right:10 }}><span style={{ background:'#B5DEC8', border:'1.5px solid white', fontFamily:'Nunito', fontWeight:800, fontSize:10, padding:'3px 10px', borderRadius:20 }}>GRATIS</span></div>}
        {!isFree && price && <div style={{ position:'absolute', top:10, right:10 }}><span style={{ background:'#FFE4A0', border:'1.5px solid white', fontFamily:'Nunito', fontWeight:800, fontSize:10, padding:'3px 10px', borderRadius:20 }}>🎟️ {price}</span></div>}
      </div>
      <div style={{ padding:'12px 14px', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
        {dist && <span style={{ background:cat.bg, border:`1.5px solid ${C.ink}`, fontFamily:'Nunito', fontWeight:800, fontSize:10, padding:'2px 9px', borderRadius:20, alignSelf:'flex-start' }}>{dist} km</span>}
        {venue && <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>📍 {venue}{address?` · ${address}`:''}</div>}
        <div style={{ marginTop:'auto', paddingTop:4, fontFamily:'Nunito', fontWeight:700, fontSize:11, color:C.blue }}>Ver detalles →</div>
      </div>
    </div>
  );
}

// ── Main EventsPage ───────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [catFilter, setCatFilter]         = useState('all');
  const [periodFilter, setPeriodFilter]   = useState('all');
  const [sortBy, setSortBy]               = useState('date');
  const [maxDist, setMaxDist]             = useState(null);
  const [lastFetch, setLastFetch]         = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { location, loading:geoLoad, getLocation } = useGeolocation();

  
const fetchEvents = useCallback(async () => {
  setLoading(true); 
  setError(null);
  
  try {
    // Ejecutamos ambas peticiones al mismo tiempo para ganar velocidad
    const [resArchivo, resGuateCom] = await Promise.all([
      fetch(`${API}/events/archivogt`).then(r => r.ok ? r.json() : []),
      fetch(`${API}/events/guatecom`).then(r => r.ok ? r.json() : [])
    ]);

    // Procesamos los datos de ArchivoGT
    const agt = resArchivo.map(e => {
      const detectedPrice = extractPrice(e.description);
      return {
        id: `agt-${e.id}`, 
        title: e.title,
        date: e.date,
        start: e.start,
        end: e.end,
        location: e.location,
        description: { text: e.description },
        url: e.url,
        source: 'archivogt',
        is_free: detectedPrice === 'gratis',
        detected_price: detectedPrice,
        venue: e.coords ? { name: e.location, latitude: e.coords.latitude, longitude: e.coords.longitude } : null,
      };
    });

    // Procesamos los datos de Guatemala.com
    const gcom = resGuateCom.map((e, idx) => {
      const detectedPrice = extractPrice(e.description);
      return {
        id: `gcom-${idx}`, 
        title: e.title,
        date: e.date,
        start: { local: e.date },
        location: e.location,
        description: { text: e.description },
        image: e.image, 
        url: e.url,
        source: 'guatemala_com',
        is_free: detectedPrice === 'gratis',
        detected_price: detectedPrice,
        venue: { name: e.location },
      };
    });

    const allEvents = [...agt, ...gcom];

    if (allEvents.length === 0) {
      setError('No se encontraron eventos en ninguna de las fuentes.');
    }

    setEvents(allEvents);
    setLastFetch(new Date());

  } catch (err) {
    console.error(err);
    setError('Error al conectar con el servidor. Asegúrate de que "node index.js" esté corriendo.');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const categories = ['all', ...new Set(events.filter(e=>e.source==='eventbrite').map(e=>e.category?.name).filter(Boolean))];

  const inPeriod = (e) => {
    const d = new Date(e.start?.local || e.date || 0), now = new Date();
    if (periodFilter === 'today') return d.toDateString() === now.toDateString();
    if (periodFilter === 'week')  { const end = new Date(now); end.setDate(now.getDate()+7);   return d>=now && d<=end; }
    if (periodFilter === 'month') { const end = new Date(now); end.setMonth(now.getMonth()+1); return d>=now && d<=end; }
    return true;
  };

  const getEventDist = (e) => {
    if (!location || !e.venue?.latitude) return null;
    return parseFloat(distKm(location.lat, location.lng, parseFloat(e.venue.latitude), parseFloat(e.venue.longitude)));
  };

  const filtered = events
    .filter(e => catFilter === 'all' || e.category?.name === catFilter)
    .filter(inPeriod)
    .filter(e => {
      if (!maxDist || !location) return true;
      const d = getEventDist(e);
      return d !== null && d <= maxDist;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') { return (getEventDist(a)??9999) - (getEventDist(b)??9999); }
      return new Date(a.start?.local || a.date || 0) - new Date(b.start?.local || b.date || 0);
    });

  return (
    <>
      <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12, overflow:'hidden' }}>
        <div className="card-ink" style={{ padding:'14px 18px', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
            <div>
              <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>📅 Eventos en Guatemala</div>
              <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', marginTop:2 }}>
                {loading ? 'Cargando...' : `${filtered.length} evento${filtered.length!==1?'s':''}`}
                {!loading && lastFetch && ` · Actualizado ${lastFetch.toLocaleTimeString('es-GT', {hour:'2-digit', minute:'2-digit'})}`}
              </div>
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>

              <button onClick={fetchEvents} disabled={loading} className="btn3d" style={{ background:'#7EC8E3', color:C.ink, fontSize:12, padding:'7px 13px' }}>
                {loading?'⏳':'🔄'} Actualizar
              </button>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap', alignItems:'center' }}>
          {[{id:'all',label:'Todos'},{id:'today',label:'Hoy'},{id:'week',label:'7 días'},{id:'month',label:'Mes'}].map(p => (
            <button key={p.id} onClick={() => setPeriodFilter(p.id)}
              style={{ background:periodFilter===p.id?C.ink:'white', border:`2px solid ${periodFilter===p.id?C.ink:C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:11, padding:'5px 12px', cursor:'pointer', color:periodFilter===p.id?'white':C.gray, transition:'all 0.15s' }}>
              {p.label}
            </button>
          ))}
          {categories.length > 1 && (
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
              style={{ background:'white', border:`2px solid ${C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:11, padding:'5px 12px', cursor:'pointer', outline:'none' }}>
              <option value="all">🏷 Categoría</option>
              {categories.filter(c=>c!=='all').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select
            value={maxDist || ''}
            onChange={e => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              if (val && !location) getLocation();
              setMaxDist(val);
              setSortBy(val ? 'distance' : 'date');
            }}
            style={{ background: maxDist ? '#7EC8E3' : 'white', border:`2px solid ${maxDist ? C.ink : C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:11, padding:'5px 12px', cursor:'pointer', outline:'none', boxShadow: maxDist ? `0 2px 0 ${C.ink}` : `0 1px 0 ${C.grayLt}` }}>
            <option value="">📍 Distancia</option>
            <option value="5">📍 5 km</option>
            <option value="10">📍 10 km</option>
            <option value="20">📍 20 km</option>
            <option value="50">📍 50 km</option>
          </select>
        </div>

        {error && !loading && (
          <div style={{ background:'#FFF5F5', border:'2px solid #FFBABA', borderRadius:14, padding:'14px 16px', flexShrink:0 }}>
            <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:13, color:'#C05050', marginBottom:4 }}>⚠️ Error de conexión</div>
            <div style={{ fontFamily:'Nunito', fontSize:12, color:'#888', whiteSpace:'pre-line' }}>{error}</div>
          </div>
        )}
        {loading && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
            <div style={{ fontSize:48, animation:'bounce 0.5s infinite alternate' }}>📅</div>
            <div style={{ fontFamily:'Fredoka One', fontSize:18, color:'#C8C0B4' }}>Cargando eventos...</div>
            <div style={{ fontFamily:'Nunito', fontSize:12, color:'#D0C8C0' }}>Calculando distancias desde el servidor</div>
          </div>
        )}
        {!loading && filtered.length === 0 && !error && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, textAlign:'center' }}>
            <div style={{ fontSize:52, animation:'float 3s ease-in-out infinite' }}>🔍</div>
            <div style={{ fontFamily:'Fredoka One', fontSize:18, color:'#C8C0B4' }}>Sin eventos con estos filtros</div>
            <button onClick={() => { setPeriodFilter('all'); setCatFilter('all'); setMaxDist(null); setSortBy('date'); }} className="btn3d"
              style={{ background:'#7EC8E3', color:C.ink, fontSize:13, padding:'10px 20px' }}>
              Limpiar filtros
            </button>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12, alignContent:'start', paddingBottom:8 }}>
            {filtered.map((event, i) => (
              <EventCard key={event.id||event.link||i} event={event} userLocation={location} idx={i} onClick={() => setSelectedEvent(event)}/>
            ))}
          </div>
        )}
      </div>
      {selectedEvent && <EventDetailModal event={selectedEvent} userLocation={location} onClose={() => setSelectedEvent(null)}/>}
    </>
  );
}