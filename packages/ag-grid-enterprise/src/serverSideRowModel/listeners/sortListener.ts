import type {
    BeanCollection,
    NamedBean,
    SortModelItem,
    SortOption,
    SortService,
    StoreRefreshAfterParams,
} from 'ag-grid-community';
import { BeanStub, _getSortModel, _isServerSideRowModel } from 'ag-grid-community';

import type { ServerSideRowModel } from '../serverSideRowModel';
import type { ListenerUtils } from './listenerUtils';

export class SortListener extends BeanStub implements NamedBean {
    beanName = 'ssrmSortSvc' as const;

    private sortSvc: SortService;
    private serverSideRowModel: ServerSideRowModel;
    private listenerUtils: ListenerUtils;
    /** The sort options when last checked, copied, to detect a comparator change with the sort model unchanged. */
    private readonly checkedOpts: Pick<SortOption, 'column' | 'sort' | 'type' | 'stringComparator'>[] = [];

    public wireBeans(beans: BeanCollection) {
        this.sortSvc = beans.sortSvc!;
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
        this.listenerUtils = beans.ssrmListenerUtils as ListenerUtils;
    }

    public postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!_isServerSideRowModel(this.gos)) {
            return;
        }

        const onComparatorsMaybeChanged = this.onComparatorsMaybeChanged.bind(this);
        this.addManagedEventListeners({
            sortChanged: this.onSortChanged.bind(this),
            columnEverythingChanged: onComparatorsMaybeChanged,
        });
        this.addManagedPropertyListener('accentedSort', onComparatorsMaybeChanged);
    }

    /** Client-side sorting re-sorts when a sorted column's `accentedSort` changes, as the sort model stays the same. */
    private onComparatorsMaybeChanged(): void {
        if (this.updateComparators() && this.gos.get('serverSideEnableClientSideSort')) {
            this.serverSideRowModel.clientSideResort();
        }
    }

    /** Records the sort options; `true` when only their string comparators changed, which raises no `sortChanged`. */
    private updateComparators(): boolean {
        const opts = this.sortSvc.getSortOptions();
        const checkedOpts = this.checkedOpts;
        const len = opts.length;
        let sameSort = len === checkedOpts.length;
        let changed = false;
        for (let i = 0; i < len; ++i) {
            const { column, sort, type, stringComparator } = opts[i];
            const checked = checkedOpts[i];
            if (sameSort && (checked.column !== column || checked.sort !== sort || checked.type !== type)) {
                sameSort = false;
            }
            if (sameSort && checked.stringComparator !== stringComparator) {
                changed = true;
            }
            checkedOpts[i] = { column, sort, type, stringComparator };
        }
        checkedOpts.length = len;
        return sameSort && changed;
    }

    private onSortChanged(): void {
        this.updateComparators();
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set

        const newSortModel = _getSortModel(this.sortSvc);
        const oldSortModel = storeParams.sortModel;

        const changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);

        const params: StoreRefreshAfterParams = {
            valueColChanged,
            secondaryColChanged,
            changedColumns,
        };

        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    }

    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    private findChangedColumnsInSort(newSortModel: SortModelItem[], oldSortModel: SortModelItem[]): string[] {
        let allColsInBothSorts: string[] = [];

        for (const sortModel of [newSortModel, oldSortModel]) {
            if (sortModel) {
                const ids = sortModel.map((sm) => sm.colId);
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        }

        const differentSorts = (oldSortItem: SortModelItem | undefined, newSortItem: SortModelItem | undefined) => {
            const oldSort = oldSortItem ? oldSortItem.sort : null;
            const newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };

        const differentIndexes = (oldSortItem: SortModelItem | undefined, newSortItem: SortModelItem | undefined) => {
            const oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
            const newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
            return oldIndex !== newIndex;
        };

        return allColsInBothSorts.filter((colId) => {
            const oldSortItem = oldSortModel.find((sm) => sm.colId === colId);
            const newSortItem = newSortModel.find((sm) => sm.colId === colId);
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    }
}
