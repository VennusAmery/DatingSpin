import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../../hooks';
import { BASE_ACTIVITIES, FEELINGS } from '../../data';
import { C } from '../../utils/theme';

const EMPTY = { activityId:'', title:'', date:new Date().toISOString().split('T')[0], rating:5, feeling:'', review:'', changes:'', photo:null };

export default function DiaryPage() {
  const [entries, setEntries] = useLocalStorage('spindocky-diary', []);
  const [view, setView]   = useState('list'); // 'list' | 'add' | 'detail'
  const [form, setForm]   = useState(EMPTY);
  const [detail, setDetail] = useState(null);
  const fileRef = useRef();

  /* ── helpers ── */
  const save = () => {
    if (!form.activityId || !form.title.trim()) return;
    setEntries(prev => [{ id:Date.now(), ...form, createdAt:new Date().toISOString() }, ...prev]);
    setForm(EMPTY); setView('list');
  };

  const remove = id => { setEntries(prev => prev.filter(e => e.id !== id)); if (detail?.id===id) setView('list'); };

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photo:ev.target.result }));
    reader.readAsDataURL(file);
  };

  const topAct = (() => {
    const map = {};
    entries.forEach(e => { if (!map[e.activityId]) map[e.activityId]=[]; map[e.activityId].push(e.rating); });
    const best = Object.entries(map).sort((a,b)=>(b[1].reduce((s,v)=>s+v,0)/b[1].length)-(a[1].reduce((s,v)=>s+v,0)/a[1].length))[0];
    return best ? BASE_ACTIVITIES.find(a=>a.id===best[0]) : null;
  })();

  /* ── Detail view ── */
  if (view==='detail' && detail) {
    const act = BASE_ACTIVITIES.find(a=>a.id===detail.activityId);
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <button onClick={()=>setView('list')} style={{ background:'transparent',border:'none',cursor:'pointer',fontFamily:'Nunito',fontWeight:800,fontSize:13,color:C.blue,display:'flex',alignItems:'center',gap:5 }}>← Diario</button>
          <button onClick={()=>{ remove(detail.id); setView('list'); }} style={{ background:'transparent',border:'none',cursor:'pointer',fontFamily:'Nunito',fontWeight:700,fontSize:12,color:'#C05050' }}>🗑 Eliminar</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
          {/* Hero */}
          {detail.photo && <img src={detail.photo} alt="" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:16, border:'3px solid #1A1A1A', flexShrink:0 }}/>}
          <div style={{ background:act?.cardColor||'#F5F0EB', border:'2.5px solid #1A1A1A', borderRadius:18, padding:'16px 18px', boxShadow:'0 4px 0 #1A1A1A', flexShrink:0 }}>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>{detail.date} • {act?.name}</div>
            <div style={{ fontFamily:'Fredoka One', fontSize:24, color:C.ink, lineHeight:1.2, marginBottom:6 }}>{detail.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>{'⭐'.repeat(detail.rating)}</span>
              <span style={{ fontFamily:'Nunito', fontSize:12, color:'#888' }}>{detail.rating}/5</span>
              {detail.feeling && <span style={{ fontFamily:'Nunito', fontSize:13, fontWeight:700, background:'white', border:`2px solid ${act?.cardBorder||C.grayLt}`, borderRadius:20, padding:'2px 10px' }}>{detail.feeling}</span>}
            </div>
          </div>

          {detail.review && (
            <Section title="📝 Reseña" color="#EEF5FF" border="#A8C4FF">
              <p style={{ fontFamily:'Nunito', fontSize:13, color:'#444', lineHeight:1.7 }}>{detail.review}</p>
            </Section>
          )}

          {detail.changes && (
            <Section title="💡 Qué cambiaría / agregaría" color="#FFF8EC" border="#FFE4A0">
              <p style={{ fontFamily:'Nunito', fontSize:13, color:'#444', lineHeight:1.7 }}>{detail.changes}</p>
            </Section>
          )}
        </div>
      </div>
    );
  }

  /* ── Add form ── */
  if (view==='add') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, marginBottom:12 }}>
        <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>📝 Nueva cita</div>
        <button onClick={()=>setView('list')} className="btn3d" style={{ background:'white',color:C.ink,fontSize:11,padding:'6px 13px' }}>✕ Cancelar</button>
      </div>

      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:13 }}>
        {/* Title */}
        <Field label="✏️ Título de la cita *">
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Ej: La noche de la pizza perfecta 🍕"
            style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:14,padding:'9px 12px' }}/>
        </Field>

        {/* Activity */}
        <Field label="🎰 Actividad *">
          <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
            {BASE_ACTIVITIES.map(a=>(
              <button key={a.id} onClick={()=>setForm(f=>({...f,activityId:a.id}))}
                style={{ background:form.activityId===a.id?a.cardColor:'#fff',border:`2px solid ${form.activityId===a.id?a.cardBorder:C.grayLt}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:12,padding:'5px 12px',cursor:'pointer',transition:'all 0.15s' }}>
                {a.emoji} {a.name}
              </button>
            ))}
          </div>
        </Field>

        {/* Date + Rating */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <Field label="📅 Fecha">
            <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
              style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'9px 10px' }}/>
          </Field>
          <Field label={`⭐ Calificación: ${form.rating}/5`}>
            <div style={{ display:'flex',gap:4,paddingTop:4 }}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setForm(f=>({...f,rating:s}))}
                  style={{ background:'transparent',border:'none',cursor:'pointer',fontSize:s<=form.rating?26:20,filter:s<=form.rating?'none':'grayscale(1) opacity(0.3)',transition:'all 0.1s' }}>⭐</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Feeling */}
        <Field label="😊 ¿Cómo se sintieron?">
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            {FEELINGS.map(f=>(
              <button key={f} onClick={()=>setForm(fo=>({...fo,feeling:fo.feeling===f?'':f}))}
                style={{ background:form.feeling===f?'#7EC8E3':'white',border:`2px solid ${form.feeling===f?C.ink:C.grayLt}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:12,padding:'5px 12px',cursor:'pointer',transition:'all 0.15s' }}>
                {f}
              </button>
            ))}
          </div>
        </Field>

        {/* Review */}
        <Field label="📝 Reseña de la cita">
          <textarea value={form.review} onChange={e=>setForm(f=>({...f,review:e.target.value}))}
            placeholder="¿Qué pasó? ¿Qué fue lo mejor? ¿Algún momento especial? 😄"
            style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'10px 12px',height:80,resize:'none' }}/>
        </Field>

        {/* Changes */}
        <Field label="💡 ¿Qué cambiarías o agregarías?">
          <textarea value={form.changes} onChange={e=>setForm(f=>({...f,changes:e.target.value}))}
            placeholder="Ideas para la próxima vez: más tiempo, otro lugar, llevar algo especial..."
            style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'10px 12px',height:70,resize:'none' }}/>
        </Field>

        {/* Photo */}
        <Field label="📸 Foto de la cita">
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
          {form.photo ? (
            <div style={{ position:'relative',display:'inline-block' }}>
              <img src={form.photo} alt="" style={{ width:110,height:80,objectFit:'cover',borderRadius:12,border:'2.5px solid #1A1A1A' }}/>
              <button onClick={()=>setForm(f=>({...f,photo:null}))} style={{ position:'absolute',top:-8,right:-8,background:'#FF6B6B',border:'2px solid #1A1A1A',borderRadius:20,width:22,height:22,cursor:'pointer',fontFamily:'Nunito',fontWeight:900,fontSize:12,color:'white',display:'flex',alignItems:'center',justifyContent:'center',padding:0 }}>×</button>
            </div>
          ) : (
            <button onClick={()=>fileRef.current.click()} className="btn3d" style={{ background:'white',color:'#888',fontSize:12,padding:'8px 16px',borderColor:C.grayLt,boxShadow:`0 2px 0 ${C.grayLt}` }}>📷 Subir foto</button>
          )}
        </Field>

        <button className="btn3d" onClick={save} disabled={!form.activityId||!form.title.trim()}
          style={{ background:'#7EC8E3',color:C.ink,fontSize:16,padding:'13px',width:'100%',marginBottom:8 }}>
          💾 Guardar cita
        </button>
      </div>
    </div>
  );

  /* ── List view ── */
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:'Fredoka One',fontSize:20,color:C.ink }}>📖 Diario de Aventuras</div>
          <div style={{ fontFamily:'Nunito',fontSize:11,color:'#AAA',marginTop:1 }}>{entries.length} cita{entries.length!==1?'s':''} guardada{entries.length!==1?'s':''}</div>
        </div>
        <button className="btn3d" onClick={()=>{ setForm(EMPTY); setView('add'); }}
          style={{ background:'#7EC8E3',color:C.ink,fontSize:13,padding:'9px 16px' }}>
          + Agregar
        </button>
      </div>

      {/* Top activity */}
      {topAct && entries.length>1 && (
        <div style={{ background:'#FFF8EC',border:'2px solid #FFE4A0',borderRadius:14,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0,animation:'popIn 0.4s ease both' }}>
          <span style={{ fontSize:22 }}>🏆</span>
          <div>
            <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:11,color:'#B8860B' }}>Actividad favorita</div>
            <div style={{ fontFamily:'Fredoka One',fontSize:15,color:C.ink }}>{topAct.emoji} {topAct.name}</div>
          </div>
        </div>
      )}

      {/* Entries list */}
      {entries.length===0 ? (
        <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,textAlign:'center' }}>
          <div style={{ fontSize:52,animation:'float 3s ease-in-out infinite' }}>📖</div>
          <div style={{ fontFamily:'Fredoka One',fontSize:18,color:'#C8C0B4' }}>¡Aún no hay citas!</div>
          <div style={{ fontFamily:'Nunito',fontSize:12,color:'#D0C8C0' }}>Agrega tu primera aventura juntos 🐾</div>
        </div>
      ) : (
        <div style={{ flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8 }}>
          {entries.map((entry,i) => {
            const act = BASE_ACTIVITIES.find(a=>a.id===entry.activityId);
            return (
              <div key={entry.id} onClick={()=>{ setDetail(entry); setView('detail'); }}
                className="card"
                style={{ padding:'12px 14px',display:'flex',gap:12,alignItems:'flex-start',cursor:'pointer',transition:'all 0.15s',animation:`popIn 0.3s ease ${i*0.05}s both` }}
                onMouseEnter={e=>{ e.currentTarget.style.background=act?.cardColor||'#F9F5F0'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform=''; }}>
                {entry.photo && <img src={entry.photo} alt="" style={{ width:52,height:52,objectFit:'cover',borderRadius:10,border:'2px solid #1A1A1A',flexShrink:0 }}/>}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:'Fredoka One',fontSize:15,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{entry.title}</div>
                  <div style={{ fontFamily:'Nunito',fontSize:11,color:'#AAA',marginTop:1 }}>{entry.date} • {act?.emoji} {act?.name}</div>
                  <div style={{ marginTop:3,fontSize:12 }}>{'⭐'.repeat(entry.rating)}</div>
                  {entry.feeling && <span style={{ fontFamily:'Nunito',fontSize:11,fontWeight:700,color:'#888' }}>{entry.feeling}</span>}
                </div>
                <span style={{ fontFamily:'Nunito',fontSize:12,color:'#CCC',flexShrink:0,alignSelf:'center' }}>→</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6 }}>{label}</div>
      {children}
    </div>
  );
}

function Section({ title, color, border, children }) {
  return (
    <div style={{ background:color, border:`2px solid ${border}`, borderRadius:14, padding:'14px 16px', flexShrink:0 }}>
      <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>{title}</div>
      {children}
    </div>
  );
}
