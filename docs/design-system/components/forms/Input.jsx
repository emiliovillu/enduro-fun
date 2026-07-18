import React from 'react';
export function Input({placeholder,disabled=false,invalid=false,defaultValue,type='text',...rest}){
const style={fontFamily:'var(--font-body)',fontSize:'var(--fs-body)',color:'var(--text-primary)',background:'var(--surface-card)',border:'1px solid '+(invalid?'var(--danger)':'var(--border-subtle)'),borderRadius:'var(--radius-lg)',padding:'11px 13px',width:'100%',boxSizing:'border-box',outline:'none',opacity:disabled?0.5:1,cursor:disabled?'not-allowed':'text',transition:'box-shadow var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)'};
return React.createElement('input',{type,placeholder,disabled,defaultValue,style,onFocus:e=>{e.currentTarget.style.boxShadow='0 0 0 2px var(--focus-ring)';e.currentTarget.style.outlineOffset='2px'},onBlur:e=>{e.currentTarget.style.boxShadow='none'},...rest});
}
