import { Column } from "../entities/column";
import { GridCompController } from "../gridComp/gridCompController";
export interface IClipboardService {
    registerGridCompController(gridCompController: GridCompController): void;
    pasteFromClipboard(): void;
    copyToClipboard(includeHeader?: boolean): void;
    copySelectedRowsToClipboard(includeHeader?: boolean, columnKeys?: (string | Column)[]): void;
    copySelectedRangeToClipboard(includeHeader?: boolean): void;
    copyRangeDown(): void;
}
