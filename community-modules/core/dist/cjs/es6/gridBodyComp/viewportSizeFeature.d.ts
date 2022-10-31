// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { RowContainerCtrl } from "./rowContainer/rowContainerCtrl";
export declare class ViewportSizeFeature extends BeanStub {
    private ctrlsService;
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
    private checkViewportAndScrolls;
    getBodyHeight(): number;
    private checkBodyHeight;
    private updateScrollVisibleService;
    private updateScrollVisibleServiceImpl;
    private isHorizontalScrollShowing;
    private onHorizontalViewportChanged;
}
