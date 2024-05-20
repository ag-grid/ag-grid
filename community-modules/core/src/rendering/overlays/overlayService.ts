import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../../context/context";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { UserCompDetails, UserComponentFactory } from "../../components/framework/userComponentFactory";
import { OverlayWrapperComponent } from "./overlayWrapperComponent";
import { PaginationProxy } from "../../pagination/paginationProxy";
import { ColumnModel } from "../../columns/columnModel";
import { Events } from "../../eventKeys";
import { ILoadingOverlayParams } from "./loadingOverlayComponent";
import { INoRowsOverlayParams } from "./noRowsOverlayComponent";
import { GridOptions } from "../../entities/gridOptions";

@Bean('overlayService')
export class OverlayService extends BeanStub {
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;
    @Autowired('paginationProxy') private readonly paginationProxy: PaginationProxy;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private overlayWrapperComp: OverlayWrapperComponent;
    private manuallyDisplayed: boolean = false;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, () => this.onRowDataUpdated());
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onNewColumnsLoaded());
    }

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;

        if (
            !this.gos.get('columnDefs') ||
            (this.gos.isRowModelType('clientSide') && !this.gos.get('rowData'))
        ) {
            this.showLoadingOverlay();
        }
    }

    public showLoadingOverlay(): void {
        if (this.gos.get('suppressLoadingOverlay')) { return; }

        const params: WithoutGridCommon<ILoadingOverlayParams> = {};

        const compDetails = this.userComponentFactory.getLoadingOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-loading-wrapper', 'loadingOverlayComponentParams');
    }

    public showNoRowsOverlay(): void {
        if (this.gos.get('suppressNoRowsOverlay')) { return; }

        const params: WithoutGridCommon<INoRowsOverlayParams> = {};

        const compDetails = this.userComponentFactory.getNoRowsOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-no-rows-wrapper', 'noRowsOverlayComponentParams');
    }

    private showOverlay(compDetails: UserCompDetails, wrapperCssClass: string, gridOption: keyof GridOptions): void {
        const promise = compDetails.newAgStackInstance();
        const listenerDestroyFunc = this.addManagedPropertyListener(gridOption, ({ currentValue }) => {
            promise.then(comp => {
                if (comp!.refresh) {
                    comp.refresh(this.gos.addGridCommonParams({
                        ...(currentValue ?? {})
                    }));
                }
            });
        });

        this.manuallyDisplayed = this.columnModel.isReady() && !this.paginationProxy.isEmpty();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass, listenerDestroyFunc);
    }

    public hideOverlay(): void {
        this.manuallyDisplayed = false;
        this.overlayWrapperComp.hideOverlay();
    }

    private showOrHideOverlay(): void {
        const isEmpty = this.paginationProxy.isEmpty();
        const isSuppressNoRowsOverlay = this.gos.get('suppressNoRowsOverlay');
        if (isEmpty && !isSuppressNoRowsOverlay) {
            this.showNoRowsOverlay();
        } else {
            this.hideOverlay();
        }
    }

    private onRowDataUpdated(): void {
        this.showOrHideOverlay();
    }

    private onNewColumnsLoaded(): void {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnModel.isReady() && !this.paginationProxy.isEmpty() && !this.manuallyDisplayed) {
            this.hideOverlay();
        }
    }
}