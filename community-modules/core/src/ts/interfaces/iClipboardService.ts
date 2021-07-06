import { Column } from "../entities/column";
import { GridCtrl } from "../gridComp/gridCtrl";

export interface IClipboardService {
    registerGridCompController(gridCompController: GridCtrl): void;
    pasteFromClipboard(): void;
    copyToClipboard(includeHeader?: boolean): void;
    copySelectedRowsToClipboard(includeHeader?: boolean, columnKeys?: (string | Column)[]): void;
    copySelectedRangeToClipboard(includeHeader?: boolean): void;
    copyRangeDown(): void;
}
