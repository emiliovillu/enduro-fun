import React from 'react';
export function ReviewCard({name,country,rating=5,text}){
return React.createElement('div',{style:{background:'var(--surface-card)',borderRadius:'var(--radius-lg)',padding:'24px',boxShadow:'var(--shadow-sm)',display:'flex',flexDirection:'column',gap:'12px'}},
React.createElement('div',{style:{color:'var(--amber-500)',fontSize:'16px',letterSpacing:'2px'}},'★'.repeat(rating)+'☆'.repeat(5-rating)),
React.createElement('p',{style:{margin:0,fontSize:'var(--fs-body)',color:'var(--text-primary)',lineHeight:'var(--lh-body)'}},'"'+text+'"'),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginTop:'auto'}},
React.createElement('div',{style:{width:36,height:36,borderRadius:'50%',background:'var(--gradient-sunset)',flexShrink:0}}),
React.createElement('div',null,
React.createElement('div',{style:{fontWeight:'var(--fw-semibold)',fontSize:'14px'}},name),
React.createElement('div',{style:{fontSize:'12px',color:'var(--text-secondary)'}},country))));
}
