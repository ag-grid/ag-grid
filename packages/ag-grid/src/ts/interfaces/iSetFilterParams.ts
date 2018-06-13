import {IFilterParams} from "./iFilter";
import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";
import {ColDef} from "../entities/colDef";
import {Column} from "../entities/column";
import {GridApi} from "../gridApi";
import {RowNode} from "../entities/rowNode";
import {ColumnApi} from "../columnController/columnApi";

export interface SetFilterValuesFuncParams {
    success: (values: string[])=>void;
    colDef: ColDef,
}
export type SetFilterValuesFunc = (params: SetFilterValuesFuncParams)=>void;
export type SetFilterValues = SetFilterValuesFunc | any[];

export interface ISetFilterParams extends IFilterParams {
    suppressRemoveEntries ?: boolean;
    values ?: SetFilterValues;
    cellHeight: number;
    apply: boolean;
    suppressSorting: boolean;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    newRowsAction: string;
    suppressMiniFilter: boolean;
    selectAllOnMiniFilter: boolean;
    comparator?: (a: any, b: any) => number;
    debounceMs?: number;
}
