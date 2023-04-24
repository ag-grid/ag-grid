import { ComponentMeta, ControllerMeta } from "../context/context";
import { RowModelType } from "./iRowModel";
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
    rowModel?: RowModelType;
    dependantModules?: Module[];
}
