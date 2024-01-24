import { Column } from "../entities/column";
import { ColumnsMenuParams } from "../entities/colDef";

export interface IColumnChooserFactory {
    showColumnChooser({ column, params }: { column?: Column | null, params?: ColumnsMenuParams }): void;

    hideActiveColumnChooser(): void
}
