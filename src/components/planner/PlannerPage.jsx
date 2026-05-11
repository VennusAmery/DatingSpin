import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks';
import { BASE_ACTIVITIES } from '../../data';
import { C } from '../../utils/theme';

const STATUS_OPTIONS = [
  { id:'idea',      label:'Idea',       emoji:'💭', color:'#E0D8CC', textColor:'#888' },
  { id:'planned',   label:'Planeado',   emoji:'📋', color:'#A8C4FF', textColor:'#2255CC' },
  { id:'confirmed', label:'Confirmado', emoji:'✅', color:'#B5DEC8', textColor:'#2A7A4A' },
  { id:'done',      label:'¡Hecho!',    emoji:'🎉', color:'#FFE4A0', textColor:'#997700' },
];

const BUDGET_OPTIONS = [
  { id:'free', label:'Gratis',    emoji:'🤲', color:'#B5DEC8' },
  { id:'low',  label:'Económico', emoji:'💚', color:'#C5E8A0' },
  { id:'mid',  label:'Moderado',  emoji:'💛', color:'#FFE4A0' },
  { id:'high', label:'Especial',  emoji:'💜', color:'#C5B8E8' },
];

// Clima determinista basado en fecha
function getWeatherForDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const seed = d.getDate() + d.getMonth() * 31;
  const options = [
    { emoji:'☀️', label:'Soleado',       color:'#FFE4A0' },
    { emoji:'⛅', label:'Parcialmente',   color:'#E0E8F0' },
    { emoji:'🌧️', label:'Lluvia',         color:'#A8C4FF' },
    { emoji:'🌙', label:'Fresco',         color:'#C5B8E8' },
    { emoji:'🌈', label:'Despejando',     color:'#B5DEC8' },
  ];
  return options[seed % options.length];
}

// Codifica plan en Base64 URL
function encodePlan(plan) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(plan)))); }
  catch { return null; }
}

function decodePlan(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { return null; }
}

function getShareUrl(plan) {
  const encoded = encodePlan(plan);
  if (!encoded) return null;
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
}

const EMPTY_PLAN = {
  title:'', activityId:'', emoji:'🌟', date:'', time:'',
  location:'', locationUrl:'', generalUrl:'',
  budget:'mid', status:'idea', notes:'', checklist:[], photo:null,
};

const EMOJI_LIST = ['🌟','💫','🎯','🎪','🎭','🎨','🎬','🍕','🌮','🍣','🍷','🍸','🧁','🌿','⛰️','🎸','🎲','🧩','🛶','✈️','🏖️','🌃','🎠','🎡','🎢','💎','🌹','🎁','🦋','🌈'];

