import React from 'react';
import {Badge} from '../feedback/Badge.jsx';
import {Button} from '../buttons/Button.jsx';
export function PackageCard({name,nights,days,price,features=[],highlight,imageSlot}){
return React.createElement('div',{style:{background:'var(--surface-card)',borderRadius:'var(--radius-lg)',overflow:'hidden',boxShadow:'var(--shadow-md)',display:'flex',flexDirection:'column',position:'relative'}},
highlight&&React.createElement('div',{style:{position:'absolute',top:16,right:16,zIndex:2}},React.createElement(Badge,{tone:'red'},highlight)),
React.createElement('div',{style:{height:180,background:imageSlot||'linear-gradient(135deg,var(--charcoal-700),var(--charcoal-900))',display:'flex',alignItems:'flex-end',padding:'16px'}},
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-on-dark-secondary)'}},nights+' nights · '+days+' route days')),
React.createElement('div',{style:{padding:'24px',display:'flex',flexDirection:'column',gap:'14px',flex:1}},
React.createElement('h3',{style:{margin:0,fontSize:'var(--fs-h3)'}},name),
React.createElement('ul',{style:{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:'8px',color:'var(--text-secondary)',fontSize:'var(--fs-small)'}},
features.map((f,i)=>React.createElement('li',{key:i,style:{display:'flex',gap:'8px'}},React.createElement('span',{style:{color:'var(--accent-primary)'}},'—'),f))),
React.createElement('div',{style:{marginTop:'auto',display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'8px',borderTop:'1px solid var(--border-subtle)'}},
React.createElement('span',{style:{fontFamily:'var(--font-display)',fontSize:'28px',color:'var(--accent-secondary)'}},price),
React.createElement(Button,{size:'sm',variant:'primary'},'Enquire'))));
}
