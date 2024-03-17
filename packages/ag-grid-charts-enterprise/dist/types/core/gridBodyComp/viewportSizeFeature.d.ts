import { BeanStub } from "../context/beanStub";
import { RowContainerCtrl } from "./rowContainer/rowContainerCtrl";
export declare class ViewportSizeFeature extends BeanStub {
    private ctrlsService;
    private pinnedWidthService;
    private columnModel;
    private scrollVisibleService;
    private centerContainerCtrl;
    private gridBodyCtrl;
    private centerWidth;
    private bodyHeight;
    constructor(centerContainerCtrl: RowContainerCtrl);
    private postConstruct;
    private listenForResize;
    private onScrollbarWidthChanged;
    private onCenterViewportResized;
    private keepPinnedColumnsNarrowerThanViewport;
    private getPinnedColumnsOverflowingViewport;
    private checkViewportAndScrolls;
    getBodyHeight(): number;
    private checkBodyHeight;
    private updateScrollVisibleService;
    private updateScrollVisibleServiceImpl;
    private isHorizontalScrollShowing;
    private onHorizontalViewportChanged;
}
