import {Autowired, Optional, PostConstruct} from "./context/context";
import {GridApi} from "./gridApi";
import {RowRenderer} from "./rendering/rowRenderer";
import {PopupService} from "./widgets/popupService";
import {FocusController} from "./focusController";
import {IToolPanel} from "./interfaces/iToolPanel";
import {SideBarDef} from "./entities/sideBar";
import {BeanStub} from "./context/beanStub";
import {GridCompService} from "./gridCompService";
import {ModuleRegistry} from "./modules/moduleRegistry";
import {ModuleNames} from "./modules/moduleNames";
import {IClipboardService} from "./interfaces/iClipboardService";
import {LayoutFeature, LayoutView} from "./styling/layoutFeature";
import {addCssClass, removeCssClass} from "./utils/dom";
import {Events} from "./eventKeys";
import {Logger, LoggerFactory} from "./logger";
import {ResizeObserverService} from "./misc/resizeObserverService";
import {GridSizeChangedEvent} from "./events";
import {ColumnApi} from "./columnController/columnApi";

export interface GridCompView extends LayoutView {
    refreshSideBar(): void;
    getToolPanelInstance(key: string): IToolPanel | undefined;
    ensureNodeVisible(comparator: any, position: string | null): void;
    isSideBarVisible(): boolean;
    setSideBarVisible(show: boolean): void;
    setSideBarPosition(position: 'left' | 'right'): void;
    openToolPanel(key: string): void;
    closeToolPanel(): void;
    getOpenedToolPanel(): string | null;
    getSideBar(): SideBarDef;
    setSideBar(def: SideBarDef | string | boolean): void;
    isToolPanelShowing(): boolean;
    destroyGridUi(): void;
    getRootGui(): HTMLElement;
    focusNextInnerContainer(backwards: boolean): boolean;
    forceFocusOutOfContainer(up: boolean): void;
    setRtlClass(cssClass: string): void;
    addOrRemoveKeyboardFocusClass(value: boolean): void;
}

export class GridCompController extends BeanStub {

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusController') protected readonly focusController: FocusController;
    @Autowired('gridCompService') protected readonly gridCompService: GridCompService;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    private view: GridCompView;
    private eGridHostDiv: HTMLElement;

    private logger: Logger;

    constructor(view: GridCompView, eGridDiv: HTMLElement) {
        super();
        this.view = view;
        this.eGridHostDiv = eGridDiv;
    }

    @PostConstruct
    protected postConstruct(): void {

        this.logger = this.loggerFactory.create('GridCompController');

        // register with services that need grid core
        [
            this.gridApi,
            this.gridCompService,
            this.popupService,
            this.focusController
        ].forEach(service => service.registerGridCompController(this));

        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            this.clipboardService.registerGridCompController(this);
        }

        this.createManagedBean(new LayoutFeature(this.view));

        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();

        this.addManagedListener(this, Events.EVENT_KEYBOARD_FOCUS, () => {
            this.view.addOrRemoveKeyboardFocusClass(true);
        });

        this.addManagedListener(this, Events.EVENT_MOUSE_FOCUS, () => {
            this.view.addOrRemoveKeyboardFocusClass(false);
        });

        this.logger.log('ready');

        const unsubscribeFromResize = this.resizeObserverService.observeResize(
            this.eGridHostDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    private onGridSizeChanged(): void {
        const event: GridSizeChangedEvent = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            clientWidth: this.eGridHostDiv.clientWidth,
            clientHeight: this.eGridHostDiv.clientHeight
        };
        this.eventService.dispatchEvent(event);
    }

    private addRtlSupport(): void {
        const cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
        this.view.setRtlClass(cssClass);
    }

    public refreshSideBar(): void {
        this.view.refreshSideBar();
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        return this.view.getToolPanelInstance(key);
    }

    public ensureNodeVisible(comparator: any, position: string | null): void {
        this.view.ensureNodeVisible(comparator, position);
    }

    public isSideBarVisible(): boolean {
        return this.view.isSideBarVisible();
    }

    public setSideBarVisible(show: boolean): void {
        this.view.setSideBarVisible(show);
    }

    public setSideBarPosition(position: 'left' | 'right'): void {
        this.view.setSideBarPosition(position);
    }

    public openToolPanel(key: string): void {
        this.view.openToolPanel(key);
    }

    public closeToolPanel(): void {
        this.view.closeToolPanel();
    }

    public getOpenedToolPanel(): string | null {
        return this.view.getOpenedToolPanel();
    }

    public getSideBar(): SideBarDef {
        return this.view.getSideBar();
    }

    public setSideBar(def: SideBarDef | string | boolean): void {
        this.view.setSideBar(def);
    }

    public isToolPanelShowing(): boolean {
        return this.view.isToolPanelShowing();
    }

    public destroyGridUi(): void {
        this.view.destroyGridUi();
    }

    public getRootGui(): HTMLElement {
        return this.view.getRootGui();
    }

    public focusNextInnerContainer(backwards: boolean): boolean {
        return this.view.focusNextInnerContainer(backwards);
    }

    public forceFocusOutOfContainer(up = false): void {
        this.view.forceFocusOutOfContainer(up);
    }
}