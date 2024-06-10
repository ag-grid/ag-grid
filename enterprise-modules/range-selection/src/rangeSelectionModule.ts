import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { AgFillHandleClass } from './rangeSelection/agFillHandle';
import { AgRangeHandleClass } from './rangeSelection/agRangeHandle';
import { addCellRange, clearRangeSelection, getCellRanges } from './rangeSelection/rangeSelectionApi';
import { RangeService } from './rangeSelection/rangeService';
import { SelectionHandleFactory } from './rangeSelection/selectionHandleFactory';
import { VERSION } from './version';

export const RangeSelectionCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.RangeSelectionModule}-core`,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [AgFillHandleClass, AgRangeHandleClass],
    dependantModules: [EnterpriseCoreModule],
};

export const RangeSelectionApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.RangeSelectionModule}-api`,
    apiFunctions: {
        getCellRanges,
        addCellRange,
        clearRangeSelection,
    },
    dependantModules: [RangeSelectionCoreModule],
};

export const RangeSelectionModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    dependantModules: [RangeSelectionCoreModule, RangeSelectionApiModule],
};
