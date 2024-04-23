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
    STICKY_BOTTOM_LEFT = "stickyBottomLeft",
    STICKY_BOTTOM_RIGHT = "stickyBottomRight",
    STICKY_BOTTOM_CENTER = "stickyBottomCenter",
    STICKY_BOTTOM_FULL_WIDTH = "stickyBottomFullWidth",
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
    setRowCtrls(params: {
        rowCtrls: RowCtrl[];
        useFlushSync?: boolean;
    }): void;
    setDomOrder(domOrder: boolean): void;
    setContainerWidth(width: string): void;
}
export declare class RowContainerCtrl extends BeanStub {
    static getRowContainerCssClasses(name: RowContainerName): {
        container?: string;
        viewport?: string;
    };
    static getPinned(name: RowContainerName): ColumnPinnedType;
    private dragService;
    private ctrlsService;
    private columnModel;
    private resizeObserverService;
    private rowRenderer;
    private readonly name;
    private readonly isFullWithContainer;
    private comp;
    private eContainer;
    private eViewport;
    private enableRtl;
    private viewportSizeFeature;
    private pinnedWidthFeature;
    private visible;
    private EMPTY_CTRLS;
    constructor(name: RowContainerName);
    private postConstruct;
    private registerWithCtrlsService;
    private forContainers;
    getContainerElement(): HTMLElement;
    getViewportSizeFeature(): ViewportSizeFeature | undefined;
    setComp(view: IRowContainerComp, eContainer: HTMLElement, eViewport: HTMLElement): void;
    private addListeners;
    private listenOnDomOrder;
    private stopHScrollOnPinnedRows;
    onDisplayedColumnsChanged(): void;
    private onDisplayedColumnsWidthChanged;
    private addPreventScrollWhileDragging;
    onHorizontalViewportChanged(afterScroll?: boolean): void;
    getCenterWidth(): number;
    getCenterViewportScrollLeft(): number;
    registerViewportResizeListener(listener: (() => void)): void;
    isViewportInTheDOMTree(): boolean;
    getViewportScrollLeft(): number;
    isHorizontalScrollShowing(): boolean;
    getViewportElement(): HTMLElement;
    setContainerTranslateX(amount: number): void;
    getHScrollPosition(): {
        left: number;
        right: number;
    };
    setCenterViewportScrollLeft(value: number): void;
    private isContainerVisible;
    private onPinnedWidthChanged;
    private onDisplayedRowsChanged;
    private getRowCtrls;
}
