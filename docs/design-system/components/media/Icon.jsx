import React from 'react';
const paths={
mail:'M4 4h16v16H4z M22 6l-10 7L2 6',
'map-pin':'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
instagram:'M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z M16.5 7.5h.01 M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
menu:'M3 6h18 M3 12h18 M3 18h18',
x:'M18 6 6 18 M6 6l12 12',
globe:'M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20 M2 12a10 10 0 0 1 20 0 10 10 0 0 1-20 0',
chevronDown:'M6 9l6 6 6-6',
'bike':'M5 17a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M19 17a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M5 20l4-8h6l4 8 M9 12l2-5h4',
phone:'M4 5c0 8.5 6.5 15 15 15l3-4-5-3-2 2c-2-1-4.5-3.5-5.5-5.5l2-2-3-5z'
};
export function Icon({name='mail',size=20,color='currentColor',strokeWidth=1.8}){
const d=paths[name]||paths.mail;
return React.createElement('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth,strokeLinecap:'round',strokeLinejoin:'round'},
d.split(' M').map((seg,i)=>React.createElement('path',{key:i,d:(i===0?seg:'M'+seg)}))
);
}
