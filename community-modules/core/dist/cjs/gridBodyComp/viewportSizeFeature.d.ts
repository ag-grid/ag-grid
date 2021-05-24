// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { RowContainerController } from "./rowContainer/rowContainerController";
export declare class ViewportSizeFeature extends BeanStub {
    private controllersService;
    private columnController;
    private scrollVisibleService;
    private columnApi;
    private gridApi;
    private centerContainerCon;
    private gridBodyCon;
    private centerWidth;
    private bodyHeight;
    constructor(centerContainer: RowContainerController);
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
