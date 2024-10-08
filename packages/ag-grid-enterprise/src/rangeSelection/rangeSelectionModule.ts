import type { _ModuleWithApi, _ModuleWithoutApi, _RangeSelectionGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { addCellRange, clearRangeSelection, getCellRanges } from './rangeSelectionApi';
import { RangeService } from './rangeService';
import { SelectionHandleFactory } from './selectionHandleFactory';

export const RangeSelectionCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RangeSelectionCoreModule'),
    beans: [RangeService, SelectionHandleFactory],
    dependsOn: [EnterpriseCoreModule, KeyboardNavigationCoreModule],
};

export const RangeSelectionApiModule: _ModuleWithApi<_RangeSelectionGridApi> = {
    ...baseEnterpriseModule('RangeSelectionApiModule'),
    apiFunctions: {
        getCellRanges,
        addCellRange,
        clearRangeSelection,
        clearCellSelection: clearRangeSelection,
    },
    dependsOn: [RangeSelectionCoreModule],
};

export const RangeSelectionModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RangeSelectionModule'),
    dependsOn: [RangeSelectionCoreModule, RangeSelectionApiModule],
};
