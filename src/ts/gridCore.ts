import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColumnApi} from "./columnController/columnApi";
import {ColumnController} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {FilterManager} from "./filter/filterManager";
import {EventService} from "./eventService";
import {GridPanel} from "./gridPanel/gridPanel";
import {Logger, LoggerFactory} from "./logger";
import {Constants} from "./constants";
import {PopupService} from "./widgets/popupService";
import {Events, ViewportImpactedEvent} from "./events";
import {Utils as _} from "./utils";
import {Autowired, Bean, Context, Optional, PostConstruct, PreDestroy} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {FocusedCellController} from "./focusedCellController";
import {Component} from "./widgets/component";
import {ICompFactory} from "./interfaces/iCompFactory";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {PaginationComp} from "./rowModels/pagination/paginationComp";
import {GridApi} from "./gridApi";
import {IToolPanel} from "./interfaces/iToolPanel";
import {RefSelector} from "./widgets/componentAnnotations";

@Bean('gridCore')
export class GridCore extends Component {

    private static TEMPLATE_NORMAL =
        `<div class="ag-root-wrapper">
            <div class="ag-root-wrapper-body">
                <ag-grid-comp ref="gridPanel"></ag-grid-comp>
            </div>
        </div>`;

    private static TEMPLATE_ENTERPRISE =
        `<div class="ag-root-wrapper">
            <ag-header-column-drop></ag-header-column-drop>
            <div class="ag-root-wrapper-body">
                <ag-grid-comp ref="gridPanel"></ag-grid-comp>
                <ag-tool-panel ref="toolPanel"></ag-tool-panel>
            </div>
        </div>`;

    @Autowired('enterprise') private enterprise: boolean;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;

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
    @Optional('statusBar') private statusBar: Component;

    @RefSelector('gridPanel') private gridPanel: GridPanel;
    @RefSelector('toolPanel') private toolPanelComp: IToolPanel;

    private finished: boolean;
    private doingVirtualPaging: boolean;

    private logger: Logger;

    constructor() {
        super();
    }

    @PostConstruct
    public init(): void {

        this.logger = this.loggerFactory.create('GridCore');

        let eSouthPanel = this.createSouthPanel();

        let template = this.enterprise ? GridCore.TEMPLATE_ENTERPRISE : GridCore.TEMPLATE_NORMAL;
        this.setTemplate(template);
        this.instantiate(this.context);

        if (eSouthPanel) {
            this.getGui().appendChild(eSouthPanel);
        }

        // parts of the CSS need to know if we are in 'for print' mode or not,
        // so we add a class to allow applying CSS based on this.
        if (this.gridOptionsWrapper.isAutoHeight()) {
            _.addCssClass(this.getGui(), 'ag-layout-auto-height');
        } else {
            _.addCssClass(this.getGui(), 'ag-layout-normal');
            // kept to limit breaking changes, ag-scrolls was renamed to ag-layout-normal
            _.addCssClass(this.getGui(), 'ag-scrolls');
        }

        // see what the grid options are for default of toolbar
        this.showToolPanel(this.gridOptionsWrapper.isShowToolPanel());

        this.eGridDiv.appendChild(this.getGui());
        this.addDestroyFunc( () => {
            this.eGridDiv.removeChild(this.getGui());
        });

        // if using angular, watch for quickFilter changes
        if (this.$scope) {
            let quickFilterUnregisterFn = this.$scope.$watch(this.quickFilterOnScope, (newFilter: any) => this.filterManager.setQuickFilter(newFilter) );
            this.addDestroyFunc(quickFilterUnregisterFn);
        }

        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();

        this.finished = false;
        this.addDestroyFunc( () => this.finished = true );
        this.periodicallyDoLayout();

        this.logger.log('ready');
    }

    private addRtlSupport(): void {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            _.addCssClass(this.getGui(), 'ag-rtl');
        } else {
            _.addCssClass(this.getGui(), 'ag-ltr');
        }
    }

    public getRootGui(): HTMLElement {
        return this.getGui();
    }

    private createSouthPanel(): HTMLElement {

        let statusBarEnabled = this.statusBar && this.gridOptionsWrapper.isEnableStatusBar();
        let isPaging = this.gridOptionsWrapper.isPagination();
        let paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();

        if (!statusBarEnabled && !paginationPanelEnabled) {
            return null;
        }

        let eSouthPanel = document.createElement('div');
        if (statusBarEnabled) {
            eSouthPanel.appendChild(this.statusBar.getGui());
        }

        if (paginationPanelEnabled) {
            let paginationComp = new PaginationComp();
            this.context.wireBean(paginationComp);
            eSouthPanel.appendChild(paginationComp.getGui());
            this.addDestroyFunc(paginationComp.destroy.bind(paginationComp));
        }

        return eSouthPanel;
    }

    private periodicallyDoLayout() {
        if (!this.finished) {
            let intervalMillis = this.gridOptionsWrapper.getLayoutInterval();
            // if interval is negative, this stops the layout from happening
            if (intervalMillis > 0) {
                this.frameworkFactory.setTimeout(() => {
                    // this gets grid to resize immediately, rather than waiting for next 500ms
                    this.dispatchViewImpacted();
                    this.periodicallyDoLayout();
                }, intervalMillis);
            } else {
                // if user provided negative number, we still do the check every 5 seconds,
                // in case the user turns the number positive again
                this.frameworkFactory.setTimeout(() => {
                        this.periodicallyDoLayout();
                }, 5000);
            }
        }
    }

    public showToolPanel(show: any) {
        if (!this.toolPanelComp) {
            if (show) {
                console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            }
            return;
        }

        this.toolPanelComp.init();
        this.toolPanelComp.showToolPanel(show);

        this.dispatchViewImpacted();
    }

    private dispatchViewImpacted(): void {
        let event = <ViewportImpactedEvent> {
            type: Events.EVENT_VIEWPORT_IMPACTED,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.eventService.dispatchEvent(event);
    }

    public isToolPanelShowing() {
        return this.toolPanelComp.isToolPanelShowing();
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
            throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
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

export class HeaderColumnDropComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Optional('rowGroupCompFactory') private rowGroupCompFactory: ICompFactory;
    @Optional('pivotCompFactory') private pivotCompFactory: ICompFactory;

    private rowGroupComp: Component;
    private pivotComp: Component;

    constructor() {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        this.setGui(this.createNorthPanel());

        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));

        this.onRowGroupChanged();
    }

    private createNorthPanel(): HTMLElement {

        let topPanelGui = document.createElement('div');

        let dropPanelVisibleListener = this.onDropPanelVisible.bind(this);

        this.rowGroupComp = this.rowGroupCompFactory.create();
        this.pivotComp = this.pivotCompFactory.create();

        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());

        this.rowGroupComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);

        this.addDestroyFunc(() => {
            this.rowGroupComp.removeEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
            this.pivotComp.removeEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        });

        this.onDropPanelVisible();

        return topPanelGui;
    }

    private onDropPanelVisible(): void {
        let bothVisible = this.rowGroupComp.isVisible() && this.pivotComp.isVisible();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothVisible);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothVisible);
    }

    private onRowGroupChanged(): void {
        if (!this.rowGroupComp) {
            return;
        }

        let rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();

        if (rowGroupPanelShow === Constants.ALWAYS) {
            this.rowGroupComp.setVisible(true);
        } else if (rowGroupPanelShow === Constants.ONLY_WHEN_GROUPING) {
            let grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setVisible(grouping);
        } else {
            this.rowGroupComp.setVisible(false);
        }
    }

}
