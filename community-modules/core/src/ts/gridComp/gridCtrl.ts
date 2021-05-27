import { Autowired, Optional, PostConstruct } from "../context/context";
import { GridApi } from "../gridApi";
import { PopupService } from "../widgets/popupService";
import { FocusService } from "../focusService";
import { BeanStub } from "../context/beanStub";
import { ModuleRegistry } from "../modules/moduleRegistry";
import { ModuleNames } from "../modules/moduleNames";
import { IClipboardService } from "../interfaces/iClipboardService";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Events } from "../eventKeys";
import { Logger, LoggerFactory } from "../logger";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { GridSizeChangedEvent } from "../events";
import { ColumnApi } from "../columns/columnApi";
import { findIndex } from "../utils/array";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { ColumnModel } from "../columns/columnModel";
import { ControllersService } from "../controllersService";
import { MouseEventService } from "../gridBodyComp/mouseEventService";

export interface IGridComp extends LayoutView {
    setRtlClass(cssClass: string): void;
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    addOrRemoveKeyboardFocusClass(value: boolean): void;
    getFocusableContainers(): HTMLElement[];
}

export class GridCtrl extends BeanStub {

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusService') protected readonly focusService: FocusService;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('controllersService') private controllersService: ControllersService;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;

    private view: IGridComp;
    private eGridHostDiv: HTMLElement;
    private eGui: HTMLElement;

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
            this.focusService,
            this.controllersService
        ].forEach(service => service.registerGridCompController(this));

        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            this.clipboardService.registerGridCompController(this);
        }
    }

    public setComp(view: IGridComp, eGridDiv: HTMLElement, eGui: HTMLElement): void {
        this.view = view;
        this.eGridHostDiv = eGridDiv;
        this.eGui = eGui;

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
        return ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule); ;
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

    public getGui(): HTMLElement {
        return this.eGui;
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

        return this.focusService.focusInto(focusableContainers[nextIdx]);
    }

    public focusGridHeader(): boolean {
        let firstColumn: Column | ColumnGroup = this.columnModel.getAllDisplayedColumns()[0];
        if (!firstColumn) { return false; }

        if (firstColumn.getParent()) {
            firstColumn = this.columnModel.getColumnGroupAtLevel(firstColumn, 0)!;
        }

        this.focusService.focusHeaderPosition(
            { headerRowIndex: 0, column: firstColumn }
        );

        return true;
    }

    public forceFocusOutOfContainer(up = false): void {
        this.view.forceFocusOutOfContainer(up);
    }

}