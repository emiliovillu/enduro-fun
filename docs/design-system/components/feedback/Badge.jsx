import React from 'react';
export function Badge({children,tone='neutral'}){
const tones={
neutral:{background:'var(--sand-200)',color:'var(--text-primary)'},
amber:{background:'var(--amber-500)',color:'var(--charcoal-900)'},
red:{background:'var(--accent-secondary)',color:'var(--white)'},
dark:{background:'var(--charcoal-800)',color:'var(--text-on-dark)'}
};
return React.createElement('span',{style:{...tones[tone],fontFamily:'var(--font-display)',fontSize:'12px',letterSpacing:'var(--ls-eyebrow)',textTransform:'uppercase',fontWeight:'var(--fw-semibold)',padding:'6px 12px',borderRadius:'var(--radius-pill)',display:'inline-block'}},children);
}
