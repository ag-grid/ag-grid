import {
    _,
    Autowired,
    Bean,
    BeanStub,
    ColumnController,
    Constants,
    Events,
    GridOptionsWrapper,
    PostConstruct,
    SortController
} from "@ag-grid-community/core";
import {ServerSideRowModel} from "./serverSideRowModel";

@Bean('ssrmSortService')
export class SortService extends BeanStub {

    @Autowired('sortController') private sortController: SortController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) { return; }

        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }

    public extractSortModel(): { colId: string; sort: string } [] {
        const sortModel = this.sortController.getSortModel();

        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }

        const rowGroupCols = this.serverSideRowModel.columnsToValueObjects(this.columnController.getRowGroupColumns());

        // find index of auto group column in sort model
        let autoGroupIndex = -1;
        for (let i = 0; i < sortModel.length; ++i) {
            if (sortModel[i].colId === Constants.GROUP_AUTO_COLUMN_ID) {
                autoGroupIndex = i;
                break;
            }
        }

        // replace auto column with individual group columns
        if (autoGroupIndex > -1) {
            const individualGroupCols =
                rowGroupCols.map(group => {
                    return {
                        colId: group.id,
                        sort: sortModel[autoGroupIndex].sort
                    };
                });

            // remove auto group column
            sortModel.splice(autoGroupIndex, 1);

            // insert individual group columns
            for (let i = 0; i < individualGroupCols.length; i++) {
                const individualGroupCol = individualGroupCols[i];

                // don't add individual group column if non group column already exists as it gets precedence
                const sameNonGroupColumnExists = sortModel.some(sm => sm.colId === individualGroupCol.colId);
                if (sameNonGroupColumnExists) {
                    continue;
                }

                sortModel.splice(autoGroupIndex++, 0, individualGroupCol);
            }
        }

        // strip out multi-column prefix on colId's
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = Constants.GROUP_AUTO_COLUMN_ID + "-";

            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }

        return sortModel;
    }

    private onSortChanged(): void {
        const cache = this.serverSideRowModel.getRootCache();
        if (!cache) { return; }

        const params = this.serverSideRowModel.getParams();

        const newSortModel = this.extractSortModel();
        const oldSortModel = params.sortModel;
        const changedColumnsInSort = this.findChangedColumnsInSort(newSortModel, oldSortModel);

        this.serverSideRowModel.updateSortModel(newSortModel);

        const rowGroupColIds = this.columnController.getRowGroupColumns().map(col => col.getId());

        const sortingWithValueCol = this.isSortingWithValueColumn(changedColumnsInSort);
        const sortingWithSecondaryCol = this.isSortingWithSecondaryColumn(changedColumnsInSort);

        const sortAlwaysResets = this.gridOptionsWrapper.isServerSideSortingAlwaysResets();
        if (sortAlwaysResets || sortingWithValueCol || sortingWithSecondaryCol) {
            this.serverSideRowModel.resetRootCache();
        } else {
            cache.refreshCacheAfterSort(changedColumnsInSort, rowGroupColIds);
        }
    }

    private isSortingWithValueColumn(changedColumnsInSort: string[]): boolean {
        const valueColIds = this.columnController.getValueColumns().map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    private isSortingWithSecondaryColumn(changedColumnsInSort: string[]): boolean {
        if (!this.columnController.getSecondaryColumns()) {
            return false;
        }

        const secondaryColIds = this.columnController.getSecondaryColumns()!.map(col => col.getColId());

        for (let i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    private findChangedColumnsInSort(
        newSortModel: { colId: string, sort: string }[],
        oldSortModel: { colId: string, sort: string }[]): string[] {

        let allColsInBothSorts: string[] = [];

        [newSortModel, oldSortModel].forEach(sortModel => {
            if (sortModel) {
                const ids = sortModel.map(sm => sm.colId);
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });

        const differentSorts = (oldSortItem: any, newSortItem: any) => {
            const oldSort = oldSortItem ? oldSortItem.sort : null;
            const newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };

        const differentIndexes = (oldSortItem: any, newSortItem: any) => {
            const oldIndex = oldSortModel.indexOf(oldSortItem);
            const newIndex = newSortModel.indexOf(newSortItem);
            return oldIndex !== newIndex;
        };

        return allColsInBothSorts.filter(colId => {
            const oldSortItem = _.find(oldSortModel, sm => sm.colId === colId);
            const newSortItem = _.find(newSortModel, sm => sm.colId === colId);
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    }

}