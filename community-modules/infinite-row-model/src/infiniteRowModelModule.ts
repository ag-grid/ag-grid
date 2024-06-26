import type { InfiniteRowModelGridApi } from '@ag-grid-community/core';
import {
    ModuleNames,
    RowModelHelperService,
    _RowNodeBlockModule,
    _SsrmInfiniteSharedApiModule,
    _defineModule,
} from '@ag-grid-community/core';

import { InfiniteRowModel } from './infiniteRowModel/infiniteRowModel';
import {
    getInfiniteRowCount,
    isLastRowIndexKnown,
    purgeInfiniteCache,
    refreshInfiniteCache,
} from './infiniteRowModel/infiniteRowModelApi';
import { VERSION } from './version';

export const InfiniteRowModelCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.InfiniteRowModelModule}-core`,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
    dependantModules: [_RowNodeBlockModule],
});

export const InfiniteRowModelApiModule = _defineModule<InfiniteRowModelGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.InfiniteRowModelModule}-api`,
    beans: [RowModelHelperService],
    apiFunctions: {
        refreshInfiniteCache,
        purgeInfiniteCache,
        getInfiniteRowCount,
        isLastRowIndexKnown,
    },
    dependantModules: [InfiniteRowModelCoreModule, _SsrmInfiniteSharedApiModule],
});

export const InfiniteRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    dependantModules: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule],
});
