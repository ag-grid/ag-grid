import { IFilterParams } from "./iFilter";
import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef } from "../entities/colDef";
import { IProvidedFilterParams } from "../filter/provided/providedFilter";

export interface SetFilterValuesFuncParams {
    success: (values: string[]) => void;
    colDef: ColDef;
}
export type SetFilterValuesFunc = (params: SetFilterValuesFuncParams) => void;
export type SetFilterValues = SetFilterValuesFunc | any[];

export interface ISetFilterParams extends IProvidedFilterParams {
    suppressRemoveEntries ?: boolean;
    values ?: SetFilterValues;
    cellHeight: number;
    suppressSorting: boolean;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    suppressMiniFilter: boolean;
    selectAllOnMiniFilter: boolean;
    comparator?: (a: any, b: any) => number;
    miniFilterSearchByRefDataKey?: boolean;
    textFormatter?: (from: string) => string;
}