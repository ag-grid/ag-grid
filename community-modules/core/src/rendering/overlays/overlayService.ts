import { UserCompDetails } from "../../components/framework/userComponentFactory";
import { BeanStub } from "../../context/beanStub";
import { Bean, PostConstruct } from "../../context/context";
import { GridOptions } from "../../entities/gridOptions";
import { Events } from "../../eventKeys";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { ILoadingOverlayParams } from "./loadingOverlayComponent";
import { INoRowsOverlayParams } from "./noRowsOverlayComponent";
import { OverlayWrapperComponent } from "./overlayWrapperComponent";

@Bean('overlayService')
export class OverlayService extends BeanStub {

    private overlayWrapperComp: OverlayWrapperComponent;
    private manuallyDisplayed: boolean = false;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedEventListener(Events.EVENT_ROW_DATA_UPDATED, () => this.onRowDataUpdated());
        this.addManagedEventListener(Events.EVENT_NEW_COLUMNS_LOADED, () => this.onNewColumnsLoaded());
    }

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;

        if (
            !this.beans.gos.get('columnDefs') ||
            (this.beans.gos.isRowModelType('clientSide') && !this.beans.gos.get('rowData'))
        ) {
            this.showLoadingOverlay();
        }
    }

    public showLoadingOverlay(): void {
        if (this.beans.gos.get('suppressLoadingOverlay')) { return; }

        const params: WithoutGridCommon<ILoadingOverlayParams> = {};

        const compDetails = this.beans.userComponentFactory.getLoadingOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-loading-wrapper', 'loadingOverlayComponentParams');
    }

    public showNoRowsOverlay(): void {
        if (this.beans.gos.get('suppressNoRowsOverlay')) { return; }

        const params: WithoutGridCommon<INoRowsOverlayParams> = {};

        const compDetails = this.beans.userComponentFactory.getNoRowsOverlayCompDetails(params);
        this.showOverlay(compDetails, 'ag-overlay-no-rows-wrapper', 'noRowsOverlayComponentParams');
    }

    private showOverlay(compDetails: UserCompDetails, wrapperCssClass: string, gridOption: keyof GridOptions): void {
        const promise = compDetails.newAgStackInstance();
        const listenerDestroyFunc = this.addManagedPropertyListener(gridOption, ({ currentValue }) => {
            promise.then(comp => {
                if (comp!.refresh) {
                    comp.refresh(this.beans.gos.addGridCommonParams({
                        ...(currentValue ?? {})
                    }));
                }
            });
        });

        this.manuallyDisplayed = this.beans.columnModel.isReady() && !this.beans.paginationProxy.isEmpty();
        this.overlayWrapperComp.showOverlay(promise, wrapperCssClass, listenerDestroyFunc);
    }

    public hideOverlay(): void {
        this.manuallyDisplayed = false;
        this.overlayWrapperComp.hideOverlay();
    }

    private showOrHideOverlay(): void {
        const isEmpty = this.beans.paginationProxy.isEmpty();
        const isSuppressNoRowsOverlay = this.beans.gos.get('suppressNoRowsOverlay');
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
        if (this.beans.columnModel.isReady() && !this.beans.paginationProxy.isEmpty() && !this.manuallyDisplayed) {
            this.hideOverlay();
        }
    }
}