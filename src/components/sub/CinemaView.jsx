import React, { useState, useEffect } from 'react';
import { distKm } from '../../utils/places';
import { C } from '../../utils/theme';

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYTAxOTIzZGJmNDU4YWMyNjU4NGFhNmZhZDYyYTU0YyIsIm5iZiI6MTc3Mzc5NDc1MS43MDMsInN1YiI6IjY5YjlmNWJmM2QyMWUxZWEwMjNiYTg4OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.s2_abrfQFX64imStrzGyuqtSYpLuhJmmzmPq7Tk6qj0';
const TMDB = (path) => fetch(`https://api.themoviedb.org/3${path}`, {
  headers: { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
}).then(r => r.json());

const IMG = (path, size='w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// Search nearby cinemas via Overpass
async function searchCinemas(lat, lng, radiusM = 15000) {
  const q = `[out:json][timeout:20];(node[amenity=cinema](around:${radiusM},${lat},${lng});way[amenity=cinema](around:${radiusM},${lat},${lng}););out center 10;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:`data=${encodeURIComponent(q)}` });
  const d = await r.json();
  return (d.elements||[]).filter(e=>e.tags?.name).map(e=>({
    id:`${e.type}-${e.id}`,
    name: e.tags.name,
    lat: e.lat??e.center?.lat,
    lng: e.lon??e.center?.lon,
    address: [e.tags['addr:street'],e.tags['addr:housenumber']].filter(Boolean).join(' ')||null,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${e.lat??e.center?.lat},${e.lon??e.center?.lon}`,
    directionsUrl: (uLat,uLng) => `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${e.lat??e.center?.lat},${e.lon??e.center?.lon}&travelmode=driving`,
  }));
}

function addToGCal(movie, cinema) {
  const start = new Date(); start.setHours(20,0,0,0);
  const end   = new Date(start.getTime() + (movie.runtime||120)*60*1000);
  const fmt   = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🎬 '+movie.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(movie.overview||'')}&location=${encodeURIComponent(cinema?.name||'Cine')}`, '_blank');
}

