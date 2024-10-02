import type { _InfiniteRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { SsrmInfiniteSharedApiModule } from '../api/sharedApiModule';
import { CommunityFeaturesModule } from '../communityFeaturesModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { RowNodeBlockModule } from '../rowNodeCache/rowNodeBlockModule';
import { InfiniteRowModel } from './infiniteRowModel';
import { getInfiniteRowCount, purgeInfiniteCache, refreshInfiniteCache } from './infiniteRowModelApi';

export const InfiniteRowModelCoreModule = defineCommunityModule('InfiniteRowModelCoreModule', {
    rowModels: ['infinite'],
    beans: [InfiniteRowModel],
    dependsOn: [RowNodeBlockModule],
});

export const InfiniteRowModelApiModule = defineCommunityModule<_InfiniteRowModelGridApi>('InfiniteRowModelApiModule', {
    rowModels: ['infinite'],
    beans: [RowModelHelperService],
    apiFunctions: {
        refreshInfiniteCache,
        purgeInfiniteCache,
        getInfiniteRowCount,
    },
    dependsOn: [InfiniteRowModelCoreModule, SsrmInfiniteSharedApiModule],
});

export const InfiniteRowModelModule = defineCommunityModule(ModuleNames.InfiniteRowModelModule, {
    rowModels: ['infinite'],
    dependsOn: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule, CommunityFeaturesModule],
});
