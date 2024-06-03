import type { ColumnModel } from '../columns/columnModel';
import type { DataTypeService } from '../columns/dataTypeService';
import type { UserCompDetails } from '../components/framework/userComponentFactory';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { EventsType } from '../eventKeys';
import type { AdvancedFilterEnabledChangedEvent, FilterChangedEventSourceType } from '../events';
import { Events } from '../events';
import type { AdvancedFilterModel } from '../interfaces/advancedFilterModel';
import type { IAdvancedFilterService } from '../interfaces/iAdvancedFilterService';
import type { FilterModel, IFilter, IFilterComp, IFilterParams } from '../interfaces/iFilter';
import { _warnOnce } from '../utils/function';
import type { ColumnFilterService, FilterWrapper } from './columnFilterService';
import { EVENT_QUICK_FILTER_CHANGED, type QuickFilterService } from './quickFilterService';

export class FilterManager extends BeanStub implements NamedBean {
    beanName = 'filterManager' as const;

    private columnModel: ColumnModel;
    private dataTypeService?: DataTypeService;
    private quickFilterService?: QuickFilterService;
    private advancedFilterService: IAdvancedFilterService;
    private columnFilterService?: ColumnFilterService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.dataTypeService = beans.dataTypeService;
        this.quickFilterService = beans.quickFilterService;
        this.advancedFilterService = beans.advancedFilterService;
        this.columnFilterService = beans.columnFilterService;
    }

    // A cached version of gridOptions.isExternalFilterPresent so its not called for every row
    private externalFilterPresent: boolean;

    private aggFiltering: boolean;

    // when we're waiting for cell data types to be inferred, we need to defer filter model updates
    private advancedFilterModelUpdateQueue: (AdvancedFilterModel | null | undefined)[] = [];

    public postConstruct(): void {
        this.addManagedListeners<EventsType>(this.eventService, {
            [Events.EVENT_COLUMN_VALUE_CHANGED]: this.refreshFiltersForAggregations.bind(this),
            [Events.EVENT_COLUMN_PIVOT_CHANGED]: this.refreshFiltersForAggregations.bind(this),
            [Events.EVENT_COLUMN_PIVOT_MODE_CHANGED]: this.refreshFiltersForAggregations.bind(this),
            [Events.EVENT_NEW_COLUMNS_LOADED]: this.updateAdvancedFilterColumns.bind(this),
            [Events.EVENT_COLUMN_VISIBLE]: this.updateAdvancedFilterColumns.bind(this),
            [Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED]: ({ enabled }: AdvancedFilterEnabledChangedEvent) =>
                this.onAdvancedFilterEnabledChanged(enabled),
            [Events.EVENT_DATA_TYPES_INFERRED]: this.processFilterModelUpdateQueue.bind(this),
        });

        this.externalFilterPresent = this.isExternalFilterPresentCallback();
        this.addManagedPropertyListeners(['isExternalFilterPresent', 'doesExternalFilterPass'], () => {
            this.onFilterChanged({ source: 'api' });
        });

        this.updateAggFiltering();
        this.addManagedPropertyListener('groupAggFiltering', () => {
            this.updateAggFiltering();
            this.onFilterChanged();
        });

        this.addManagedPropertyListener('advancedFilterModel', (event) =>
            this.setAdvancedFilterModel(event.currentValue)
        );

        if (this.quickFilterService) {
            this.addManagedListener(this.quickFilterService, EVENT_QUICK_FILTER_CHANGED, () =>
                this.onFilterChanged({ source: 'quickFilter' })
            );
        }
    }

    private isExternalFilterPresentCallback() {
        const isFilterPresent = this.gos.getCallback('isExternalFilterPresent');
        if (typeof isFilterPresent === 'function') {
            return isFilterPresent({});
        }
        return false;
    }

    private doesExternalFilterPass(node: RowNode) {
        const doesFilterPass = this.gos.get('doesExternalFilterPass');
        if (typeof doesFilterPass === 'function') {
            return doesFilterPass(node);
        }
        return false;
    }

    public setFilterModel(model: FilterModel | null, source: FilterChangedEventSourceType = 'api'): void {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return;
        }

        this.columnFilterService?.setFilterModel(model, source);
    }

    public getFilterModel(): FilterModel {
        return this.columnFilterService?.getFilterModel() ?? {};
    }

    public isColumnFilterPresent(): boolean {
        return !!this.columnFilterService?.isColumnFilterPresent();
    }

    public isAggregateFilterPresent(): boolean {
        return !!this.columnFilterService?.isAggregateFilterPresent();
    }

    public isExternalFilterPresent(): boolean {
        return this.externalFilterPresent;
    }

    public isChildFilterPresent(): boolean {
        return (
            this.isColumnFilterPresent() ||
            this.isQuickFilterPresent() ||
            this.isExternalFilterPresent() ||
            this.isAdvancedFilterPresent()
        );
    }

    private isAdvancedFilterPresent(): boolean {
        return this.isAdvancedFilterEnabled() && this.advancedFilterService.isFilterPresent();
    }

    private onAdvancedFilterEnabledChanged(enabled: boolean): void {
        if (enabled) {
            if (this.columnFilterService?.disableColumnFilters()) {
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        } else {
            if (this.advancedFilterService?.isFilterPresent()) {
                this.advancedFilterService.setModel(null);
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        }
    }

    public isAdvancedFilterEnabled(): boolean {
        return !!this.advancedFilterService?.isEnabled();
    }

    public isAdvancedFilterHeaderActive(): boolean {
        return this.isAdvancedFilterEnabled() && this.advancedFilterService.isHeaderActive();
    }

    public isAnyFilterPresent(): boolean {
        return (
            this.isQuickFilterPresent() ||
            this.isColumnFilterPresent() ||
            this.isAggregateFilterPresent() ||
            this.isExternalFilterPresent() ||
            this.isAdvancedFilterPresent()
        );
    }

    public resetQuickFilterCache(): void {
        this.quickFilterService?.resetQuickFilterCache();
    }

    private refreshFiltersForAggregations() {
        const isAggFiltering = this.gos.getGroupAggFiltering();
        if (isAggFiltering) {
            this.onFilterChanged();
        }
    }

    public onFilterChanged(
        params: {
            source?: FilterChangedEventSourceType;
            filterInstance?: IFilterComp;
            additionalEventAttributes?: any;
            columns?: AgColumn[];
        } = {}
    ): void {
        this.externalFilterPresent = this.isExternalFilterPresentCallback();
        this.columnFilterService?.updateForFilterChanged(params);
    }

    public isSuppressFlashingCellsBecauseFiltering(): boolean {
        return !!this.columnFilterService?.isSuppressFlashingCellsBecauseFiltering();
    }

    public isQuickFilterPresent(): boolean {
        return !!this.quickFilterService?.isQuickFilterPresent();
    }

    private updateAggFiltering(): void {
        this.aggFiltering = !!this.gos.getGroupAggFiltering();
    }

    public isAggregateQuickFilterPresent(): boolean {
        return this.isQuickFilterPresent() && this.shouldApplyQuickFilterAfterAgg();
    }

    private isNonAggregateQuickFilterPresent(): boolean {
        return this.isQuickFilterPresent() && !this.shouldApplyQuickFilterAfterAgg();
    }

    private shouldApplyQuickFilterAfterAgg(): boolean {
        return (
            (this.aggFiltering || this.columnModel.isPivotMode()) && !this.gos.get('applyQuickFilterBeforePivotOrAgg')
        );
    }

    public doesRowPassOtherFilters(filterToSkip: IFilterComp, node: any): boolean {
        return this.doesRowPassFilter({ rowNode: node, filterInstanceToSkip: filterToSkip });
    }

    public doesRowPassAggregateFilters(params: { rowNode: RowNode; filterInstanceToSkip?: IFilterComp }): boolean {
        // check quick filter
        if (this.isAggregateQuickFilterPresent() && !this.quickFilterService!.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }

        if (
            this.isAggregateFilterPresent() &&
            !this.columnFilterService!.doAggregateFiltersPass(params.rowNode, params.filterInstanceToSkip)
        ) {
            return false;
        }

        // got this far, all filters pass
        return true;
    }

    public doesRowPassFilter(params: { rowNode: RowNode; filterInstanceToSkip?: IFilterComp }): boolean {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall

        // first up, check quick filter
        if (
            this.isNonAggregateQuickFilterPresent() &&
            !this.quickFilterService!.doesRowPassQuickFilter(params.rowNode)
        ) {
            return false;
        }

        // secondly, give the client a chance to reject this row
        if (this.isExternalFilterPresent() && !this.doesExternalFilterPass(params.rowNode)) {
            return false;
        }

        // lastly, check column filter
        if (
            this.isColumnFilterPresent() &&
            !this.columnFilterService!.doColumnFiltersPass(params.rowNode, params.filterInstanceToSkip)
        ) {
            return false;
        }

        if (this.isAdvancedFilterPresent() && !this.advancedFilterService.doesFilterPass(params.rowNode)) {
            return false;
        }

        // got this far, all filters pass
        return true;
    }

    public isFilterActive(column: AgColumn): boolean {
        return !!this.columnFilterService?.isFilterActive(column);
    }

    public getOrCreateFilterWrapper(column: AgColumn): FilterWrapper | null {
        return this.columnFilterService?.getOrCreateFilterWrapper(column) ?? null;
    }

    public getDefaultFloatingFilter(column: AgColumn): string {
        return this.columnFilterService!.getDefaultFloatingFilter(column);
    }

    public createFilterParams(column: AgColumn, colDef: ColDef): IFilterParams {
        return this.columnFilterService!.createFilterParams(column, colDef);
    }

    // for group filters, can change dynamically whether they are allowed or not
    public isFilterAllowed(column: AgColumn): boolean {
        if (this.isAdvancedFilterEnabled()) {
            return false;
        }
        return !!this.columnFilterService?.isFilterAllowed(column);
    }

    public getFloatingFilterCompDetails(column: AgColumn, showParentFilter: () => void): UserCompDetails | undefined {
        return this.columnFilterService?.getFloatingFilterCompDetails(column, showParentFilter);
    }

    public getCurrentFloatingFilterParentModel(column: AgColumn): any {
        return this.columnFilterService?.getCurrentFloatingFilterParentModel(column);
    }

    // destroys the filter, so it no longer takes part
    public destroyFilter(column: AgColumn, source: 'api' | 'columnChanged' | 'paramsUpdated' = 'api'): void {
        this.columnFilterService?.destroyFilter(column, source);
    }

    public areFilterCompsDifferent(
        oldCompDetails: UserCompDetails | null,
        newCompDetails: UserCompDetails | null
    ): boolean {
        return !!this.columnFilterService?.areFilterCompsDifferent(oldCompDetails, newCompDetails);
    }

    public getAdvancedFilterModel(): AdvancedFilterModel | null {
        return this.isAdvancedFilterEnabled() ? this.advancedFilterService.getModel() : null;
    }

    public setAdvancedFilterModel(expression: AdvancedFilterModel | null | undefined): void {
        if (!this.isAdvancedFilterEnabled()) {
            return;
        }
        if (this.dataTypeService?.isPendingInference()) {
            this.advancedFilterModelUpdateQueue.push(expression);
            return;
        }
        this.advancedFilterService.setModel(expression ?? null);
        this.onFilterChanged({ source: 'advancedFilter' });
    }

    public showAdvancedFilterBuilder(source: 'api' | 'ui'): void {
        if (!this.isAdvancedFilterEnabled()) {
            return;
        }
        this.advancedFilterService.getCtrl().toggleFilterBuilder(source, true);
    }

    private updateAdvancedFilterColumns(): void {
        if (!this.isAdvancedFilterEnabled()) {
            return;
        }
        if (this.advancedFilterService.updateValidity()) {
            this.onFilterChanged({ source: 'advancedFilter' });
        }
    }

    public hasFloatingFilters(): boolean {
        if (this.isAdvancedFilterEnabled()) {
            return false;
        }
        return !!this.columnFilterService?.hasFloatingFilters();
    }

    public getFilterInstance<TFilter extends IFilter>(
        key: string | AgColumn,
        callback?: (filter: TFilter | null) => void
    ): TFilter | null | undefined {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return undefined;
        }
        return this.columnFilterService?.getFilterInstance(key, callback);
    }

    public getColumnFilterInstance<TFilter extends IFilter>(
        key: string | AgColumn
    ): Promise<TFilter | null | undefined> {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return Promise.resolve(undefined);
        }
        return this.columnFilterService?.getColumnFilterInstance(key) ?? Promise.resolve(undefined);
    }

    private warnAdvancedFilters(): void {
        _warnOnce('Column Filter API methods have been disabled as Advanced Filters are enabled.');
    }

    public setupAdvancedFilterHeaderComp(eCompToInsertBefore: HTMLElement): void {
        this.advancedFilterService?.getCtrl().setupHeaderComp(eCompToInsertBefore);
    }

    public getHeaderRowCount(): number {
        return this.isAdvancedFilterHeaderActive() ? 1 : 0;
    }

    public getHeaderHeight(): number {
        return this.isAdvancedFilterHeaderActive() ? this.advancedFilterService.getCtrl().getHeaderHeight() : 0;
    }

    private processFilterModelUpdateQueue(): void {
        this.advancedFilterModelUpdateQueue.forEach((model) => this.setAdvancedFilterModel(model));
        this.advancedFilterModelUpdateQueue = [];
    }

    public getColumnFilterModel(key: string | AgColumn): any {
        return this.columnFilterService?.getColumnFilterModel(key);
    }

    public setColumnFilterModel(key: string | AgColumn, model: any): Promise<void> {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return Promise.resolve();
        }
        return this.columnFilterService?.setColumnFilterModel(key, model) ?? Promise.resolve();
    }
}
