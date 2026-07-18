import * as React from 'react';
export interface InputProps{
placeholder?:string;
disabled?:boolean;
invalid?:boolean;
defaultValue?:string;
type?:'text'|'email'|'tel'|'password';
name?:string;
id?:string;
}
