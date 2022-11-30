import {
    _,
    Autowired,
    Bean,
    BeanStub,
    ColumnModel,
    GROUP_AUTO_COLUMN_ID,
    Events,
    PostConstruct,
    SortController,
    Column,
    SortModelItem,
    StoreRefreshAfterParams
} from "@ag-grid-community/core";
import { ServerSideRowModel } from "../serverSideRowModel";
import { ListenerUtils } from "./listenerUtils";

@Bean('ssrmSortService')
export class SortListener extends BeanStub {

    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('ssrmListenerUtils') private listenerUtils: ListenerUtils;

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) { return; }

        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }

    public extractSortModel(): SortModelItem[] {
        const sortModel = this.sortController.getSortModel();

        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsService.isTreeData()) {
            return sortModel;
        }

        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);

        return sortModel;
    }

    private removeMultiColumnPrefixOnColumnIds(sortModel: SortModelItem[]): void {
        if (this.gridOptionsService.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = GROUP_AUTO_COLUMN_ID + "-";

            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    }

    private replaceAutoGroupColumnWithActualRowGroupColumns(sortModel: SortModelItem[]): void {
        // find index of auto group column in sort model
        const autoGroupSortModel = sortModel.find(sm => sm.colId == GROUP_AUTO_COLUMN_ID);

        // replace auto column with individual group columns
        if (autoGroupSortModel) {
            // remove auto group column
            const autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            _.removeFromArray(sortModel, autoGroupSortModel);

            const isNotInSortModel = (col: Column) => sortModel.filter(sm => sm.colId === col.getColId()).length == 0;
            const mapColumnToSortModel = (col: Column): SortModelItem => ({ colId: col.getId(), sort: autoGroupSortModel.sort });

            const newModels = this.columnModel.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);

            _.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    }

    private onSortChanged(): void {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) { return; } // params is undefined if no datasource set

        const newSortModel = this.extractSortModel();
        const oldSortModel = storeParams.sortModel;

        const changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);

        const params: StoreRefreshAfterParams = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };

        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    }

    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    private findChangedColumnsInSort(
        newSortModel: SortModelItem[],
        oldSortModel: SortModelItem[]): string[] {

        let allColsInBothSorts: string[] = [];

        [newSortModel, oldSortModel].forEach(sortModel => {
            if (sortModel) {
                const ids = sortModel.map(sm => sm.colId);
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });

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

        return allColsInBothSorts.filter(colId => {
            const oldSortItem = oldSortModel.find(sm => sm.colId === colId);
            const newSortItem = newSortModel.find(sm => sm.colId === colId);
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    }

}