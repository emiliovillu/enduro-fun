import React from 'react';
import {LanguageSwitcher} from './LanguageSwitcher.jsx';
import {Icon} from '../media/Icon.jsx';
export function Footer({locale='EN',onLocaleChange}){
const cols=[
['Explore',['Home','Packages','About','Reviews']],
['Company',['Contact','info@endurofun.eu']]
];
return React.createElement('footer',{style:{background:'var(--bg-inverse)',color:'var(--text-on-dark-secondary)',padding:'56px clamp(20px,4vw,48px) 28px'}},
React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:'48px',justifyContent:'space-between',maxWidth:'var(--container-max)',margin:'0 auto'}},
React.createElement('div',{style:{maxWidth:280}},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'22px',color:'#fff',textTransform:'uppercase',marginBottom:'10px'}},'EnduroFun'),
React.createElement('p',{style:{fontSize:'14px',lineHeight:1.6,margin:0}},'Guided enduro routes from Álora, Málaga. Multi-day packages with bike and accommodation included.')),
cols.map(([title,items])=>React.createElement('div',{key:title},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'13px',letterSpacing:'.08em',textTransform:'uppercase',color:'#fff',marginBottom:'14px'}},title),
React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'10px',fontSize:'14px'}},
items.map(i=>React.createElement('a',{key:i,href:'#',style:{color:'var(--text-on-dark-secondary)',textDecoration:'none'}},i))))),
React.createElement('div',null,
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'13px',letterSpacing:'.08em',textTransform:'uppercase',color:'#fff',marginBottom:'14px'}},'Follow'),
React.createElement('a',{href:'#',style:{display:'flex',alignItems:'center',gap:'8px',color:'var(--text-on-dark-secondary)',textDecoration:'none',fontSize:'14px'}},React.createElement(Icon,{name:'instagram',size:18}),'@endurofun_oficial'))),
React.createElement('div',{style:{maxWidth:'var(--container-max)',margin:'40px auto 0',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,.1)',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',alignItems:'center'}},
React.createElement('span',{style:{fontSize:'12px'}},'© 2026 EnduroFun. Álora, Málaga.'),
React.createElement(LanguageSwitcher,{locale,onChange:onLocaleChange,dark:true})));
}
