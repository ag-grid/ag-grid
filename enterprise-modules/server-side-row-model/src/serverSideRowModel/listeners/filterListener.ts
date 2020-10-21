import { Autowired, Bean, BeanStub, Events, PostConstruct, FilterManager } from "@ag-grid-community/core";
import { ServerSideRowModel } from "../serverSideRowModel";

@Bean('ssrmFilterListener')
export class FilterListener extends BeanStub {

    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('filterManager') private filterManager: FilterManager;

    @PostConstruct
    private postConstruct(): void {

        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }

    private onFilterChanged(): void {
        const newModel = this.filterManager.getFilterModel();
        this.serverSideRowModel.refreshStoreAfterFilter(newModel);
    }
}