import { Autowired, Optional, PostConstruct } from "../context/context";
import { GridApi } from "../gridApi";
import { RowRenderer } from "../rendering/rowRenderer";
import { PopupService } from "../widgets/popupService";
import { FocusController } from "../focusController";
import { BeanStub } from "../context/beanStub";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { ModuleNames } from "../modules/moduleNames";
import { IClipboardService } from "../interfaces/iClipboardService";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { Logger, LoggerFactory } from "../logger";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { GridSizeChangedEvent } from "../events";
import { ColumnApi } from "../columnController/columnApi";
import { GridOptions } from "../entities/gridOptions";
import { IRowModel } from "../interfaces/iRowModel";
import { findIndex } from "../utils/array";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { ColumnController } from "../columnController/columnController";
import { ControllersService } from "../controllersService";
import { MouseEventService } from "../gridBodyComp/mouseEventService";

export interface GridCompView extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    addOrRemoveKeyboardFocusClass(value: boolean): void;
    getFocusableContainers(): HTMLElement[];
}

export class GridCompController extends BeanStub {

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusController') protected readonly focusController: FocusController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('controllersService') private controllersService: ControllersService;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;

    private view: GridCompView;
    private eGridHostDiv: HTMLElement;
    private eGridComp: HTMLElement;

    private logger: Logger;

    constructor() {
        super();
    }

    @PostConstruct
    protected postConstruct(): void {

        this.logger = this.loggerFactory.create('GridCompController');

        // register with services that need grid core
        [
            this.gridApi,
            this.popupService,
            this.focusController,
            this.controllersService
        ].forEach(service => service.registerGridCompController(this));

        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            this.clipboardService.registerGridCompController(this);
        }
    }

    public setView(view: GridCompView, eGridDiv: HTMLElement, eGridComp: HTMLElement): void {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGridComp = eGridComp;

        this.mouseEventService.stampTopLevelGridCompWithGridInstance(eGridDiv);

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

        const unsubscribeFromResize = this.resizeObserverService.observeResize(
            this.eGridHostDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public showDropZones(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule);
    }

    public showSideBar(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.SideBarModule);
    }

    public showStatusBar(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.StatusBarModule);
    }

    public showWatermark(): boolean {
        return ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);;
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

    public destroyGridUi(): void {
        this.view.destroyGridUi();
    }

    public getRootGui(): HTMLElement {
        return this.eGridComp;
    }

    public focusNextInnerContainer(backwards: boolean): boolean {
        const focusableContainers = this.view.getFocusableContainers();
        const idxWithFocus = findIndex(focusableContainers, container => container.contains(document.activeElement));
        const nextIdx = idxWithFocus + (backwards ? -1 : 1);

        if (nextIdx < 0 || nextIdx >= focusableContainers.length) {
            return false;
        }

        if (nextIdx === 0) {
            return this.focusGridHeader();
        }

        return this.focusController.focusInto(focusableContainers[nextIdx]);
    }

    public focusGridHeader(): boolean {
        let firstColumn: Column | ColumnGroup = this.columnController.getAllDisplayedColumns()[0];
        if (!firstColumn) { return false; }

        if (firstColumn.getParent()) {
            firstColumn = this.columnController.getColumnGroupAtLevel(firstColumn, 0)!;
        }

        this.focusController.focusHeaderPosition(
            { headerRowIndex: 0, column: firstColumn }
        );

        return true;
    }

    public forceFocusOutOfContainer(up = false): void {
        this.view.forceFocusOutOfContainer(up);
    }


}