// ── Movie detail view ─────────────────────────────────────────────────────────
function MovieDetail({ movie, cinema, userLocation, onBack }) {
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast]       = useState([]);

  useEffect(() => {
    TMDB(`/movie/${movie.id}/videos?language=es`).then(d => {
      const v = d.results?.find(v => v.type==='Trailer' && v.site==='YouTube')
             || d.results?.[0];
      setTrailer(v?.key || null);
    });
    TMDB(`/movie/${movie.id}/credits`).then(d => {
      setCast((d.cast||[]).slice(0,6));
    });
  }, [movie.id]);

  const rating  = movie.vote_average?.toFixed(1);
  const year    = movie.release_date?.slice(0,4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60}m` : null;
  const poster  = IMG(movie.poster_path);

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:0 }}>
      <button onClick={onBack} style={{ background:'transparent',border:'none',cursor:'pointer',fontFamily:'Nunito',fontWeight:800,fontSize:13,color:C.blue,display:'flex',alignItems:'center',gap:5,padding:'0 0 10px',flexShrink:0 }}>← Cartelera</button>

      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
        {/* Hero */}
        <div style={{ display:'flex', gap:14, flexShrink:0 }}>
          {poster && <img src={poster} alt="" style={{ width:90, borderRadius:14, border:'2.5px solid #1A1A1A', objectFit:'cover', flexShrink:0, alignSelf:'flex-start' }}/>}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Fredoka One', fontSize:18, color:C.ink, lineHeight:1.2 }}>{movie.title}</div>
            {movie.original_title !== movie.title && (
              <div style={{ fontFamily:'Nunito', fontSize:11, color:'#AAA', marginTop:2 }}>{movie.original_title}</div>
            )}
            <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', marginTop:5, display:'flex', flexWrap:'wrap', gap:6 }}>
              {year && <span style={{ background:'#F5F0EB', border:`1.5px solid ${C.grayLt}`, borderRadius:20, padding:'2px 8px' }}>{year}</span>}
              {runtime && <span style={{ background:'#F5F0EB', border:`1.5px solid ${C.grayLt}`, borderRadius:20, padding:'2px 8px' }}>⏱ {runtime}</span>}
              {rating && <span style={{ background:'#FFE4A0', border:'1.5px solid #1A1A1A', borderRadius:20, padding:'2px 8px', fontWeight:700 }}>⭐ {rating}</span>}
            </div>
            {(movie.genres||[]).length > 0 && (
              <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:4 }}>
                {movie.genres.map(g => (
                  <span key={g.id} style={{ background:'#EEF5FF', border:'1.5px solid #A8C4FF', borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:10, padding:'2px 8px', color:'#2255CC' }}>{g.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Synopsis */}
        {movie.overview && (
          <div style={{ background:'#F9F5F0', border:`1.5px solid ${C.grayLt}`, borderRadius:12, padding:'12px 14px' }}>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Sinopsis</div>
            <p style={{ fontFamily:'Nunito', fontSize:13, color:'#444', lineHeight:1.7, margin:0 }}>{movie.overview}</p>
          </div>
        )}

        {/* Trailer */}
        {trailer && (
          <a href={`https://www.youtube.com/watch?v=${trailer}`} target="_blank" rel="noopener noreferrer"
            className="btn3d"
            style={{ background:'#FF0000', color:'white', fontSize:13, padding:'11px 18px', textDecoration:'none', display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
            ▶ Ver trailer en YouTube
          </a>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Reparto principal</div>
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
              {cast.map(p => (
                <div key={p.id} style={{ flexShrink:0, textAlign:'center', width:64 }}>
                  {p.profile_path
                    ? <img src={IMG(p.profile_path,'w185')} alt="" style={{ width:52, height:52, borderRadius:50, objectFit:'cover', border:'2px solid #1A1A1A', display:'block', margin:'0 auto 4px' }}/>
                    : <div style={{ width:52, height:52, borderRadius:50, background:'#F5F0EB', border:'2px solid #1A1A1A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, margin:'0 auto 4px' }}>👤</div>
                  }
                  <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:9, color:C.ink, lineHeight:1.3 }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cinema + actions */}
        {cinema && (
          <div style={{ background:'#EEF5FF', border:'2px solid #A8C4FF', borderRadius:14, padding:'12px 14px' }}>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#2255CC', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>🎭 Cine seleccionado</div>
            <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:14, color:C.ink }}>{cinema.name}</div>
            {cinema.address && <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', marginTop:2 }}>📍 {cinema.address}</div>}
            {userLocation && (
              <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', marginTop:2 }}>
                📏 {distKm(userLocation.lat, userLocation.lng, cinema.lat, cinema.lng).toFixed(1)} km
              </div>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', paddingBottom:8 }}>
          {cinema && userLocation && (
            <a href={cinema.directionsUrl(userLocation.lat, userLocation.lng)} target="_blank" rel="noopener noreferrer"
              className="btn3d" style={{ background:'#7EC8E3', color:C.ink, fontSize:12, padding:'9px 16px', textDecoration:'none', flex:1, justifyContent:'center' }}>
              🗺 Cómo llegar
            </a>
          )}
          <button className="btn3d" onClick={() => addToGCal(movie, cinema)}
            style={{ background:'#4285F4', color:'white', fontSize:12, padding:'9px 16px', flex:1 }}>
            📅 Google Cal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main CinemaView ───────────────────────────────────────────────────────────
export default function CinemaView({ userLocation, onNeedLocation }) {
  const [movies, setMovies]     = useState([]);
  const [cinemas, setCinemas]   = useState([]);
  const [selCinema, setSelCinema] = useState(null);
  const [selMovie, setSelMovie] = useState(null);
  const [loadingM, setLoadingM] = useState(true);
  const [loadingC, setLoadingC] = useState(false);
  const [genre, setGenre]       = useState('Todos');
  const [errorM, setErrorM]     = useState(null);

  // Load now-playing movies from TMDb
  useEffect(() => {
    setLoadingM(true);
    TMDB('/movie/now_playing?language=es-419&region=GT&page=1')
      .then(d => {
        const list = d.results || [];
        // Fetch runtime for each (in batches of 5)
        const detailed = list.slice(0,12).map(m =>
          TMDB(`/movie/${m.id}?language=es-419`).then(detail => detail).catch(() => m)
        );
        Promise.all(detailed).then(full => { setMovies(full); setLoadingM(false); });
      })
      .catch(() => { setErrorM('No se pudo cargar la cartelera'); setLoadingM(false); });
  }, []);

  // Search nearby cinemas when location available
  useEffect(() => {
    if (!userLocation) return;
    setLoadingC(true);
    searchCinemas(userLocation.lat, userLocation.lng)
      .then(c => { setCinemas(c); setLoadingC(false); })
      .catch(() => setLoadingC(false));
  }, [userLocation]);

  if (selMovie) return <MovieDetail movie={selMovie} cinema={selCinema} userLocation={userLocation} onBack={() => setSelMovie(null)}/>;

  const genres = ['Todos', ...new Set(movies.flatMap(m => (m.genres||[]).map(g=>g.name)))];
  const filtered = genre==='Todos' ? movies : movies.filter(m => (m.genres||[]).some(g=>g.name===genre));

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:10 }}>

      {/* Cinema selector */}
      <div style={{ flexShrink:0 }}>
        <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
          🎭 Cine más cercano
        </div>
        {!userLocation ? (
          <button className="btn3d" onClick={onNeedLocation}
            style={{ background:'#7EC8E3', color:C.ink, fontSize:12, padding:'8px 16px', width:'100%' }}>
            📍 Activar ubicación para ver cines cercanos
          </button>
        ) : loadingC ? (
          <div style={{ fontFamily:'Nunito', fontSize:12, color:'#AAA', padding:'8px 0' }}>🔍 Buscando cines...</div>
        ) : cinemas.length > 0 ? (
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
            {cinemas.map(c => {
              const dist = distKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
              const active = selCinema?.id === c.id;
              return (
                <button key={c.id} onClick={() => setSelCinema(active ? null : c)}
                  style={{ flexShrink:0, background:active?'#7EC8E3':'white', border:`2px solid ${active?C.ink:C.grayLt}`, borderRadius:12, padding:'7px 12px', cursor:'pointer', transition:'all 0.15s', textAlign:'left', boxShadow:active?`0 2px 0 ${C.ink}`:`0 1px 0 ${C.grayLt}` }}>
                  <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:12, color:C.ink, whiteSpace:'nowrap' }}>{c.name}</div>
                  <div style={{ fontFamily:'Nunito', fontSize:10, color:'#888' }}>{dist.toFixed(1)} km</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ fontFamily:'Nunito', fontSize:12, color:'#AAA' }}>No se encontraron cines a 15km</div>
        )}
      </div>

      {/* Genre filter */}
      {genres.length > 1 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
          {genres.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              style={{ background:genre===g?'#7EC8E3':'white', border:`2px solid ${genre===g?C.ink:C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, padding:'4px 12px', cursor:'pointer', transition:'all 0.15s', boxShadow:genre===g?`0 2px 0 ${C.ink}`:`0 1px 0 ${C.grayLt}` }}>
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Movies list */}
      {loadingM ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
          <div style={{ fontSize:36, animation:'bounce 0.5s infinite alternate' }}>🎬</div>
          <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:13, color:'#AAA' }}>Cargando cartelera...</div>
        </div>
      ) : errorM ? (
        <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:12, color:'#C05050', background:'#FFF5F5', border:'1.5px solid #FFBABA', borderRadius:12, padding:'10px 14px' }}>{errorM}</div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>
            {filtered.length} películas en cartelera · TMDb
          </div>
          {filtered.map((m, i) => {
            const poster  = IMG(m.poster_path, 'w92');
            const rating  = m.vote_average?.toFixed(1);
            const year    = m.release_date?.slice(0,4);
            const runtime = m.runtime ? `${Math.floor(m.runtime/60)}h ${m.runtime%60}m` : null;
            return (
              <div key={m.id} onClick={() => setSelMovie(m)}
                className="card"
                style={{ padding:'10px 12px', display:'flex', gap:12, alignItems:'center', cursor:'pointer', transition:'all 0.15s', animation:`popIn 0.3s ease ${i*0.04}s both` }}
                onMouseEnter={e => { e.currentTarget.style.background='#EEF5FF'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.transform=''; }}>
                {poster
                  ? <img src={poster} alt="" style={{ width:44, height:64, objectFit:'cover', borderRadius:8, border:'2px solid #1A1A1A', flexShrink:0 }}/>
                  : <div style={{ width:44, height:64, background:'#F5F0EB', borderRadius:8, border:'2px solid #1A1A1A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🎬</div>
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:13, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                  <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', marginTop:2 }}>
                    {year}{runtime ? ` · ${runtime}` : ''}
                  </div>
                  <div style={{ marginTop:4, display:'flex', gap:4, flexWrap:'wrap' }}>
                    {(m.genres||[]).slice(0,2).map(g => (
                      <span key={g.id} style={{ background:'#EEF5FF', border:'1px solid #A8C4FF', borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:9, padding:'1px 6px', color:'#2255CC' }}>{g.name}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  {rating && <span style={{ background:'#FFE4A0', border:'1.5px solid #1A1A1A', borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, padding:'2px 8px' }}>⭐ {rating}</span>}
                  <span style={{ fontFamily:'Nunito', fontSize:11, color:'#CCC' }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}