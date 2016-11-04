import {Column} from "../entities/column";
import {ColDef} from "../entities/colDef";

export interface IClipboardService {
    pasteFromClipboard(): void;
    copyToClipboard(includeHeader?: boolean): void;
    copySelectedRowsToClipboard(includeHeader?: boolean, columnKeys?: (string|Column|ColDef)[]): void;
    copySelectedRangeToClipboard(includeHeader?: boolean): void;
    copyRangeDown(): void;
}
