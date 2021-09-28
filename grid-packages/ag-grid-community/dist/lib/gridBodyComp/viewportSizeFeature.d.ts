import { BeanStub } from "../context/beanStub";
import { RowContainerCtrl } from "./rowContainer/rowContainerCtrl";
export declare class ViewportSizeFeature extends BeanStub {
    private ctrlsService;
    private columnModel;
    private scrollVisibleService;
    private columnApi;
    private gridApi;
    private centerContainerCon;
    private gridBodyCon;
    private centerWidth;
    private bodyHeight;
    constructor(centerContainer: RowContainerCtrl);
    private postConstruct;
    private listenForResize;
    private onScrollbarWidthChanged;
    private onCenterViewportResized;
    checkViewportAndScrolls(): void;
    getBodyHeight(): number;
    private checkBodyHeight;
    private updateScrollVisibleService;
    private updateScrollVisibleServiceImpl;
    isHorizontalScrollShowing(): boolean;
    private onHorizontalViewportChanged;
}
