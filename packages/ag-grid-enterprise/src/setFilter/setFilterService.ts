import type { AgColumn, ColumnFilterService, ISetFilterService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { SetFilterHandler } from './setFilterHandler';

interface PreservingFilterParams {
    preservePreviousValues?: boolean;
    defaultFilterParams?: { preservePreviousValues?: boolean };
    filters?: { filterParams?: PreservingFilterParams }[];
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
            createPreservingFilter(colFilter, column);
            return;
        }
        const cols = colModel.getColsInStateOrder();
        for (let i = 0, len = cols.length; i < len; ++i) {
            createPreservingFilter(colFilter, cols[i]);
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

    public override destroy(): void {
        this.handlersByColId.clear();
        super.destroy();
    }
}

/** Not for pivot result columns, which copy their value column's params and are rebuilt by every pivot change. */
const createPreservingFilter = (colFilter: ColumnFilterService, column: AgColumn): void => {
    if (column.primary && colFilter.isCurrentColumn(column) && wantsPreservedValues(column.colDef.filterParams)) {
        colFilter.getHandler(column, true);
    }
};

/**
 * Whether the column's params, a Multi or selectable filter child's, or a selectable filter's defaults opt in.
 * Function-form params are not called here: they run with the filter, so such a filter is created on first use.
 */
const wantsPreservedValues = (filterParams: PreservingFilterParams | undefined): boolean => {
    if (filterParams?.preservePreviousValues || filterParams?.defaultFilterParams?.preservePreviousValues) {
        return true;
    }
    const filters = filterParams?.filters;
    return Array.isArray(filters) && filters.some((def) => wantsPreservedValues(def?.filterParams));
};

const clearHandlers = (handlers: Set<SetFilterHandler<any>> | undefined, onlyUnselected: boolean): void => {
    if (!handlers) {
        return;
    }
    for (const handler of handlers) {
        handler.clearOwnPreservedValues(onlyUnselected);
    }
};
