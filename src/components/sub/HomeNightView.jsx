import React, { useState } from 'react';
import MiniRoulette from '../roulette/MiniRoulette';
import { HOME_OPTIONS, RECIPES, STREAMING, BOARD_GAMES } from '../../data';
import { useLocalStorage } from '../../hooks';
import { C } from '../../utils/theme';

export default function HomeNightView() {
  const [chosen, setChosen] = useState(null);
  if (!chosen) return (
    <div style={{ height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Fredoka One',fontSize:20,color:C.ink }}>🏠 ¿Qué hacemos en casa?</div>
        <p style={{ fontFamily:'Nunito',fontSize:12,color:'#888',marginTop:4 }}>Gira para decidir 🎲</p>
      </div>
      <MiniRoulette items={HOME_OPTIONS} onResult={idx=>setTimeout(()=>setChosen(HOME_OPTIONS[idx]),400)} size={230} />
    </div>
  );
  return (
    <div style={{ height:'100%',display:'flex',flexDirection:'column',gap:10 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
        <div style={{ background:chosen.color,border:'2.5px solid #1A1A1A',borderRadius:12,padding:'8px 14px',display:'flex',alignItems:'center',gap:8,boxShadow:'0 3px 0 #1A1A1A' }}>
          <span style={{ fontSize:22 }}>{chosen.emoji}</span>
          <span style={{ fontFamily:'Fredoka One',fontSize:16,color:C.ink }}>{chosen.name}</span>
        </div>
        <button onClick={()=>setChosen(null)} className="btn3d" style={{ background:'white',color:C.ink,fontSize:11,padding:'6px 12px' }}>🔄</button>
      </div>
      <div style={{ flex:1,overflowY:'auto' }}>
        {chosen.id==='cook'    && <CookView/>}
        {chosen.id==='movies'  && <MoviesView/>}
        {chosen.id==='games'   && <GamesView/>}
        {chosen.id==='spa'     && <SpaView/>}
        {chosen.id==='karaoke' && <KaraokeView/>}
        {chosen.id==='puzzle'  && <PuzzleView/>}
      </div>
    </div>
  );
}

// ── Add Recipe Modal ──────────────────────────────────────────────────────────
const EMPTY_RECIPE = { name:'', emoji:'🍳', time:'', difficulty:'Fácil', ingredients:[], steps:[], link:'', color:'#FFE4A0' };
const COLORS = ['#FFE4A0','#FFB3C1','#A8D8EA','#B5DEC8','#C5B8E8','#FFD4A0','#F5B8A0'];
const DIFFICULTIES = ['Fácil','Media','Difícil'];
const EMOJIS_RECIPE = ['🍳','🍕','🍣','🍝','🥘','🍜','🥗','🌮','🍱','🥩','🦞','🍫','🧁','🥞','🍦','🍲','🥙','🫕','🍛','🥐'];

function AddRecipeModal({ onSave, onClose, initial }) {
  const [form, setForm]           = useState(initial ? { ...initial } : EMPTY_RECIPE);
  const isEdit = !!initial;
  const [ingName, setIngName]     = useState('');
  const [ingQty, setIngQty]       = useState('');
  const [stepInput, setStepInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);

  // ingredient = { name, qty }
  const addIng = () => {
    if (!ingName.trim()) return;
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: ingName.trim(), qty: ingQty.trim() }] }));
    setIngName(''); setIngQty('');
  };
  const remIng  = i => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_,j) => j!==i) }));
  const addStep = () => { if (!stepInput.trim()) return; setForm(f => ({ ...f, steps:[...f.steps, stepInput.trim()] })); setStepInput(''); };
  const remStep = i => setForm(f => ({ ...f, steps: f.steps.filter((_,j) => j!==i) }));

  const save = () => { if (!form.name.trim()) return; onSave({ ...form, id: isEdit ? form.id : `u${Date.now()}` }); onClose(); };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:12 }}>
      <div style={{ background:'white',border:'3px solid #1A1A1A',borderRadius:22,padding:'20px',width:'100%',maxWidth:720,maxHeight:'90dvh',display:'flex',flexDirection:'column',boxShadow:'0 8px 0 #1A1A1A',animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>

        {/* Fixed header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexShrink:0 }}>
          <div style={{ fontFamily:'Fredoka One',fontSize:18,color:C.ink }}>{isEdit ? '✏️ Editar receta' : '🍳 Nueva receta'}</div>
          <button onClick={onClose} style={{ background:'transparent',border:'none',cursor:'pointer',fontSize:20,color:'#AAA',lineHeight:1 }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:0,paddingRight:2 }}>

          {/* Row 1: Emoji+Name | Color+Time+Difficulty */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:14 }}>
            <div>
              <Label>Emoji y nombre *</Label>
              <div style={{ display:'flex',gap:8 }}>
                <div style={{ position:'relative',flexShrink:0 }}>
                  <button onClick={()=>setEmojiOpen(p=>!p)}
                    style={{ width:46,height:46,background:'#F5F0EB',border:'2.5px solid #1A1A1A',borderRadius:13,fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {form.emoji}
                  </button>
                  {emojiOpen && (
                    <div style={{ position:'absolute',top:52,left:0,background:'white',border:'2.5px solid #1A1A1A',borderRadius:14,padding:8,display:'flex',flexWrap:'wrap',gap:4,zIndex:300,width:220,boxShadow:'0 8px 24px rgba(0,0,0,0.18)' }}>
                      {EMOJIS_RECIPE.map(e=>(
                        <button key={e} onClick={()=>{setForm(f=>({...f,emoji:e}));setEmojiOpen(false);}}
                          style={{ background:'transparent',border:'none',cursor:'pointer',fontSize:22,padding:4,borderRadius:6 }}
                          onMouseEnter={el=>el.currentTarget.style.background='#F5F0EB'}
                          onMouseLeave={el=>el.currentTarget.style.background='transparent'}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  placeholder="Nombre de la receta..."
                  style={{ flex:1,background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:14,padding:'9px 12px' }}/>
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div style={{ display:'flex',gap:6,marginBottom:10 }}>
                {COLORS.map(col=>(
                  <button key={col} onClick={()=>setForm(f=>({...f,color:col}))}
                    style={{ width:26,height:26,background:col,border:`3px solid ${form.color===col?'#1A1A1A':col}`,borderRadius:50,cursor:'pointer',transition:'transform 0.1s',transform:form.color===col?'scale(1.2)':'scale(1)' }}/>
                ))}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                <div>
                  <Label>⏱ Tiempo</Label>
                  <input value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} placeholder="30 min"
                    style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'8px 10px' }}/>
                </div>
                <div>
                  <Label>👨‍🍳 Dificultad</Label>
                  <div style={{ display:'flex',gap:3 }}>
                    {DIFFICULTIES.map(d=>(
                      <button key={d} onClick={()=>setForm(f=>({...f,difficulty:d}))}
                        style={{ flex:1,background:form.difficulty===d?'#7EC8E3':'white',border:`2px solid ${form.difficulty===d?C.ink:C.grayLt}`,borderRadius:8,fontFamily:'Nunito',fontWeight:700,fontSize:10,padding:'6px 2px',cursor:'pointer',transition:'all 0.15s' }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Ingredients | Steps (2 columns) */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:14 }}>

            {/* LEFT — Ingredients */}
            <div>
              <Label>🥕 Ingredientes</Label>
              <div style={{ display:'flex',gap:5,marginBottom:6 }}>
                <input value={ingQty} onChange={e=>setIngQty(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addIng()}
                  placeholder="Cantidad"
                  style={{ width:80,background:'white',border:`2px solid ${C.grayLt}`,borderRadius:9,fontSize:12,padding:'7px 8px',flexShrink:0 }}/>
                <input value={ingName} onChange={e=>setIngName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addIng()}
                  placeholder="Ingrediente..."
                  style={{ flex:1,background:'white',border:`2px solid ${C.grayLt}`,borderRadius:9,fontSize:12,padding:'7px 8px' }}/>
                <button className="btn3d" onClick={addIng}
                  style={{ background:'#7EC8E3',color:C.ink,fontSize:13,padding:'7px 10px',borderRadius:18,boxShadow:`0 2px 0 ${C.ink}`,flexShrink:0 }}>+</button>
              </div>
              <div style={{ border:`2px solid ${C.grayLt}`,borderRadius:10,overflow:'hidden',minHeight:40 }}>
                <div style={{ display:'grid',gridTemplateColumns:'80px 1fr 24px',background:'#F5F0EB',borderBottom:`1px solid ${C.grayLt}`,padding:'5px 8px' }}>
                  <span style={{ fontFamily:'Nunito',fontWeight:900,fontSize:9,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.06em' }}>Cantidad</span>
                  <span style={{ fontFamily:'Nunito',fontWeight:900,fontSize:9,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.06em' }}>Ingrediente</span>
                </div>
                <div style={{ maxHeight:140,overflowY:'auto' }}>
                  {form.ingredients.length===0 && <div style={{ fontFamily:'Nunito',fontSize:11,color:'#CCC',padding:'8px 10px',textAlign:'center' }}>Sin ingredientes aún</div>}
                  {form.ingredients.map((ing,i)=>(
                    <div key={i} style={{ display:'grid',gridTemplateColumns:'80px 1fr 24px',alignItems:'center',borderBottom:i<form.ingredients.length-1?`1px solid ${C.grayXlt}`:'none',background:i%2===0?'white':'#FAFAF8' }}>
                      <input value={ing.qty||''} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,qty:e.target.value}:x)}))}
                        style={{ background:'transparent',border:'none',borderRight:`1px solid ${C.grayXlt}`,fontFamily:'Nunito',fontWeight:700,fontSize:11,color:'#888',padding:'6px 8px',width:'100%',outline:'none' }}
                        placeholder="—"/>
                      <input value={ing.name} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,name:e.target.value}:x)}))}
                        style={{ background:'transparent',border:'none',fontFamily:'Nunito',fontWeight:600,fontSize:11,color:C.ink,padding:'6px 8px',width:'100%',outline:'none' }}/>
                      <button onClick={()=>remIng(i)} style={{ background:'transparent',border:'none',cursor:'pointer',color:'#DDD',fontSize:14,lineHeight:1,padding:1 }}
                        onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Steps */}
            <div>
              <Label>📋 Pasos</Label>
              <div style={{ display:'flex',gap:5,marginBottom:6 }}>
                <input value={stepInput} onChange={e=>setStepInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addStep()}
                  placeholder="Agregar paso... (Enter)"
                  style={{ flex:1,background:'white',border:`2px solid ${C.grayLt}`,borderRadius:9,fontSize:12,padding:'7px 8px' }}/>
                <button className="btn3d" onClick={addStep}
                  style={{ background:'#7EC8E3',color:C.ink,fontSize:13,padding:'7px 10px',borderRadius:18,boxShadow:`0 2px 0 ${C.ink}`,flexShrink:0 }}>+</button>
              </div>
              <div style={{ border:`2px solid ${C.grayLt}`,borderRadius:10,overflow:'hidden',minHeight:40 }}>
                <div style={{ background:'#F5F0EB',borderBottom:`1px solid ${C.grayLt}`,padding:'5px 8px' }}>
                  <span style={{ fontFamily:'Nunito',fontWeight:900,fontSize:9,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.06em' }}>Paso</span>
                </div>
                <div style={{ maxHeight:140,overflowY:'auto' }}>
                  {form.steps.length===0 && <div style={{ fontFamily:'Nunito',fontSize:11,color:'#CCC',padding:'8px 10px',textAlign:'center' }}>Sin pasos aún</div>}
                  {form.steps.map((s,i)=>(
                    <div key={i} style={{ display:'flex',gap:6,alignItems:'center',padding:'4px 8px',borderBottom:i<form.steps.length-1?`1px solid ${C.grayXlt}`:'none',background:i%2===0?'white':'#FAFAF8' }}>
                      <span style={{ background:'#7EC8E3',border:'1.5px solid #1A1A1A',borderRadius:20,width:19,height:19,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Fredoka One',fontSize:10,flexShrink:0 }}>{i+1}</span>
                      <input value={s} onChange={e=>setForm(f=>({...f,steps:f.steps.map((x,j)=>j===i?e.target.value:x)}))}
                        style={{ background:'transparent',border:'none',fontFamily:'Nunito',fontSize:11,color:'#555',flex:1,padding:'4px 2px',outline:'none',lineHeight:1.4 }}/>
                      <button onClick={()=>remStep(i)} style={{ background:'transparent',border:'none',cursor:'pointer',color:'#DDD',fontSize:14,padding:1,lineHeight:1,flexShrink:0 }}
                        onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Link */}
          <Label>🔗 Link (TikTok, YouTube, web...)</Label>
          <input value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))}
            placeholder="https://www.tiktok.com/..."
            style={{ width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'9px 12px',marginBottom:14 }}/>
        </div>

        {/* Fixed footer */}
        <div style={{ display:'flex',gap:8,paddingTop:12,flexShrink:0,borderTop:`1.5px solid ${C.grayLt}` }}>
          <button className="btn3d" onClick={onClose}
            style={{ flex:1,background:'white',color:'#888',fontSize:12,padding:'10px',borderColor:C.grayLt,boxShadow:`0 2px 0 ${C.grayLt}` }}>Cancelar</button>
          <button className="btn3d" onClick={save} disabled={!form.name.trim()}
            style={{ flex:2,background:'#7EC8E3',color:C.ink,fontSize:14,padding:'10px' }}>💾 Guardar receta</button>
        </div>
      </div>
    </div>
  );
}

function Label({children}){
  return <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6 }}>{children}</div>;
}

// ── CookView ──────────────────────────────────────────────────────────────────
function CookView() {
  const [recipe, setRecipe]         = useState(null);
  const [customRecipes, setCustom]  = useLocalStorage('spindocky-recipes', []);
  const [modalRecipe, setModal]     = useState(null); // null=closed, 'new'=add, obj=edit

  const allRecipes = [...RECIPES, ...customRecipes];
  const pickRandom = () => setRecipe(allRecipes[Math.floor(Math.random()*allRecipes.length)]);

  const handleSave = (saved) => {
    const isExistingCustom = customRecipes.some(r => r.id === saved.id);
    if (isExistingCustom) {
      // editing an existing custom recipe — update in place
      setCustom(prev => prev.map(r => r.id === saved.id ? saved : r));
      if (recipe?.id === saved.id) setRecipe(saved);
    } else if (modalRecipe && modalRecipe !== 'new') {
      // editing a predefined recipe — save as new custom copy
      const copy = { ...saved, id: `u${Date.now()}` };
      setCustom(prev => [...prev, copy]);
      setRecipe(copy);
    } else {
      // new recipe
      setCustom(prev => [...prev, saved]);
    }
    setModal(null);
  };

  const exportPDF = (r) => {
    const ingList = (r.ingredients||[]).map(i =>
      typeof i === 'object' ? `${i.qty ? i.qty+' — ' : ''}${i.name}` : i
    );
    const win = window.open('','_blank');
    win.document.write(`<html><head><title>${r.name}</title><style>body{font-family:sans-serif;padding:30px;max-width:600px}h2{margin-bottom:4px}table{border-collapse:collapse;width:100%;margin:10px 0}th{background:#f5f0eb;text-align:left;padding:7px 10px;font-size:13px}td{padding:7px 10px;border-bottom:1px solid #eee;font-size:14px}h3{margin:18px 0 8px;color:#555}ol{padding-left:20px}li{margin:7px 0;font-size:14px}.link{margin-top:16px;font-size:12px;color:#888}.foot{color:#aaa;font-size:11px;margin-top:24px}</style></head><body><h2>${r.emoji} ${r.name}</h2><p style="color:#888;font-size:13px">⏱ ${r.time||''} · 👨‍🍳 ${r.difficulty||''}</p><h3>🥕 Ingredientes</h3><table><tr><th>Cantidad</th><th>Ingrediente</th></tr>${(r.ingredients||[]).map(i=>typeof i==='object'?`<tr><td>${i.qty||'—'}</td><td>${i.name}</td></tr>`:`<tr><td>—</td><td>${i}</td></tr>`).join('')}</table><h3>📋 Pasos</h3><ol>${(r.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol>${r.link?`<div class="link">🔗 Fuente: <a href="${r.link}">${r.link}</a></div>`:''}<p class="foot">SpinDocky 🐾</p></body></html>`);
    win.document.close(); win.print();
  };

  const shareWhatsApp = (r) => {
    const ings = (r.ingredients||[]).map(i =>
      typeof i === 'object' ? `  - ${i.qty ? i.qty+' ' : ''}${i.name}` : `  - ${i}`
    ).join('\n');
    const text = `*${r.name}*\n`
      + (r.time ? `Tiempo: ${r.time}` : '')
      + (r.difficulty ? `  |  Dificultad: ${r.difficulty}` : '')
      + `\n\n*Ingredientes:*\n${ings}`
      + (r.steps?.length ? `\n\n*Pasos:*\n${r.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')}` : '')
      + (r.link ? `\n\nFuente: ${r.link}` : '')
      + `\n\n_SpinDocky_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!recipe) return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div style={{ fontFamily:'Fredoka One',fontSize:17,color:'#1A1A1A' }}>👨‍🍳 Recetas ({allRecipes.length})</div>
        <div style={{ display:'flex',gap:7 }}>
          <button className="btn3d" onClick={pickRandom}
            style={{ background:'#FFE4A0',color:'#1A1A1A',fontSize:12,padding:'7px 14px' }}>🎲 Aleatoria</button>
          <button className="btn3d" onClick={()=>setModal('new')}
            style={{ background:'#7EC8E3',color:'#1A1A1A',fontSize:12,padding:'7px 14px' }}>+ Agregar</button>
        </div>
      </div>

      {/* All recipes list */}
      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
        {allRecipes.map((r, i) => {
          const isCustom = !!r.id?.toString().startsWith('u');
          return (
            <div key={r.id||i}
              style={{ background:'white',border:`2px solid ${C.grayLt}`,borderRadius:12,padding:'9px 12px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',transition:'all 0.15s',boxShadow:`0 2px 0 ${C.grayLt}` }}
              onClick={()=>setRecipe(r)}
              onMouseEnter={e=>{e.currentTarget.style.background=r.color;e.currentTarget.style.transform='translateY(-1px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.transform='';}}>
              <span style={{ fontSize:24,flexShrink:0 }}>{r.emoji}</span>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:'Nunito',fontWeight:800,fontSize:13,color:'#1A1A1A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.name}</div>
                <div style={{ fontFamily:'Nunito',fontSize:11,color:'#AAA' }}>
                  {r.time && `⏱ ${r.time}`}{r.difficulty && ` · 👨‍🍳 ${r.difficulty}`}
                  {r.link && <span style={{ marginLeft:6,color:C.blue }}>🔗</span>}
                </div>
              </div>
              <button onClick={e=>{e.stopPropagation();setModal(r);}}
                  style={{ background:'transparent',border:'none',cursor:'pointer',color:'#BBB',fontSize:14,padding:3,lineHeight:1,flexShrink:0,borderRadius:5 }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#F5F0EB';e.currentTarget.style.color='#555';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#BBB';}}>✏️</button>
              {isCustom && (
                <button onClick={e=>{e.stopPropagation();setCustom(prev=>prev.filter(c=>c.id!==r.id));}}
                  style={{ background:'transparent',border:'none',cursor:'pointer',color:'#DDD',fontSize:16,padding:3,lineHeight:1,flexShrink:0 }}
                  onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>×</button>
              )}
              <span style={{ color:'#CCC',fontSize:14,flexShrink:0 }}>→</span>
            </div>
          );
        })}
      </div>

      {modalRecipe !== null && <AddRecipeModal initial={modalRecipe==='new'?null:modalRecipe} onSave={handleSave} onClose={()=>setModal(null)}/>}
    </div>
  );

  return (
    <>
    <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
      <div className="card-ink" style={{ overflow:'hidden',animation:'popIn 0.35s ease both' }}>
        <div style={{ background:recipe.color,padding:'14px 16px',borderBottom:'2px solid #1A1A1A' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:32 }}>{recipe.emoji}</span>
            <div>
              <div style={{ fontFamily:'Fredoka One',fontSize:18,color:'#1A1A1A' }}>{recipe.name}</div>
              <div style={{ fontFamily:'Nunito',fontSize:11,color:'#555' }}>
                {recipe.time && `⏱${recipe.time}`}{recipe.difficulty && ` • 👨‍🍳${recipe.difficulty}`}
              </div>
            </div>
            <button onClick={()=>setModal(recipe)} className="btn3d"
                style={{ marginLeft:'auto',background:'#FFE4A0',color:'#1A1A1A',fontSize:11,padding:'5px 12px',borderRadius:20,boxShadow:`0 2px 0 #1A1A1A` }}>
                ✏️ Editar
              </button>
          </div>
        </div>
        <div style={{ padding:'14px 16px' }}>
          <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Ingredientes</div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:12 }}>
            {recipe.ingredients.map((ing,i)=>(
              <span key={i} style={{ background:recipe.color,border:'1.5px solid #1A1A1A',borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:11,padding:'3px 9px' }}>
                {typeof ing==='object' ? `${ing.qty ? ing.qty+' ' : ''}${ing.name}` : ing}
              </span>
            ))}
          </div>
          <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Pasos</div>
          {recipe.steps.map((s,i)=>(
            <div key={i} style={{ display:'flex',gap:8,marginBottom:7,alignItems:'flex-start' }}>
              <span style={{ background:'#7EC8E3',border:'2px solid #1A1A1A',borderRadius:20,width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Fredoka One',fontSize:12,flexShrink:0 }}>{i+1}</span>
              <span style={{ fontFamily:'Nunito',fontSize:12,color:'#555',lineHeight:1.5,paddingTop:2 }}>{s}</span>
            </div>
          ))}

          {/* Link source */}
          {recipe.link && (
            <a href={recipe.link} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:5,fontFamily:'Nunito',fontWeight:700,fontSize:12,color:C.blue,marginBottom:12,marginTop:4 }}>
              🔗 Ver receta original
            </a>
          )}

          <div style={{ display:'flex',gap:8,marginTop:8,flexWrap:'wrap' }}>
            <a href="https://www.ubereats.com/gt" target="_blank" rel="noopener noreferrer" className="btn3d"
              style={{ background:'#06C167',color:'white',fontSize:12,padding:'9px 14px',textDecoration:'none' }}>🛵 Uber Eats</a>
            <a href="https://www.pedidosya.com.gt" target="_blank" rel="noopener noreferrer" className="btn3d"
              style={{ background:'#FA0050',color:'white',fontSize:12,padding:'9px 14px',textDecoration:'none' }}>🍔 Pedidos Ya</a>
            <button className="btn3d" onClick={()=>exportPDF(recipe)}
              style={{ background:'white',color:'#1A1A1A',fontSize:12,padding:'9px 12px' }}>📄 PDF</button>
            <button className="btn3d" onClick={()=>shareWhatsApp(recipe)}
              style={{ background:'#25D366',color:'white',fontSize:12,padding:'9px 12px' }}>💬 WhatsApp</button>
            <button className="btn3d" onClick={()=>setRecipe(null)}
              style={{ background:'white',color:'#1A1A1A',fontSize:12,padding:'9px 14px' }}>Otra receta</button>
          </div>
        </div>
      </div>
    </div>
    {modalRecipe !== null && <AddRecipeModal initial={modalRecipe==='new'?null:modalRecipe} onSave={handleSave} onClose={()=>setModal(null)}/>}
  </>);
}

