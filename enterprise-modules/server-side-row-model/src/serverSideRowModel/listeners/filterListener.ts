import { Autowired, Bean, BeanStub, Events, PostConstruct, FilterManager, GridOptionsWrapper } from "@ag-grid-community/core";
import { ServerSideRowModel } from "../serverSideRowModel";

@Bean('ssrmFilterListener')
export class FilterListener extends BeanStub {

    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) { return; }

        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }

    private onFilterChanged(): void {
        const newModel = this.filterManager.getFilterModel();
        this.serverSideRowModel.refreshStoreAfterFilter(newModel);
    }
}