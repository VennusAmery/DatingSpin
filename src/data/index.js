// ─── SLICES alternos azul/crema del logo ───
const SA = '#7EC8E3'; // azul
const SB = '#EDE0C4'; // crema

export const BASE_ACTIVITIES = [
  { id:'cinema',    name:'Cine & Teatro',    label:'CINE',     emoji:'🎬', sliceA:SA, sliceB:SB, cardColor:'#EEF5FF', cardBorder:'#A8C4FF', iconBg:'#A8C4FF', tagline:'¡Palomitas para dos! 🎟️', hasSubRoulette:false, osmType:null },
  { id:'dinner',    name:'Cena Romántica',   label:'CENA',     emoji:'🍷', sliceA:SB, sliceB:SA, cardColor:'#FFF0F3', cardBorder:'#FFB3C1', iconBg:'#FFB3C1', tagline:'¡Mesa para dos! 💕',       hasSubRoulette:true,  osmType:'restaurant' },
  { id:'bars',      name:'Bares & Cócteles', label:'BARES',    emoji:'🍸', sliceA:SA, sliceB:SB, cardColor:'#FFF4EC', cardBorder:'#FFB085', iconBg:'#FFB085', tagline:'¡Cheers! 🥂',              hasSubRoulette:false, osmType:'bar' },
  { id:'outdoor',   name:'Aire Libre',       label:'PARQUE',   emoji:'🌿', sliceA:SB, sliceB:SA, cardColor:'#EDFAF3', cardBorder:'#B5DEC8', iconBg:'#B5DEC8', tagline:'¡Naturaleza y amor! 🌸',  hasSubRoulette:false, osmType:'park' },
  { id:'culture',   name:'Arte & Cultura',   label:'ARTE',     emoji:'🎨', sliceA:SA, sliceB:SB, cardColor:'#F5F0FF', cardBorder:'#C5B8E8', iconBg:'#C5B8E8', tagline:'¡Inspírense juntos! ✨',  hasSubRoulette:false, osmType:'museum' },
  { id:'home',      name:'Noche en Casa',    label:'EN CASA',  emoji:'🏠', sliceA:SB, sliceB:SA, cardColor:'#FFFBE8', cardBorder:'#FFE4A0', iconBg:'#FFE4A0', tagline:'¡Cozy vibes! 🕯️',        hasSubRoulette:true,  osmType:null },
  { id:'adventure', name:'Aventura',         label:'AVENTURA', emoji:'🧗', sliceA:SA, sliceB:SB, cardColor:'#EDFCFF', cardBorder:'#7EC8E3', iconBg:'#7EC8E3', tagline:'¡Adrenalina a dos! ⚡',  hasSubRoulette:false, osmType:'gym' },
  { id:'food',      name:'Salir a Comer',    label:'COMIDA',   emoji:'🍽️', sliceA:SB, sliceB:SA, cardColor:'#FFF8EC', cardBorder:'#FFE4A0', iconBg:'#FFE4A0', tagline:'¡A comer rico! 😋',       hasSubRoulette:true,  osmType:'restaurant' },
  { id:'hot',       name:'Noche Picante',    label:'HOT',      emoji:'🌶️', sliceA:'#FF6B6B', sliceB:'#FF8E8E', cardColor:'#FFF0F0', cardBorder:'#FF6B6B', iconBg:'#FF6B6B', tagline:'¡Solo ustedes dos! 🔥', hasSubRoulette:false, osmType:'hot' },
];

export const DINNER_TYPES = [
  { id:'italian',    name:'Italiana',  emoji:'🍝', color:'#FFD4A0' },
  { id:'japanese',   name:'Japonesa',  emoji:'🍣', color:'#FFB3C1' },
  { id:'steakhouse', name:'Carnes',    emoji:'🥩', color:'#F5B8A0' },
  { id:'seafood',    name:'Mariscos',  emoji:'🦞', color:'#A8D8EA' },
  { id:'mexican',    name:'Mexicana',  emoji:'🌮', color:'#FFE4A0' },
  { id:'french',     name:'Francesa',  emoji:'🥐', color:'#E8D4F0' },
];

