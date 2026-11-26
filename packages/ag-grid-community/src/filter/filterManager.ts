import { AgPromise } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { FilterChangedEvent, FilterChangedEventSourceType } from '../events';
import type { RowChanges } from '../gridChanges';
import { _getGroupAggFiltering } from '../gridOptionsUtils';
import type { AdvancedFilterModel } from '../interfaces/advancedFilterModel';
import type { IAdvancedFilterService } from '../interfaces/iAdvancedFilterService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ColumnFilterState, FilterModel, IFilter } from '../interfaces/iFilter';
import type { IPinnedSectionCompHost } from '../interfaces/iPinnedSectionCompHost';
import type { IRowNode } from '../interfaces/iRowNode';
import { _mergeDeep } from '../utils/mergeDeep';
import type { ColumnFilterService } from './columnFilterService';
import type { QuickFilterChangedEvent, QuickFilterService } from './quickFilterService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class FilterManager extends BeanStub implements NamedBean {
    beanName = 'filterManager' as const;

    private quickFilter?: QuickFilterService;
    private advancedFilter: IAdvancedFilterService;
    private colFilter?: ColumnFilterService;

    public wireBeans(beans: BeanCollection): void {
        this.quickFilter = beans.quickFilter;
        this.advancedFilter = beans.advancedFilter;
        this.colFilter = beans.colFilter;
    }

    // A cached version of gridOptions.isExternalFilterPresent so its not called for every row
    private externalFilterPresent: boolean;

    private aggFiltering: boolean;

    private alwaysPassFilter?: (rowNode: IRowNode) => boolean;

    public postConstruct(): void {
        this.addManagedEventListeners({
            advancedFilterEnabledChanged: ({ enabled }) => this.onAdvFilterEnabledChanged(enabled),
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

        if (this.quickFilter) {
            this.addManagedListeners(this.quickFilter, {
                // A state restore supplies its own source; a user edit of the quick filter has none.
                quickFilterChanged: ({ source }: QuickFilterChangedEvent) =>
                    this.onFilterChanged({ source: source ?? 'quickFilter' }),
            });
        }

        const { gos } = this;
        this.alwaysPassFilter = gos.get('alwaysPassFilter');
        this.addManagedPropertyListener('alwaysPassFilter', () => {
            this.alwaysPassFilter = gos.get('alwaysPassFilter');
            this.onFilterChanged({ source: 'api' });
        });
    }

    private isExternalFilterPresentCallback() {
        const isFilterPresent = this.gos.getCallback('isExternalFilterPresent');
        return typeof isFilterPresent === 'function' && isFilterPresent({});
    }

    private doesExternalFilterPass(node: RowNode) {
        const doesFilterPass = this.gos.get('doesExternalFilterPass');
        return typeof doesFilterPass === 'function' && doesFilterPass(node);
    }

    public setFilterState(
        model: FilterModel | null,
        state: ColumnFilterState | null,
        source: FilterChangedEventSourceType = 'api'
    ) {
        if (this.isAdvFilterEnabled()) {
            return;
        }

        this.colFilter?.setState(model, state, source);
    }

    public setFilterModel(
        model: FilterModel | null,
        source: FilterChangedEventSourceType = 'api',
        skipWarning?: boolean
    ): void {
        this.beans.stateSvc?.applyInitialFilterState();
        if (this.isAdvFilterEnabled()) {
            if (!skipWarning) {
                this.warnAdvFilters();
            }
            return;
        }

        this.colFilter?.setModel(model, source);
    }

    public getFilterModel(): FilterModel {
        return this.colFilter?.getLatestModel() ?? {};
    }

    public getFilterState(): ColumnFilterState | undefined {
        return this.colFilter?.getState();
    }

    public isColumnFilterPresent(): boolean {
        return !!this.colFilter?.isFilterPresent();
    }

    public isAggregateFilterPresent(): boolean {
        return !!this.colFilter?.isAggFilterPresent();
    }

    public isChildFilterPresent(): boolean {
        return (
            this.isColumnFilterPresent() ||
            this.isQuickFilterPresent() ||
            this.externalFilterPresent ||
            this.isAdvFilterPresent()
        );
    }
    public isAnyFilterPresent(): boolean {
        return this.isChildFilterPresent() || this.isAggregateFilterPresent();
    }

    private isAdvFilterPresent(): boolean {
        return this.isAdvFilterEnabled() && this.advancedFilter.isFilterPresent();
    }

    private onAdvFilterEnabledChanged(enabled: boolean): void {
        if (enabled) {
            if (this.colFilter?.disableFilters()) {
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        } else if (this.advancedFilter?.isFilterPresent()) {
            this.advancedFilter.setModel(null);
            this.onFilterChanged({ source: 'advancedFilter' });
        }
    }

    public isAdvFilterEnabled(): boolean {
        return !!this.advancedFilter?.isEnabled();
    }

    public isAdvFilterHeaderActive(): boolean {
        return this.isAdvFilterEnabled() && this.advancedFilter.isHeaderActive();
    }

    /** Before an update's rows refresh, filters follow its columns: re-run once on a re-aggregation, show or hide. */
    public applyRowChanges(change: RowChanges): void {
        this.colFilter?.applyRowChanges(change);
        // regenerated pivot value columns leave a filter classified against the old ones, whatever `groupAggFiltering`
        const reaggregates = change.pivot || ((change.values || change.pivotMode) && !!_getGroupAggFiltering(this.gos));
        if (reaggregates && this.isAnyFilterPresent()) {
            this.onFilterChanged();
        }
        const columnsVisible = change.columnsVisible;
        if (change.columnsLoaded || columnsVisible) {
            this.updateAdvFilterColumns();
        }
        if (columnsVisible) {
            this.quickFilter?.refreshCols();
        }
    }

    public onFilterChanged(
        params: {
            source?: FilterChangedEventSourceType;
            additionalEventAttributes?: any;
            column?: AgColumn;
            columns?: AgColumn[];
        } = {}
    ): void {
        const { source, additionalEventAttributes, columns = [] } = params;
        this.externalFilterPresent = this.isExternalFilterPresentCallback();
        (this.colFilter ? this.colFilter.updateBeforeFilterChanged(params) : AgPromise.resolve()).then(() => {
            const filterChangedEvent: WithoutGridCommon<FilterChangedEvent> = {
                source,
                type: 'filterChanged',
                columns,
            };

            if (additionalEventAttributes) {
                _mergeDeep(filterChangedEvent, additionalEventAttributes);
            }

            this.eventSvc.dispatchEvent(filterChangedEvent);
            const primary = columns.length === 0 || columns.some((col) => col.primary);
            this.beans.syncSvc.filterChanged(!filterChangedEvent.afterDataChange, primary);

            this.colFilter?.updateAfterFilterChanged();
        });
    }

    public isSuppressFlashingCellsBecauseFiltering(): boolean {
        return !!this.colFilter?.isSuppressFlashingCellsBecauseFiltering();
    }

    private isQuickFilterPresent(): boolean {
        return !!this.quickFilter?.isFilterPresent();
    }

    private updateAggFiltering(): void {
        this.aggFiltering = !!_getGroupAggFiltering(this.gos);
    }

    public isAggregateQuickFilterPresent(): boolean {
        return this.isQuickFilterPresent() && this.shouldApplyQuickFilterAfterAgg();
    }

    private isNonAggregateQuickFilterPresent(): boolean {
        return this.isQuickFilterPresent() && !this.shouldApplyQuickFilterAfterAgg();
    }

    private shouldApplyQuickFilterAfterAgg(): boolean {
        return (
            (this.aggFiltering || this.beans.colModel.pivotMode) && !this.gos.get('applyQuickFilterBeforePivotOrAgg')
        );
    }

    public doesRowPassAggregateFilters(params: { rowNode: RowNode; colIdToSkip?: string }): boolean {
        const { rowNode } = params;

        if (this.alwaysPassFilter?.(rowNode)) {
            return true;
        }

        // check quick filter
        if (this.isAggregateQuickFilterPresent() && !this.quickFilter!.doesRowPass(rowNode)) {
            return false;
        }

        if (this.isAggregateFilterPresent() && !this.colFilter!.doFiltersPass(rowNode, params.colIdToSkip, true)) {
            return false;
        }

        // got this far, all filters pass
        return true;
    }

    public doesRowPassFilter(rowNode: RowNode, colIdToSkip?: string): boolean {
        if (this.alwaysPassFilter?.(rowNode)) {
            return true;
        }

        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall
        // first up, check quick filter
        if (this.isNonAggregateQuickFilterPresent() && !this.quickFilter!.doesRowPass(rowNode)) {
            return false;
        }

        // secondly, give the client a chance to reject this row
        if (this.externalFilterPresent && !this.doesExternalFilterPass(rowNode)) {
            return false;
        }

        // lastly, check column filter
        if (this.isColumnFilterPresent() && !this.colFilter!.doFiltersPass(rowNode, colIdToSkip)) {
            return false;
        }

        if (this.isAdvFilterPresent() && !this.advancedFilter.doesFilterPass(rowNode)) {
            return false;
        }

        // got this far, all filters pass
        return true;
    }

    // for group filters, can change dynamically whether they are allowed or not
    public isFilterAllowed(column: AgColumn): boolean {
        if (this.isAdvFilterEnabled()) {
            return false;
        }
        return !!this.colFilter?.isFilterAllowed(column);
    }

    public getAdvFilterModel(): AdvancedFilterModel | null {
        return this.isAdvFilterEnabled() ? this.advancedFilter.getLatestModel() : null;
    }

    public setAdvFilterModel(
        expression: AdvancedFilterModel | null | undefined,
        source: FilterChangedEventSourceType = 'api'
    ): void {
        if (!this.isAdvFilterEnabled()) {
            return;
        }
        this.beans.stateSvc?.applyInitialFilterState();
        this.advancedFilter.setModelOrDefer(expression ?? null, source);
    }

    public toggleAdvFilterBuilder(show: boolean, source: 'api' | 'ui'): void {
        if (!this.isAdvFilterEnabled()) {
            return;
        }
        this.advancedFilter.getCtrl().toggleFilterBuilder({ source, force: show });
    }

    private updateAdvFilterColumns(): void {
        if (!this.isAdvFilterEnabled()) {
            return;
        }
        if (this.advancedFilter.updateValidity()) {
            this.onFilterChanged({ source: 'advancedFilter' });
        }
    }

    public hasFloatingFilters(): boolean {
        if (this.isAdvFilterEnabled()) {
            return false;
        }
        return !!this.colFilter?.hasFloatingFilters();
    }

    public getColumnFilterInstance<TFilter = IFilter>(key: string | AgColumn): Promise<TFilter | null | undefined> {
        if (this.isAdvFilterEnabled()) {
            this.warnAdvFilters();
            return Promise.resolve(undefined);
        }
        return this.colFilter?.getFilterInstance(key) ?? Promise.resolve(undefined);
    }

    private warnAdvFilters(): void {
        // Column Filter API methods have been disabled as Advanced Filters are enabled
        this.warn(68);
    }

    public mountAdvFilterTopSectionComp(host: IPinnedSectionCompHost): void {
        this.advancedFilter?.getCtrl().mountTopSectionComp(host);
    }

    public getHeaderRowCount(): number {
        return this.isAdvFilterHeaderActive() ? 1 : 0;
    }

    public getHeaderHeight(): number {
        return this.isAdvFilterHeaderActive() ? this.advancedFilter.getCtrl().getHeaderHeight() : 0;
    }

    public setColumnFilterModel(key: string | AgColumn, model: any): Promise<void> {
        this.beans.stateSvc?.applyInitialFilterState();
        if (this.isAdvFilterEnabled()) {
            this.warnAdvFilters();
            return Promise.resolve();
        }
        return this.colFilter?.setModelForColumn(key, model) ?? Promise.resolve();
    }
}
