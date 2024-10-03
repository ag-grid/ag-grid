import type { Module, ModuleName } from 'ag-grid-community';

import { VERSION } from './version';

export function baseEnterpriseModule(moduleName: ModuleName): Readonly<Module> {
    return { moduleName, version: VERSION, enterprise: true };
}
