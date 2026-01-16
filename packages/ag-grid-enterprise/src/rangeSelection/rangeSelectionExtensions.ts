import type { AgColumn, CellPosition, CellRange } from 'ag-grid-community';

export interface RangeSelectionExtension {
    shouldSuppressRangeSelection?(eventTarget: EventTarget | null): boolean;
    shouldSkipColumn?(column: AgColumn): boolean;
    isAllColumnsSelectionCell?(cellPosition: CellPosition): boolean;
    isAllColumnsRange?(range: CellRange, allColumns: AgColumn[]): boolean;
}

export interface RangeSelectionExtensionRegistry {
    registerRangeSelectionExtension(extension: RangeSelectionExtension): void;
    unregisterRangeSelectionExtension?(extension: RangeSelectionExtension): void;
}
