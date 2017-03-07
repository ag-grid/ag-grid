import {Observable} from "rxjs";
import {RowNode} from "../entities/rowNode";
import {IRowModel} from "./iRowModel";

export interface IObservableInMemoryRowModel extends IRowModel {

    /** ObservableInMemory model only. Gets the model to refresh. Provide a step for the
     * step in the pipeline you want to refresh from. */
    refreshModel(params: {step: number, groupState?: any, keepRenderedRows?: boolean, animate?: boolean}): void;
    /** ObservableInMemory model only. */
    setRowDataSource(rows: Observable<any>): void;
    /** When the row height was changed for a row node */
    onRowHeightChanged(): void;
    /** When all row heights should be reset */
    resetRowHeights(): void;
}