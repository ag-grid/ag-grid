import type { GridApi } from '../api/gridApi';
import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { ComponentMeta, ControllerMeta, SingletonBean } from '../context/context';
import type { RowModelType } from './iRowModel';

export type ModuleValidationValidResult = {
    isValid: true;
};

export type ModuleValidationInvalidResult = {
    isValid: false;
    message: string;
};

export type ModuleValidationResult = ModuleValidationValidResult | ModuleValidationInvalidResult;

export interface Module {
    version: string;
    /**
     * Validation run when registering the module
     *
     * @return Whether the module is valid or not. If not, a message explaining why it is not valid
     */
    validate?: () => ModuleValidationResult;
    moduleName: string;
    beans?: SingletonBean[];
    controllers?: ControllerMeta[];
    userComponents?: ComponentMeta[];
    rowModel?: RowModelType;
    dependantModules?: Module[];

    apiFunctions?: { [K in ApiFunctionName]: ApiFunction<K> };
}

export function _defineModule(definition: Omit<Module, 'apiFunctions'>): Module;

export function _defineModule<TGridApi extends Readonly<Partial<GridApi>>>(
    definition: Omit<Module, 'apiFunctions'> &
        (object extends TGridApi
            ? { apiFunctions: never }
            : { apiFunctions: { [K in ApiFunctionName & keyof TGridApi]: ApiFunction<K> } })
): Module;

export function _defineModule(definition: any): Module {
    return definition;
}
