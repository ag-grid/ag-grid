import { Module, ModuleNames } from '@ag-grid-community/core';

import { ClientSideRowModel } from './clientSideRowModel/clientSideRowModel';
import { FilterService } from './clientSideRowModel/filterService';
import { FilterStage } from './clientSideRowModel/filterStage';
import { FlattenStage } from './clientSideRowModel/flattenStage';
import { ImmutableService } from './clientSideRowModel/immutableService';
import { SortService } from './clientSideRowModel/sortService';
import { SortStage } from './clientSideRowModel/sortStage';
import { VERSION } from './version';

export const ClientSideRowModelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
};
