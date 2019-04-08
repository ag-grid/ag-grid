import { GridOptions } from "./entities/gridOptions";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { ColumnApi } from "./columnController/columnApi";
import { ColumnController } from "./columnController/columnController";
import { RowRenderer } from "./rendering/rowRenderer";
import { FilterManager } from "./filter/filterManager";
import { EventService } from "./eventService";
import { GridPanel } from "./gridPanel/gridPanel";
import { Logger, LoggerFactory } from "./logger";
import { PopupService } from "./widgets/popupService";
import { Autowired, Optional, PostConstruct } from "./context/context";
import { IRowModel } from "./interfaces/iRowModel";
import { FocusedCellController } from "./focusedCellController";
import { Component } from "./widgets/component";
import { IClipboardService } from "./interfaces/iClipboardService";
import { GridApi } from "./gridApi";
import { ISideBar } from "./interfaces/ISideBar";
import { RefSelector } from "./widgets/componentAnnotations";
import { Events, GridSizeChangedEvent } from "./events";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { SideBarDef, SideBarDefParser } from "./entities/sideBar";
import { _ } from "./utils";

export class GridCore extends Component {

    private static TEMPLATE_NORMAL =
        `<div class="ag-root-wrapper">
            <div class="ag-root-wrapper-body" ref="rootWrapperBody">
                <ag-grid-comp ref="gridPanel"></ag-grid-comp>
            </div>
            <ag-pagination></ag-pagination>
        </div>`;

    private static TEMPLATE_ENTERPRISE =
        `<div class="ag-root-wrapper">
            <ag-grid-header-drop-zones></ag-grid-header-drop-zones>
            <div ref="rootWrapperBody" class="ag-root-wrapper-body">
                <ag-grid-comp ref="gridPanel"></ag-grid-comp>
                <ag-side-bar ref="sideBar"></ag-side-bar>
            </div>
            <ag-status-bar ref="statusBar"></ag-status-bar>
            <ag-pagination></ag-pagination>
            <ag-watermark></ag-watermark>
        </div>`;

    @Autowired('enterprise') private enterprise: boolean;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;
    @Autowired('$scope') private $scope: any;
    @Autowired('quickFilterOnScope') private quickFilterOnScope: string;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @Optional('clipboardService') private clipboardService: IClipboardService;

    @RefSelector('gridPanel') private gridPanel: GridPanel;
    @RefSelector('sideBar') private sideBarComp: ISideBar & Component;
    @RefSelector('rootWrapperBody') private eRootWrapperBody: HTMLElement;

    private doingVirtualPaging: boolean;

    private logger: Logger;

    @PostConstruct
    public init(): void {

        this.logger = this.loggerFactory.create('GridCore');

        const template = this.enterprise ? GridCore.TEMPLATE_ENTERPRISE : GridCore.TEMPLATE_NORMAL;
        this.setTemplate(template);

        // register with services that need grid core
        [
            this.gridApi,
            this.filterManager,
            this.rowRenderer,
            this.popupService
        ].forEach(service => service.registerGridCore(this));

        if (this.enterprise) {
            this.clipboardService.registerGridCore(this);
        }

        this.gridOptionsWrapper.addLayoutElement(this.getGui());

        // see what the grid options are for default of toolbar
        this.setSideBarVisible(this.gridOptionsWrapper.isShowToolPanel());

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
        const gridPanelEl = this.gridPanel.getGui();

        this.addDestroyableEventListener(gridPanelEl, 'focusin', () => {
            _.addCssClass(gridPanelEl, 'ag-has-focus');
        });

        this.addDestroyableEventListener(gridPanelEl, 'focusout', (e: FocusEvent) => {
            if (!gridPanelEl.contains(e.relatedTarget as HTMLElement)) {
                _.removeCssClass(gridPanelEl, 'ag-has-focus');
            }
        });

        const unsubscribeFromResize = this.resizeObserverService.observeResize(
            this.eGridDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());
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

        return this.sideBarComp.isVisible();
    }

    public setSideBarVisible(show:boolean) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            }
            return;
        }

        this.sideBarComp.setVisible(show);
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

    public refreshSideBar() {
        if (this.sideBarComp) {
            this.sideBarComp.refresh();
        }
    }

    public setSideBar(def: SideBarDef | string | boolean): void {
        this.eRootWrapperBody.removeChild(this.sideBarComp.getGui());
        this.gridOptions.sideBar = SideBarDefParser.parse(def);
        this.sideBarComp.reset ();
        this.eRootWrapperBody.appendChild(this.sideBarComp.getGui());
    }

    public getOpenedToolPanel(): string {
        if (!this.sideBarComp) {
            return null;
        }

        return this.sideBarComp.openedItem();
    }

    public openToolPanel(key:string) {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }

        this.sideBarComp.openToolPanel(key);
    }

    public isToolPanelShowing() {
        return this.sideBarComp.isToolPanelShowing();
    }

    public destroy() {
        super.destroy();
        this.logger.log('Grid DOM removed');
    }

    // Valid values for position are bottom, middle and top
    public ensureNodeVisible(comparator: any, position: string = 'top') {
        if (this.doingVirtualPaging) {
            throw new Error('Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory');
        }
        // look for the node index we want to display
        const rowCount = this.rowModel.getPageLastRow() + 1;
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