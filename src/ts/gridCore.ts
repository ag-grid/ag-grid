
import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {InMemoryRowController} from "./rowControllers/inMemory/inMemoryRowController";
import {PaginationController} from "./rowControllers/paginationController";
import {VirtualPageRowController} from "./rowControllers/virtualPageRowController";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {ColumnController} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {FilterManager} from "./filter/filterManager";
import {ValueService} from "./valueService";
import {MasterSlaveService} from "./masterSlaveService";
import {EventService} from "./eventService";
import {GridPanel} from "./gridPanel/gridPanel";
import {Logger} from "./logger";
import {GridApi} from "./gridApi";
import {Constants} from "./constants";
import {HeaderTemplateLoader} from "./headerRendering/headerTemplateLoader";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {SelectionRendererFactory} from "./selectionRendererFactory";
import {ExpressionService} from "./expressionService";
import {TemplateService} from "./templateService";
import {PopupService} from "./widgets/popupService";
import {LoggerFactory} from "./logger";
import {ColumnUtils} from "./columnController/columnUtils";
import {AutoWidthCalculator} from "./rendering/autoWidthCalculator";
import {Events} from "./events";
import {BorderLayout} from "./layout/borderLayout";
import {ColumnChangeEvent} from "./columnChangeEvent";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {ColDef} from "./entities/colDef";
import {Context} from './context/context';
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {Autowired} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {PostConstruct} from "./context/context";
import {FocusedCellController} from "./focusedCellController";
import {Optional} from "./context/context";
import {Component} from "./widgets/component";

@Bean('gridCore')
export class GridCore {

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('paginationController') private paginationController: PaginationController;
    @Autowired('rowModel') private rowModel: IRowModel;

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;
    @Autowired('$scope') private $scope: any;
    @Autowired('quickFilterOnScope') private quickFilterOnScope: string;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;

    @Optional('rowGroupPanel') private rowGroupPanel: Component;
    @Optional('toolPanel') private toolPanel: Component;
    @Optional('statusBar') private statusBar: Component;

    private finished: boolean;
    private doingVirtualPaging: boolean;

    private eRootPanel: BorderLayout;
    private toolPanelShowing: boolean;

    private windowResizeListener: EventListener;
    private logger: Logger;

    constructor(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('GridCore');
    }

    @PostConstruct
    public init(): void {

        // and the last bean, done in it's own section, as it's optional
        var toolPanelGui: HTMLElement;

        var eSouthPanel = this.createSouthPanel();

        if (this.toolPanel && !this.gridOptionsWrapper.isForPrint()) {
            toolPanelGui = this.toolPanel.getGui();
        }

        var rowGroupGui: HTMLElement;
        if (this.rowGroupPanel) {
            rowGroupGui = this.rowGroupPanel.getGui();
        }

        this.eRootPanel = new BorderLayout({
            center: this.gridPanel.getLayout(),
            east: toolPanelGui,
            north: rowGroupGui,
            south: eSouthPanel,
            dontFill: this.gridOptionsWrapper.isForPrint(),
            name: 'eRootPanel'
        });

        // see what the grid options are for default of toolbar
        this.showToolPanel(this.gridOptionsWrapper.isShowToolPanel());

        this.eGridDiv.appendChild(this.eRootPanel.getGui());

        // if using angular, watch for quickFilter changes
        if (this.$scope) {
            this.$scope.$watch(this.quickFilterOnScope, (newFilter: any) => this.filterManager.setQuickFilter(newFilter) );
        }

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addWindowResizeListener();
        }

        this.doLayout();

        this.finished = false;
        this.periodicallyDoLayout();

        this.popupService.setPopupParent(this.eRootPanel.getGui());

        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));

        this.onRowGroupChanged();

        this.logger.log('ready');
    }

    private createSouthPanel(): HTMLElement {

        if (!this.statusBar && this.gridOptionsWrapper.isEnableStatusBar()) {
            console.warn('ag-Grid: status bar is only available in ag-Grid-Enterprise');
        }

        var statusBarEnabled = this.statusBar && this.gridOptionsWrapper.isEnableStatusBar();
        var paginationPanelEnabled = this.gridOptionsWrapper.isRowModelPagination() && !this.gridOptionsWrapper.isForPrint();

        if (!statusBarEnabled && !paginationPanelEnabled) {
            return null;
        }

        var eSouthPanel = document.createElement('div');
        if (statusBarEnabled) {
            eSouthPanel.appendChild(this.statusBar.getGui());
        }

        if (paginationPanelEnabled) {
            eSouthPanel.appendChild(this.paginationController.getGui());
        }

        return eSouthPanel;
    }

    private onRowGroupChanged(): void {
        if (!this.rowGroupPanel) { return; }

        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();

        if (rowGroupPanelShow===Constants.ALWAYS) {
            this.eRootPanel.setNorthVisible(true);
        } else if (rowGroupPanelShow===Constants.ONLY_WHEN_GROUPING) {
            var grouping = !this.columnController.isRowGroupEmpty();
            this.eRootPanel.setNorthVisible(grouping);
        } else {
            this.eRootPanel.setNorthVisible(false);
        }
    }

    public agApplicationBoot(): void {
        var readyEvent = {
            api: this.gridOptions.api,
            columnApi: this.gridOptions.columnApi
        };
        this.eventService.dispatchEvent(Events.EVENT_GRID_READY, readyEvent);
    }

    private addWindowResizeListener(): void {
        var that = this;
        // putting this into a function, so when we remove the function,
        // we are sure we are removing the exact same function (i'm not
        // sure what 'bind' does to the function reference, if it's safe
        // the result from 'bind').
        this.windowResizeListener = function resizeListener() {
            that.doLayout();
        };
        window.addEventListener('resize', this.windowResizeListener);
    }

    private periodicallyDoLayout() {
        if (!this.finished) {
            var that = this;
            setTimeout(function () {
                that.doLayout();
                that.gridPanel.periodicallyCheck();
                that.periodicallyDoLayout();
            }, 500);
        }
    }

    public showToolPanel(show: any) {
        if (show && !this.toolPanel) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            this.toolPanelShowing = false;
            return;
        }

        this.toolPanelShowing = show;
        this.eRootPanel.setEastVisible(show);
    }

    public isToolPanelShowing() {
        return this.toolPanelShowing;
    }

    public agDestroy() {
        if (this.windowResizeListener) {
            window.removeEventListener('resize', this.windowResizeListener);
            this.logger.log('Removing windowResizeListener');
        }
        this.finished = true;

        this.eGridDiv.removeChild(this.eRootPanel.getGui());
        this.logger.log('Grid DOM removed');
    }

    public ensureNodeVisible(comparator: any) {
        if (this.doingVirtualPaging) {
            throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
        }
        // look for the node index we want to display
        var rowCount = this.rowModel.getRowCount();
        var comparatorIsAFunction = typeof comparator === 'function';
        var indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (var i = 0; i < rowCount; i++) {
            var node = this.rowModel.getRow(i);
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
            this.gridPanel.ensureIndexVisible(indexToSelect);
        }
    }

    public doLayout() {
        // need to do layout first, as drawVirtualRows and setPinnedColHeight
        // need to know the result of the resizing of the panels.
        var sizeChanged = this.eRootPanel.doLayout();
        // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
        if (sizeChanged) {
            this.rowRenderer.drawVirtualRows();
            var event = {
                clientWidth: this.eRootPanel.getGui().clientWidth,
                clientHeight: this.eRootPanel.getGui().clientHeight
            };
            this.eventService.dispatchEvent(Events.EVENT_GRID_SIZE_CHANGED, event);
        }
    }
}
