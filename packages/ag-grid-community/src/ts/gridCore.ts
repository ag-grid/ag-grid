import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColumnApi} from "./columnController/columnApi";
import {ColumnController} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {FilterManager} from "./filter/filterManager";
import {EventService} from "./eventService";
import {GridPanel} from "./gridPanel/gridPanel";
import {Logger, LoggerFactory} from "./logger";
import {PopupService} from "./widgets/popupService";
import {Utils as _} from "./utils";
import {Autowired, Bean, Context, Optional, PostConstruct, PreDestroy} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {FocusedCellController} from "./focusedCellController";
import {Component} from "./widgets/component";
import {ICompFactory} from "./interfaces/iCompFactory";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {GridApi} from "./gridApi";
import {ISideBar} from "./interfaces/ISideBar";
import {RefSelector} from "./widgets/componentAnnotations";
import {Events, GridSizeChangedEvent} from "./events";
import {ResizeObserverService} from "./misc/resizeObserverService";
import {SideBarDef, SideBarDefParser} from "./entities/sideBar";

@Bean('gridCore')
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
        </div>`;

    @Autowired('enterprise') private enterprise: boolean;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;
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
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @Optional('rowGroupCompFactory') private rowGroupCompFactory: ICompFactory;
    @Optional('pivotCompFactory') private pivotCompFactory: ICompFactory;

    @RefSelector('gridPanel') private gridPanel: GridPanel;
    @RefSelector('sideBar') private sideBarComp: ISideBar & Component;
    @RefSelector('rootWrapperBody') private eRootWrapperBody: HTMLElement;

    private finished: boolean;
    private doingVirtualPaging: boolean;

    private logger: Logger;

    constructor() {
        super();
    }

    @PostConstruct
    public init(): void {

        this.logger = this.loggerFactory.create('GridCore');

        let template = this.enterprise ? GridCore.TEMPLATE_ENTERPRISE : GridCore.TEMPLATE_NORMAL;
        this.setTemplate(template);
        this.instantiate(this.context);

        if (this.enterprise) {
            this.sideBarComp.registerGridComp(this.gridPanel);
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
            let quickFilterUnregisterFn = this.$scope.$watch(this.quickFilterOnScope, (newFilter: any) => this.filterManager.setQuickFilter(newFilter));
            this.addDestroyFunc(quickFilterUnregisterFn);
        }

        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();

        this.finished = false;
        this.addDestroyFunc(() => this.finished = true);

        this.logger.log('ready');

        this.gridOptionsWrapper.addLayoutElement(this.eRootWrapperBody);

        const unsubscribeFromResize = this.resizeObserverService.observeResize(
            this.eGridDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    private onGridSizeChanged(): void {
        let event: GridSizeChangedEvent = {
            type: Events.EVENT_GRID_SIZE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            clientWidth: this.eGridDiv.clientWidth,
            clientHeight: this.eGridDiv.clientHeight
        };
        this.eventService.dispatchEvent(event);
    }

    // this was deprecated in v19, we can drop in v20
    public getPreferredWidth(): number {
        let widthForCols = this.columnController.getBodyContainerWidth()
            + this.columnController.getPinnedLeftContainerWidth()
            + this.columnController.getPinnedRightContainerWidth();
        let widthForToolpanel = this.sideBarComp ? this.sideBarComp.getPreferredWidth() : 0;
        return widthForCols + widthForToolpanel;
    }

    private addRtlSupport(): void {
        let cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
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
        return <SideBarDef>this.gridOptions.sideBar;
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

    // need to override, as parent class isn't marked with PreDestroy
    @PreDestroy
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
        let rowCount = this.rowModel.getPageLastRow() + 1;
        let comparatorIsAFunction = typeof comparator === 'function';
        let indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (let i = 0; i < rowCount; i++) {
            let node = this.rowModel.getRow(i);
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