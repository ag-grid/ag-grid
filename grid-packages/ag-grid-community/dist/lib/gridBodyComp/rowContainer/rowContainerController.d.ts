import { BeanStub } from "../../context/beanStub";
import { RowContainerNames } from "./rowContainerComp";
import { ViewportSizeFeature } from "../viewportSizeFeature";
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
    private enableRtl;
    private viewportSizeFeature;
    constructor(name: RowContainerNames);
    private postConstruct;
    private registerWithControllersService;
    private forContainers;
    getContainerElement(): HTMLElement;
    getViewportSizeFeature(): ViewportSizeFeature;
    setView(view: RowContainerView, eContainer: HTMLElement, eViewport: HTMLElement): void;
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
