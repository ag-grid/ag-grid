import type { Module } from 'ag-grid-community';

import { VERSION } from './version';

export function baseEnterpriseModule(name: string): Readonly<Module> {
    return { moduleName: name, version: VERSION, enterprise: true };
}
