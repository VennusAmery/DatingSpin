import React, { useState, useRef } from 'react';
import MainRoulette from './components/roulette/MainRoulette';
import MiniRoulette from './components/roulette/MiniRoulette';
import CinemaView from './components/sub/CinemaView';
import FoodView from './components/sub/FoodView';
import HomeNightView from './components/sub/HomeNightView';
import PlacesList from './components/sub/PlacesList';
import IcebreakerPage from './components/icebreaker/IcebreakerPage';
import DiaryPage from './components/diary/DiaryPage';
import PlannerPage from './components/planner/PlannerPage';
import { useGeolocation, useLocalStorage } from './hooks';
import { BASE_ACTIVITIES } from './data';
import { C, GLOBAL_CSS } from './utils/theme';

function ideaToActivity(idea) {
  return {
    id:`idea_${idea.id}`, name:idea.title,
    label:idea.title.toUpperCase().slice(0,9),
    emoji:idea.emoji, isCustom:true, customIdea:idea,
    cardColor:'#FFF0F8', cardBorder:'#FFB3C1', iconBg:'#FFB3C1',
    tagline:idea.note||'¡Una idea personalizada! 💡',
    hasSubRoulette:!!(idea.subRoulette&&idea.subRoulette.length>0), osmType:null,
  };
}



const TABS=[{id:'roulette',label:'Ruleta',emoji:'🎰'},{id:'icebreaker',label:'Rompehielos',emoji:'💬'},{id:'planner',label:'Planear',emoji:'🗓'},{id:'diary',label:'Diario',emoji:'📖'}];
const OSM_MAP={bars:'bar',outdoor:'park',culture:'museum',adventure:'gym', hot:'hot'};
const EMOJIS=['🌟','💫','🎯','🎪','🎭','🎨','🎬','🍕','🌮','🍣','🍷','🍸','🧁','🌿','⛰️','🎸', '🌶️', '🎲','🧩','🛶','✈️','🏖️','🌃','💎','🌹','🎁','🦋','🌈','🎡','🎠','🎢','🏄','🚴','🤿','🏕️','🌌','🌙','☀️','🌊','🏔️','🎻','🥁','🎹','🥩','🦞','🦀','🍦','🧇','🥞','🍫','🍩'];

