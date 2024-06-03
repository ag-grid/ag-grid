import type { Module } from './interfaces/iModule';
import { ModuleNames } from './modules/moduleNames';
import { ValidationService } from './validation/validationService';
import { VERSION } from './version';

export const GridBaseModule = {
    version: VERSION,
    moduleName: '@ag-grid-community/core-base',
};

export const ValidationsModule = {
    version: VERSION,
    moduleName: '@ag-grid-community/core-validations',
    beans: [ValidationService],
};

export const GridCoreModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.CommunityCoreModule,
    dependantModules: [GridBaseModule, ValidationsModule],
};
