import { ComponentMeta, ControllerMeta } from "../context/context";
import { IRowModel } from "./iRowModel";
export interface Module {
    moduleName: string;
    beans?: any[];
    agStackComponents?: ComponentMeta[];
    controllers?: ControllerMeta[];
    userComponents?: {
        componentName: string;
        componentClass: any;
    }[];
    rowModels?: {
        [name: string]: {
            new (): IRowModel;
        };
    };
    dependantModules?: Module[];
}
