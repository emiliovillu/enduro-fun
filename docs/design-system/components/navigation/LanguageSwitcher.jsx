import React from 'react';
export function LanguageSwitcher({locale='EN',onChange,dark=false}){
const locales=['EN','ES','DE'];
return React.createElement('div',{style:{display:'flex',gap:'2px',background:dark?'rgba(255,255,255,.08)':'var(--sand-200)',borderRadius:'var(--radius-pill)',padding:'3px'}},
locales.map(l=>React.createElement('button',{key:l,onClick:()=>onChange&&onChange(l),style:{border:'none',cursor:'pointer',padding:'6px 12px',borderRadius:'var(--radius-pill)',fontFamily:'var(--font-display)',fontSize:'12px',letterSpacing:'.05em',background:l===locale?'var(--accent-primary)':'transparent',color:l===locale?'#fff':(dark?'var(--text-on-dark-secondary)':'var(--text-secondary)')}},l)));
}
