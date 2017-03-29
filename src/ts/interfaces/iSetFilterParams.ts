import {IFilterParams} from "./iFilter";
import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";

export interface ISetFilterParams extends IFilterParams {
    suppressRemoveEntries ?: boolean;
    values ?: any;
    cellHeight: number;
    apply: boolean;
    suppressSorting: boolean;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    newRowsAction: string;
    suppressMiniFilter:boolean;
    selectAllOnMiniFilter:boolean;
    comparator?: (a: any, b: any) => number;
}
