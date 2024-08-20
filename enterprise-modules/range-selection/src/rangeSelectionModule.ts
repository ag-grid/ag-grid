import type { _RangeSelectionGridApi } from '@ag-grid-community/core';
import { ModuleNames, _defineModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { addCellRange, clearRangeSelection, getCellRanges } from './rangeSelection/rangeSelectionApi';
import { RangeService } from './rangeSelection/rangeService';
import { SelectionHandleFactory } from './rangeSelection/selectionHandleFactory';
import { VERSION } from './version';

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
