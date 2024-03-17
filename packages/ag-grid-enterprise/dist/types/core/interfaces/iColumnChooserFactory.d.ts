import { Column } from "../entities/column";
import { ColumnChooserParams } from "../entities/colDef";
export interface ShowColumnChooserParams {
    column?: Column | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
}
export interface IColumnChooserFactory {
    showColumnChooser(params: ShowColumnChooserParams): void;
    hideActiveColumnChooser(): void;
}
