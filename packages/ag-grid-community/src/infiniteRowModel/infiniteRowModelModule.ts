import type { _InfiniteRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { SsrmInfiniteSharedApiModule } from '../api/sharedApiModule';
import { CommunityFeaturesModule } from '../communityFeaturesModule';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { RowNodeBlockModule } from '../rowNodeCache/rowNodeBlockModule';
import { InfiniteRowModel } from './infiniteRowModel';
import { getInfiniteRowCount, purgeInfiniteCache, refreshInfiniteCache } from './infiniteRowModelApi';

export const InfiniteRowModelCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('InfiniteRowModelCoreModule'),
    rowModels: ['infinite'],
    beans: [InfiniteRowModel],
    dependsOn: [RowNodeBlockModule],
};

export const InfiniteRowModelApiModule: _ModuleWithApi<_InfiniteRowModelGridApi> = {
    ...baseCommunityModule('InfiniteRowModelApiModule'),
    rowModels: ['infinite'],
    beans: [RowModelHelperService],
    apiFunctions: {
        refreshInfiniteCache,
        purgeInfiniteCache,
        getInfiniteRowCount,
    },
    dependsOn: [InfiniteRowModelCoreModule, SsrmInfiniteSharedApiModule],
};

export const InfiniteRowModelModule: _ModuleWithoutApi = {
    ...baseCommunityModule('InfiniteRowModelModule'),
    rowModels: ['infinite'],
    dependsOn: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule, CommunityFeaturesModule],
};