function SubPanel({activity,userLocation,onNeedLocation}){
  const[chosen,setChosen]=useState(null);
  if(!activity)return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,textAlign:'center'}}>
      <div style={{fontSize:52,animation:'float 3s ease-in-out infinite'}}>🎡</div>
      <div style={{fontFamily:'Fredoka One',fontSize:17,color:'#C8C0B4',lineHeight:1.4}}>¡Gira para ver<br/>los planes aquí!</div>
      <p style={{fontFamily:'Nunito',fontWeight:600,fontSize:11,color:'#D8D0C8'}}>Los detalles aparecerán en este panel 👈</p>
    </div>
  );
  if(activity.id==='cinema')return<CinemaView/>;
  if(activity.id==='home')return<HomeNightView/>;
  if(activity.id==='dinner'||activity.id==='food')return<FoodView activityId={activity.id} userLocation={userLocation} onNeedLocation={onNeedLocation}/>;
  if(activity.isCustom){
    const idea=activity.customIdea;
    const act=BASE_ACTIVITIES.find(a=>a.id===idea.activityId);
    const subItems=(idea.subRoulette||[]).map((s,i)=>({id:`s${i}`,name:s.name,emoji:s.emoji,color:['#FFE4A0','#A8D8EA','#FFB3C1','#B5DEC8','#C5B8E8','#FFD4A0','#F5B8A0','#E8D4F0'][i%8]}));
    return(
      <div style={{height:'100%',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{background:'#FFF0F8',border:'2.5px solid #1A1A1A',borderRadius:16,padding:'12px 14px',boxShadow:'0 3px 0 #1A1A1A',flexShrink:0}}>
          <div style={{fontFamily:'Fredoka One',fontSize:18,color:C.ink}}>{idea.emoji} {idea.title}</div>
          {idea.note&&<p style={{fontFamily:'Nunito',fontSize:12,color:'#666',marginTop:4,lineHeight:1.5}}>{idea.note}</p>}
          {act&&<span style={{display:'inline-block',marginTop:6,background:act.cardColor,border:`1.5px solid ${act.cardBorder}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:11,padding:'2px 9px'}}>{act.emoji} {act.name}</span>}
        </div>
        {subItems.length>0&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,flexShrink:0}}>
            <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:10,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em'}}>🎲 Sub-ruleta</div>
            <MiniRoulette items={subItems} onResult={idx=>setChosen(subItems[idx])} size={210}/>
            {chosen&&(
              <div style={{background:chosen.color,border:'2.5px solid #1A1A1A',borderRadius:14,padding:'10px 16px',textAlign:'center',boxShadow:'0 3px 0 #1A1A1A',animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',width:'100%',maxWidth:240}}>
                <div style={{fontFamily:'Fredoka One',fontSize:18,color:C.ink}}>{chosen.emoji} {chosen.name}</div>
              </div>
            )}
          </div>
        )}
        {idea.activityId&&OSM_MAP[idea.activityId]&&(
          <div style={{flex:1,minHeight:0}}>
            <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:10,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>📍 Lugares cercanos</div>
            <PlacesList osmType={OSM_MAP[idea.activityId]} userLocation={userLocation} onNeedLocation={onNeedLocation} cardColor="#FFF0F8" iconBg="#FFB3C1" label={idea.title}/>
          </div>
        )}
      </div>
    );
  }
  return<PlacesList osmType={OSM_MAP[activity.id]||'restaurant'} userLocation={userLocation} onNeedLocation={onNeedLocation} cardColor={activity.cardColor} iconBg={activity.iconBg} label={activity.name}/>;
}

function EmojiPicker({value,onChange,dropUp}){
  const[open,setOpen]=useState(false);
  return(
    <div style={{position:'relative',flexShrink:0}}>
      <button onClick={()=>setOpen(p=>!p)} style={{width:46,height:46,background:'#F5F0EB',border:'2.5px solid #1A1A1A',borderRadius:13,fontSize:23,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{value}</button>
      {open&&(
        <div style={{position:'absolute',[dropUp?'bottom':'top']:52,left:0,background:'white',border:'2.5px solid #1A1A1A',borderRadius:14,padding:8,display:'flex',flexWrap:'wrap',gap:3,zIndex:300,width:224,boxShadow:'0 8px 24px rgba(0,0,0,0.18)',maxHeight:200,overflowY:'auto'}}>
          {EMOJIS.map(e=>(
            <button key={e} onClick={()=>{onChange(e);setOpen(false);}} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:20,padding:4,borderRadius:6}}
              onMouseEnter={el=>el.currentTarget.style.background='#F5F0EB'} onMouseLeave={el=>el.currentTarget.style.background='transparent'}>{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaModal({initial,onSave,onClose}){
  const isEdit=!!initial;
  const[form,setForm]=useState(initial?{...initial}:{title:'',emoji:'🌟',activityId:'',note:'',subRoulette:[]});
  const[newName,setNewName]=useState('');
  const[newEmoji,setNewEmoji]=useState('🎯');
  const addSub=()=>{ if(!newName.trim())return; setForm(f=>({...f,subRoulette:[...(f.subRoulette||[]),{name:newName.trim(),emoji:newEmoji}]})); setNewName(''); setNewEmoji('🎯'); };
  const remSub=i=>setForm(f=>({...f,subRoulette:f.subRoulette.filter((_,j)=>j!==i)}));
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
      <div style={{background:'white',border:'3px solid #1A1A1A',borderRadius:22,padding:'18px',width:'100%',maxWidth:420,maxHeight:'90dvh',overflowY:'auto',boxShadow:'0 8px 0 #1A1A1A',animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{fontFamily:'Fredoka One',fontSize:18,color:C.ink}}>{isEdit?'✏️ Editar idea':'💡 Nueva idea de cita'}</div>
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:20,color:'#AAA',lineHeight:1}}>×</button>
        </div>

        <Label>Emoji y nombre *</Label>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <EmojiPicker value={form.emoji} onChange={e=>setForm(f=>({...f,emoji:e}))}/>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Nombre de la idea..."
            style={{flex:1,background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:14,padding:'9px 12px'}}/>
        </div>

        <Label>Categoría (busca lugares de este tipo)</Label>
        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
          {BASE_ACTIVITIES.map(a=>(
            <button key={a.id} onClick={()=>setForm(f=>({...f,activityId:f.activityId===a.id?'':a.id}))}
              style={{background:form.activityId===a.id?a.cardColor:'white',border:`1.5px solid ${form.activityId===a.id?a.cardBorder:C.grayLt}`,borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:11,padding:'4px 10px',cursor:'pointer',transition:'all 0.15s'}}>
              {a.emoji} {a.name}
            </button>
          ))}
        </div>

        <Label>Concepto / descripción</Label>
        <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Describe la idea, qué incluye, qué quieren hacer..."
          style={{width:'100%',background:'white',border:`2px solid ${C.grayLt}`,borderRadius:10,fontSize:13,padding:'9px 12px',height:60,resize:'none',marginBottom:14}}/>

        <div style={{background:'#F5F0EB',border:`2px solid ${C.grayLt}`,borderRadius:14,padding:'12px 14px',marginBottom:14}}>
          <Label>🎲 Sub-ruleta personalizada <span style={{fontFamily:'Nunito',fontWeight:600,fontSize:10,color:'#BBB',textTransform:'none',letterSpacing:0}}>(opcional)</span></Label>
          {(form.subRoulette||[]).length>0&&(
            <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:10}}>
              {form.subRoulette.map((item,i)=>(
                <div key={i} style={{background:'white',border:`1.5px solid ${C.grayLt}`,borderRadius:9,padding:'5px 10px',display:'flex',alignItems:'center',gap:7}}>
                  <span style={{fontSize:16}}>{item.emoji}</span>
                  <span style={{fontFamily:'Nunito',fontWeight:700,fontSize:12,color:C.ink,flex:1}}>{item.name}</span>
                  <button onClick={()=>remSub(i)} style={{background:'transparent',border:'none',cursor:'pointer',color:'#DDD',fontSize:16,lineHeight:1,padding:2}}
                    onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <EmojiPicker value={newEmoji} onChange={setNewEmoji} dropUp/>
            <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSub()}
              placeholder="Opción para sub-ruleta... (Enter)"
              style={{flex:1,background:'white',border:`2px solid ${C.grayLt}`,borderRadius:9,fontSize:12,padding:'7px 10px'}}/>
            <button className="btn3d" onClick={addSub} style={{background:'#7EC8E3',color:C.ink,fontSize:13,padding:'7px 12px',borderRadius:20,boxShadow:`0 2px 0 ${C.ink}`,flexShrink:0}}>+</button>
          </div>
          {!(form.subRoulette||[]).length&&<p style={{fontFamily:'Nunito',fontSize:11,color:'#BBB',marginTop:8,marginBottom:0}}>Agrega opciones para una mini-ruleta dentro de esta idea ✨</p>}
        </div>

        <div style={{display:'flex',gap:8}}>
          <button className="btn3d" onClick={onClose} style={{flex:1,background:'white',color:'#888',fontSize:12,padding:'10px',borderColor:C.grayLt,boxShadow:`0 2px 0 ${C.grayLt}`}}>Cancelar</button>
          <button className="btn3d" onClick={()=>{if(form.title.trim()){onSave(form);onClose();}}} disabled={!form.title.trim()}
            style={{flex:2,background:'#7EC8E3',color:C.ink,fontSize:14,padding:'10px'}}>
            {isEdit?'💾 Guardar cambios':'✅ Agregar a ruleta'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({children}){return<div style={{fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#888',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{children}</div>;}

export default function App(){
  const[tab,setTab]=useState('roulette');
  const[triggerSpin,setTrig]=useState(0);
  const[spinning,setSpinning]=useState(false);
  const[actIdx,setActIdx]=useState(null);
  const[showSub,setShowSub]=useState(false);
  const[ideaModal,setIdeaModal]=useState(null);
  const[customIdeas,setCustomIdeas]=useLocalStorage('spindocky-custom-ideas',[]);
  const{location,error:geoErr,loading:geoLoad,getLocation}=useGeolocation();
  const spinRef=useRef(0);

  const allActivities=[...BASE_ACTIVITIES,...customIdeas.map(ideaToActivity)];

  const doSpin=()=>{ if(spinning)return; setShowSub(false);setActIdx(null);setSpinning(true); spinRef.current+=1;setTrig(spinRef.current); };
  const handleResult=idx=>{ setSpinning(false);setActIdx(idx);setTimeout(()=>setShowSub(true),300); };
  const handleLocation=async()=>{ try{await getLocation();}catch{} };

  const saveIdea=form=>{
    if(ideaModal&&ideaModal!=='add') setCustomIdeas(prev=>prev.map(i=>i.id===ideaModal.id?{...i,...form}:i));
    else setCustomIdeas(prev=>[...prev,{id:Date.now(),...form}]);
  };
  const removeIdea=id=>{ setCustomIdeas(prev=>prev.filter(i=>i.id!==id)); if(actIdx!==null&&allActivities[actIdx]?.id===`idea_${id}`){setActIdx(null);setShowSub(false);} };

  const activity=actIdx!==null?allActivities[actIdx]:null;

  return(
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{width:'100vw',height:'100dvh',display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden',maxWidth:1100,margin:'0 auto'}}>

        {/* HEADER */}
        <header style={{background:'white',borderBottom:`3px solid ${C.ink}`,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',flexShrink:0,boxShadow:`0 3px 0 ${C.grayLt}`,zIndex:50}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <img src="/logo.png" alt="SpinDocky" style={{width:34,height:34,borderRadius:10,border:'2px solid #1A1A1A',boxShadow:'0 2px 0 #1A1A1A',objectFit:'cover'}}/>
            <div>
              <div style={{fontFamily:'Fredoka One',fontSize:18,color:C.ink,lineHeight:1}}>Spin<span style={{color:C.blue}}>Docky</span></div>
              <div style={{fontFamily:'Nunito',fontSize:8,fontWeight:800,color:'#AAA',letterSpacing:'0.06em',textTransform:'uppercase'}}>Date Night Roulette 🐾</div>
            </div>
          </div>
          <button onClick={handleLocation} disabled={geoLoad}
            style={{background:location?'#EDFAF3':'white',border:`2px solid ${location?C.blueDk:C.grayLt}`,borderRadius:20,color:location?C.green:'#888',fontFamily:'Nunito',fontWeight:800,fontSize:11,padding:'5px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:4,transition:'all 0.15s',boxShadow:`0 2px 0 ${location?C.blueDk:C.grayLt}`}}>
            📍 {geoLoad?'Localizando...':location?'Ubicación activa':'Activar ubicación'}
          </button>
        </header>

        {geoErr&&<div style={{background:'#FFF5F5',borderBottom:`1px solid #FFBABA`,padding:'4px 14px',fontFamily:'Nunito',fontWeight:700,fontSize:11,color:'#C05050',flexShrink:0,textAlign:'center'}}>{geoErr}</div>}

        {/* TABS */}
        <div style={{background:'white',borderBottom:`2px solid ${C.grayLt}`,display:'flex',flexShrink:0,padding:'0 4px'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{flex:1,background:'transparent',border:'none',borderBottom:`3px solid ${tab===t.id?C.ink:'transparent'}`,fontFamily:'Nunito',fontWeight:800,fontSize:12,color:tab===t.id?C.ink:'#AAA',padding:'8px 6px',cursor:'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
              <span style={{fontSize:13}}>{t.emoji}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflow:'hidden'}}>

          {tab==='roulette'&&(
            <div style={{height:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',overflow:'hidden'}}>

              {/* LEFT */}
              <div style={{borderRight:`2px solid ${C.grayLt}`,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 12px 8px',gap:8,overflowY:'auto'}}>
                <div style={{textAlign:'center',width:'100%'}}>
                  <h1 style={{fontFamily:'Fredoka One',fontSize:17,color:C.ink,lineHeight:1.2,margin:0}}>
                    ¿Qué hacemos <span style={{color:C.blue}}> el día de hoy?</span> 🌙
                  </h1>
                  <p style={{fontFamily:'Nunito',fontWeight:600,fontSize:10,color:'#AAA',margin:'2px 0 0'}}>
                    {allActivities.length} opciones · Gira 🐾
                  </p>
                </div>

                {/* Wheel — same top margin as sub-panel content */}
                <MainRoulette activities={allActivities} triggerSpin={triggerSpin} onResult={handleResult} size={272}/>

                <div style={{display:'flex',gap:7,width:'100%',maxWidth:272}}>
                  <button className="btn3d" onClick={doSpin} disabled={spinning}
                    style={{flex:1,background:spinning?C.grayLt:C.blue,color:C.ink,fontSize:14,padding:'10px',animation:!spinning&&actIdx===null?'wiggle 2.5s ease-in-out infinite':'none'}}>
                    {spinning?'🌀 Docky esta pensando...':'🎰 ¡Girar!'}
                  </button>
                </div>

                {activity&&showSub&&(
                  <div style={{background:activity.cardColor,border:`2px solid ${C.ink}`,borderRadius:12,padding:'8px 12px',width:'100%',maxWidth:272,display:'flex',alignItems:'center',gap:9,boxShadow:`0 3px 0 ${C.ink}`,animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',flexShrink:0}}>
                    <span style={{fontSize:22}}>{activity.emoji}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:'Nunito',fontSize:9,fontWeight:800,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.07em'}}>Docky eligió 🎉</div>
                      <div style={{fontFamily:'Fredoka One',fontSize:16,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activity.name}</div>
                    </div>
                  </div>
                )}

                {/* Custom ideas */}
                <div style={{width:'100%',maxWidth:272,borderTop:`1.5px solid ${C.grayLt}`,paddingTop:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase'}}>Mis ideas ({customIdeas.length})</div>
                    <button className="btn3d" onClick={()=>setIdeaModal('add')}
                      style={{background:'#FFE4A0',color:C.ink,fontSize:10,padding:'3px 10px',borderRadius:20,boxShadow:`0 2px 0 ${C.ink}`}}>+ Idea</button>
                  </div>
                  {customIdeas.length>0?(
                    <div style={{display:'flex',flexDirection:'column',gap:4, maxHeight: 'calc(3 * 40px)', overflowY: 'auto', paddingRight: 2,}}>
                      {customIdeas.map(idea=>(
                        <div key={idea.id} style={{background:'white',border:`1.5px solid ${C.grayLt}`,borderRadius:10,padding:'5px 9px',display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:15,flexShrink:0}}>{idea.emoji}</span>
                          <span style={{fontFamily:'Nunito',fontWeight:700,fontSize:11,color:C.ink,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{idea.title}</span>
                          {idea.subRoulette?.length>0&&<span style={{fontSize:11,flexShrink:0}} title={`${idea.subRoulette.length} opciones`}>🎲</span>}
                          <button onClick={()=>setIdeaModal({...idea})}
                            style={{background:'transparent',border:'none',cursor:'pointer',color:'#BBB',fontSize:13,padding:'2px 3px',lineHeight:1,flexShrink:0,borderRadius:5}}
                            onMouseEnter={e=>{e.currentTarget.style.background='#F5F0EB';e.currentTarget.style.color='#555';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#BBB';}}>✏️</button>
                          <button onClick={()=>removeIdea(idea.id)}
                            style={{background:'transparent',border:'none',cursor:'pointer',color:'#DDD',fontSize:15,padding:'2px 3px',lineHeight:1,flexShrink:0}}
                            onMouseEnter={e=>e.target.style.color='#FF6B6B'} onMouseLeave={e=>e.target.style.color='#DDD'}>×</button>
                        </div>
                      ))}
                    </div>
                  ):(
                    <div style={{background:`${C.yellow}44`,border:`1.5px dashed ${C.yellow}`,borderRadius:10,padding:'8px 10px',textAlign:'center'}}>
                      <div style={{fontFamily:'Nunito',fontWeight:700,fontSize:11,color:'#B8860B'}}>💡 ¡Agrega tus propias ideas!</div>
                      <div style={{fontFamily:'Nunito',fontSize:9,color:'#AAA',marginTop:1}}>Aparecen en la ruleta automáticamente</div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div style={{display:'flex',flexDirection:'column',padding:'10px 12px 8px',overflowY:'auto',gap:8}}>
                <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase',flexShrink:0}}>
                  {activity?((activity.hasSubRoulette||['cinema','home','dinner','food'].includes(activity.id))?'🎲 Sub-Ruleta':'📍 Lugares cercanos'):'🎡 Sub-Ruleta'}
                </div>
                <div style={{flex:1,minHeight:0,opacity:showSub?1:0,transition:'opacity 0.4s',display:'flex',flexDirection:'column'}}>
                  <SubPanel key={actIdx} activity={activity} userLocation={location} onNeedLocation={handleLocation}/>
                </div>
              </div>
            </div>
          )}

          {tab==='icebreaker'&&<div style={{height:'100%',padding:'12px',overflowY:'auto'}}><IcebreakerPage/></div>}
          {tab==='planner'&&<div style={{height:'100%',padding:'12px',overflowY:'auto'}}><PlannerPage/></div>}
          {tab==='diary'&&<div style={{height:'100%',padding:'12px',overflowY:'auto'}}><DiaryPage/></div>}
        </div>
      </div>

      {ideaModal!==null&&(
        <IdeaModal initial={ideaModal==='add'?null:ideaModal} onSave={saveIdea} onClose={()=>setIdeaModal(null)}/>
      )}
    </>
  );
}
