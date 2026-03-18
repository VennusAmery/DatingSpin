import React, { useState, useEffect } from 'react';
import { searchPlaces, distKm } from '../../utils/places';
import { C } from '../../utils/theme';
import { RADIUS_OPTIONS } from '../../data';

export default function PlacesList({ osmType, userLocation, onNeedLocation, cardColor, iconBg, label }) {
  const [places, setPlaces]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [radius, setRadius]   = useState(5);

  useEffect(() => {
    if (!userLocation) return;
    setLoading(true); setError(null);
    searchPlaces({ lat:userLocation.lat, lng:userLocation.lng, radiusKm:radius, type:osmType })
      .then(r => { setPlaces(r); if(!r.length) setError('Sin resultados. Prueba ampliar el radio 🔍'); })
      .catch(() => setError('Error de red. Verifica tu conexión 🌐'))
      .finally(() => setLoading(false));
  }, [userLocation, radius, osmType]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, height:'100%' }}>
      {/* Radius chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
        <span style={{ fontFamily:'Nunito', fontSize:11, fontWeight:800, color:'#AAA', alignSelf:'center', marginRight:2 }}>📍 Radio:</span>
        {RADIUS_OPTIONS.map(r => (
          <button key={r} onClick={()=>setRadius(r)}
            style={{ background:radius===r?'#7EC8E3':'white', border:`2px solid ${radius===r?C.ink:C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, padding:'4px 11px', cursor:'pointer', transition:'all 0.15s', boxShadow:radius===r?`0 2px 0 ${C.ink}`:`0 2px 0 ${C.grayLt}` }}>
            {r}km
          </button>
        ))}
      </div>

      {/* No location */}
      {!userLocation && (
        <div style={{ border:`2px dashed ${C.blue}`, borderRadius:16, padding:'18px', textAlign:'center' }}>
          <p style={{ fontFamily:'Nunito', fontSize:13, fontWeight:700, color:'#888', marginBottom:12 }}>
            📍 Activa tu ubicación para ver lugares cercanos
          </p>
          <button className="btn3d" onClick={onNeedLocation}
            style={{ background:'#7EC8E3', color:C.ink, fontSize:13, padding:'9px 20px' }}>
            Compartir ubicación
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:28, animation:'bounce 0.5s infinite alternate' }}>🔍</div>
          <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:12, color:'#888', marginTop:8 }}>Buscando lugares... ✨</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:12, color:'#C05050', background:'#FFF5F5', border:'1.5px solid #FFBABA', borderRadius:12, padding:'10px 14px' }}>{error}</div>
      )}

      {!loading && places.length > 0 && (
        <div style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:7 }}>
          <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', flexShrink:0 }}>
            {places.length} lugares encontrados
          </div>
          {places.map((p,i) => {
            const dist = userLocation ? distKm(userLocation.lat, userLocation.lng, p.lat, p.lng) : null;
            const dirUrl = userLocation
              ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${p.lat},${p.lng}&travelmode=driving`
              : p.mapsUrl;
            return (
              <div key={p.id} className="card"
                style={{ padding:'10px 13px', display:'flex', gap:10, alignItems:'center', flexShrink:0, animation:`popIn 0.3s ease ${i*0.05}s both`, transition:'all 0.15s', cursor:'default' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=cardColor; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform=''; }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:13, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  {p.cuisine && <div style={{ fontFamily:'Nunito', fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.05em' }}>{p.cuisine}</div>}
                  <div style={{ fontSize:11, marginTop:2 }}>
                    {'⭐'.repeat(Math.round(p.rating))} <span style={{ fontFamily:'Nunito', fontSize:11, color:'#888' }}>{p.rating.toFixed(1)}</span>
                    {p.openNow !== null && <span style={{ marginLeft:8, fontSize:10, color:p.openNow?'#3A9A5C':'#C05050', fontFamily:'Nunito', fontWeight:700 }}>{p.openNow?'● Abierto':'● Cerrado'}</span>}
                  </div>
                </div>
                {dist !== null && (
                  <span style={{ background:iconBg, border:'1.5px solid #1A1A1A', borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, color:C.ink, padding:'2px 9px', whiteSpace:'nowrap', flexShrink:0 }}>
                    {dist<1?`${(dist*1000).toFixed(0)}m`:`${dist.toFixed(1)}km`}
                  </span>
                )}
                <a href={dirUrl} target="_blank" rel="noopener noreferrer" className="btn3d"
                  style={{ background:'#7EC8E3', color:C.ink, fontSize:10, padding:'5px 10px', borderRadius:20, flexShrink:0, boxShadow:`0 2px 0 ${C.ink}` }}>
                  🗺 Ir
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
