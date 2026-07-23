import * as React from 'react';
export interface LightboxProps{
src:string;
alt:string;
onClose:()=>void;
onPrev?:()=>void;
onNext?:()=>void;
closeLabel?:string;
prevLabel?:string;
nextLabel?:string;
}
export declare function Lightbox(props:LightboxProps):React.ReactElement;
