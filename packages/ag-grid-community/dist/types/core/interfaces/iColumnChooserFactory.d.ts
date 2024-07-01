import type { AgColumn } from '../entities/agColumn';
import type { ColumnChooserParams } from '../entities/colDef';
export interface ShowColumnChooserParams {
    column?: AgColumn | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
}
export interface IColumnChooserFactory {
    showColumnChooser(params: ShowColumnChooserParams): void;
    hideActiveColumnChooser(): void;
}
