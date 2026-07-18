import React from 'react';
import {LanguageSwitcher} from './LanguageSwitcher.jsx';
import {Button} from '../buttons/Button.jsx';
import {Icon} from '../media/Icon.jsx';
export function Header({locale='EN',onLocaleChange,active='home',transparent=false,onNavigate}){
const [open,setOpen]=React.useState(false);
const links=[['home','Home'],['packages','Packages'],['about','About'],['contact','Contact'],['reviews','Reviews']];
return React.createElement('header',{style:{position:transparent?'absolute':'static',top:0,left:0,right:0,zIndex:10,background:transparent?'linear-gradient(180deg,rgba(28,28,30,.55),transparent)':'var(--bg-inverse)',padding:'18px clamp(20px,4vw,48px)',display:'flex',alignItems:'center',justifyContent:'space-between'}},
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px',fontFamily:'var(--font-display)',fontSize:'22px',color:'#fff',textTransform:'uppercase',letterSpacing:'.02em'}},
React.createElement(Icon,{name:'bike',color:'var(--accent-primary)',size:26}),'EnduroFun'),
React.createElement('nav',{style:{display:'flex',gap:'28px'}},
links.map(([k,label])=>React.createElement('a',{key:k,href:'#',onClick:(e)=>{e.preventDefault();onNavigate&&onNavigate(k);},style:{color:k===active?'var(--accent-amber)':'var(--text-on-dark-secondary)',textDecoration:'none',fontFamily:'var(--font-display)',fontSize:'14px',letterSpacing:'.04em',textTransform:'uppercase',cursor:'pointer'}},label))),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'16px'}},
React.createElement(LanguageSwitcher,{locale,onChange:onLocaleChange,dark:true}),
React.createElement(Button,{size:'sm',variant:'primary',onClick:()=>onNavigate&&onNavigate('contact')},'Contact')));
}
