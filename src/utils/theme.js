export const C = {
  blue:     '#7EC8E3',
  blueDk:   '#5BAEC8',
  blueLt:   '#C5E8F5',
  cream:    '#EDE0C4',
  creamLt:  '#F5EDD8',
  bg:       '#F5F0EB',
  white:    '#FFFFFF',
  ink:      '#1A1A1A',
  gray:     '#888888',
  grayLt:   '#E0D8CC',
  grayXlt:  '#F0EAE2',
  pink:     '#FFB3C1',
  coral:    '#FFB085',
  mint:     '#B5DEC8',
  yellow:   '#FFE4A0',
  lavender: '#C5B8E8',
  green:    '#5AAB7A',
  red:      '#FF6B6B',
};

export const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { font-size:16px; }
  body { font-family:'Nunito',sans-serif; background:${C.bg}; overflow:hidden; width:100vw; height:100vh; }
  #root { width:100%; height:100%; }

  @keyframes popIn {
    from { opacity:0; transform:scale(0.82) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity:0; transform:translateX(22px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes bounce {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-7px); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0) rotate(-1deg); }
    50%      { transform:translateY(-6px) rotate(1deg); }
  }
  @keyframes wiggle {
    0%,100% { transform:rotate(-4deg) scale(1); }
    50%      { transform:rotate(4deg) scale(1.04); }
  }
  @keyframes spinRing {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes pulse {
    0%,100% { transform:scale(1); }
    50%      { transform:scale(1.07); }
  }
  @keyframes shake {
    0%,100%{ transform:translateX(0) rotate(0); }
    20%    { transform:translateX(-5px) rotate(-3deg); }
    40%    { transform:translateX(5px) rotate(3deg); }
    60%    { transform:translateX(-3px) rotate(-1deg); }
    80%    { transform:translateX(3px) rotate(1deg); }
  }
  @keyframes spin360 {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes heartbeat {
    0%,100% { transform:scale(1); }
    14%     { transform:scale(1.15); }
    28%     { transform:scale(1); }
    42%     { transform:scale(1.1); }
    70%     { transform:scale(1); }
  }
  @keyframes confetti {
    0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
    100% { transform:translateY(60px) rotate(720deg); opacity:0; }
  }

  select option { background:#fff; color:#1A1A1A; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${C.blue}88; border-radius:4px; }

  .btn3d {
    border:2.5px solid ${C.ink};
    border-radius:28px;
    font-family:'Fredoka One',cursive;
    cursor:pointer;
    box-shadow:0 4px 0 ${C.ink};
    transition:transform 0.1s, box-shadow 0.1s, background 0.15s;
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    letter-spacing:0.02em; text-decoration:none;
  }
  .btn3d:active { transform:translateY(4px)!important; box-shadow:0 0 0 ${C.ink}!important; }
  .btn3d:disabled { opacity:0.4; cursor:not-allowed; pointer-events:none; }

  .card {
    background:#fff;
    border:2.5px solid ${C.grayLt};
    border-radius:18px;
    box-shadow:0 3px 0 ${C.grayLt};
  }
  .card-ink {
    background:#fff;
    border:2.5px solid ${C.ink};
    border-radius:18px;
    box-shadow:0 4px 0 ${C.ink};
  }

  input, textarea, select {
    font-family:'Nunito',sans-serif;
  }
  input:focus, textarea:focus, select:focus {
    outline:2px solid ${C.blue};
    outline-offset:1px;
  }
`;
