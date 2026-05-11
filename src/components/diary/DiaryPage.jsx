import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../../hooks';
import { BASE_ACTIVITIES, FEELINGS } from '../../data';
import { C } from '../../utils/theme';

const EMPTY = {
  activityId:'', title:'', date:new Date().toISOString().split('T')[0],
  rating:5, feeling:'', review:'', changes:'',
  photos:[], location:'', withWho:'', cost:'', weather:'', mood:'',
};

const WEATHER_OPTIONS = ['☀️ Soleado','🌧️ Lluvioso','⛅ Nublado','🌙 Nocturno','🌈 Después de lluvia'];
const MOOD_OPTIONS    = ['😍 Enamorados','😂 Risas','😌 Relajados','🥰 Romántico','🔥 Emocionante','😴 Tranquilo'];

export default function DiaryPage() {
  const [entries, setEntries] = useLocalStorage('spindocky-diary', []);
  const [view, setView]       = useState('list');
  const [form, setForm]       = useState(EMPTY);
  const [detail, setDetail]   = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [editingId, setEditingId]     = useState(null);
  const fileRef = useRef();

  const save = () => {
    if (!form.activityId || !form.title.trim()) return;
    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, ...form } : e));
      setEditingId(null);
    } else {
      setEntries(prev => [{ id:Date.now(), ...form, createdAt:new Date().toISOString() }, ...prev]);
    }
    setForm(EMPTY);
    setView('list');
  };

  const remove = id => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setView('list');
  };

  const startEdit = (entry) => {
    setForm({ ...EMPTY, ...entry, photos: entry.photos || (entry.photo ? [entry.photo] : []) });
    setEditingId(entry.id);
    setCarouselIdx(0);
    setView('add');
  };

  const handlePhotos = e => {
    const files = Array.from(e.target.files);
    const remaining = 10 - (form.photos || []).length;
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, photos: [...(f.photos || []), ev.target.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = idx => setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

  const topAct = (() => {
    const map = {};
    entries.forEach(e => {
      if (!map[e.activityId]) map[e.activityId] = [];
      map[e.activityId].push(e.rating);
    });
    const best = Object.entries(map).sort((a, b) =>
      (b[1].reduce((s, v) => s + v, 0) / b[1].length) -
      (a[1].reduce((s, v) => s + v, 0) / a[1].length)
    )[0];
    return best ? BASE_ACTIVITIES.find(a => a.id === best[0]) : null;
  })();

  const inputStyle = { width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'9px 10px', boxSizing:'border-box' };

  /* ── DETAIL VIEW ── */
  if (view === 'detail' && detail) {
    const entry  = entries.find(e => e.id === detail.id) || detail;
    const act    = BASE_ACTIVITIES.find(a => a.id === entry.activityId);
    const photos = entry.photos || (entry.photo ? [entry.photo] : []);
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <button onClick={() => setView('list')} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:'Nunito', fontWeight:800, fontSize:13, color:C.blue }}>
            ← Diario
          </button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => startEdit(entry)} className="btn3d" style={{ background:'#FFE4A0', color:C.ink, fontSize:11, padding:'5px 12px' }}>✏️ Editar</button>
            <button onClick={() => remove(entry.id)} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:'Nunito', fontWeight:700, fontSize:12, color:'#C05050' }}>🗑</button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
          {photos.length > 0 && (
            <div style={{ position:'relative', borderRadius:16, overflow:'hidden', border:'3px solid #1A1A1A', flexShrink:0, height:220 }}>
              <img src={photos[carouselIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setCarouselIdx(i => (i - 1 + photos.length) % photos.length)}
                    style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'2px solid white', borderRadius:'50%', color:'white', width:32, height:32, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    ‹
                  </button>
                  <button onClick={() => setCarouselIdx(i => (i + 1) % photos.length)}
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'2px solid white', borderRadius:'50%', color:'white', width:32, height:32, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    ›
                  </button>
                  <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>
                    {photos.map((_, i) => (
                      <div key={i} onClick={() => setCarouselIdx(i)}
                        style={{ width:i === carouselIdx ? 18 : 8, height:8, borderRadius:4, background:i === carouselIdx ? 'white' : 'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.2s' }} />
                    ))}
                  </div>
                </>
              )}
              <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.5)', borderRadius:20, padding:'2px 8px', fontFamily:'Nunito', fontWeight:800, fontSize:10, color:'white' }}>
                {carouselIdx + 1}/{photos.length}
              </div>
            </div>
          )}

          <div style={{ background:act?.cardColor || '#F5F0EB', border:'2.5px solid #1A1A1A', borderRadius:18, padding:'16px 18px', boxShadow:'0 4px 0 #1A1A1A' }}>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>
              {entry.date} • {act?.name}
            </div>
            <div style={{ fontFamily:'Fredoka One', fontSize:24, color:C.ink, lineHeight:1.2, marginBottom:8 }}>{entry.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:18 }}>{'⭐'.repeat(entry.rating)}</span>
              <span style={{ fontFamily:'Nunito', fontSize:12, color:'#888' }}>{entry.rating}/5</span>
              {entry.feeling && <span style={{ fontFamily:'Nunito', fontSize:12, fontWeight:700, background:'white', border:`2px solid ${act?.cardBorder || C.grayLt}`, borderRadius:20, padding:'2px 10px' }}>{entry.feeling}</span>}
              {entry.mood    && <span style={{ fontFamily:'Nunito', fontSize:12, fontWeight:700, background:'white', border:`2px solid ${C.grayLt}`, borderRadius:20, padding:'2px 10px' }}>{entry.mood}</span>}
              {entry.weather && <span style={{ fontFamily:'Nunito', fontSize:12, fontWeight:700, background:'white', border:`2px solid ${C.grayLt}`, borderRadius:20, padding:'2px 10px' }}>{entry.weather}</span>}
            </div>
          </div>

          {(entry.location || entry.withWho || entry.cost) && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {entry.location && <InfoPill icon="📍" label={entry.location} />}
              {entry.withWho  && <InfoPill icon="👫" label={entry.withWho} />}
              {entry.cost     && <InfoPill icon="💸" label={entry.cost} />}
            </div>
          )}

          {entry.review  && <Section title="📝 Reseña" color="#EEF5FF" border="#A8C4FF"><p style={{ fontFamily:'Nunito', fontSize:13, color:'#444', lineHeight:1.7, margin:0 }}>{entry.review}</p></Section>}
          {entry.changes && <Section title="💡 Qué cambiaría / agregaría" color="#FFF8EC" border="#FFE4A0"><p style={{ fontFamily:'Nunito', fontSize:13, color:'#444', lineHeight:1.7, margin:0 }}>{entry.changes}</p></Section>}
        </div>
      </div>
    );
  }

  /* ── ADD / EDIT FORM ── */
  if (view === 'add') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, marginBottom:12 }}>
        <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>{editingId ? '✏️ Editar cita' : '📝 Nueva cita'}</div>
        <button onClick={() => { setView('list'); setEditingId(null); setForm(EMPTY); }} className="btn3d" style={{ background:'white', color:C.ink, fontSize:11, padding:'6px 13px' }}>
          ✕ Cancelar
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:13 }}>
        <Field label="✏️ Título de la cita *">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
            placeholder="Ej: La noche de la pizza perfecta 🍕"
            style={{ ...inputStyle, fontSize:14, padding:'9px 12px' }} />
        </Field>

        <Field label="🎰 Actividad *">
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {BASE_ACTIVITIES.map(a => (
              <button key={a.id} onClick={() => setForm(f => ({ ...f, activityId:a.id }))}
                style={{ background:form.activityId === a.id ? a.cardColor : '#fff', border:`2px solid ${form.activityId === a.id ? a.cardBorder : C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:12, padding:'5px 12px', cursor:'pointer', transition:'all 0.15s' }}>
                {a.emoji} {a.name}
              </button>
            ))}
          </div>
        </Field>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="📅 Fecha">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date:e.target.value }))} style={inputStyle} />
          </Field>
          <Field label={`⭐ Calificación: ${form.rating}/5`}>
            <div style={{ display:'flex', gap:4, paddingTop:4 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, rating:s }))}
                  style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:s <= form.rating ? 26 : 20, filter:s <= form.rating ? 'none' : 'grayscale(1) opacity(0.3)', transition:'all 0.1s' }}>⭐</button>
              ))}
            </div>
          </Field>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="📍 ¿A dónde fueron?">
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location:e.target.value }))} placeholder="Ej: Zona 4, Guatemala" style={inputStyle} />
          </Field>
          <Field label="👫 ¿Con quién?">
            <input value={form.withWho} onChange={e => setForm(f => ({ ...f, withWho:e.target.value }))} placeholder="Ej: Mi amor 💕" style={inputStyle} />
          </Field>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="💸 ¿Cuánto gastaron?">
            <input value={form.cost} onChange={e => setForm(f => ({ ...f, cost:e.target.value }))} placeholder="Ej: Q150" style={inputStyle} />
          </Field>
          <Field label="🌤️ Clima">
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {WEATHER_OPTIONS.map(w => (
                <button key={w} onClick={() => setForm(f => ({ ...f, weather:f.weather === w ? '' : w }))}
                  style={{ background:form.weather === w ? '#A8C4FF' : 'white', border:`2px solid ${form.weather === w ? C.ink : C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:11, padding:'3px 8px', cursor:'pointer', transition:'all 0.15s' }}>
                  {w}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="😊 ¿Cómo se sintieron?">
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {FEELINGS.map(f => (
              <button key={f} onClick={() => setForm(fo => ({ ...fo, feeling:fo.feeling === f ? '' : f }))}
                style={{ background:form.feeling === f ? '#7EC8E3' : 'white', border:`2px solid ${form.feeling === f ? C.ink : C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:12, padding:'5px 12px', cursor:'pointer', transition:'all 0.15s' }}>
                {f}
              </button>
            ))}
          </div>
        </Field>

        <Field label="✨ Ambiente / mood">
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {MOOD_OPTIONS.map(m => (
              <button key={m} onClick={() => setForm(f => ({ ...f, mood:f.mood === m ? '' : m }))}
                style={{ background:form.mood === m ? '#FFB3C1' : 'white', border:`2px solid ${form.mood === m ? C.ink : C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:12, padding:'5px 12px', cursor:'pointer', transition:'all 0.15s' }}>
                {m}
              </button>
            ))}
          </div>
        </Field>

        <Field label="📝 Reseña de la cita">
          <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review:e.target.value }))}
            placeholder="¿Qué pasó? ¿Qué fue lo mejor? ¿Algún momento especial? 😄"
            style={{ ...inputStyle, height:80, resize:'none' }} />
        </Field>

        <Field label="💡 ¿Qué cambiarías o agregarías?">
          <textarea value={form.changes} onChange={e => setForm(f => ({ ...f, changes:e.target.value }))}
            placeholder="Ideas para la próxima vez..."
            style={{ ...inputStyle, height:70, resize:'none' }} />
        </Field>

        <Field label={`📸 Fotos (${(form.photos || []).length}/10)`}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display:'none' }} />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-start' }}>
            {(form.photos || []).map((photo, i) => (
              <div key={i} style={{ position:'relative' }}>
                <img src={photo} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:10, border:'2.5px solid #1A1A1A' }} />
                <button onClick={() => removePhoto(i)}
                  style={{ position:'absolute', top:-8, right:-8, background:'#FF6B6B', border:'2px solid #1A1A1A', borderRadius:'50%', width:22, height:22, cursor:'pointer', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:0, fontWeight:900, fontSize:14 }}>
                  ×
                </button>
              </div>
            ))}
            {(form.photos || []).length < 10 && (
              <button onClick={() => fileRef.current.click()} className="btn3d"
                style={{ background:'white', color:'#888', borderColor:C.grayLt, boxShadow:`0 2px 0 ${C.grayLt}`, width:80, height:80, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, fontSize:12 }}>
                <span style={{ fontSize:22 }}>📷</span>
                <span style={{ fontSize:10 }}>Agregar</span>
              </button>
            )}
          </div>
        </Field>

        <button className="btn3d" onClick={save} disabled={!form.activityId || !form.title.trim()}
          style={{ background:'#7EC8E3', color:C.ink, fontSize:16, padding:'13px', width:'100%', marginBottom:8 }}>
          💾 {editingId ? 'Guardar cambios' : 'Guardar cita'}
        </button>
      </div>
    </div>
  );

  /* ── LIST VIEW ── */
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>📖 Diario de Aventuras</div>
          <div style={{ fontFamily:'Nunito', fontSize:11, color:'#AAA', marginTop:1 }}>
            {entries.length} cita{entries.length !== 1 ? 's' : ''} guardada{entries.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="btn3d" onClick={() => { setForm(EMPTY); setEditingId(null); setView('add'); }}
          style={{ background:'#7EC8E3', color:C.ink, fontSize:13, padding:'9px 16px' }}>
          + Agregar
        </button>
      </div>

      {topAct && entries.length > 1 && (
        <div style={{ background:'#FFF8EC', border:'2px solid #FFE4A0', borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:22 }}>🏆</span>
          <div>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:11, color:'#B8860B' }}>Actividad favorita</div>
            <div style={{ fontFamily:'Fredoka One', fontSize:15, color:C.ink }}>{topAct.emoji} {topAct.name}</div>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, textAlign:'center' }}>
          <div style={{ fontSize:52, animation:'float 3s ease-in-out infinite' }}>📖</div>
          <div style={{ fontFamily:'Fredoka One', fontSize:18, color:'#C8C0B4' }}>¡Aún no hay citas!</div>
          <div style={{ fontFamily:'Nunito', fontSize:12, color:'#D0C8C0' }}>Agrega tu primera aventura juntos 🐾</div>
        </div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          {entries.map((entry, i) => {
            const act    = BASE_ACTIVITIES.find(a => a.id === entry.activityId);
            const photos = entry.photos || (entry.photo ? [entry.photo] : []);
            return (
              <div key={entry.id}
                onClick={() => { setDetail(entry); setCarouselIdx(0); setView('detail'); }}
                className="card"
                style={{ padding:'12px 14px', display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', transition:'all 0.15s', animation:`popIn 0.3s ease ${i * 0.05}s both` }}
                onMouseEnter={e => { e.currentTarget.style.background = act?.cardColor || '#F9F5F0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = ''; }}>
                {photos.length > 0 && (
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <img src={photos[0]} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:10, border:'2px solid #1A1A1A' }} />
                    {photos.length > 1 && (
                      <div style={{ position:'absolute', bottom:-4, right:-4, background:C.ink, borderRadius:10, padding:'1px 5px', fontFamily:'Nunito', fontWeight:900, fontSize:9, color:'white' }}>
                        +{photos.length - 1}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Fredoka One', fontSize:15, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.title}</div>
                  <div style={{ fontFamily:'Nunito', fontSize:11, color:'#AAA', marginTop:1 }}>{entry.date} • {act?.emoji} {act?.name}</div>
                  {entry.location && <div style={{ fontFamily:'Nunito', fontSize:11, color:'#888', marginTop:1 }}>📍 {entry.location}</div>}
                  <div style={{ marginTop:3, display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:11 }}>{'⭐'.repeat(entry.rating)}</span>
                    {entry.feeling && <span style={{ fontFamily:'Nunito', fontSize:10, fontWeight:700, color:'#888' }}>{entry.feeling}</span>}
                    {entry.mood    && <span style={{ fontFamily:'Nunito', fontSize:10, fontWeight:700, color:'#888' }}>{entry.mood}</span>}
                  </div>
                </div>
                <span style={{ fontFamily:'Nunito', fontSize:12, color:'#CCC', flexShrink:0, alignSelf:'center' }}>→</span>
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
      <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{label}</div>
      {children}
    </div>
  );
}

function Section({ title, color, border, children }) {
  return (
    <div style={{ background:color, border:`2px solid ${border}`, borderRadius:14, padding:'14px 16px', flexShrink:0 }}>
      <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoPill({ icon, label }) {
  return (
    <div style={{ background:'white', border:`2px solid ${C.grayLt}`, borderRadius:20, padding:'4px 12px', display:'flex', alignItems:'center', gap:5, fontFamily:'Nunito', fontWeight:700, fontSize:12, color:'#555' }}>
      {icon} {label}
    </div>
  );
}