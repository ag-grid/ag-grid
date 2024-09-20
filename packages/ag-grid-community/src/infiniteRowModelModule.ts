import type { _InfiniteRowModelGridApi } from './main';
import {
    ModuleNames,
    RowModelHelperService,
    _RowNodeBlockModule,
    _SsrmInfiniteSharedApiModule,
    _defineModule,
} from './main';

import { InfiniteRowModel } from './infiniteRowModel/infiniteRowModel';
import { getInfiniteRowCount, purgeInfiniteCache, refreshInfiniteCache } from './infiniteRowModel/infiniteRowModelApi';
import { VERSION } from './version';

export const InfiniteRowModelCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.InfiniteRowModelModule}-core`,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
    dependantModules: [_RowNodeBlockModule],
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
    dependantModules: [InfiniteRowModelCoreModule, _SsrmInfiniteSharedApiModule],
});

export const InfiniteRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    dependantModules: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule],
});
