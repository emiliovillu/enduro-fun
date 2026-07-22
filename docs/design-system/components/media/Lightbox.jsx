import React from 'react';
import {Icon} from './Icon.jsx';
export function Lightbox({src,alt,onClose,closeLabel='Close image viewer'}){
return React.createElement('div',{role:'dialog','aria-modal':'true','aria-label':alt,style:{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}},
React.createElement('div',{onClick:onClose,style:{position:'fixed',inset:0,background:'rgba(28,28,30,.92)'}}),
React.createElement('button',{type:'button',onClick:onClose,'aria-label':closeLabel,style:{position:'fixed',top:16,right:16,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-on-dark)',background:'transparent',border:'none',cursor:'pointer'}},
React.createElement(Icon,{name:'x',size:24,color:'var(--text-on-dark)'})),
React.createElement('img',{src,alt,style:{position:'relative',maxHeight:'calc(100% - 48px)',maxWidth:'calc(100% - 48px)',objectFit:'contain',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-lg)'}}));
}
