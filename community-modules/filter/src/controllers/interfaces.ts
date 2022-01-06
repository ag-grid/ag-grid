import { AgPromise, Column, ColumnEventType, Component, FilterRequestSource, FilterUIInfo, IFilterComp, IFilterParams, RowNode } from "@ag-grid-community/core";
import { ExpressionComponent } from "../components/interfaces";
import { IFilterAdapter } from "../adapters/iFilterAdapter";

export interface FilterUICommon {
    filterUIInfo: FilterUIInfo;
}

export interface IFilterCompUI extends FilterUICommon {
    type: 'IFilterComp';
    comp: IFilterComp;
    column: Column;
}

export interface ExpressionComponentUI extends FilterUICommon {
    type: 'ExpressionComponent',
    comp: ExpressionComponent & Component,
    adaptor: IFilterAdapter;
    column: Column;
}

export type FilterUI = (IFilterCompUI | ExpressionComponentUI);

interface BaseFilterController {
    isActive(): boolean;
    isFilterActive(column: Column): boolean;
    evaluate(params: { rowNode: RowNode, columnToSkip?: Column }): boolean;
}

export interface IFilterParamSupport {
    doesRowPassOtherFilters(column: Column, node: RowNode): boolean;
    onFilterChanged(params: { additionalEventAttributes: any; columns: Column[]; }): void;
    createBaseFilterParams(column: Column): IFilterParams;
}

export interface StatelessFilterController extends BaseFilterController {
    readonly type: 'stateless';
}

export interface AdvancedFilterController<T extends FilterUI> extends BaseFilterController {
    readonly type: 'advanced';
    
    getFilterModel(): { [key: string]: any; };
    setFilterModel(exprs: {[key: string]: any} | null, support: IFilterParamSupport): AgPromise<void>;
    
    onColumnsChanged(): Column[];
    
    isResponsibleFor(column: Column): boolean;
    getFilterUIInfo(column: Column, source: FilterRequestSource, support: IFilterParamSupport): AgPromise<FilterUIInfo>;
    getAllFilterUIs(): Record<string, T>;
    createFilterComp(column: Column, source: FilterRequestSource, support: IFilterParamSupport): AgPromise<T>;
    destroyFilter(column: Column, source: ColumnEventType): AgPromise<void>;
}

export type InternalFilterController = StatelessFilterController | AdvancedFilterController<FilterUI>;
