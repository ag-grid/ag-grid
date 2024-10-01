import type { _InfiniteRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { SsrmInfiniteSharedApiModule } from '../api/sharedApiModule';
import { CommunityFeaturesModule } from '../gridCoreModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { RowNodeBlockModule } from '../rowNodeCache/rowNodeBlockModule';
import { InfiniteRowModel } from './infiniteRowModel';
import { getInfiniteRowCount, purgeInfiniteCache, refreshInfiniteCache } from './infiniteRowModelApi';

export const InfiniteRowModelCoreModule = defineCommunityModule('InfiniteRowModelCoreModule', {
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
    dependsOn: [RowNodeBlockModule],
});

export const InfiniteRowModelApiModule = defineCommunityModule<_InfiniteRowModelGridApi>('InfiniteRowModelApiModule', {
    beans: [RowModelHelperService],
    apiFunctions: {
        refreshInfiniteCache,
        purgeInfiniteCache,
        getInfiniteRowCount,
    },
    dependsOn: [InfiniteRowModelCoreModule, SsrmInfiniteSharedApiModule],
});

export const InfiniteRowModelModule = defineCommunityModule(ModuleNames.InfiniteRowModelModule, {
    dependsOn: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule, CommunityFeaturesModule],
});
