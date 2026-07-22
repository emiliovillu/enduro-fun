import * as React from 'react';
export interface FleetCardProps{
name:string;
displacementCc:number;
categoryLabel:string;
description:string;
imageSlot?:string;
}
export declare function FleetCard(props:FleetCardProps):React.ReactElement;
