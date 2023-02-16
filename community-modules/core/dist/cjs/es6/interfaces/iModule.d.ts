// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ComponentMeta, ControllerMeta } from "../context/context";
import { IRowModel } from "./iRowModel";
export declare type ModuleValidationValidResult = {
    isValid: true;
};
export declare type ModuleValidationInvalidResult = {
    isValid: false;
    message: string;
};
export declare type ModuleValidationResult = ModuleValidationValidResult | ModuleValidationInvalidResult;
export interface Module {
    version: string;
    /**
     * Validation run when registering the module
     *
     * @return Whether the module is valid or not. If not, a message explaining why it is not valid
     */
    validate?: () => ModuleValidationResult;
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
