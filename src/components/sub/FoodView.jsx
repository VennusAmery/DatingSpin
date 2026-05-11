import React, { useState } from 'react';
import MiniRoulette from '../roulette/MiniRoulette';
import PlacesList from './PlacesList';
import { DINNER_TYPES, FOOD_TYPES } from '../../data';
import { C } from '../../utils/theme';

export default function FoodView({ activityId, userLocation, onNeedLocation }) {
  const [foodType, setFoodType] = useState(null);
  const items = activityId === 'dinner' ? DINNER_TYPES : FOOD_TYPES;

  if (!foodType) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Fredoka One', fontSize:20, color:C.ink }}>
          {activityId==='dinner' ? '🍷 ¿Qué tipo de cocina?' : '🍽️ ¿Qué se te antoja?'}
        </div>
        <p style={{ fontFamily:'Nunito', fontSize:12, color:'#888', marginTop:4 }}>Gira para decidir 🎲</p>
      </div>
      <MiniRoulette items={items} onResult={idx => setTimeout(() => setFoodType(items[idx]), 400)} size={240} />
    </div>
  );

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ background:foodType.color, border:'2.5px solid #1A1A1A', borderRadius:12, padding:'8px 14px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 3px 0 #1A1A1A' }}>
          <span style={{ fontSize:22 }}>{foodType.emoji}</span>
          <span style={{ fontFamily:'Fredoka One', fontSize:16, color:C.ink }}>{foodType.name}</span>
        </div>
        <button onClick={() => setFoodType(null)} className="btn3d" style={{ background:'white', color:C.ink, fontSize:11, padding:'6px 12px' }}>🔄 Cambiar</button>
      </div>
      <div style={{ flex:1, minHeight:0 }}>
        <PlacesList
          osmType="restaurant"
          userLocation={userLocation}
          onNeedLocation={onNeedLocation}
          cardColor={foodType.color}
          iconBg={foodType.color}
          label={foodType.name}
        />
      </div>
    </div>
  );
}
