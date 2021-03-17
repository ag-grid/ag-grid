import { Column } from "../entities/column";
import { GridComp } from "../gridComp";

export interface IClipboardService {
    registerGridCore(gridCore: GridComp): void;
    pasteFromClipboard(): void;
    copyToClipboard(includeHeader?: boolean): void;
    copySelectedRowsToClipboard(includeHeader?: boolean, columnKeys?: (string | Column)[]): void;
    copySelectedRangeToClipboard(includeHeader?: boolean): void;
    copyRangeDown(): void;
}
