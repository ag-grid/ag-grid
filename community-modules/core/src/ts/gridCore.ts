import { GridOptions } from "./entities/gridOptions";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { ColumnApi } from "./columnController/columnApi";
import { RowRenderer } from "./rendering/rowRenderer";
import { FilterManager } from "./filter/filterManager";
import { GridPanel } from "./gridPanel/gridPanel";
import { Logger, LoggerFactory } from "./logger";
import { PopupService } from "./widgets/popupService";
import { Autowired, Optional, PostConstruct } from "./context/context";
import { IRowModel } from "./interfaces/iRowModel";
import { FocusController } from "./focusController";
import { Component } from "./widgets/component";
import { IClipboardService } from "./interfaces/iClipboardService";
import { GridApi } from "./gridApi";
import { ISideBar } from "./interfaces/iSideBar";
import { RefSelector } from "./widgets/componentAnnotations";
import { Events, GridSizeChangedEvent } from "./events";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { SideBarDef, SideBarDefParser } from "./entities/sideBar";
import { IToolPanel } from "./interfaces/iToolPanel";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { ManagedFocusComponent } from "./widgets/managedFocusComponent";
import { ColumnController } from "./columnController/columnController";
import { ColumnGroup } from "./entities/columnGroup";
import { Column } from "./entities/column";
import { _ } from "./utils";

export class GridCore extends ManagedFocusComponent {

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('filterManager') private filterManager: FilterManager;

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;
    @Autowired('$scope') private $scope: any;
    @Autowired('quickFilterOnScope') private quickFilterOnScope: string;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusController') private focusController: FocusController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @Optional('clipboardService') private clipboardService: IClipboardService;

    @RefSelector('gridPanel') private gridPanel: GridPanel;
    @RefSelector('sideBar') private sideBarComp: ISideBar & Component;
    @RefSelector('rootWrapperBody') private eRootWrapperBody: HTMLElement;

    private doingVirtualPaging: boolean;
    private logger: Logger;

    protected postConstruct(): void {
        this.logger = this.loggerFactory.create('GridCore');

        const template = this.createTemplate();
        this.setTemplate(template);

        // register with services that need grid core
        [
            this.gridApi,
            this.rowRenderer,
            this.popupService
        ].forEach(service => service.registerGridCore(this));

        if (ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            this.clipboardService.registerGridCore(this);
        }

        this.gridOptionsWrapper.addLayoutElement(this.getGui());

        this.eGridDiv.appendChild(this.getGui());
        this.addDestroyFunc(() => {
            this.eGridDiv.removeChild(this.getGui());
        });

        // if using angular, watch for quickFilter changes
        if (this.$scope) {
            const quickFilterUnregisterFn = this.$scope.$watch(this.quickFilterOnScope, (newFilter: any) => this.filterManager.setQuickFilter(newFilter));
            this.addDestroyFunc(quickFilterUnregisterFn);
        }

        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();

        this.logger.log('ready');

        this.gridOptionsWrapper.addLayoutElement(this.eRootWrapperBody);

        const unsubscribeFromResize = this.resizeObserverService.observeResize(
            this.eGridDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());

        const eGui = this.getGui();

        this.addManagedListener(this.eventService, Events.EVENT_KEYBOARD_FOCUS, () => {
            _.addCssClass(eGui, 'ag-keyboard-focus');
        });

        this.addManagedListener(this.eventService, Events.EVENT_MOUSE_FOCUS, () => {
            _.removeCssClass(eGui, 'ag-keyboard-focus');
        });

        super.postConstruct();
    }

    public getFocusableElement(): HTMLElement {
        return this.eRootWrapperBody;
    }