function MoviesView() {
  const [platform,setPlatform]=useState(null);
  if (!platform) return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
      {STREAMING.map(s=>(
        <button key={s.id} onClick={()=>setPlatform(s)} style={{ background:s.color+'22',border:`2.5px solid ${s.color}`,borderRadius:14,padding:'12px 10px',cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
          <div style={{ fontSize:26,marginBottom:4 }}>{s.emoji}</div>
          <div style={{ fontFamily:'Fredoka One',fontSize:15,color:'#1A1A1A' }}>{s.name}</div>
        </button>
      ))}
    </div>
  );
  return (
    <div style={{ animation:'popIn 0.3s ease both' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
        <div style={{ fontFamily:'Fredoka One',fontSize:16,color:'#1A1A1A' }}>{platform.emoji} {platform.name}</div>
        <button onClick={()=>setPlatform(null)} className="btn3d" style={{ background:'white',color:'#1A1A1A',fontSize:11,padding:'5px 11px' }}>← Cambiar</button>
      </div>
      <div className="card" style={{ padding:'12px 14px' }}>
        {platform.suggestions.map((s,i)=>(
          <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:i<platform.suggestions.length-1?`1px solid #E0D8CC`:'none' }}>
            <span style={{ background:platform.color+'22',borderRadius:8,padding:'2px 7px',fontFamily:'Nunito',fontSize:10,fontWeight:700,color:platform.color }}>{i+1}</span>
            <span style={{ fontFamily:'Nunito',fontSize:13,fontWeight:700,color:'#1A1A1A' }}>{s}</span>
          </div>
        ))}
        <a href={platform.url} target="_blank" rel="noopener noreferrer" className="btn3d" style={{ marginTop:12,background:platform.color,color:'white',fontSize:12,padding:'9px 18px',textDecoration:'none',display:'inline-flex' }}>Abrir {platform.name} →</a>
      </div>
    </div>
  );
}

function GamesView() {
  const [picked,setPicked]=useState(null);
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
        <div style={{ fontFamily:'Fredoka One',fontSize:16,color:'#1A1A1A' }}>🎲 Juegos de mesa</div>
        <button className="btn3d" onClick={()=>setPicked(BOARD_GAMES[Math.floor(Math.random()*BOARD_GAMES.length)])} style={{ background:'#B5DEC8',color:'#1A1A1A',fontSize:12,padding:'7px 14px' }}>🎰 Aleatorio</button>
      </div>
      {picked && <div style={{ background:picked.color,border:'2.5px solid #1A1A1A',borderRadius:14,padding:'12px 14px',marginBottom:10,animation:'popIn 0.3s ease both',boxShadow:'0 3px 0 #1A1A1A' }}><div style={{ fontFamily:'Fredoka One',fontSize:17,color:'#1A1A1A' }}>{picked.emoji} {picked.name}</div><div style={{ fontFamily:'Nunito',fontSize:12,color:'#555' }}>👥{picked.players} • ⏱{picked.time} • 🏷{picked.type}</div></div>}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7 }}>
        {BOARD_GAMES.map((g,i)=>(
          <div key={g.id} onClick={()=>setPicked(g)} style={{ background:g.color,border:`2px solid ${picked?.id===g.id?'#1A1A1A':'#E0D8CC'}`,borderRadius:12,padding:'10px 12px',cursor:'pointer',transition:'all 0.15s',animation:`popIn 0.3s ease ${i*0.04}s both`,boxShadow:`0 2px 0 ${picked?.id===g.id?'#1A1A1A':'#E0D8CC'}` }}>
            <div style={{ fontSize:22,marginBottom:3 }}>{g.emoji}</div>
            <div style={{ fontFamily:'Fredoka One',fontSize:13,color:'#1A1A1A' }}>{g.name}</div>
            <div style={{ fontFamily:'Nunito',fontSize:10,color:'#666' }}>{g.players} • {g.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpaView() {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
      {[{emoji:'💆',name:'Masajes en pareja',tip:'Aceite de lavanda, música suave y turnos'},{emoji:'🛁',name:'Baño de espuma',tip:'Bombas de baño, velas aromáticas'},{emoji:'🧴',name:'Mascarillas faciales',tip:'¡Aplíquenselas y ríanse juntos!'},{emoji:'🍷',name:'Vino y relax',tip:'Una copa mientras se relajan'}].map((a,i)=>(
        <div key={i} className="card" style={{ padding:'12px 14px',display:'flex',gap:12,alignItems:'center',animation:`popIn 0.3s ease ${i*0.07}s both` }}>
          <span style={{ fontSize:28 }}>{a.emoji}</span><div><div style={{ fontFamily:'Fredoka One',fontSize:15,color:'#1A1A1A' }}>{a.name}</div><div style={{ fontFamily:'Nunito',fontSize:12,color:'#888' }}>{a.tip}</div></div>
        </div>
      ))}
    </div>
  );
}
function KaraokeView() {
  const songs=['Perfect — Ed Sheeran 🎵','Thinking Out Loud — Ed Sheeran 💕','Can\'t Help Falling in Love — Elvis 🎤','All of Me — John Legend 🎹','A Thousand Years — Christina Perri 🌹','Shallow — Lady Gaga & Bradley Cooper 🎬'];
  return (
    <div>
      <div className="card" style={{ padding:'12px 14px',marginBottom:10 }}>
        {songs.map((s,i)=><div key={i} style={{ padding:'7px 0',borderBottom:i<songs.length-1?'1px solid #E0D8CC':'none',fontFamily:'Nunito',fontSize:13,fontWeight:700,color:'#1A1A1A' }}>{i+1}. {s}</div>)}
      </div>
      <a href="https://www.youtube.com/results?search_query=karaoke+romantico" target="_blank" rel="noopener noreferrer" className="btn3d" style={{ background:'#FF0000',color:'white',fontSize:13,padding:'10px 20px',textDecoration:'none',display:'inline-flex' }}>▶ YouTube Karaoke</a>
    </div>
  );
}
function PuzzleView() {
  return (
    <div className="card" style={{ padding:20,textAlign:'center' }}>
      <div style={{ fontSize:48,marginBottom:10 }}>🧩</div>
      <div style={{ fontFamily:'Fredoka One',fontSize:18,color:'#1A1A1A',marginBottom:8 }}>Rompecabezas</div>
      <p style={{ fontFamily:'Nunito',fontSize:13,color:'#888',lineHeight:1.7,marginBottom:16 }}>500-1000 piezas es el rango ideal para una noche especial juntos. Sin prisa, con mucha complicidad.</p>
      <a href="https://www.amazon.com/s?k=puzzle+romantico" target="_blank" rel="noopener noreferrer" className="btn3d" style={{ background:'#FFE4A0',color:'#1A1A1A',fontSize:13,padding:'10px 20px',textDecoration:'none',display:'inline-flex' }}>🛒 Ver puzzles</a>
    </div>
  );
}