import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks';
import { BASE_ACTIVITIES } from '../../data';
import { C } from '../../utils/theme';

const DEFAULT_IDEAS = [
  { id:'d1', title:'Picnic en el parque', emoji:'🧺', activityId:'outdoor', note:'Llevar mantita y snacks' },
  { id:'d2', title:'Noche de coctelería casera', emoji:'🍹', activityId:'bars', note:'Comprar ingredientes antes' },
  { id:'d3', title:'Tarde de museos', emoji:'🏛️', activityId:'culture', note:'Ver si hay exposición temporal' },
  { id:'d4', title:'Senderismo romántico', emoji:'🥾', activityId:'adventure', note:'Llevar agua y snacks' },
  { id:'d5', title:'Cena a la luz de las velas', emoji:'🕯️', activityId:'dinner', note:'Cocinar juntos en casa' },
];

const EMOJIS = ['🎯','🌟','💫','🎪','🎭','🎨','🎬','🍕','🌮','🍣','🍷','🍸','🧁','🌿','⛰️','🎸','🎲','🧩','🛶','✈️','🏖️','🌃','🎠','🎡','🎢'];

export default function IdeasPage() {
  const [ideas, setIdeas] = useLocalStorage('spindocky-ideas', DEFAULT_IDEAS);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title:'', emoji:'🌟', activityId:'', note:'' });
  const [filter, setFilter] = useState('all');
  const [emojiPicker, setEmojiPicker] = useState(false);

  const save = () => {
    if (!form.title.trim()) return;
    setIdeas(prev => [{ id:`u${Date.now()}`, ...form }, ...prev]);
    setForm({ title:'', emoji:'🌟', activityId:'', note:'' });
    setAdding(false);
  };

  const remove = id => setIdeas(prev => prev.filter(i => i.id !== id));

  const filtered = filter==='all' ? ideas : ideas.filter(i => i.activityId===filter);

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>💡 Ideas de Citas</div>
          <div style={{ fontFamily:'Nunito', fontSize:11, color:'#AAA' }}>{ideas.length} idea{ideas.length!==1?'s':''} guardada{ideas.length!==1?'s':''}</div>
        </div>
        <button className="btn3d" onClick={()=>setAdding(a=>!a)}
          style={{ background:adding?'white':'#7EC8E3', color:C.ink, fontSize:13, padding:'9px 16px' }}>
          {adding ? '✕ Cancelar' : '+ Nueva idea'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card-ink" style={{ padding:'16px 18px', flexShrink:0, animation:'slideUp 0.3s ease both' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {/* Emoji + title row */}
            <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <div style={{ position:'relative' }}>
                <button onClick={()=>setEmojiPicker(p=>!p)}
                  style={{ width:48,height:48,background:'#F5F0EB',border:'2.5px solid #1A1A1A',borderRadius:14,fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {form.emoji}
                </button>
                {emojiPicker && (
                  <div style={{ position:'absolute',top:52,left:0,background:'white',border:'2.5px solid #1A1A1A',borderRadius:14,padding:10,display:'flex',flexWrap:'wrap',gap:5,zIndex:50,width:220,boxShadow:'0 6px 20px rgba(0,0,0,0.15)' }}>
                    {EMOJIS.map(e=>(
                      <button key={e} onClick={()=>{ setForm(f=>({...f,emoji:e})); setEmojiPicker(false); }}
                        style={{ background:'transparent',border:'none',cursor:'pointer',fontSize:20,padding:3,borderRadius:6,transition:'background 0.1s' }}
                        onMouseEnter={el=>el.target.style.background='#F5F0EB'} onMouseLeave={el=>el.target.style.background='transparent'}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex:1 }}>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                  placeholder="Nombre de la idea de cita..."
                  style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:14,padding:'9px 12px' }}/>
              </div>
            </div>

            {/* Activity tag */}
            <div>
              <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:7 }}>Categoría (opcional)</div>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {BASE_ACTIVITIES.map(a=>(
                  <button key={a.id} onClick={()=>setForm(f=>({...f,activityId:f.activityId===a.id?'':a.id}))}
                    style={{ background:form.activityId===a.id?a.cardColor:'white',border:`2px solid ${form.activityId===a.id?a.cardBorder:C.grayLt}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:11,padding:'4px 11px',cursor:'pointer',transition:'all 0.15s' }}>
                    {a.emoji} {a.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
              placeholder="Notas o detalles (opcional)..."
              style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'9px 12px' }}/>

            <button className="btn3d" onClick={save} disabled={!form.title.trim()}
              style={{ background:'#7EC8E3',color:C.ink,fontSize:15,padding:'11px' }}>
              💾 Guardar idea
            </button>
          </div>
        </div>
      )}

      {/* Filter by activity */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
        <button onClick={()=>setFilter('all')}
          style={{ background:filter==='all'?'#1A1A1A':'white',border:`2px solid ${filter==='all'?'#1A1A1A':C.grayLt}`,borderRadius:20,fontFamily:'Nunito',fontWeight:800,fontSize:11,padding:'4px 12px',cursor:'pointer',color:filter==='all'?'white':'#888',transition:'all 0.15s' }}>
          Todas
        </button>
        {BASE_ACTIVITIES.map(a=>(
          <button key={a.id} onClick={()=>setFilter(f=>f===a.id?'all':a.id)}
            style={{ background:filter===a.id?a.cardColor:'white',border:`2px solid ${filter===a.id?a.cardBorder:C.grayLt}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:11,padding:'4px 11px',cursor:'pointer',transition:'all 0.15s' }}>
            {a.emoji}
          </button>
        ))}
      </div>

      {/* Ideas list */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.length===0 && (
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,textAlign:'center' }}>
            <div style={{ fontSize:48,animation:'float 3s ease-in-out infinite' }}>💡</div>
            <div style={{ fontFamily:'Fredoka One',fontSize:17,color:'#C8C0B4' }}>¡Agrega ideas de citas!</div>
            <div style={{ fontFamily:'Nunito',fontSize:12,color:'#D0C8C0' }}>Se guardarán aquí para inspirarse 🐾</div>
          </div>
        )}
        {filtered.map((idea, i) => {
          const act = BASE_ACTIVITIES.find(a=>a.id===idea.activityId);
          return (
            <div key={idea.id} className="card"
              style={{ padding:'12px 14px', display:'flex', gap:12, alignItems:'center', animation:`popIn 0.3s ease ${i*0.05}s both`, transition:'all 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=act?.cardColor||'#F9F5F0'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform=''; }}>
              {/* Emoji */}
              <div style={{ width:44,height:44,background:act?.cardColor||'#F5F0EB',border:'2px solid #1A1A1A',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>
                {idea.emoji}
              </div>
              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'Nunito',fontWeight:800,fontSize:14,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{idea.title}</div>
                {idea.note && <div style={{ fontFamily:'Nunito',fontSize:11,color:'#AAA',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{idea.note}</div>}
                {act && <span style={{ display:'inline-block',marginTop:4,background:act.cardColor,border:`1.5px solid ${act.cardBorder}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:10,padding:'2px 8px',color:C.ink }}>{act.emoji} {act.name}</span>}
              </div>
              {/* Delete */}
              <button onClick={()=>remove(idea.id)}
                style={{ background:'transparent',border:'none',cursor:'pointer',color:'#DDD',fontSize:18,lineHeight:1,flexShrink:0,padding:4,transition:'color 0.15s' }}
                onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
