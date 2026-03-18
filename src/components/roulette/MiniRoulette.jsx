import React, { useRef, useState, useEffect } from 'react';

const easeOut = t => 1 - Math.pow(1 - t, 4);

function getWinnerFromRot(rotDeg, N) {
  const sliceDeg = 360 / N;
  const angle = ((-rotDeg) % 360 + 360) % 360;
  return Math.floor(angle / sliceDeg) % N;
}

export default function MiniRoulette({ items, onResult, size = 260, duration = 3800 }) {
  const N = items.length;
  const CX = size / 2, R = CX - 12;
  const SLICE_RAD = (2 * Math.PI) / N;
  const SLICE_DEG = 360 / N;

  const [rot, setRot]       = useState(0);
  const [spinning, setSpin] = useState(false);
  const [winner, setWinner] = useState(null);

  const fromRef  = useRef(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  const spin = () => {
    if (spinning) return;
    const idx = Math.floor(Math.random() * N);
    const sliceCenter = (idx + 0.5) * SLICE_DEG;
    const jitter = (Math.random() - 0.5) * SLICE_DEG * 0.7;
    const targetAngle = (360 - sliceCenter + jitter + 360) % 360;
    const end = fromRef.current + (4 + Math.floor(Math.random() * 3)) * 360 + targetAngle;

    setSpin(true); setWinner(null); startRef.current = null;

    const animate = ts => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / duration, 1);
      const current = fromRef.current + easeOut(t) * (end - fromRef.current);
      setRot(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = end % 360;
        const verified = getWinnerFromRot(end % 360, N);
        setSpin(false);
        setWinner(verified);
        onResult(verified);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const arc = i => {
    const s = i * SLICE_RAD - Math.PI / 2, e = s + SLICE_RAD;
    return `M${CX},${CX} L${CX + R * Math.cos(s)},${CX + R * Math.sin(s)} A${R},${R} 0 0,1 ${CX + R * Math.cos(e)},${CX + R * Math.sin(e)} Z`;
  };
  const mid = i => i * SLICE_RAD + SLICE_RAD / 2 - Math.PI / 2;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
      <div style={{ position:'relative', width:size, height:size }}>
        {/* Needle */}
        <div style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', zIndex:10 }}>
          <svg width="20" height="30" viewBox="0 0 20 30">
            <ellipse cx="10" cy="6" rx="7" ry="5.5" fill="#1A1A1A"/>
            <polygon points="10,28 4,7 16,7" fill="#1A1A1A"/>
            <polygon points="10,22 5,11 15,11" fill="#7EC8E3"/>
            <ellipse cx="10" cy="6" rx="3.5" ry="2.5" fill="#7EC8E3"/>
          </svg>
        </div>
        <svg width={size} height={size} style={{ transform:`rotate(${rot}deg)`, willChange:'transform', filter:'drop-shadow(0 5px 14px rgba(0,0,0,0.13))' }}>
          {items.map((item, i) => {
            const isW = winner === i;
            const fill = isW ? '#FFE4A0' : item.color;
            const m = mid(i);
            const lx = CX + R * 0.57 * Math.cos(m), ly = CX + R * 0.57 * Math.sin(m);
            const ex = CX + R * 0.82 * Math.cos(m), ey = CX + R * 0.82 * Math.sin(m);
            const ang = (m * 180) / Math.PI + 90;
            return (
              <g key={item.id}>
                <path d={arc(i)} fill={fill} stroke="#1A1A1A" strokeWidth="2" style={{ transition: isW ? 'fill 0.3s' : 'none' }}/>
                <text x={ex} y={ey} textAnchor="middle" dominantBaseline="middle" fontSize="15" style={{ userSelect:'none', pointerEvents:'none' }}>{item.emoji}</text>
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#1A1A1A" fontSize="8.5" fontFamily="Nunito,sans-serif" fontWeight="900"
                  style={{ userSelect:'none', pointerEvents:'none', transform:`rotate(${ang}deg)`, transformOrigin:`${lx}px ${ly}px` }}>
                  {item.name.split(' ').slice(0, 2).join(' ')}
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CX} r={22} fill="white" stroke="#1A1A1A" strokeWidth="2.5"/>
          <circle cx={CX} cy={CX} r={13} fill="#7EC8E3" stroke="#1A1A1A" strokeWidth="1.5"/>
          <text x={CX} y={CX + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12">🐾</text>
          {items.map((_, i) => {
            const a = i * SLICE_RAD - Math.PI / 2;
            return <circle key={i} cx={CX + (R-1) * Math.cos(a)} cy={CX + (R-1) * Math.sin(a)} r={3} fill="white" stroke="#1A1A1A" strokeWidth="1.5"/>;
          })}
        </svg>
        {winner !== null && <div style={{ position:'absolute', inset:-5, borderRadius:'50%', border:'2px dashed #7EC8E3', animation:'spinRing 4s linear infinite', pointerEvents:'none' }}/>}
      </div>
      <button className="btn3d" onClick={spin} disabled={spinning}
        style={{ background: spinning ? '#E0D8CC' : '#7EC8E3', color:'#1A1A1A', fontSize:16, padding:'11px 28px', minWidth:160 }}>
        {spinning ? '🌀 Girando...' : '🎰 Girar'}
      </button>
    </div>
  );
}
