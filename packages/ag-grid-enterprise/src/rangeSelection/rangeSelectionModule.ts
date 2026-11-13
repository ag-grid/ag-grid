import type { _CellSelectionGridApi, _ModuleWithApi } from 'ag-grid-community';
import { _DragModule, _KeyboardNavigationModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgFillHandle } from './agFillHandle';
import { AgRangeHandle } from './agRangeHandle';
import rangeSelectionCSS from './rangeSelection.css';
import { addCellRange, clearCellSelection, getCellRanges } from './rangeSelectionApi';
import { RangeService } from './rangeService';

/**
 * @feature Selection -> Cell Selection
 * @gridOption cellSelection
 */
export const CellSelectionModule: _ModuleWithApi<_CellSelectionGridApi> = {
    moduleName: 'CellSelection',
    version: VERSION,
    beans: [RangeService],
    dynamicBeans: { fillHandle: AgFillHandle, rangeHandle: AgRangeHandle },
    apiFunctions: {
        getCellRanges,
        addCellRange,
        clearCellSelection,
    },
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule, _DragModule],
    css: [rangeSelectionCSS],
};
