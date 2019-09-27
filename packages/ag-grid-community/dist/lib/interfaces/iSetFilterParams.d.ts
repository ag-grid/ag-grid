// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef } from "../entities/colDef";
import { IProvidedFilterParams } from "../filter/provided/providedFilter";
export interface SetFilterValuesFuncParams {
    success: (values: string[]) => void;
    colDef: ColDef;
}
export declare type SetFilterValuesFunc = (params: SetFilterValuesFuncParams) => void;
export declare type SetFilterValues = SetFilterValuesFunc | any[];
export interface ISetFilterParams extends IProvidedFilterParams {
    suppressRemoveEntries?: boolean;
    values?: SetFilterValues;
    cellHeight: number;
    suppressSorting: boolean;
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    suppressMiniFilter: boolean;
    suppressSelectAll: boolean;
    selectAllOnMiniFilter: boolean;
    syncValuesLikeExcel: boolean;
    comparator?: (a: any, b: any) => number;
    miniFilterSearchByRefDataKey?: boolean;
    textFormatter?: (from: string) => string;
}
