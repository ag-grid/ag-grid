import type { BaseModule, GridApi, Module, ModuleWithApi } from 'ag-grid-community';

import { VERSION } from './version';

export function defineEnterpriseModule(name: string, definition: BaseModule): Module;
export function defineEnterpriseModule<TGridApi extends Readonly<Partial<GridApi>>>(
    name: string,
    definition: ModuleWithApi<TGridApi>
): Module;
export function defineEnterpriseModule(name: string, definition: any): Module {
    definition.moduleName = name;
    definition.version = VERSION;
    return definition;
}
