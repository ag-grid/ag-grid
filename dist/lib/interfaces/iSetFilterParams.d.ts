// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilterParams } from "./iFilter";
import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
export interface ISetFilterParams extends IFilterParams {
    suppressRemoveEntries?: boolean;
    values?: any;
    cellHeight: number;
    apply: boolean;
    suppressSorting: boolean;
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    newRowsAction: string;
    suppressMiniFilter: boolean;
    selectAllOnMiniFilter: boolean;
    comparator?: (a: any, b: any) => number;
    debounceMs?: number;
}
