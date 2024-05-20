import { ColumnChooserParams } from '../entities/colDef';
import { Column } from '../entities/column';

export interface ShowColumnChooserParams {
    column?: Column | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
}

export interface IColumnChooserFactory {
    showColumnChooser(params: ShowColumnChooserParams): void;

    hideActiveColumnChooser(): void;
}
