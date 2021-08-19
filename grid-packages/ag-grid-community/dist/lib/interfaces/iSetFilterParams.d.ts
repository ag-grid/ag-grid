import { ICellRendererComp, ICellRendererFunc } from '../rendering/cellRenderers/iCellRenderer';
import { ColDef, ValueFormatterParams } from '../entities/colDef';
import { IProvidedFilterParams } from '../filter/provided/providedFilter';
export interface SetFilterValuesFuncParams {
    success: (values: string[]) => void;
    colDef: ColDef;
}
export declare type SetFilterValuesFunc = (params: SetFilterValuesFuncParams) => void;
export declare type SetFilterValues = SetFilterValuesFunc | any[];
export interface ISetFilterParams extends IProvidedFilterParams {
    /** @deprecated */ suppressRemoveEntries?: boolean;
    values?: SetFilterValues;
    refreshValuesOnOpen?: boolean;
    cellHeight?: number;
    suppressSorting?: boolean;
    cellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    suppressMiniFilter?: boolean;
    applyMiniFilterWhileTyping?: boolean;
    suppressSelectAll?: boolean;
    defaultToNothingSelected?: boolean;
    /** @deprecated */ suppressSyncValuesAfterDataChange?: boolean;
    comparator?: (a: any, b: any) => number;
    textFormatter?: (from: string) => string;
    valueFormatter?: (params: ValueFormatterParams) => string;
    /** @deprecated */ selectAllOnMiniFilter?: boolean;
    /** @deprecated */ syncValuesLikeExcel?: boolean;
    showTooltips?: boolean;
    excelMode?: 'mac' | 'windows';
}
