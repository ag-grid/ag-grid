import { Column } from "../entities/column";
import { ColumnChooserParams } from "../entities/colDef";

export interface IColumnChooserFactory {
    showColumnChooser({ column, params }: { column?: Column | null, params?: ColumnChooserParams }): void;

    hideActiveColumnChooser(): void
}
