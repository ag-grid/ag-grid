import type { _RangeSelectionGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { addCellRange, clearRangeSelection, getCellRanges } from './rangeSelectionApi';
import { RangeService } from './rangeService';
import { SelectionHandleFactory } from './selectionHandleFactory';

export const RangeSelectionCoreModule = defineEnterpriseModule(`${ModuleNames.RangeSelectionModule}-core`, {
    beans: [RangeService, SelectionHandleFactory],
    dependsOn: [EnterpriseCoreModule, KeyboardNavigationCoreModule],
});

export const RangeSelectionApiModule = defineEnterpriseModule<_RangeSelectionGridApi>(
    `${ModuleNames.RangeSelectionModule}-api`,
    {
        apiFunctions: {
            getCellRanges,
            addCellRange,
            clearRangeSelection,
            clearCellSelection: clearRangeSelection,
        },
        dependsOn: [RangeSelectionCoreModule],
    }
);

export const RangeSelectionModule = defineEnterpriseModule(ModuleNames.RangeSelectionModule, {
    dependsOn: [RangeSelectionCoreModule, RangeSelectionApiModule],
});
