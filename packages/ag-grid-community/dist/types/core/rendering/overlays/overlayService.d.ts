import { BeanStub } from "../../context/beanStub";
import { OverlayWrapperComponent } from "./overlayWrapperComponent";
export declare class OverlayService extends BeanStub {
    private readonly userComponentFactory;
    private readonly paginationProxy;
    private readonly columnModel;
    private overlayWrapperComp;
    private manuallyDisplayed;
    private postConstruct;
    registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void;
    showLoadingOverlay(): void;
    showNoRowsOverlay(): void;
    private showOverlay;
    hideOverlay(): void;
    private showOrHideOverlay;
    private onRowDataUpdated;
    private onNewColumnsLoaded;
}
