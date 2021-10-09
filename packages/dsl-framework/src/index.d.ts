
// function DslStarter(): typeof DslFramework;
// declare function DslFramework(): typeof DslFrameworkCallback;
// declare function DslFrameworkCallback(e: number, d: ddd);

import { type } from "os";
import { setCoreData } from "./core";

export type dslFrameworkStarter = () => dslFramework;
type dslFramework = ({key: string}) => core;
type core = (
    {setCoreData: ()=>void}
)
// declare function dslFramework(): any
// export =  DslFramework = (
//     {aaa: () => void} ,
// ) => DslFramework
