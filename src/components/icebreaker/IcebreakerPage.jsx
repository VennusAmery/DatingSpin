import React, { useState } from 'react';
import { ICEBREAKERS } from '../../data';
import { useLocalStorage } from '../../hooks';
import { C } from '../../utils/theme';

const CATS = [
  { id:'divertidas', name:'Divertidas', emoji:'😄', color:'#FFE4A0' },
  { id:'profundas',  name:'Profundas',  emoji:'💭', color:'#C5B8E8' },
  { id:'romanticas', name:'Románticas', emoji:'💕', color:'#FFB3C1' },
  { id:'retos',      name:'Retos',      emoji:'🔥', color:'#FFB085' },
];

// ── Modal: pregunta en grande ─────────────────────────────────────────────────
function QuestionModal({ question, cat, onClose, onNext }) {
  const current = CATS.find(c => c.id === cat);
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', border:'3px solid #1A1A1A', borderRadius:28, padding:'32px 28px', width:'100%', maxWidth:420, boxShadow:'0 10px 0 #1A1A1A', animation:'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both', textAlign:'center' }}>
        {/* Docky */}
        <div style={{ width:72, height:72, background:current.color, border:'3px solid #1A1A1A', borderRadius:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, boxShadow:'0 4px 0 #1A1A1A', margin:'0 auto 20px' }}>
          🐾
        </div>
        {/* Category badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:current.color, border:'2px solid #1A1A1A', borderRadius:20, fontFamily:'Nunito', fontWeight:800, fontSize:12, padding:'4px 12px', marginBottom:20 }}>
          {current.emoji} {current.name}
        </div>
        {/* Question */}
        <div style={{ fontFamily:'Fredoka One', fontSize:24, color:C.ink, lineHeight:1.4, marginBottom:28 }}>
          {question}
        </div>
        {/* Buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn3d" onClick={onClose}
            style={{ flex:1, background:'white', color:'#888', fontSize:13, padding:'11px', borderColor:C.grayLt, boxShadow:`0 2px 0 ${C.grayLt}` }}>
            Cerrar
          </button>
          <button className="btn3d" onClick={onNext}
            style={{ flex:2, background:current.color, color:C.ink, fontSize:15, padding:'11px' }}>
            {current.emoji} Otra pregunta
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: agregar pregunta ───────────────────────────────────────────────────
function AddQuestionModal({ onSave, onClose, custom }) {
  const [text, setText]   = useState('');
  const [type, setType]   = useState('divertidas');

  const save = () => {
    if (!text.trim()) return;
    onSave(type, text.trim());
    onClose();
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', border:'3px solid #1A1A1A', borderRadius:24, padding:'22px 20px', width:'100%', maxWidth:400, boxShadow:'0 8px 0 #1A1A1A', animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:'Fredoka One', fontSize:18, color:C.ink }}>✏️ Nueva pregunta</div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:20, color:'#AAA', lineHeight:1 }}>×</button>
        </div>

        {/* Type selector */}
        <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
          Tipo de pregunta
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:16 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setType(c.id)}
              style={{ background:type===c.id?c.color:'white', border:`2px solid ${type===c.id?C.ink:C.grayLt}`, borderRadius:12, fontFamily:'Nunito', fontWeight:800, fontSize:12, padding:'9px 10px', cursor:'pointer', textAlign:'left', transition:'all 0.15s', boxShadow:type===c.id?`0 2px 0 ${C.ink}`:`0 1px 0 ${C.grayLt}` }}>
              <span style={{ fontSize:18, display:'block', marginBottom:2 }}>{c.emoji}</span>
              {c.name}
              {(custom[c.id]||[]).length > 0 && (
                <span style={{ fontFamily:'Nunito', fontSize:10, color:'#888', marginLeft:4 }}>+{custom[c.id].length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
          Pregunta
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Escribe tu pregunta o reto aquí..."
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && save()}
          style={{ width:'100%', background:'white', border:`2px solid ${C.grayLt}`, borderRadius:10, fontSize:13, padding:'10px 12px', height:80, resize:'none', marginBottom:16 }}/>

        {/* Existing custom questions for selected type */}
        {(custom[type]||[]).length > 0 && (
          <div style={{ background:'#F5F0EB', borderRadius:12, padding:'10px 12px', marginBottom:16, maxHeight:100, overflowY:'auto' }}>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:10, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
              Ya agregadas en {CATS.find(c=>c.id===type)?.name} ({custom[type].length})
            </div>
            {custom[type].map((q, i) => (
              <div key={i} style={{ fontFamily:'Nunito', fontSize:11, color:'#666', paddingBottom:3, lineHeight:1.4 }}>• {q}</div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn3d" onClick={onClose}
            style={{ flex:1, background:'white', color:'#888', fontSize:13, padding:'10px', borderColor:C.grayLt, boxShadow:`0 2px 0 ${C.grayLt}` }}>
            Cancelar
          </button>
          <button className="btn3d" onClick={save} disabled={!text.trim()}
            style={{ flex:2, background:'#7EC8E3', color:C.ink, fontSize:14, padding:'10px' }}>
            ✅ Agregar pregunta
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IcebreakerPage() {
  const [cat, setCat]         = useState('divertidas');
  const [question, setQ]      = useState(null);
  const [spinning, setSpin]   = useState(false);
  const [history, setHist]    = useState([]);
  const [custom, setCustom]   = useLocalStorage('spindocky-icebreakers', { divertidas:[], profundas:[], romanticas:[], retos:[] });
  const [showQ, setShowQ]     = useState(false);   // question modal
  const [showAdd, setShowAdd] = useState(false);   // add question modal

  const current      = CATS.find(c => c.id === cat);
  const allQuestions = [...ICEBREAKERS[cat], ...(custom[cat] || [])];

  const spin = () => {
    setSpin(true); setQ(null);
    setTimeout(() => {
      const avail = allQuestions.filter(q => !history.slice(-allQuestions.length + 1).includes(q));
      const src   = avail.length > 0 ? avail : allQuestions;
      const q     = src[Math.floor(Math.random() * src.length)];
      setQ(q); setHist(h => [...h, q]); setSpin(false);
      setShowQ(true); // open modal with the question
    }, 800);
  };

  const nextQuestion = () => {
    const avail = allQuestions.filter(q => !history.slice(-allQuestions.length + 1).includes(q));
    const src   = avail.length > 0 ? avail : allQuestions;
    const q     = src[Math.floor(Math.random() * src.length)];
    setQ(q); setHist(h => [...h, q]);
  };

  const saveQuestion = (type, text) => {
    setCustom(prev => ({ ...prev, [type]: [...(prev[type] || []), text] }));
  };

  const removeCustomQ = (type, idx) => {
    setCustom(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));
  };

  return (
    <>
      <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
        {/* Header */}
        <div className="card-ink" style={{ padding:'14px 18px', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>💬 Rompehielos de Docky</div>
            <p style={{ fontFamily:'Nunito', fontSize:12, color:'#888', marginTop:2 }}>Preguntas y retos para conocerse mejor ✨</p>
          </div>
          <button className="btn3d" onClick={() => setShowAdd(true)}
            style={{ background:'#FFE4A0', color:C.ink, fontSize:12, padding:'8px 14px', flexShrink:0 }}>
            ✏️ Agregar
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, flexShrink:0 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => { setCat(c.id); setQ(null); }}
              style={{ background:cat===c.id?c.color:'#fff', border:`2.5px solid ${cat===c.id?C.ink:C.grayLt}`, borderRadius:14, padding:'10px 12px', fontFamily:'Nunito', fontWeight:800, fontSize:13, color:C.ink, cursor:'pointer', textAlign:'left', boxShadow:cat===c.id?`0 3px 0 ${C.ink}`:`0 2px 0 ${C.grayLt}`, transition:'all 0.15s' }}>
              <span style={{ fontSize:20, display:'block', marginBottom:2 }}>{c.emoji}</span>
              {c.name}
              {(custom[c.id]||[]).length > 0 && (
                <span style={{ fontFamily:'Nunito', fontSize:10, fontWeight:700, color:'#888', marginLeft:4 }}>+{custom[c.id].length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Docky + question placeholder */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          <div style={{ width:80, height:80, background:'#7EC8E3', border:'3px solid #1A1A1A', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, boxShadow:'0 5px 0 #1A1A1A', animation:spinning?'spin360 0.8s linear':'float 3s ease-in-out infinite' }}>
            🐾
          </div>

          <div style={{ border:`2px dashed ${C.grayLt}`, borderRadius:22, padding:'24px 28px', textAlign:'center', maxWidth:360, width:'100%' }}>
            <div style={{ fontFamily:'Fredoka One', fontSize:16, color:'#C8C0B4' }}>
              {spinning ? '✨ Eligiendo pregunta...' : question ? `"${question.slice(0, 40)}${question.length > 40 ? '...' : ''}"` : 'Presiona para una pregunta 👆'}
            </div>
            {question && !spinning && (
              <button onClick={() => setShowQ(true)}
                style={{ marginTop:10, background:'transparent', border:`1.5px solid ${C.grayLt}`, borderRadius:20, fontFamily:'Nunito', fontWeight:700, fontSize:11, color:'#AAA', padding:'4px 12px', cursor:'pointer' }}>
                Ver completa →
              </button>
            )}
          </div>

          <button className="btn3d" onClick={spin} disabled={spinning}
            style={{ background:current.color, color:C.ink, fontSize:16, padding:'13px 36px', minWidth:210 }}>
            {spinning ? '🌀 Eligiendo...' : `${current.emoji} Nueva pregunta`}
          </button>
        </div>
      </div>

      {/* Question modal */}
      {showQ && question && (
        <QuestionModal
          question={question}
          cat={cat}
          onClose={() => setShowQ(false)}
          onNext={() => { nextQuestion(); }}
        />
      )}

      {/* Add question modal */}
      {showAdd && (
        <AddQuestionModal
          custom={custom}
          onSave={saveQuestion}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}