    private createTemplate(): string {
        const sideBarModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SideBarModule);
        const statusBarModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.StatusBarModule);
        const rowGroupingLoaded = ModuleRegistry.isRegistered(ModuleNames.RowGroupingModule);
        const enterpriseCoreLoaded = ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);

        const dropZones = rowGroupingLoaded ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        const sideBar = sideBarModuleLoaded ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        const statusBar = statusBarModuleLoaded ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        const watermark = enterpriseCoreLoaded ? '<ag-watermark></ag-watermark>' : '';

        const template =
            `<div class="ag-root-wrapper">
                ${dropZones}
                <div class="ag-root-wrapper-body" ref="rootWrapperBody">
                    <ag-grid-comp ref="gridPanel"></ag-grid-comp>
                    ${sideBar}
                </div>
                ${statusBar}
                <ag-pagination></ag-pagination>
                ${watermark}
            </div>`;

        return template;
    }

    protected isFocusableContainer(): boolean {
        return true;
    }

    protected focusFirstElement(): void {
        let firstColumn: Column | ColumnGroup = this.columnController.getAllDisplayedColumns()[0];
        if (!firstColumn) { return; }

        if (firstColumn.getParent()) {
            firstColumn = this.columnController.getColumnGroupAtLevel(firstColumn, 0);
        }

        this.focusController.focusHeaderPosition({
            headerRowIndex: 0,
            column: firstColumn
        });
    }

    private onGridSizeChanged(): void {
        const event: GridSizeChangedEvent = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            clientWidth: this.eGridDiv.clientWidth,
            clientHeight: this.eGridDiv.clientHeight
        };
        this.eventService.dispatchEvent(event);
    }

    private addRtlSupport(): void {
        const cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
        _.addCssClass(this.getGui(), cssClass);
    }

    public getRootGui(): HTMLElement {
        return this.getGui();
    }

    public isSideBarVisible(): boolean {
        if (!this.sideBarComp) {
            return false;
        }

        return this.sideBarComp.isDisplayed();
    }

    public setSideBarVisible(show: boolean) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('ag-Grid: sideBar is not loaded');
            }
            return;
        }

        this.sideBarComp.setDisplayed(show);
    }

    public setSideBarPosition(position: 'left' | 'right') {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: sideBar is not loaded');
            return;
        }
        this.sideBarComp.setSideBarPosition(position);
    }

    public closeToolPanel() {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }

        this.sideBarComp.close();
    }

    public getSideBar(): SideBarDef {
        return this.gridOptions.sideBar as SideBarDef;
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }
        return this.sideBarComp.getToolPanelInstance(key);
    }

    public refreshSideBar() {
        if (this.sideBarComp) {
            this.sideBarComp.refresh();
        }
    }

    public setSideBar(def: SideBarDef | string | boolean): void {
        if (!this.sideBarComp) { return; }
        this.eRootWrapperBody.removeChild(this.sideBarComp.getGui());
        this.gridOptions.sideBar = SideBarDefParser.parse(def);
        this.sideBarComp.reset();
        this.eRootWrapperBody.appendChild(this.sideBarComp.getGui());
    }

    public getOpenedToolPanel(): string {
        if (!this.sideBarComp) {
            return null;
        }

        return this.sideBarComp.openedItem();
    }

    public openToolPanel(key: string) {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }

        this.sideBarComp.openToolPanel(key);
    }

    public isToolPanelShowing() {
        return this.sideBarComp.isToolPanelShowing();
    }

    protected destroy(): void {
        this.logger.log('Grid DOM removed');
        super.destroy();
    }

    // Valid values for position are bottom, middle and top
    public ensureNodeVisible(comparator: any, position: string | null = null) {
        if (this.doingVirtualPaging) {
            throw new Error('Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory');
        }
        // look for the node index we want to display
        const rowCount = this.rowModel.getRowCount();
        const comparatorIsAFunction = typeof comparator === 'function';
        let indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (let i = 0; i < rowCount; i++) {
            const node = this.rowModel.getRow(i);
            if (comparatorIsAFunction) {
                if (comparator(node)) {
                    indexToSelect = i;
                    break;
                }
            } else {
                // check object equality against node and data
                if (comparator === node || comparator === node.data) {
                    indexToSelect = i;
                    break;
                }
            }
        }
        if (indexToSelect >= 0) {
            this.gridPanel.ensureIndexVisible(indexToSelect, position);
        }
    }
}
