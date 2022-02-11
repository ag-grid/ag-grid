// Type definitions for @ag-grid-community/core v27.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
