import * as React from 'react';
export interface FooterProps{
locale?:'EN'|'ES'|'DE';
onLocaleChange?:(locale:string)=>void;
}