export default function PlannerPage() {
  const [plans, setPlans]       = useLocalStorage('spindocky-plans', []);
  const [diary, setDiary]       = useLocalStorage('spindocky-diary', []);
  const [view, setView]         = useState('list');
  const [form, setForm]         = useState(EMPTY_PLAN);
  const [detail, setDetail]     = useState(null);
  const [newCheck, setNewCheck] = useState('');
  const [importPlan, setImportPlan] = useState(null);
  const [copied, setCopied]     = useState(false);
  const fileRef = useRef();

  // Detecta ?share= en la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
      const decoded = decodePlan(shareParam);
      if (decoded) setImportPlan(decoded);
      // Limpia la URL sin recargar
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const save = () => {
    if (!form.title.trim()) return;
    if (view === 'edit' && detail) {
      setPlans(prev => prev.map(p => p.id === detail.id ? { ...p, ...form } : p));
      setDetail({ ...detail, ...form });
      setView('detail');
    } else {
      const entry = { id: Date.now(), ...form, createdAt: new Date().toISOString() };
      setPlans(prev => [entry, ...prev]);
      setView('list');
    }
    setForm(EMPTY_PLAN);
  };

  const remove = id => { setPlans(prev => prev.filter(p => p.id !== id)); setView('list'); };

  const setStatus = (id, status) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Diary Bridge — envía plan al diario cuando está "Hecho"
  const sendToDiary = (plan) => {
    const act = BASE_ACTIVITIES.find(a => a.id === plan.activityId);
    const entry = {
      id:         Date.now(),
      title:      plan.title,
      activityId: plan.activityId || '',
      date:       plan.date || new Date().toISOString().split('T')[0],
      rating:     5,
      feeling:    '',
      mood:       '',
      weather:    '',
      location:   plan.location || '',
      withWho:    '',
      cost:       '',
      review:     plan.notes || '',
      changes:    '',
      photos:     plan.photo ? [plan.photo] : [],
      createdAt:  new Date().toISOString(),
    };
    setDiary(prev => [entry, ...prev]);
    alert(`"${plan.title}" enviado al diario ✅`);
  };

  // Importar plan compartido
  const confirmImport = () => {
    if (!importPlan) return;
    const entry = { ...importPlan, id: Date.now(), status: 'idea', createdAt: new Date().toISOString() };
    setPlans(prev => [entry, ...prev]);
    setImportPlan(null);
  };

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const addCheckItem = () => {
    if (!newCheck.trim()) return;
    setForm(f => ({ ...f, checklist: [...(f.checklist || []), { text: newCheck.trim(), done: false }] }));
    setNewCheck('');
  };

  const toggleCheck = (planId, idx) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const cl = p.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
      return { ...p, checklist: cl };
    }));
    if (detail?.id === planId)
      setDetail(d => ({ ...d, checklist: d.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item) }));
  };

  const copyShareUrl = (plan) => {
    const url = getShareUrl(plan);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const grouped = STATUS_OPTIONS.map(s => ({ ...s, items: plans.filter(p => p.status === s.id) }));

  // ── MODAL IMPORTAR ────────────────────────────────────────────────────────
  const ImportModal = () => importPlan ? (
    <div onClick={e => { if(e.target===e.currentTarget) setImportPlan(null); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'white', border:'3px solid #1A1A1A', borderRadius:22, padding:22, maxWidth:380, width:'100%', boxShadow:'0 8px 0 #1A1A1A', animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink, marginBottom:6 }}>📩 Plan recibido</div>
        <div style={{ fontFamily:'Nunito', fontSize:13, color:'#666', marginBottom:14 }}>Alguien compartió este plan contigo:</div>
        <div style={{ background:'#F5F0EB', borderRadius:14, padding:'12px 14px', marginBottom:16 }}>
          <div style={{ fontFamily:'Fredoka One', fontSize:18, color:C.ink }}>{importPlan.emoji} {importPlan.title}</div>
          {importPlan.date && <div style={{ fontFamily:'Nunito', fontSize:12, color:'#888', marginTop:4 }}>📅 {importPlan.date}</div>}
          {importPlan.location && <div style={{ fontFamily:'Nunito', fontSize:12, color:'#888' }}>📍 {importPlan.location}</div>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setImportPlan(null)} className="btn3d"
            style={{ flex:1, background:'white', color:'#888', fontSize:12, padding:'10px', borderColor:C.grayLt }}>
            Ignorar
          </button>
          <button onClick={confirmImport} className="btn3d"
            style={{ flex:2, background:'#7EC8E3', color:C.ink, fontSize:14, padding:'10px' }}>
            ✅ Agregar a mis planes
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ── FORM ─────────────────────────────────────────────────────────────────
  if (view === 'add' || view === 'edit') return (
    <>
      <ImportModal />
      <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, marginBottom:12 }}>
          <div style={{ fontFamily:'Fredoka One', fontSize:19, color:C.ink }}>{view==='edit'?'✏️ Editar cita':'✨ Nueva cita planeada'}</div>
          <button onClick={() => { setView(view==='edit'?'detail':'list'); setForm(EMPTY_PLAN); }} className="btn3d"
            style={{ background:'white', color:C.ink, fontSize:11, padding:'6px 13px' }}>✕ Cancelar</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, paddingBottom:8 }}>
          <Field label="📌 Título *">
            <div style={{ display:'flex', gap:8 }}>
              <EmojiBtn value={form.emoji} onChange={e => setForm(f=>({...f,emoji:e}))} />
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="Ej: Cena en el rooftop..."
                style={{ flex:1, background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:14, padding:'9px 12px' }}/>
            </div>
          </Field>

          <Field label="🎯 Tipo de cita">
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {BASE_ACTIVITIES.map(a => (
                <button key={a.id} onClick={() => setForm(f=>({...f,activityId:f.activityId===a.id?'':a.id}))}
                  style={{ background:form.activityId===a.id?a.cardColor:'white', border:`2px solid ${form.activityId===a.id?a.cardBorder:C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:11, padding:'4px 11px', cursor:'pointer', transition:'all 0.15s' }}>
                  {a.emoji} {a.name}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Field label="📅 Fecha">
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'9px 10px' }}/>
            </Field>
            <Field label="🕐 Hora">
              <input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}
                style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'9px 10px' }}/>
            </Field>
          </div>

          <Field label="📍 Lugar">
            <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}
              placeholder="Nombre del lugar..." style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'9px 12px', marginBottom:6 }}/>
            <input value={form.locationUrl} onChange={e=>setForm(f=>({...f,locationUrl:e.target.value}))}
              placeholder="Link de Google Maps (opcional)..." style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'9px 12px' }}/>
          </Field>

          <Field label="💰 Presupuesto">
            <div style={{ display:'flex', gap:7 }}>
              {BUDGET_OPTIONS.map(b => (
                <button key={b.id} onClick={()=>setForm(f=>({...f,budget:b.id}))}
                  style={{ flex:1, background:form.budget===b.id?b.color:'white', border:`2px solid ${form.budget===b.id?C.ink:C.grayLt}`, borderRadius:12, fontFamily:'Nunito', fontWeight:700, fontSize:11, padding:'7px 4px', cursor:'pointer', transition:'all 0.15s', textAlign:'center', boxShadow:form.budget===b.id?`0 2px 0 ${C.ink}`:`0 1px 0 ${C.grayLt}` }}>
                  <div style={{ fontSize:16 }}>{b.emoji}</div>
                  <div style={{ fontSize:10, marginTop:2 }}>{b.label}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="📊 Estado">
            <div style={{ display:'flex', gap:7 }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s.id} onClick={()=>setForm(f=>({...f,status:s.id}))}
                  style={{ flex:1, background:form.status===s.id?s.color:'white', border:`2px solid ${form.status===s.id?C.ink:C.grayLt}`, borderRadius:12, fontFamily:'Nunito', fontWeight:700, fontSize:10, padding:'7px 4px', cursor:'pointer', transition:'all 0.15s', textAlign:'center', boxShadow:form.status===s.id?`0 2px 0 ${C.ink}`:`0 1px 0 ${C.grayLt}` }}>
                  <div style={{ fontSize:15 }}>{s.emoji}</div>
                  <div style={{ marginTop:2 }}>{s.label}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="📝 Notas e ideas">
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
              placeholder="Ideas, qué llevar, qué reservar..."
              style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'10px 12px', height:80, resize:'none' }}/>
          </Field>

          <Field label="✅ Checklist">
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              <input value={newCheck} onChange={e=>setNewCheck(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCheckItem()}
                placeholder="Agregar tarea... (Enter)"
                style={{ flex:1, background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'8px 12px' }}/>
              <button className="btn3d" onClick={addCheckItem} style={{ background:'#7EC8E3', color:C.ink, fontSize:13, padding:'8px 14px' }}>+</button>
            </div>
            {(form.checklist||[]).map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:i<form.checklist.length-1?`1px solid ${C.grayXlt}`:'none' }}>
                <div style={{ width:18, height:18, background:item.done?'#7EC8E3':'white', border:'2px solid #1A1A1A', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, cursor:'pointer', flexShrink:0 }}
                  onClick={()=>setForm(f=>({...f,checklist:f.checklist.map((c,j)=>j===i?{...c,done:!c.done}:c)}))}>
                  {item.done?'✓':''}
                </div>
                <span style={{ fontFamily:'Nunito', fontSize:12, fontWeight:600, color:item.done?'#AAA':C.ink, textDecoration:item.done?'line-through':'none', flex:1 }}>{item.text}</span>
                <button onClick={()=>setForm(f=>({...f,checklist:f.checklist.filter((_,j)=>j!==i)}))}
                  style={{ background:'transparent', border:'none', cursor:'pointer', color:'#DDD', fontSize:16, lineHeight:1, padding:2 }}
                  onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>×</button>
              </div>
            ))}
          </Field>

          <Field label="📸 Foto de referencia">
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
            {form.photo ? (
              <div style={{ position:'relative', display:'inline-block' }}>
                <img src={form.photo} alt="" style={{ width:120, height:85, objectFit:'cover', borderRadius:12, border:'2.5px solid #1A1A1A' }}/>
                <button onClick={()=>setForm(f=>({...f,photo:null}))} style={{ position:'absolute', top:-8, right:-8, background:'#FF6B6B', border:'2px solid #1A1A1A', borderRadius:20, width:22, height:22, cursor:'pointer', color:'white', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', padding:0, fontWeight:900 }}>×</button>
              </div>
            ) : (
              <button onClick={()=>fileRef.current.click()} className="btn3d"
                style={{ background:'white', color:'#888', fontSize:12, padding:'8px 16px', borderColor:C.grayLt, boxShadow:`0 2px 0 ${C.grayLt}` }}>📷 Agregar foto</button>
            )}
          </Field>

          <Field label="🔗 Link de interés">
            <input value={form.generalUrl} onChange={e=>setForm(f=>({...f,generalUrl:e.target.value}))}
              placeholder="https://..." style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'9px 12px' }}/>
          </Field>

          <button className="btn3d" onClick={save} disabled={!form.title.trim()}
            style={{ background:'#7EC8E3', color:C.ink, fontSize:16, padding:'13px', width:'100%', marginBottom:4 }}>
            💾 {view==='edit'?'Guardar cambios':'Crear plan de cita'}
          </button>
        </div>
      </div>
    </>
  );

  // ── DETAIL ────────────────────────────────────────────────────────────────
  if (view === 'detail' && detail) {
    const plan    = plans.find(p => p.id === detail.id) || detail;
    const act     = BASE_ACTIVITIES.find(a => a.id === plan.activityId);
    const st      = STATUS_OPTIONS.find(s => s.id === plan.status) || STATUS_OPTIONS[0];
    const bg      = BUDGET_OPTIONS.find(b => b.id === plan.budget) || BUDGET_OPTIONS[2];
    const weather = getWeatherForDate(plan.date);

    // Genera URL de Google Maps
    const mapsUrl = plan.locationUrl
      ? plan.locationUrl
      : plan.location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.location)}`
        : null;

    return (
      <>
        <ImportModal />
        <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexShrink:0, marginBottom:12, gap:8 }}>
            <button onClick={()=>setView('list')} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:'Nunito', fontWeight:800, fontSize:13, color:C.blue }}>← Planes</button>
            <div style={{ display:'flex', gap:6 }}>
              {/* Compartir */}
              <button onClick={()=>copyShareUrl(plan)} className="btn3d"
                style={{ background:copied?'#B5DEC8':'#FFE4A0', color:C.ink, fontSize:11, padding:'6px 12px' }}>
                {copied?'✅ Copiado':'🔗 Compartir'}
              </button>
              <button onClick={()=>{ setForm({...plan}); setView('edit'); }} className="btn3d"
                style={{ background:'white', color:C.ink, fontSize:11, padding:'6px 12px' }}>✏️</button>
              <button onClick={()=>remove(plan.id)} className="btn3d"
                style={{ background:'white', color:'#C05050', fontSize:11, padding:'6px 12px', borderColor:'#FFBABA' }}>🗑</button>
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
            {/* Hero */}
            {plan.photo && <img src={plan.photo} alt="" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:16, border:'3px solid #1A1A1A', flexShrink:0 }}/>}

            <div style={{ background:act?.cardColor||'#F5F0EB', border:'2.5px solid #1A1A1A', borderRadius:18, padding:'16px 18px', boxShadow:'0 4px 0 #1A1A1A' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <span style={{ fontSize:36, lineHeight:1 }}>{plan.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'Fredoka One', fontSize:22, color:C.ink, lineHeight:1.2 }}>{plan.title}</div>
                  {act && <div style={{ fontFamily:'Nunito', fontSize:12, color:'#888', marginTop:3 }}>{act.emoji} {act.name}</div>}
                </div>
                <span style={{ background:st.color, border:'2px solid #1A1A1A', borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, padding:'4px 10px', color:st.textColor, flexShrink:0 }}>
                  {st.emoji} {st.label}
                </span>
              </div>
            </div>

            {/* Indicadores: fecha, presupuesto, clima */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {plan.date && (
                <div style={{ background:'#EEF5FF', border:'1.5px solid #A8C4FF', borderRadius:12, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:16 }}>📅</span>
                  <div>
                    <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:9, color:'#2255CC', textTransform:'uppercase' }}>Fecha</div>
                    <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:12, color:C.ink }}>{plan.date}{plan.time?' · '+plan.time:''}</div>
                  </div>
                </div>
              )}
              <div style={{ background:bg.color, border:'1.5px solid #1A1A1A', borderRadius:12, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:16 }}>{bg.emoji}</span>
                <div>
                  <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:9, color:'#888', textTransform:'uppercase' }}>Presupuesto</div>
                  <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:12, color:C.ink }}>{bg.label}</div>
                </div>
              </div>
              {weather && plan.date && (
                <div style={{ background:weather.color, border:'1.5px solid #1A1A1A', borderRadius:12, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:16 }}>{weather.emoji}</span>
                  <div>
                    <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:9, color:'#888', textTransform:'uppercase' }}>Clima</div>
                    <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:12, color:C.ink }}>{weather.label}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Card de mapa táctil */}
            {(plan.location || mapsUrl) && (
              <a href={mapsUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                <div style={{ background:'#EDFAF3', border:'2px solid #B5DEC8', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'all 0.15s', boxShadow:'0 3px 0 #B5DEC8' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  <div style={{ width:44, height:44, background:'white', border:'2px solid #1A1A1A', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>📍</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#2A7A4A', textTransform:'uppercase', letterSpacing:'0.08em' }}>Ubicación · Toca para abrir</div>
                    <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:14, color:C.ink, marginTop:2 }}>{plan.location || 'Ver en Google Maps'}</div>
                  </div>
                  <span style={{ fontSize:18, color:'#2A7A4A' }}>↗</span>
                </div>
              </a>
            )}

            {/* Cambiar estado */}
            <div>
              <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Cambiar estado</div>
              <div style={{ display:'flex', gap:6 }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s.id} onClick={()=>{ setStatus(plan.id, s.id); setDetail(d=>({...d,status:s.id})); }}
                    style={{ flex:1, background:plan.status===s.id?s.color:'white', border:`2px solid ${plan.status===s.id?C.ink:C.grayLt}`, borderRadius:10, fontFamily:'Nunito', fontWeight:700, fontSize:10, padding:'6px 4px', cursor:'pointer', transition:'all 0.15s', textAlign:'center' }}>
                    {s.emoji}<div style={{ fontSize:9, marginTop:1 }}>{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botones de acción rápida */}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>copyShareUrl(plan)} className="btn3d"
                style={{ flex:1, background:copied?'#B5DEC8':'#FFE4A0', color:C.ink, fontSize:12, padding:'10px' }}>
                {copied?'✅ URL Copiada':'🔗 Compartir plan'}
              </button>
              {plan.status === 'done' && (
                <button onClick={()=>sendToDiary(plan)} className="btn3d"
                  style={{ flex:1, background:'#FFB3C1', color:C.ink, fontSize:12, padding:'10px' }}>
                  📖 Guardar en diario
                </button>
              )}
            </div>

            {plan.notes && (
              <Section title="📝 Notas" color="#FFF8EC" border="#FFE4A0">
                <p style={{ fontFamily:'Nunito', fontSize:13, color:'#444', lineHeight:1.7, margin:0 }}>{plan.notes}</p>
              </Section>
            )}

            {plan.checklist?.length > 0 && (
              <Section title={`✅ Checklist (${plan.checklist.filter(c=>c.done).length}/${plan.checklist.length})`} color="#EDFAF3" border="#B5DEC8">
                {plan.checklist.map((item, i) => (
                  <div key={i} onClick={()=>toggleCheck(plan.id, i)}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:i<plan.checklist.length-1?`1px solid #B5DEC8`:'none', cursor:'pointer' }}>
                    <div style={{ width:20, height:20, background:item.done?'#7EC8E3':'white', border:'2px solid #1A1A1A', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, transition:'all 0.15s' }}>{item.done?'✓':''}</div>
                    <span style={{ fontFamily:'Nunito', fontSize:13, fontWeight:600, color:item.done?'#AAA':C.ink, textDecoration:item.done?'line-through':'none' }}>{item.text}</span>
                  </div>
                ))}
              </Section>
            )}

            {plan.generalUrl && (
              <a href={plan.generalUrl} target="_blank" rel="noopener noreferrer" className="btn3d"
                style={{ background:'white', color:C.ink, fontSize:12, padding:'10px', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:6, borderColor:C.grayLt, boxShadow:`0 2px 0 ${C.grayLt}` }}>
                🔗 Abrir link de interés
              </a>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── LIST ─────────────────────────────────────────────────────────────────
  return (
    <>
      <ImportModal />
      <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>🗓 Posibles Citas</div>
            <div style={{ fontFamily:'Nunito', fontSize:11, color:'#AAA' }}>{plans.length} plan{plans.length!==1?'es':''} guardado{plans.length!==1?'s':''}</div>
          </div>
          <button className="btn3d" onClick={()=>{ setForm(EMPTY_PLAN); setView('add'); }}
            style={{ background:'#7EC8E3', color:C.ink, fontSize:13, padding:'9px 16px' }}>+ Nueva cita</button>
        </div>

        {plans.length === 0 ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, textAlign:'center' }}>
            <div style={{ fontSize:56, animation:'float 3s ease-in-out infinite' }}>🗓</div>
            <div style={{ fontFamily:'Fredoka One', fontSize:18, color:'#C8C0B4' }}>¡Planifica tu próxima cita!</div>
            <p style={{ fontFamily:'Nunito', fontSize:13, color:'#D0C8C0', maxWidth:260, lineHeight:1.6 }}>
              Guarda lugares, actividades e ideas para organizar la cita perfecta 🐾
            </p>
            <button className="btn3d" onClick={()=>{ setForm(EMPTY_PLAN); setView('add'); }}
              style={{ background:'#7EC8E3', color:C.ink, fontSize:14, padding:'12px 24px' }}>
              ✨ Crear primer plan
            </button>
          </div>
        ) : (
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:14 }}>
            {grouped.filter(g=>g.items.length>0).map(group => (
              <div key={group.id}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <span style={{ background:group.color, border:`1.5px solid ${C.ink}`, borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:11, padding:'3px 10px', color:group.textColor }}>
                    {group.emoji} {group.label}
                  </span>
                  <span style={{ fontFamily:'Nunito', fontSize:11, color:'#CCC' }}>{group.items.length}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {group.items.map((plan, i) => {
                    const act     = BASE_ACTIVITIES.find(a=>a.id===plan.activityId);
                    const weather = getWeatherForDate(plan.date);
                    const done    = (plan.checklist||[]).filter(c=>c.done).length;
                    const total   = (plan.checklist||[]).length;
                    return (
                      <div key={plan.id} onClick={()=>{ setDetail(plan); setView('detail'); }}
                        className="card"
                        style={{ padding:'12px 14px', display:'flex', gap:12, alignItems:'center', cursor:'pointer', transition:'all 0.15s', animation:`popIn 0.3s ease ${i*0.05}s both` }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=act?.cardColor||'#F9F5F0'; e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform=''; }}>
                        {plan.photo
                          ? <img src={plan.photo} alt="" style={{ width:48, height:48, objectFit:'cover', borderRadius:10, border:'2px solid #1A1A1A', flexShrink:0 }}/>
                          : <div style={{ width:48, height:48, background:act?.cardColor||'#F5F0EB', border:'2px solid #1A1A1A', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{plan.emoji}</div>
                        }
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:14, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{plan.title}</div>
                          <div style={{ fontFamily:'Nunito', fontSize:11, color:'#AAA', marginTop:1 }}>
                            {plan.date&&<span>{plan.date}{plan.time?' · '+plan.time:''}</span>}
                            {plan.location&&<span> · 📍{plan.location}</span>}
                            {weather&&plan.date&&<span> · {weather.emoji}</span>}
                          </div>
                          {total>0&&(
                            <div style={{ marginTop:4 }}>
                              <div style={{ background:'#E0D8CC', borderRadius:4, height:4, width:'100%', overflow:'hidden' }}>
                                <div style={{ background:'#7EC8E3', height:'100%', width:`${(done/total)*100}%`, transition:'width 0.3s', borderRadius:4 }}/>
                              </div>
                              <div style={{ fontFamily:'Nunito', fontSize:10, color:'#AAA', marginTop:2 }}>{done}/{total} tareas</div>
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily:'Nunito', fontSize:11, color:'#CCC', flexShrink:0 }}>→</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
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
    <div style={{ background:color, border:`2px solid ${border}`, borderRadius:14, padding:'12px 16px' }}>
      <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{title}</div>
      {children}
    </div>
  );
}

function EmojiBtn({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <button onClick={()=>setOpen(p=>!p)}
        style={{ width:46, height:46, background:'#F5F0EB', border:'2.5px solid #1A1A1A', borderRadius:12, fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {value}
      </button>
      {open && (
        <div style={{ position:'absolute', top:52, left:0, background:'white', border:'2.5px solid #1A1A1A', borderRadius:14, padding:10, display:'flex', flexWrap:'wrap', gap:4, zIndex:100, width:220, boxShadow:'0 6px 20px rgba(0,0,0,0.15)' }}>
          {EMOJI_LIST.map(e => (
            <button key={e} onClick={()=>{ onChange(e); setOpen(false); }}
              style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:20, padding:3, borderRadius:6 }}
              onMouseEnter={el=>el.target.style.background='#F5F0EB'} onMouseLeave={el=>el.target.style.background='transparent'}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}