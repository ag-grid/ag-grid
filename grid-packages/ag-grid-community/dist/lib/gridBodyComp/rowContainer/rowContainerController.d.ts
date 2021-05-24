import { BeanStub } from "../../context/beanStub";
import { ViewportSizeFeature } from "../viewportSizeFeature";
export declare enum RowContainerNames {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
    FULL_WIDTH = "fullWidth",
    TOP_LEFT = "topLeft",
    TOP_RIGHT = "topRight",
    TOP_CENTER = "topCenter",
    TOP_FULL_WITH = "topFullWidth",
    BOTTOM_LEFT = "bottomLeft",
    BOTTOM_RIGHT = "bottomRight",
    BOTTOM_CENTER = "bottomCenter",
    BOTTOM_FULL_WITH = "bottomFullWidth"
}
export declare const ContainerCssClasses: Map<RowContainerNames, string>;
export declare const ViewportCssClasses: Map<RowContainerNames, string>;
export declare const WrapperCssClasses: Map<RowContainerNames, string>;
export interface RowContainerView {
    setViewportHeight(height: string): void;
}
export declare class RowContainerController extends BeanStub {
    private scrollVisibleService;
    private dragService;
    private controllersService;
    private columnController;
    private resizeObserverService;
    private view;
    private name;
    private eContainer;
    private eViewport;
    private eWrapper;
    private enableRtl;
    private viewportSizeFeature;
    constructor(name: RowContainerNames);
    private postConstruct;
    private registerWithControllersService;
    private forContainers;
    getContainerElement(): HTMLElement;
    getViewportSizeFeature(): ViewportSizeFeature;
    setView(view: RowContainerView, eContainer: HTMLElement, eViewport: HTMLElement, eWrapper: HTMLElement): void;
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
}
