const OVERPASS = 'https://overpass-api.de/api/interpreter';

const OSM_TAGS = {
  restaurant:   [
                  'amenity=restaurant', 
                  'amenity=food_court', 
                  'shop=bakery', 
                  'amenity=ice_cream'
                ],

  movie_theater:[
                  'amenity=cinema',
                  'amenity=theatre'
                ],

  bar:          [
                  'amenity=bar',
                  'amenity=pub',
                  'amenity=nightclub', 
                  'amenity=biergarten'
                ],

  park:         [
                  'leisure=nature_reserve',   
                  'boundary=protected_area', 
                  'leisure=park',           
                  'landuse=forest',           
                  'leisure=garden',           
                  'tourism=picnic_site',   
                  'tourism=camp_site',       
                  'leisure=recreation_ground' 
                ],  

  museum:       [
                  'tourism=museum',
                  'tourism=gallery',
                  'amenity=arts_centre'
                  ],

  gym:          [
                  'leisure=theme_park',      
                  'leisure=water_park',   
                  'leisure=amusement_arcade', 
                  'tourism=attraction',     
                  'leisure=playground',    
                  'leisure=miniature_golf'  
                ], 

  cafe:         [ 
                  'amenity=cafe'
                ],

  hot:          [
                  'amenity=love_hotel', 
                  'tourism=motel', 
                  'amenity=motel'
                ],
};

function buildQ(lat, lng, radiusM, type) {
  const tags = OSM_TAGS[type] || OSM_TAGS.restaurant;
  
  const formattedLines = tags.map(t => {
    const [key, val] = t.split('=');
    const filter = `["${key}"="${val}"](around:${radiusM},${lat},${lng})`;
    return `node${filter}; way${filter}; relation${filter};`;
  }).join('\n');

  return `[out:json][timeout:30];
(
${formattedLines}
);
out center 20;`;
}

function fakeRating(t) {
  return Math.min(5, Math.max(2.5,
    +(3.2 + (t.name?0.3:0) + (t.phone||t['contact:phone']?0.15:0) + (t.website||t['contact:website']?0.15:0) + (t.opening_hours?0.1:0) + (Math.random()*0.6-0.1)).toFixed(1)
  ));
}

function parseHours(h) {
  if (!h) return null;
  if (h.includes('24/7')) return true;
  try {
    const day = ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date().getDay()];
    if (!h.includes(day)) return null;
    const m = h.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    if (!m) return null;
    const now = new Date().getHours()*60+new Date().getMinutes();
    return now >= (+m[1]*60+ +m[2]) && now <= (+m[3]*60+ +m[4]);
  } catch { return null; }
}

export async function searchPlaces({ lat, lng, radiusKm=5, type='restaurant', minRating, priceLevel, openNow }) {
  const radiusM = Math.min(radiusKm * 1000, 50000);
  const q = buildQ(lat, lng, radiusM, type);
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(q)}`,
  });
  if (!res.ok) throw new Error('Overpass error');
  const data = await res.json();

  let places = (data.elements || [])
    .filter(e => e.tags?.name)
    .map(e => {
      const t = e.tags;
      const plat = e.lat ?? e.center?.lat;
      const plng = e.lon ?? e.center?.lon;
      return {
        id: `${e.type}-${e.id}`,
        name: t.name,
        lat: plat,
        lng: plng,
        address: [t['addr:street'], t['addr:housenumber'], t['addr:city']].filter(Boolean).join(', ') || null,
        rating: fakeRating(t),
        priceLevel: t['price_level']==='expensive'?3:t['price_level']==='moderate'?2:0,
        openNow: parseHours(t.opening_hours),
        phone: t.phone || t['contact:phone'] || null,
        website: t.website || t['contact:website'] || null,
        cuisine: t.cuisine?.replace(/_/g,' ') || null,
        // Maps URL with directions FROM user location TO place
        directionsUrl: (userLat, userLng) =>
          `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${plat},${plng}&travelmode=driving`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${plat},${plng}`,
      };
    });

  if (minRating) places = places.filter(p => p.rating >= parseFloat(minRating));
  if (priceLevel) places = places.filter(p => !p.priceLevel || p.priceLevel <= parseInt(priceLevel));
  if (openNow) places = places.filter(p => p.openNow !== false);

  return places.sort((a,b) => b.rating-a.rating).slice(0,15);
}

export function distKm(lat1,lng1,lat2,lng2) {
  const R=6371, dL=(lat2-lat1)*Math.PI/180, dN=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dN/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
