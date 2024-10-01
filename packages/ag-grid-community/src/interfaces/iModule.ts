import type { GridApi } from '../api/gridApi';
import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { ComponentMeta, ControllerMeta, SingletonBean } from '../context/context';
import { VERSION } from '../version';
import type { RowModelType } from './iRowModel';

export type ModuleValidationValidResult = {
    isValid: true;
};

export type ModuleValidationInvalidResult = {
    isValid: false;
    message: string;
};

export type ModuleValidationResult = ModuleValidationValidResult | ModuleValidationInvalidResult;

export type BaseModule = Omit<Module, 'apiFunctions' | 'version' | 'moduleName'>;

export type ModuleWithApi<TGridApi extends Readonly<Partial<GridApi>>> = BaseModule &
    (object extends TGridApi
        ? { apiFunctions: never }
        : { apiFunctions: { [K in ApiFunctionName & keyof TGridApi]: ApiFunction<K> } });

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
    dependsOn?: Module[];

    apiFunctions?: { [K in ApiFunctionName]: ApiFunction<K> };
}

export function defineCommunityModule(name: string, definition: BaseModule): Module;
export function defineCommunityModule<TGridApi extends Readonly<Partial<GridApi>>>(
    name: string,
    definition: ModuleWithApi<TGridApi>
): Module;
export function defineCommunityModule(name: string, definition: any): Module {
    definition.moduleName = name;
    definition.version = VERSION;
    return definition;
}
