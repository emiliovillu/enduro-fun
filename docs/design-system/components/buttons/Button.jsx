import React from 'react';
export function Button({children,variant='primary',size='md',icon,as='button',href,...rest}){
const Tag=as==='a'?'a':'button';
const base={fontFamily:'var(--font-display)',textTransform:'uppercase',letterSpacing:'var(--ls-display)',fontWeight:'var(--fw-semibold)',border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'8px',borderRadius:'var(--radius-pill)',transition:'transform var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard)',textDecoration:'none',justifyContent:'center'};
const sizes={sm:{padding:'8px 18px',fontSize:'13px'},md:{padding:'13px 28px',fontSize:'15px'},lg:{padding:'17px 36px',fontSize:'17px'}};
const variants={
primary:{background:'var(--accent-primary)',color:'var(--white)'},
secondary:{background:'var(--accent-secondary)',color:'var(--white)'},
outline:{background:'transparent',color:'var(--text-on-dark)',boxShadow:'inset 0 0 0 2px var(--text-on-dark)'},
ghost:{background:'transparent',color:'var(--text-primary)',boxShadow:'inset 0 0 0 2px var(--border-subtle)'}
};
const style={...base,...sizes[size],...variants[variant]};
return React.createElement(Tag,{style,href,onMouseDown:e=>e.currentTarget.style.transform='scale(.96)',onMouseUp:e=>e.currentTarget.style.transform='scale(1)',onMouseLeave:e=>e.currentTarget.style.transform='scale(1)',...rest},icon,children);
}
