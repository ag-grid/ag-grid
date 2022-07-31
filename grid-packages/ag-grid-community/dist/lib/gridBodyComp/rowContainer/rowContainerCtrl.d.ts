import { BeanStub } from "../../context/beanStub";
import { ViewportSizeFeature } from "../viewportSizeFeature";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { ColumnPinnedType } from "../../entities/column";
export declare enum RowContainerName {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
    FULL_WIDTH = "fullWidth",
    TOP_LEFT = "topLeft",
    TOP_RIGHT = "topRight",
    TOP_CENTER = "topCenter",
    TOP_FULL_WIDTH = "topFullWidth",
    STICKY_TOP_LEFT = "stickyTopLeft",
    STICKY_TOP_RIGHT = "stickyTopRight",
    STICKY_TOP_CENTER = "stickyTopCenter",
    STICKY_TOP_FULL_WIDTH = "stickyTopFullWidth",
    BOTTOM_LEFT = "bottomLeft",
    BOTTOM_RIGHT = "bottomRight",
    BOTTOM_CENTER = "bottomCenter",
    BOTTOM_FULL_WIDTH = "bottomFullWidth"
}
export declare enum RowContainerType {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
    FULL_WIDTH = "fullWidth"
}
export declare function getRowContainerTypeForName(name: RowContainerName): RowContainerType;
export interface IRowContainerComp {
    setViewportHeight(height: string): void;
    setRowCtrls(rowCtrls: RowCtrl[]): void;
    setDomOrder(domOrder: boolean): void;
    setContainerWidth(width: string): void;
}
export declare class RowContainerCtrl extends BeanStub {
    static getRowContainerCssClasses(name: RowContainerName): {
        container?: string;
        viewport?: string;
        wrapper?: string;
    };
    static getPinned(name: RowContainerName): ColumnPinnedType;
    private scrollVisibleService;
    private dragService;
    private ctrlsService;
    private columnModel;
    private resizeObserverService;
    private rowRenderer;
    private readonly name;
    private comp;
    private eContainer;
    private eViewport;
    private eWrapper;
    private enableRtl;
    private embedFullWidthRows;
    private viewportSizeFeature;
    constructor(name: RowContainerName);
    private postConstruct;
    private registerWithCtrlsService;
    private forContainers;
    getContainerElement(): HTMLElement;
    getViewportSizeFeature(): ViewportSizeFeature;
    setComp(view: IRowContainerComp, eContainer: HTMLElement, eViewport: HTMLElement, eWrapper: HTMLElement): void;
    private addListeners;
    private listenOnDomOrder;
    private stopHScrollOnPinnedRows;
    onDisplayedColumnsChanged(): void;
    private onDisplayedColumnsWidthChanged;
    private onScrollVisibilityChanged;
    private addPreventScrollWhileDragging;
    onHorizontalViewportChanged(): void;
    getCenterWidth(): number;
    getCenterViewportScrollLeft(): number;
    registerViewportResizeListener(listener: (() => void)): void;
    isViewportVisible(): boolean;
    isViewportHScrollShowing(): boolean;
    getViewportScrollLeft(): number;
    isHorizontalScrollShowing(): boolean;
    getViewportElement(): HTMLElement;
    setContainerTranslateX(amount: number): void;
    getHScrollPosition(): {
        left: number;
        right: number;
    };
    setCenterViewportScrollLeft(value: number): void;
    private onDisplayedRowsChanged;
    private getRowCtrls;
}
