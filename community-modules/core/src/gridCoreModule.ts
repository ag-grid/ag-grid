import { AlignedGridsModule } from './alignedGridsModule';
import { CommunityApiModule } from './api/apiModule';
import { DataTypeModule } from './columns/columnModule';
import { EditModule } from './edit/editModule';
import { FilterModule } from './filter/filterModule';
import { _defineModule } from './interfaces/iModule';
import { StateModule } from './misc/state/stateModule';
import { ModuleNames } from './modules/moduleNames';
import { PaginationModule } from './pagination/paginationModule';
import { ValidationsModule } from './validation/validationService';
import { VERSION } from './version';

export const GridCoreModule = {
    version: VERSION,
    moduleName: ModuleNames.CommunityCoreModule,
};

export const CommunityFeaturesModule = _defineModule({
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
});