export const FOOD_TYPES = [
  { id:'burger',  name:'Hamburguesas', emoji:'🍔', color:'#FFE4A0' },
  { id:'pizza',   name:'Pizza',        emoji:'🍕', color:'#FFD4A0' },
  { id:'tacos',   name:'Tacos',        emoji:'🌮', color:'#B5DEC8' },
  { id:'sushi',   name:'Sushi',        emoji:'🍣', color:'#FFB3C1' },
  { id:'chicken', name:'Pollo',        emoji:'🍗', color:'#FFE4A0' },
  { id:'dessert', name:'Postres',      emoji:'🍰', color:'#C5B8E8' },
];

export const HOME_OPTIONS = [
  { id:'cook',    name:'Cocinar Juntos',  emoji:'👨‍🍳', color:'#FFE4A0' },
  { id:'movies',  name:'Maratón Pelis',   emoji:'🍿',  color:'#A8C4FF' },
  { id:'games',   name:'Juegos de Mesa',  emoji:'🎲',  color:'#B5DEC8' },
  { id:'spa',     name:'Spa en Casa',     emoji:'🛁',  color:'#C5B8E8' },
  { id:'karaoke', name:'Karaoke',         emoji:'🎤',  color:'#FFB3C1' },
  { id:'puzzle',  name:'Rompecabezas',    emoji:'🧩',  color:'#FFB085' },
];

export const RECIPES = [
  { id:'r1', name:'Pasta Alfredo',       emoji:'🍝', time:'30 min', difficulty:'Fácil', color:'#FFD4A0', ingredients:['400g fettuccine','200ml crema','100g mantequilla','100g parmesano','2 dientes ajo','Sal y pimienta'],                    steps:['Cocina la pasta al dente','Sofríe ajo en mantequilla','Agrega crema y parmesano','Mezcla con la pasta caliente'],         delivery:'https://rappi.com.gt' },
  { id:'r2', name:'Sushi Casero',        emoji:'🍣', time:'45 min', difficulty:'Media', color:'#FFB3C1', ingredients:['Arroz para sushi','4 láminas nori','200g salmón','1 aguacate','Vinagre de arroz','Salsa de soya'],                       steps:['Prepara arroz con vinagre','Corta rellenos en tiras','Extiende arroz sobre nori','Enrolla y corta en 8 piezas'],            delivery:'https://rappi.com.gt' },
  { id:'r3', name:'Pizza Casera',        emoji:'🍕', time:'60 min', difficulty:'Media', color:'#FFE4A0', ingredients:['500g harina','7g levadura','Tomates triturados','250g mozzarella','Albahaca','Aceite de oliva'],                          steps:['Prepara masa, deja reposar 30min','Estira en redondo','Agrega salsa y toppings','Hornea 220°C por 15 minutos'],             delivery:'https://rappi.com.gt' },
  { id:'r4', name:'Fondue de Chocolate', emoji:'🍫', time:'20 min', difficulty:'Fácil', color:'#C5B8E8', ingredients:['300g chocolate negro','200ml crema caliente','Fresas','Marshmallows','Plátano','Galletas'],                              steps:['Derrite chocolate a baño maría','Agrega crema caliente','Revuelve hasta suave','Sirve con fruta para dipear'],               delivery:'https://rappi.com.gt' },
];

