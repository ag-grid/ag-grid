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
    SortController,
    Column,
    SortModelItem
} from "@ag-grid-community/core";
import {ServerSideRowModel} from "../serverSideRowModel";

@Bean('ssrmSortService')
export class SortListener extends BeanStub {

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

    public extractSortModel(): SortModelItem [] {
        const sortModel = this.sortController.getSortModel();

        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }

        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);

        return sortModel;
    }

    private removeMultiColumnPrefixOnColumnIds(sortModel: SortModelItem[]): void {
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = Constants.GROUP_AUTO_COLUMN_ID + "-";

            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    }

    private replaceAutoGroupColumnWithActualRowGroupColumns(sortModel: SortModelItem[]): void {
        // find index of auto group column in sort model
        const autoGroupSortModel = sortModel.find( sm => sm.colId == Constants.GROUP_AUTO_COLUMN_ID);

        // replace auto column with individual group columns
        if (autoGroupSortModel) {

            // remove auto group column
            let autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            _.removeFromArray(sortModel, autoGroupSortModel);

            const isNotInSortModel = (col: Column) => sortModel.filter(sm => sm.colId === col.getColId()).length==0;
            const mapColumnToSortModel = (col: Column) => { return { colId: col.getId(), sort: autoGroupSortModel.sort} };

            const newModels = this.columnController.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);

            _.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    }

    private onSortChanged(): void {
        const storeParams = this.serverSideRowModel.getParams();
        const newSortModel = this.extractSortModel();
        const oldSortModel = storeParams.sortModel;

        this.serverSideRowModel.updateSortModel(newSortModel);
        this.serverSideRowModel.refreshAfterSort(oldSortModel, newSortModel);
    }

}