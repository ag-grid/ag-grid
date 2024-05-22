import type { ColumnChooserParams } from '../entities/colDef';
import type { Column } from '../entities/column';

export interface ShowColumnChooserParams {
    column?: Column | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
}

export interface IColumnChooserFactory {
    showColumnChooser(params: ShowColumnChooserParams): void;

    hideActiveColumnChooser(): void;
}
