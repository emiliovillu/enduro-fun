import React from 'react';
import {Badge} from '../feedback/Badge.jsx';
export function FleetCard({name,displacementCc,categoryLabel,description,imageSlot}){
return React.createElement('div',{style:{background:'var(--surface-card)',borderRadius:'var(--radius-lg)',overflow:'hidden',boxShadow:'var(--shadow-md)',display:'flex',flexDirection:'column',position:'relative'}},
React.createElement('div',{style:{position:'absolute',top:16,right:16,zIndex:2}},React.createElement(Badge,{tone:'neutral'},categoryLabel)),
React.createElement('div',{style:{height:180,background:imageSlot||'linear-gradient(135deg,var(--charcoal-700),var(--charcoal-900))',display:'flex',alignItems:'flex-end',padding:'16px'}},
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-on-dark-secondary)'}},displacementCc+'cc')),
React.createElement('div',{style:{padding:'24px',display:'flex',flexDirection:'column',gap:'12px'}},
React.createElement('h3',{style:{margin:0,fontSize:'var(--fs-h3)'}},name),
React.createElement('p',{style:{margin:0,color:'var(--text-secondary)',fontSize:'var(--fs-small)'}},description)));
}
