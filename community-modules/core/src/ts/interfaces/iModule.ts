import { ComponentMeta } from "../context/context";
import { IComponent } from "./iComponent";
import { IRowModel } from "./iRowModel";

export interface Module {
    moduleName: string;
    beans?: any[];
    agStackComponents?: ComponentMeta[];
    userComponents?: {componentName: string, componentClass: any}[];
    rowModels?: {[name: string]: { new(): IRowModel }};
    dependantModules?: Module[]; // Niall / Sean - my addition
}
