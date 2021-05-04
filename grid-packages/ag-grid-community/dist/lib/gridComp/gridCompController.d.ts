import { FocusController } from "../focusController";
import { BeanStub } from "../context/beanStub";
import { LayoutView } from "../styling/layoutFeature";
import { LoggerFactory } from "../logger";
export interface GridCompView extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    addOrRemoveKeyboardFocusClass(value: boolean): void;
    getFocusableContainers(): HTMLElement[];
}
export declare class GridCompController extends BeanStub {
    private columnApi;
    private gridApi;
    private popupService;
    protected readonly focusController: FocusController;
    private clipboardService;
    loggerFactory: LoggerFactory;
    private resizeObserverService;
    private columnController;
    private controllersService;
    private mouseEventService;
    private view;
    private eGridHostDiv;
    private eGui;
    private logger;
    constructor();
    protected postConstruct(): void;
    setView(view: GridCompView, eGridDiv: HTMLElement, eGui: HTMLElement): void;
    showDropZones(): boolean;
    showSideBar(): boolean;
    showStatusBar(): boolean;
    showWatermark(): boolean;
    private onGridSizeChanged;
    private addRtlSupport;
    destroyGridUi(): void;
    getGui(): HTMLElement;
    focusNextInnerContainer(backwards: boolean): boolean;
    focusGridHeader(): boolean;
    forceFocusOutOfContainer(up?: boolean): void;
}
