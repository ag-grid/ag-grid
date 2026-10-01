import type { AgColumn, IFilterDef, IFilterParams, ISetFilterService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { SetFilterHandler } from './setFilterHandler';

/** Read from a filter's params as written, or as merged for the filter about to be created. */
interface PreservingFilterParams extends Partial<IFilterParams> {
    preservePreviousValues?: boolean;
    defaultFilterParams?: { preservePreviousValues?: boolean };
    filters?: (IFilterDef | null | undefined)[];
}

/** Every Set Filter handler by column, as a column's filter, Multi Filter children and the Advanced Filter each keep values. */
export class SetFilterService extends BeanStub implements NamedBean, ISetFilterService {
    readonly beanName = 'setFilterSvc' as const;

    private readonly handlersByColId = new Map<string, Set<SetFilterHandler<any>>>();

    public postConstruct(): void {
        const createPreservingFilters = () => this.createPreservingFilters();
        this.addManagedEventListeners({
            newColumnsLoaded: createPreservingFilters,
            advancedFilterEnabledChanged: createPreservingFilters,
        });
    }

    /** A filter keeping values that leave the data has to see them before they leave, not from first use. */
    public createPreservingFilters(column?: AgColumn): void {
        const { colFilter, filterManager, dataTypeSvc, colModel } = this.beans;
        // Its keys are made by the inferred data type, which a filter built before inference never picks up.
        if (!colFilter || filterManager?.isAdvFilterEnabled() || dataTypeSvc?.isPendingInference) {
            return;
        }
        if (column) {
            this.createPreservingFilter(column);
            return;
        }
        const cols = colModel.getColsInStateOrder();
        for (let i = 0, len = cols.length; i < len; ++i) {
            this.createPreservingFilter(cols[i]);
        }
    }

    public addHandler(colId: string, handler: SetFilterHandler<any>): void {
        const handlersByColId = this.handlersByColId;
        let handlers = handlersByColId.get(colId);
        if (!handlers) {
            handlers = new Set();
            handlersByColId.set(colId, handlers);
        }
        handlers.add(handler);
    }

    public removeHandler(colId: string, handler: SetFilterHandler<any>): void {
        const handlers = this.handlersByColId.get(colId);
        if (!handlers) {
            return;
        }
        handlers.delete(handler);
        if (!handlers.size) {
            this.handlersByColId.delete(colId);
        }
    }

    public clearPreservedValues(colId: string | string[] | undefined, onlyUnselected: boolean): void {
        const handlersByColId = this.handlersByColId;
        if (!colId) {
            for (const handlers of handlersByColId.values()) {
                clearHandlers(handlers, onlyUnselected);
            }
        } else if (typeof colId === 'string') {
            clearHandlers(handlersByColId.get(colId), onlyUnselected);
        } else {
            for (let i = 0, len = colId.length; i < len; ++i) {
                clearHandlers(handlersByColId.get(colId[i]), onlyUnselected);
            }
        }
    }

    /** Not for pivot result columns, which copy their value column's params and are rebuilt by every pivot change. */
    private createPreservingFilter(column: AgColumn): void {
        const colFilter = this.beans.colFilter!;
        // A column that has its filter is skipped before its params are read, as reading may call the app's function.
        if (
            column.primary &&
            !colFilter.hasFilter(column) &&
            colFilter.isFilterAllowed(column) &&
            colFilter.isCurrentColumn(column) &&
            this.wantsPreservedValues(column, column.colDef)
        ) {
            colFilter.getHandler(column, true);
        }
    }

    /** Whether the column's params, a Multi or selectable filter child's, or a selectable filter's defaults opt in. */
    private wantsPreservedValues(column: AgColumn, def: IFilterDef): boolean {
        let filterParams: PreservingFilterParams | undefined = def.filterParams;
        if (typeof filterParams === 'function') {
            // Merged as for the filter about to be created, so the function is handed every param it expects.
            filterParams = this.beans.colFilter!.createHandlerFilterParams(column, def, 'init');
        }
        if (filterParams?.preservePreviousValues || filterParams?.defaultFilterParams?.preservePreviousValues) {
            return true;
        }
        const filters = filterParams?.filters;
        if (!Array.isArray(filters)) {
            return false;
        }
        for (let i = 0, len = filters.length; i < len; ++i) {
            const child = filters[i];
            if (child && this.wantsPreservedValues(column, child)) {
                return true;
            }
        }
        return false;
    }
}

const clearHandlers = (handlers: Set<SetFilterHandler<any>> | undefined, onlyUnselected: boolean): void => {
    if (!handlers) {
        return;
    }
    for (const handler of handlers) {
        handler.clearOwnPreservedValues(onlyUnselected);
    }
};
