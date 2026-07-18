import * as React from 'react';
export interface LanguageSwitcherProps{
locale?:'EN'|'ES'|'DE';
onChange?:(locale:string)=>void;
dark?:boolean;
}