export const STREAMING = [
  { id:'netflix', name:'Netflix',  emoji:'🎬', color:'#E50914', url:'https://netflix.com',     suggestions:['La La Land','The Notebook','Pride & Prejudice','To All the Boys','Always Be My Maybe'] },
  { id:'max',     name:'Max',      emoji:'📺', color:'#002BE7', url:'https://max.com',         suggestions:['The White Lotus','Barry','Succession','Euphoria','The Last of Us'] },
  { id:'disney',  name:'Disney+',  emoji:'✨', color:'#0063E5', url:'https://disneyplus.com',  suggestions:['Soul','Encanto','Coco','Ratatouille','Up'] },
  { id:'prime',   name:'Prime',    emoji:'📦', color:'#00A8E1', url:'https://primevideo.com',  suggestions:['The Marvelous Mrs. Maisel','Fleabag','The Boys','Invincible','Good Omens'] },
];

export const BOARD_GAMES = [
  { id:'g1', name:'Catan',          emoji:'🏝️', players:'2-4', time:'60-120min', color:'#FFE4A0' },
  { id:'g2', name:'Dixit',          emoji:'🃏', players:'2-6', time:'30min',     color:'#C5B8E8' },
  { id:'g3', name:'Codenames',      emoji:'🕵️', players:'2-8', time:'30min',     color:'#7EC8E3' },
  { id:'g4', name:'Ticket to Ride', emoji:'🚂', players:'2-5', time:'45-90min',  color:'#B5DEC8' },
  { id:'g5', name:'Azul',           emoji:'🔷', players:'2-4', time:'30-45min',  color:'#A8C4FF' },
  { id:'g6', name:'Dobble',         emoji:'🎯', players:'2-8', time:'15min',     color:'#FFB085' },
];

