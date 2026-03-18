import React, { useState } from 'react';
import MiniRoulette from '../roulette/MiniRoulette';
import { HOME_OPTIONS, RECIPES, STREAMING, BOARD_GAMES } from '../../data';
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

function CookView() {
  const [recipe,setRecipe]=useState(null);
  if (!recipe) return (
    <div className="card" style={{ padding:20,textAlign:'center' }}>
      <div style={{ fontSize:48,marginBottom:10,animation:'float 3s ease-in-out infinite' }}>👨‍🍳</div>
      <div style={{ fontFamily:'Fredoka One',fontSize:18,color:'#1A1A1A',marginBottom:8 }}>¿Qué cocinamos?</div>
      <button className="btn3d" onClick={()=>setRecipe(RECIPES[Math.floor(Math.random()*RECIPES.length)])} style={{ background:'#FFE4A0',color:'#1A1A1A',fontSize:15,padding:'11px 24px' }}>🎲 Receta aleatoria</button>
    </div>
  );
  return (
    <div className="card-ink" style={{ overflow:'hidden',animation:'popIn 0.35s ease both' }}>
      <div style={{ background:recipe.color,padding:'14px 16px',borderBottom:'2px solid #1A1A1A' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}><span style={{ fontSize:32 }}>{recipe.emoji}</span><div><div style={{ fontFamily:'Fredoka One',fontSize:18,color:'#1A1A1A' }}>{recipe.name}</div><div style={{ fontFamily:'Nunito',fontSize:11,color:'#555' }}>⏱{recipe.time} • 👨‍🍳{recipe.difficulty}</div></div></div>
      </div>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Ingredientes</div>
        <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:12 }}>{recipe.ingredients.map((ing,i)=><span key={i} style={{ background:recipe.color,border:'1.5px solid #1A1A1A',borderRadius:20,fontFamily:'Nunito',fontWeight:700,fontSize:11,padding:'3px 9px' }}>{ing}</span>)}</div>
        <div style={{ fontFamily:'Nunito',fontWeight:900,fontSize:10,color:'#AAA',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Pasos</div>
        {recipe.steps.map((s,i)=><div key={i} style={{ display:'flex',gap:8,marginBottom:7,alignItems:'flex-start' }}><span style={{ background:'#7EC8E3',border:'2px solid #1A1A1A',borderRadius:20,width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Fredoka One',fontSize:12,flexShrink:0 }}>{i+1}</span><span style={{ fontFamily:'Nunito',fontSize:12,color:'#555',lineHeight:1.5,paddingTop:2 }}>{s}</span></div>)}
        <div style={{ display:'flex',gap:8,marginTop:12,flexWrap:'wrap' }}>
          <a href={recipe.delivery} target="_blank" rel="noopener noreferrer" className="btn3d" style={{ background:'#FF6B35',color:'white',fontSize:12,padding:'9px 16px',textDecoration:'none' }}>🚀 Pedir ingredientes</a>
          <button className="btn3d" onClick={()=>setRecipe(null)} style={{ background:'white',color:'#1A1A1A',fontSize:12,padding:'9px 14px' }}>Otra receta</button>
        </div>
      </div>
    </div>
  );
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
