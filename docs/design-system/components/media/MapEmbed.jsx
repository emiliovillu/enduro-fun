import React from 'react';
import {Icon} from './Icon.jsx';
export function MapEmbed({label='Álora, Málaga',compact=false}){
return React.createElement('div',{style:{position:'relative',borderRadius:compact?'var(--radius-md)':'var(--radius-lg)',overflow:'hidden',height:compact?140:360,background:'repeating-linear-gradient(45deg,var(--sand-200),var(--sand-200) 10px,var(--sand-300) 10px,var(--sand-300) 20px)'}},
React.createElement('div',{style:{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px',color:'var(--text-secondary)'}},
React.createElement(Icon,{name:'map-pin',size:compact?22:32,color:'var(--accent-secondary)'}),
!compact&&React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'12px'}},'Google Maps embed — '+label)));
}
