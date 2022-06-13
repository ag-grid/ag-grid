import {
    Autowired,
    Bean,
    BeanStub,
    Events,
    FilterManager,
    PostConstruct,
    StoreRefreshAfterParams
} from "@ag-grid-community/core";
import { ServerSideRowModel } from "../serverSideRowModel";
import { ListenerUtils } from "./listenerUtils";

@Bean('ssrmFilterListener')
export class FilterListener extends BeanStub {

    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('ssrmListenerUtils') private listenerUtils: ListenerUtils;

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) { return; }

        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }

    private onFilterChanged(): void {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) { return; } // params is undefined if no datasource set

        const newModel = this.filterManager.getFilterModel();
        const oldModel = storeParams ? storeParams.filterModel : {};

        const changedColumns = this.findChangedColumns(newModel, oldModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);

        const params: StoreRefreshAfterParams = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };

        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    }

    private findChangedColumns(oldModel: any, newModel: any): string[] {

        const allColKeysMap: {[key: string]: boolean} = {};

        Object.keys(oldModel).forEach(key => allColKeysMap[key] = true);
        Object.keys(newModel).forEach(key => allColKeysMap[key] = true);

        const res: string[] = [];

        Object.keys(allColKeysMap).forEach(key => {
            const oldJson = JSON.stringify(oldModel[key]);
            const newJson = JSON.stringify(newModel[key]);
            const filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });

        return res;
    }
}