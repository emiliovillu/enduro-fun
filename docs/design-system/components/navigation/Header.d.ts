import * as React from 'react';
export interface HeaderProps{
locale?:'EN'|'ES'|'DE';
onLocaleChange?:(locale:string)=>void;
active?:'home'|'packages'|'about'|'contact'|'reviews';
transparent?:boolean;
onNavigate?:(page:string)=>void;
}
