import type { Module } from '@ag-grid-community/core';
import { ModuleNames, RowNodeBlockModule } from '@ag-grid-community/core';

import { InfiniteRowModel } from './infiniteRowModel/infiniteRowModel';
import { VERSION } from './version';

export const InfiniteRowModelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.InfiniteRowModelModule,
    rowModel: 'infinite',
    beans: [InfiniteRowModel],
    dependantModules: [RowNodeBlockModule],
};
