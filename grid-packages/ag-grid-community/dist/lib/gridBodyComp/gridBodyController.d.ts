import { BeanStub } from "../context/beanStub";
import { LayoutView } from "../styling/layoutFeature";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { RowDragFeature } from "./rowDragFeature";
import { PopupService } from "../widgets/popupService";
import { MouseEventService } from "./mouseEventService";
export declare enum RowAnimationCssClasses {
    ANIMATION_ON = "ag-row-animation",
    ANIMATION_OFF = "ag-row-no-animation"
}
export declare const CSS_CLASS_CELL_SELECTABLE = "ag-selectable";
export declare const CSS_CLASS_FORCE_VERTICAL_SCROLL = "ag-force-vertical-scroll";
export declare const CSS_CLASS_COLUMN_MOVING = "ag-column-moving";
export interface GridBodyView extends LayoutView {
    setColumnMovingCss(selectable: boolean): void;
    setCellSelectableCss(selectable: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(animate: boolean): void;
    setAlwaysVerticalScrollClass(on: boolean): void;
    setVerticalScrollPaddingVisible(visible: boolean): void;
    registerBodyViewportResizeListener(listener: (() => void)): void;
}
export declare class GridBodyController extends BeanStub {
    private rowContainerHeightService;
    private controllersService;
    private columnController;
    private scrollVisibleService;
    private contextMenuFactory;
    private headerNavigationService;
    private paginationProxy;
    private dragAndDropService;
    private pinnedRowModel;
    private rowRenderer;
    popupService: PopupService;
    mouseEventService: MouseEventService;
    private view;
    private eGridBody;
    private eBodyViewport;
    private eTop;
    private eBottom;
    private bodyScrollFeature;
    private rowDragFeature;
    getScrollFeature(): GridBodyScrollFeature;
    getBodyViewportElement(): HTMLElement;
    setView(view: GridBodyView, eGridBody: HTMLElement, eBodyViewport: HTMLElement, eTop: HTMLElement, eBottom: HTMLElement): void;
    private addEventListeners;
    setColumnMovingCss(moving: boolean): void;
    setCellTextSelection(selectable?: boolean): void;
    private onScrollVisibilityChanged;
    private onGridColumnsChanged;
    private disableBrowserDragging;
    private addStopEditingWhenGridLosesFocus;
    updateRowCount(): void;
    registerBodyViewportResizeListener(listener: (() => void)): void;
    setVerticalScrollPaddingVisible(visible: boolean): void;
    isVerticalScrollShowing(): boolean;
    private setupRowAnimationCssClass;
    getGridBodyElement(): HTMLElement;
    private addBodyViewportListener;
    getGui(): HTMLElement;
    scrollVertically(pixels: number): number;
    getBodyClientRect(): ClientRect | undefined;
    private addRowDragListener;
    getRowDragFeature(): RowDragFeature;
    private setFloatingHeights;
    sizeColumnsToFit(nextTimeout?: number): void;
}
