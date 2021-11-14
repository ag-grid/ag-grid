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
export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string | null, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: string, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    setPinnedTopBottomOverflowY(overflow: string): void;
    registerBodyViewportResizeListener(listener: (() => void)): void;
}
export declare class GridBodyCtrl extends BeanStub {
    private rowContainerHeightService;
    private ctrlsService;
    private columnModel;
    private scrollVisibleService;
    private contextMenuFactory;
    private headerNavigationService;
    private paginationProxy;
    private dragAndDropService;
    private pinnedRowModel;
    private rowRenderer;
    popupService: PopupService;
    mouseEventService: MouseEventService;
    private $scope;
    private comp;
    private eGridBody;
    private eBodyViewport;
    private eTop;
    private eBottom;
    private bodyScrollFeature;
    private rowDragFeature;
    private angularApplyTriggered;
    getScrollFeature(): GridBodyScrollFeature;
    getBodyViewportElement(): HTMLElement;
    setComp(comp: IGridBodyComp, eGridBody: HTMLElement, eBodyViewport: HTMLElement, eTop: HTMLElement, eBottom: HTMLElement): void;
    getComp(): IGridBodyComp;
    private addEventListeners;
    private addFocusListeners;
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
    private onWheel;
    getGui(): HTMLElement;
    scrollVertically(pixels: number): number;
    private addRowDragListener;
    getRowDragFeature(): RowDragFeature;
    private setFloatingHeights;
    sizeColumnsToFit(nextTimeout?: number): void;
    addScrollEventListener(listener: () => void): void;
    removeScrollEventListener(listener: () => void): void;
    requestAngularApply(): void;
    private addAngularApplyCheck;
}
