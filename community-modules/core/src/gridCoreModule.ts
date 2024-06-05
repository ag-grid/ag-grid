import { AlignedGridsModule } from './alignedGridsModule';
import { ApiAllModule, ApiModule } from './api/apiModule';
import { DataTypeModule } from './columns/columnModules';
import { EditModule } from './edit/editModules';
import { FilterModule } from './filter/filterModules';
import type { Module } from './interfaces/iModule';
import { StateModule } from './misc/stateModule';
import { ModuleNames } from './modules/moduleNames';
import { PaginationModule } from './pagination/paginationModule';
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
    dependantModules: [
        GridCoreModule,
        ValidationsModule,
        EditModule,
        FilterModule,
        StateModule,
        DataTypeModule,
        AlignedGridsModule,
        PaginationModule,
        ApiModule,
        ApiAllModule,
    ],
};
