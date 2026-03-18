import React, { useRef, useState, useEffect } from 'react';

const easeOut = t => 1 - Math.pow(1 - t, 4.5);

function getWinnerFromRot(rotDeg, N) {
  const sliceDeg = 360 / N;
  const angle = ((-rotDeg) % 360 + 360) % 360;
  return Math.floor(angle / sliceDeg) % N;
}

// activities = dynamic array (base + custom ideas)
export default function MainRoulette({ activities, size = 310, triggerSpin, onResult }) {
  const N = activities.length;
  const CX = size / 2, R = CX - 14;
  const SLICE_RAD = (2 * Math.PI) / N;
  const SLICE_DEG = 360 / N;

  const [rot, setRot]       = useState(0);
  const [winner, setWinner] = useState(null);
  const [winAnim, setWinAnim] = useState(false);
  const fromRef  = useRef(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    if (!triggerSpin) return;
    const idx = Math.floor(Math.random() * N);
    const sliceCenter = (idx + 0.5) * SLICE_DEG;
    const jitter = (Math.random() - 0.5) * SLICE_DEG * 0.7;
    const targetAngle = (360 - sliceCenter + jitter + 360) % 360;
    const end = fromRef.current + (5 + Math.floor(Math.random() * 3)) * 360 + targetAngle;

    setWinner(null); setWinAnim(false); startRef.current = null;
    cancelAnimationFrame(rafRef.current);

    const animate = ts => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / 5200, 1);
      const cur = fromRef.current + easeOut(t) * (end - fromRef.current);
      setRot(cur);
      if (t < 1) { rafRef.current = requestAnimationFrame(animate); }
      else {
        fromRef.current = end % 360;
        const verified = getWinnerFromRot(end % 360, N);
        setWinner(verified); setTimeout(() => setWinAnim(true), 60);
        onResult(verified);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line
  }, [triggerSpin, N]);

  const arc = i => {
    const s = i * SLICE_RAD - Math.PI / 2, e = s + SLICE_RAD;
    return `M${CX},${CX} L${CX+R*Math.cos(s)},${CX+R*Math.sin(s)} A${R},${R} 0 0,1 ${CX+R*Math.cos(e)},${CX+R*Math.sin(e)} Z`;
  };
  const mid = i => i * SLICE_RAD + SLICE_RAD / 2 - Math.PI / 2;

  // Slice colors: alternate blue/cream
  const SLICE_COLORS = ['#7EC8E3','#EDE0C4','#A8D8EA','#F5EDD8','#C5E8F5','#F0E8D4'];
  const sliceColor = (i, isWin) => isWin ? '#FFE4A0' : SLICE_COLORS[i % SLICE_COLORS.length];

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0, marginTop: 20 }}>
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'white', border:'4px solid #1A1A1A', boxShadow:'0 8px 28px rgba(0,0,0,0.15)' }}/>
      {/* Fixed needle at top */}
      <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', zIndex:20, filter:'drop-shadow(0 3px 5px rgba(0,0,0,0.2))' }}>
        <svg width="26" height="40" viewBox="0 0 26 40">
          <ellipse cx="13" cy="7" rx="9" ry="7" fill="#1A1A1A"/>
          <polygon points="13,38 5,9 21,9" fill="#1A1A1A"/>
          <polygon points="13,32 7,13 19,13" fill="#7EC8E3"/>
          <ellipse cx="13" cy="7" rx="4.5" ry="3.5" fill="#7EC8E3"/>
        </svg>
      </div>
      <svg width={size} height={size} style={{ transform:`rotate(${rot}deg)`, willChange:'transform', borderRadius:'50%', overflow:'hidden' }}>
        {activities.map((act, i) => {
          const isW = winner === i && winAnim;
          const fill = sliceColor(i, isW);
          const m = mid(i);
          const lx = CX + R*0.59*Math.cos(m), ly = CX + R*0.59*Math.sin(m);
          const ex = CX + R*0.83*Math.cos(m), ey = CX + R*0.83*Math.sin(m);
          const ang = (m * 180) / Math.PI + 90;
          const fontSize = N > 10 ? 7 : N > 8 ? 8 : 9;
          const emojiFontSize = N > 10 ? 13 : N > 8 ? 15 : 17;
          return (
            <g key={act.id}>
              <path d={arc(i)} fill={fill} stroke="#1A1A1A" strokeWidth="1.8" style={{ transition:isW?'fill 0.35s':'none' }}/>
              <text x={ex} y={ey} textAnchor="middle" dominantBaseline="middle" fontSize={emojiFontSize} style={{ userSelect:'none', pointerEvents:'none' }}>{act.emoji}</text>
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#1A1A1A" fontSize={fontSize} fontFamily="Nunito,sans-serif" fontWeight="900"
                style={{ userSelect:'none', pointerEvents:'none', transform:`rotate(${ang}deg)`, transformOrigin:`${lx}px ${ly}px` }}>
                {(act.label || act.name.toUpperCase().slice(0,8))}
              </text>
            </g>
          );
        })}
        <circle cx={CX} cy={CX} r={28} fill="white" stroke="#1A1A1A" strokeWidth="2.5"/>
        <circle cx={CX} cy={CX} r={18} fill="#7EC8E3" stroke="#1A1A1A" strokeWidth="1.5"/>
        <text x={CX} y={CX+1} textAnchor="middle" dominantBaseline="middle" fontSize="13">🐾</text>
        {activities.map((_, i) => { const a = i*SLICE_RAD - Math.PI/2; return <circle key={i} cx={CX+(R-1)*Math.cos(a)} cy={CX+(R-1)*Math.sin(a)} r={3.5} fill="white" stroke="#1A1A1A" strokeWidth="1.5"/>; })}
      </svg>
      {winAnim && <div style={{ position:'absolute', inset:-7, borderRadius:'50%', border:'2.5px dashed #7EC8E3', animation:'spinRing 3s linear infinite', pointerEvents:'none' }}/>}
    </div>
  );
}
