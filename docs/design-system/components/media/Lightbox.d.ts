import * as React from 'react';
export interface LightboxProps{
src:string;
alt:string;
onClose:()=>void;
closeLabel?:string;
}
export declare function Lightbox(props:LightboxProps):React.ReactElement;
