import React from 'react';
export function Textarea({placeholder,disabled=false,invalid=false,defaultValue,rows=4,...rest}){
const style={fontFamily:'var(--font-body)',fontSize:'var(--fs-body)',color:'var(--text-primary)',background:'var(--surface-card)',border:'1px solid '+(invalid?'var(--danger)':'var(--border-subtle)'),borderRadius:'var(--radius-lg)',padding:'11px 13px',width:'100%',boxSizing:'border-box',outline:'none',resize:'vertical',minHeight:'96px',opacity:disabled?0.5:1,cursor:disabled?'not-allowed':'text',transition:'box-shadow var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)'};
return React.createElement('textarea',{placeholder,disabled,defaultValue,rows,style,onFocus:e=>{e.currentTarget.style.boxShadow='0 0 0 2px var(--focus-ring)';e.currentTarget.style.outlineOffset='2px'},onBlur:e=>{e.currentTarget.style.boxShadow='none'},...rest});
}
