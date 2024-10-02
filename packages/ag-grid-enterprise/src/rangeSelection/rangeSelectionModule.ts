import type { Module, ModuleWithApi, _RangeSelectionGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { addCellRange, clearRangeSelection, getCellRanges } from './rangeSelectionApi';
import { RangeService } from './rangeService';
import { SelectionHandleFactory } from './selectionHandleFactory';

export const RangeSelectionCoreModule: Module = {
    ...baseEnterpriseModule('RangeSelectionCoreModule'),
    beans: [RangeService, SelectionHandleFactory],
    dependsOn: [EnterpriseCoreModule, KeyboardNavigationCoreModule],
};

export const RangeSelectionApiModule: ModuleWithApi<_RangeSelectionGridApi> = {
    ...baseEnterpriseModule('RangeSelectionApiModule'),
    apiFunctions: {
        getCellRanges,
        addCellRange,
        clearRangeSelection,
        clearCellSelection: clearRangeSelection,
    },
    dependsOn: [RangeSelectionCoreModule],
};

export const RangeSelectionModule: Module = {
    ...baseEnterpriseModule(ModuleNames.RangeSelectionModule),
    dependsOn: [RangeSelectionCoreModule, RangeSelectionApiModule],
};
