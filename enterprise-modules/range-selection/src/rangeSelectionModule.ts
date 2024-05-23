import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { AgFillHandle } from './rangeSelection/agFillHandle';
import { AgRangeHandle } from './rangeSelection/agRangeHandle';
import { RangeService } from './rangeSelection/rangeService';
import { SelectionHandleFactory } from './rangeSelection/selectionHandleFactory';
import { VERSION } from './version';

export const RangeSelectionModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [AgFillHandle, AgRangeHandle],
    dependantModules: [EnterpriseCoreModule],
};
