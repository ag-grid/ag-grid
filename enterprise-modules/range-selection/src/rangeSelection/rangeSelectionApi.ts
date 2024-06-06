import type { BeanCollection, CellRange, CellRangeParams } from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry } from '@ag-grid-community/core';

export function getCellRanges(beans: BeanCollection): CellRange[] | null {
    if (beans.rangeService) {
        return beans.rangeService.getCellRanges();
    }

    ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.getCellRanges', beans.context.getGridId());
    return null;
}

export function addCellRange(beans: BeanCollection, params: CellRangeParams): void {
    if (beans.rangeService) {
        beans.rangeService.addCellRange(params);
        return;
    }
    ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.addCellRange', beans.context.getGridId());
}

export function clearRangeSelection(beans: BeanCollection): void {
    if (beans.rangeService) {
        beans.rangeService.removeAllCellRanges();
    }
    ModuleRegistry.__assertRegistered(
        ModuleNames.RangeSelectionModule,
        'gridApi.clearRangeSelection',
        beans.context.getGridId()
    );
}
