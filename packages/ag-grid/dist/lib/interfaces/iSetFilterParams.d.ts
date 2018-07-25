// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IFilterParams } from "./iFilter";
import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef } from "../entities/colDef";
export interface SetFilterValuesFuncParams {
    success: (values: string[]) => void;
    colDef: ColDef;
}
export declare type SetFilterValuesFunc = (params: SetFilterValuesFuncParams) => void;
export declare type SetFilterValues = SetFilterValuesFunc | any[];
export interface ISetFilterParams extends IFilterParams {
    suppressRemoveEntries?: boolean;
    values?: SetFilterValues;
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
    miniFilterSearchByRefDataKey?: boolean;
}
