import type { ColumnChooserParams } from '../entities/colDef';
import type { InternalColumn } from '../entities/column';

export interface ShowColumnChooserParams {
    column?: InternalColumn | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
}

export interface IColumnChooserFactory {
    showColumnChooser(params: ShowColumnChooserParams): void;

    hideActiveColumnChooser(): void;
}
