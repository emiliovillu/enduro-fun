import React from 'react';
export function SectionHeading({eyebrow,title,align='left',light=false}){
return React.createElement('div',{style:{textAlign:align,maxWidth:align==='center'?640:'none',margin:align==='center'?'0 auto':'0'}},
eyebrow&&React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--fs-eyebrow)',letterSpacing:'var(--ls-eyebrow)',textTransform:'uppercase',color:'var(--accent-secondary)',fontWeight:'var(--fw-semibold)',marginBottom:'8px'}},eyebrow),
React.createElement('h2',{style:{margin:0,fontSize:'var(--fs-display-md)',color:light?'#fff':'var(--text-primary)'}},title));
}
