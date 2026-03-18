import React, { useState } from 'react';
import { CINEPOLIS_MOVIES } from '../../data';
import { C } from '../../utils/theme';

function addToGCal(movie, showtime) {
  const today = new Date();
  const [h,m] = showtime.split(':').map(Number);
  const start = new Date(today); start.setHours(h,m,0,0);
  const end = new Date(start.getTime()+2*60*60*1000);
  const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🎬 '+movie.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent('Cinépolis Guatemala\n'+movie.synopsis)}&location=${encodeURIComponent('Cinépolis Guatemala')}`, '_blank');
}

export default function CinemaView() {
  const [sel, setSel] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [genre, setGenre] = useState('Todos');
  const genres = ['Todos', ...new Set(CINEPOLIS_MOVIES.map(m=>m.genre))];
  const filtered = genre==='Todos' ? CINEPOLIS_MOVIES : CINEPOLIS_MOVIES.filter(m=>m.genre===genre);

  if (sel) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
      <button onClick={()=>{setSel(null);setSelTime(null);}} style={{ background:'transparent',border:'none',cursor:'pointer',fontFamily:'Nunito',fontWeight:800,fontSize:13,color:C.blue,display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>← Cartelera</button>
      <div className="card-ink" style={{ overflow:'hidden', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ background:sel.color, padding:'16px 18px', borderBottom:`2px solid ${C.ink}`, flexShrink:0 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ fontSize:38 }}>{sel.emoji}</span>
            <div>
              <div style={{ fontFamily:'Fredoka One', fontSize:17, color:C.ink, lineHeight:1.2 }}>{sel.title}</div>
              <div style={{ fontFamily:'Nunito', fontSize:11, color:'#555', marginTop:3 }}>{sel.genre} • {sel.rating} • {sel.duration}</div>
              <div style={{ fontSize:13 }}>{'⭐'.repeat(Math.round(sel.stars))} <span style={{ fontFamily:'Nunito',fontSize:11,color:'#888' }}>{sel.stars}</span></div>
            </div>
          </div>
          <p style={{ fontFamily:'Nunito', fontSize:12, color:'#555', lineHeight:1.6, marginTop:10 }}>{sel.synopsis}</p>
        </div>
        <div style={{ padding:'14px 18px', overflowY:'auto', flex:1 }}>
          <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>🕐 Horarios hoy</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            {sel.showtimes.map(t=>(
              <button key={t} onClick={()=>setSelTime(selTime===t?null:t)}
                style={{ background:selTime===t?'#7EC8E3':'white', border:`2px solid ${selTime===t?C.ink:C.grayLt}`, borderRadius:10, fontFamily:'Nunito', fontWeight:800, fontSize:14, padding:'7px 14px', cursor:'pointer', boxShadow:selTime===t?`0 2px 0 ${C.ink}`:`0 2px 0 ${C.grayLt}`, transition:'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>
          {selTime && (
            <div style={{ background:'#EDFAF3', border:'2px solid #B5DEC8', borderRadius:12, padding:'12px 14px', marginBottom:12, animation:'popIn 0.3s ease both' }}>
              <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:12, color:'#3A9A5C', marginBottom:10 }}>✅ {sel.title} a las {selTime}</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button className="btn3d" onClick={()=>addToGCal(sel,selTime)} style={{ background:'#4285F4',color:'white',fontSize:12,padding:'8px 14px' }}>📅 Google Cal</button>
                <a href={sel.cinepolis} target="_blank" rel="noopener noreferrer" className="btn3d" style={{ background:'#FFE4A0',color:C.ink,fontSize:12,padding:'8px 14px',textDecoration:'none' }}>🎟️ Entradas</a>
              </div>
            </div>
          )}
          {/* Checklist */}
          <Checklist items={['¿Reservaron asientos?','¿Llevan tarjeta o efectivo?','¿Snacks o los compran allá?','¿Se pusieron de acuerdo en el horario?']} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
        {genres.map(g=>(
          <button key={g} onClick={()=>setGenre(g)}
            style={{ background:genre===g?'#7EC8E3':'white', border:`2px solid ${genre===g?C.ink:C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, padding:'4px 12px', cursor:'pointer', boxShadow:genre===g?`0 2px 0 ${C.ink}`:`0 2px 0 ${C.grayLt}`, transition:'all 0.15s' }}>
            {g}
          </button>
        ))}
      </div>
      <div style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:7 }}>
        {filtered.map((m,i)=>(
          <div key={m.id} onClick={()=>setSel(m)} className="card"
            style={{ padding:'11px 14px', display:'flex', gap:12, alignItems:'center', cursor:'pointer', transition:'all 0.15s', animation:`popIn 0.3s ease ${i*0.06}s both` }}
            onMouseEnter={e=>{e.currentTarget.style.background=m.color;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.transform='';}}>
            <div style={{ width:44,height:44,background:m.color,border:'2px solid #1A1A1A',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{m.emoji}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:'Nunito',fontWeight:800,fontSize:13,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.title}</div>
              <div style={{ fontFamily:'Nunito',fontSize:11,color:'#888' }}>{m.genre} • {m.rating} • {m.duration}</div>
              <div style={{ fontSize:11 }}>{'⭐'.repeat(Math.round(m.stars))}</div>
            </div>
            <span style={{ fontFamily:'Nunito',fontSize:12,color:'#AAA',flexShrink:0 }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Checklist({ items }) {
  const [checked, setChecked] = useState({});
  return (
    <div style={{ background:'#FFF8EC', border:'2px solid #FFE4A0', borderRadius:12, padding:'12px 14px' }}>
      <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:11, color:'#B8860B', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Check-list de Docky 🐾</div>
      {items.map((item,i)=>(
        <div key={i} onClick={()=>setChecked(p=>({...p,[i]:!p[i]}))} style={{ display:'flex',gap:8,alignItems:'center',padding:'5px 0',cursor:'pointer',borderBottom:i<items.length-1?'1px solid #FFE4A0':'none' }}>
          <div style={{ width:20,height:20,background:checked[i]?'#7EC8E3':'white',border:'2px solid #1A1A1A',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,transition:'all 0.15s' }}>{checked[i]?'✓':''}</div>
          <span style={{ fontFamily:'Nunito',fontSize:12,fontWeight:600,color:checked[i]?'#888':C.ink,textDecoration:checked[i]?'line-through':'none' }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
