import { useState, useCallback, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) { setError('Geolocalización no disponible'); return Promise.reject(); }
    setLoading(true); setError(null);
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(
        p => { const c={lat:p.coords.latitude,lng:p.coords.longitude}; setLocation(c); setLoading(false); res(c); },
        e => { const m=e.code===1?'Permiso denegado. Activa ubicación en tu navegador 📍':'No se pudo obtener tu ubicación'; setError(m); setLoading(false); rej(m); },
        { enableHighAccuracy:true, timeout:12000, maximumAge:60000 }
      );
    });
  }, []);

  return { location, error, loading, getLocation };
}

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s=localStorage.getItem(key); return s!==null?JSON.parse(s):initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key,JSON.stringify(val)); } catch {} }, [key,val]);
  return [val, setVal];
}
