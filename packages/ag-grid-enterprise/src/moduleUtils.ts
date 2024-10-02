import type { Module } from 'ag-grid-community';

import { VERSION } from './version';

export function baseEnterpriseModule(name: string): Readonly<Pick<Module, 'version' | 'moduleName'>> {
    return { moduleName: name, version: VERSION };
}
