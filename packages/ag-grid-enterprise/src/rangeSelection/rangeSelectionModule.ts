import type { _RangeSelectionGridApi } from 'ag-grid-community';
import { ModuleNames, _defineModule } from 'ag-grid-community';

import { addCellRange, clearRangeSelection, getCellRanges } from './rangeSelectionApi';
import { RangeService } from './rangeService';
import { SelectionHandleFactory } from './selectionHandleFactory';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

export const RangeSelectionCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.RangeSelectionModule}-core`,
    beans: [RangeService, SelectionHandleFactory],
    dependantModules: [EnterpriseCoreModule],
});

export const RangeSelectionApiModule = _defineModule<_RangeSelectionGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.RangeSelectionModule}-api`,
    apiFunctions: {
        getCellRanges,
        addCellRange,
        clearRangeSelection,
        clearCellSelection: clearRangeSelection,
    },
    dependantModules: [RangeSelectionCoreModule],
});

export const RangeSelectionModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    dependantModules: [RangeSelectionCoreModule, RangeSelectionApiModule],
});
