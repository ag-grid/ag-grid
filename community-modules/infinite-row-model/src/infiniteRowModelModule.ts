import type { Module } from '@ag-grid-community/core';
import {
    ModuleNames,
    RowModelHelperService,
    _RowNodeBlockModule,
    _SsrmInfiniteSharedApiModule,
} from '@ag-grid-community/core';

import { InfiniteRowModel } from './infiniteRowModel/infiniteRowModel';
import {
    getInfiniteRowCount,
    isLastRowIndexKnown,
    purgeInfiniteCache,
    refreshInfiniteCache,
} from './infiniteRowModel/infiniteRowModelApi';
import { VERSION } from './version';

export const InfiniteRowModelCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/infinite-row-model-core',
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
    dependantModules: [_RowNodeBlockModule],
};

export const InfiniteRowModelApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/infinite-row-model-api',
    beans: [RowModelHelperService],
    apiFunctions: {
        refreshInfiniteCache,
        purgeInfiniteCache,
        getInfiniteRowCount,
        isLastRowIndexKnown,
    },
    dependantModules: [InfiniteRowModelCoreModule, _SsrmInfiniteSharedApiModule],
};

export const InfiniteRowModelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    dependantModules: [InfiniteRowModelCoreModule, InfiniteRowModelApiModule],
};
