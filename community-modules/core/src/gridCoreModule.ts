import { FilterModule } from './filter/filterModules';
import type { Module } from './interfaces/iModule';
import { ModuleNames } from './modules/moduleNames';
import { ValidationService } from './validation/validationService';
import { VERSION } from './version';

export const GridCoreModule = {
    version: VERSION,
    moduleName: ModuleNames.CommunityCoreModule,
};

export const ValidationsModule = {
    version: VERSION,
    moduleName: '@ag-grid-community/core-validations',
    beans: [ValidationService],
};

export const CommunityFeaturesModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/core-community-features',
    dependantModules: [GridCoreModule, ValidationsModule, FilterModule],
};