export const ICEBREAKERS = {
  divertidas: ['¿Superpodrías preferirías: volar o ser invisible? 🦸','Si pudieras comer solo una comida el resto de tu vida, ¿cuál? 🍽️','¿A qué personaje animado te pareces más y por qué? 🐭','¿Cuál sería tu nombre artístico si fueras cantante? 🎤','Si tu vida fuera una película, ¿qué género sería? 🎬','¿Qué app en tu celular dice más de quién eres? 📱','Si pudieras viajar al pasado, ¿a qué época irías? ⏰','¿Cuál es tu talento oculto más ridículo? 🙈','¿Qué harías si ganaras la lotería mañana? 💸','Si fueras un sabor de helado, ¿cuál serías? 🍦'],
  profundas:  ['¿Cuál es tu recuerdo favorito de la infancia? 🌟','¿Qué cosa pequeña te hace increíblemente feliz? 😊','¿Cuál ha sido el momento que más te ha cambiado la vida? 🔄','¿Qué es lo que más valoras en una amistad? 🤝','¿Cuál es tu sueño que aún no le has contado a nadie? 💭','¿Qué harías si supieras que no puedes fallar? 🚀','¿Qué significa para ti una vida bien vivida? 🌈','¿De qué momento de tu vida te sientes más orgulloso/a? 🏆','¿Qué le dirías a tu yo de hace 10 años? 💌','¿Cuál es el consejo que más has aplicado en tu vida? 📖'],
  romanticas: ['¿Cuál fue la primera cosa que te gustó de mí? 💕','¿Cómo sería tu cita perfecta? 🌙','¿Qué canción te recuerda a mí? 🎵','¿Cuál es tu love language favorito? 💝','Si pudiéramos ir a cualquier lugar ahora mismo, ¿adónde? ✈️','¿Cuál es el momento más romántico que has vivido? 🌹','¿Qué pequeña cosa hago que te hace sonreír? 😊','¿Cómo te imaginas nuestra próxima aventura juntos? 🗺️','¿Cuál sería nuestro lugar especial en el mundo? 🌍','¿Qué es lo más lindo que alguien ha hecho por ti? 🎁'],
  retos:      ['Imita el sonido de un animal por 10 segundos 🦁','Di 5 cosas que te gustan de la persona a tu lado ❤️','Comparte una foto vergonzosa de tu galería 😂','Canta el coro de tu canción favorita ahora mismo 🎤','Haz tu mejor pose de superhéroe 🦸','Di un chiste de "knock knock" 🚪','Baila 10 segundos sin música 💃','Imita a tu personaje favorito de película 🎭','Haz una cara graciosa y mantienla 5 segundos 😜','Dile algo muy bonito usando solo emojis 💌'],
  treinta6: [
  'Si pudieras elegir a cualquier persona del mundo, ¿a quién te gustaría como invitado en una cena?',
  '¿Te gustaría ser famoso? ¿De qué manera?',
  'Antes de hacer una llamada telefónica, ¿ensayas a veces lo que vas a decir? ¿Por qué?',
  '¿Qué sería un día "perfecto" para ti?',
  '¿Cuándo fue la última vez que cantaste para ti mismo? ¿Y para alguien más?',
  'Si pudieras vivir hasta los 90 años y conservar la mente o el cuerpo de una persona de 30 años, ¿cuál elegirías?',
  '¿Tienes alguna corazonada secreta sobre cómo vas a morir?',
  'Nombra tres cosas que tú y tu compañero parecen tener en común.',
  '¿De qué te sientes más agradecido en tu vida?',
  'Si pudieras cambiar cualquier cosa de tu crianza, ¿qué sería?',
  'Cuéntale a tu compañero la historia de tu vida con el mayor detalle posible.',
  'Si pudieras despertar mañana con cualquier cualidad o habilidad, ¿cuál sería?',
  'Si una bola de cristal pudiera decirte la verdad sobre cualquier cosa, ¿qué te gustaría saber?',
  '¿Hay algo que hayas soñado hacer durante mucho tiempo? ¿Por qué no lo has hecho?',
  '¿Cuál es el mayor logro de tu vida?',
  '¿Qué es lo que más valoras de una amistad?',
  '¿Cuál es tu recuerdo más preciado?',
  '¿Cuál es tu recuerdo más terrible?',
  'Si supieras que en un año vas a morir, ¿cambiarías algo de tu forma de vivir? ¿Por qué?',
  '¿Qué significa la amistad para ti?',
  '¿Qué papel juegan el amor y el afecto en tu vida?',
  'Túrnense para compartir cinco aspectos positivos que cada uno vea en el otro.',
  '¿Qué tan unida es tu familia? ¿Sientes que tu infancia fue feliz?',
  '¿Cómo te sientes respecto a tu relación con tu madre?',
  'Túrnense para hacer tres afirmaciones verdaderas que abarquen a los dos.',
  'Completa la frase: "Ojalá tuviera a alguien con quien compartir..."',
  'Si fueras a hacerte amigo cercano de tu compañero, ¿qué sería importante que supiera?',
  'Dile a tu compañero lo que te gusta de él; sé muy honesto.',
  'Comparte con tu compañero un momento embarazoso de tu vida.',
  '¿Cuándo fue la última vez que lloraste delante de otra persona? ¿Y solo?',
  'Dile a tu compañero algo que te guste de él ahora mismo.',
  '¿Hay algo que sea demasiado serio para bromear? ¿Qué?',
  'Si murieras esta noche, ¿qué lamentarías más no haberle dicho a alguien?',
  'Tu casa se incendia. ¿Qué objeto salvarías? ¿Por qué?',
  'De toda tu familia, ¿la muerte de quién te resultaría más perturbadora? ¿Por qué?',
  'Comparte un problema personal y pídele consejo a tu compañero sobre cómo afrontarlo.',
],
};

export const FEELINGS = ['😍 Increíble','😊 Muy bien','🙂 Bien','😐 Regular','😕 Podría mejorar'];
export const RADIUS_OPTIONS = [1, 2, 5, 10, 20, 50];
export const SLICE_COLORS = ['#7EC8E3','#EDE0C4','#A8D8EA','#F5EDD8','#C5E8F5','#EDE0C4','#7EC8E3','#F5EDD8','#A8D8EA','#EDE0C4','#C5E8F5','#F5EDD8'];
