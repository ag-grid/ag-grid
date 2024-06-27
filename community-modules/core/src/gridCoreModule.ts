import { AlignedGridsModule } from './alignedGridsModule';
import { CommunityApiModule } from './api/apiModule';
import { DataTypeModule } from './columns/columnModule';
import { EditModule } from './edit/editModule';
import { FilterModule } from './filter/filterModule';
import type { Module } from './interfaces/iModule';
import { StateModule } from './misc/state/stateModule';
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
        CommunityApiModule,
    ],
};
