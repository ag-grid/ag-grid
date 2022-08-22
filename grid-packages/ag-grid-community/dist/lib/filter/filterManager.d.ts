import { AgPromise } from '../utils';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { ColumnEventType } from '../events';
import { IFilterComp, IFilterParams } from '../interfaces/iFilter';
import { ColDef } from '../entities/colDef';
import { BeanStub } from '../context/beanStub';
export declare type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';
export declare class FilterManager extends BeanStub {
    private valueService;
    private columnModel;
    private rowModel;
    private userComponentFactory;
    private rowRenderer;
    static QUICK_FILTER_SEPARATOR: string;
    private allColumnFilters;
    private activeAggregateFilters;
    private activeColumnFilters;
    private quickFilter;
    private quickFilterParts;
    private processingFilterChange;
    private allowShowChangeAfterFilter;
    private externalFilterPresent;
    init(): void;
    private setQuickFilterParts;
    setFilterModel(model: {
        [key: string]: any;
    }): void;
    private setModelOnFilterWrapper;
    getFilterModel(): {
        [key: string]: any;
    };
    isColumnFilterPresent(): boolean;
    isAggregateFilterPresent(): boolean;
    isExternalFilterPresent(): boolean;
    private doAggregateFiltersPass;
    private updateActiveFilters;
    private updateFilterFlagInColumns;
    isAnyFilterPresent(): boolean;
    private doColumnFiltersPass;
    private parseQuickFilter;
    setQuickFilter(newFilter: string): void;
    refreshFiltersForAggregations(): void;
    callOnFilterChangedOutsideRenderCycle(params?: {
        filterInstance?: IFilterComp;
        additionalEventAttributes?: any;
        columns?: Column[];
    }): void;
    onFilterChanged(params?: {
        filterInstance?: IFilterComp;
        additionalEventAttributes?: any;
        columns?: Column[];
    }): void;
    isSuppressFlashingCellsBecauseFiltering(): boolean;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: IFilterComp, node: any): boolean;
    private doesRowPassQuickFilterNoCache;
    private doesRowPassQuickFilterCache;
    private doesRowPassQuickFilter;
    doesRowPassAggregateFilters(params: {
        rowNode: RowNode;
        filterInstanceToSkip?: IFilterComp;
    }): boolean;
    doesRowPassFilter(params: {
        rowNode: RowNode;
        filterInstanceToSkip?: IFilterComp;
    }): boolean;
    private getQuickFilterTextForColumn;
    private aggregateRowForQuickFilter;
    onNewRowsLoaded(source: ColumnEventType): void;
    private createValueGetter;
    getFilterComponent(column: Column, source: FilterRequestSource, createIfDoesNotExist?: boolean): AgPromise<IFilterComp> | null;
    isFilterActive(column: Column): boolean;
    getOrCreateFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper | null;
    cachedFilter(column: Column): FilterWrapper | undefined;
    private createFilterInstance;
    createFilterParams(column: Column, colDef: ColDef): IFilterParams;
    private createFilterWrapper;
    private putIntoGui;
    private onColumnsChanged;
    destroyFilter(column: Column, source?: ColumnEventType): void;
    private disposeFilterWrapper;
    protected destroy(): void;
}
export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: AgPromise<IFilterComp> | null;
    guiPromise: AgPromise<HTMLElement | null>;
}
