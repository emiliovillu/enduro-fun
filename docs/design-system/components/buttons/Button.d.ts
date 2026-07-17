import * as React from 'react';
export interface ButtonProps{
children:React.ReactNode;
variant?:'primary'|'secondary'|'outline'|'ghost';
size?:'sm'|'md'|'lg';
icon?:React.ReactNode;
as?:'button'|'a';
href?:string;
onClick?:()=>void;
}
