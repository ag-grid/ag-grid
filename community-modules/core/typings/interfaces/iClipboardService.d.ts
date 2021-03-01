import { Column } from "../entities/column";
import { GridCore } from "../gridCore";
export interface IClipboardService {
    registerGridCore(gridCore: GridCore): void;
    pasteFromClipboard(): void;
    copyToClipboard(includeHeader?: boolean): void;
    copySelectedRowsToClipboard(includeHeader?: boolean, columnKeys?: (string | Column)[]): void;
    copySelectedRangeToClipboard(includeHeader?: boolean): void;
    copyRangeDown(): void;
}
