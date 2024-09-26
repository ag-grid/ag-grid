import type { _InfiniteRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { SsrmInfiniteSharedApiModule } from '../api/sharedApiModule';
import { _defineModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { RowNodeBlockModule } from '../rowNodeCache/rowNodeBlockModule';
import { VERSION } from '../version';
import { InfiniteRowModel } from './infiniteRowModel';
import { getInfiniteRowCount, purgeInfiniteCache, refreshInfiniteCache } from './infiniteRowModelApi';

export const InfiniteRowModelCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.InfiniteRowModelModule}-core`,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
    dependantModules: [RowNodeBlockModule],
});

export const InfiniteRowModelApiModule = _defineModule<_InfiniteRowModelGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.InfiniteRowModelModule}-api`,
    beans: [RowModelHelperService],
    apiFunctions: {
        refreshInfiniteCache,
        purgeInfiniteCache,
        getInfiniteRowCount,
    },
    dependantModules: [InfiniteRowModelCoreModule, SsrmInfiniteSharedApiModule],
});

export const InfiniteRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    dependantModules: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule],
});
