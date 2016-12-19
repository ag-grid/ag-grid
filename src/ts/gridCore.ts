
import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {PaginationController} from "./rowControllers/paginationController";
import {ColumnController} from "./columnController/columnController";
import {RowRenderer} from "./rendering/rowRenderer";
import {FilterManager} from "./filter/filterManager";
import {EventService} from "./eventService";
import {GridPanel} from "./gridPanel/gridPanel";
import {Logger, LoggerFactory} from "./logger";
import {Constants} from "./constants";
import {PopupService} from "./widgets/popupService";
import {Events} from "./events";
import {Utils as _} from "./utils";
import {BorderLayout} from "./layout/borderLayout";
import {PreDestroy, Bean, Qualifier, Autowired, PostConstruct, Optional} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {FocusedCellController} from "./focusedCellController";
import {Component} from "./widgets/component";
import {ICompFactory} from "./interfaces/iCompFactory";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";

@Bean('gridCore')
export class GridCore {

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('paginationController') private paginationController: PaginationController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;

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

    @Optional('rowGroupCompFactory') private rowGroupCompFactory: ICompFactory;
    @Optional('pivotCompFactory') private pivotCompFactory: ICompFactory;
    @Optional('toolPanel') private toolPanel: Component;
    @Optional('statusBar') private statusBar: Component;

    private rowGroupComp: Component;
    private pivotComp: Component;

    private finished: boolean;
    private doingVirtualPaging: boolean;

    private eRootPanel: BorderLayout;
    private toolPanelShowing: boolean;

    private logger: Logger;

    private destroyFunctions: Function[] = [];

    constructor(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('GridCore');
    }

    @PostConstruct
    public init(): void {

        var eSouthPanel = this.createSouthPanel();

        let eastPanel: HTMLElement;
        let westPanel: HTMLElement;
        if (this.toolPanel && !this.gridOptionsWrapper.isForPrint()) {
            // if we are doing RTL, then the tool panel appears on the left
            if (this.gridOptionsWrapper.isEnableRtl()) {
                westPanel = this.toolPanel.getGui();
            } else {
                eastPanel = this.toolPanel.getGui();
            }
        }

        var createTopPanelGui = this.createNorthPanel();

        this.eRootPanel = new BorderLayout({
            center: this.gridPanel.getLayout(),
            east: eastPanel,
            west: westPanel,
            north: createTopPanelGui,
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

        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();

        this.doLayout();

        this.finished = false;
        this.periodicallyDoLayout();

        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));

        this.onRowGroupChanged();

        this.logger.log('ready');
    }

    private addRtlSupport(): void {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            _.addCssClass(this.eRootPanel.getGui(), 'ag-rtl');
        } else {
            _.addCssClass(this.eRootPanel.getGui(), 'ag-ltr');
        }
    }

    private createNorthPanel(): HTMLElement {

        if (!this.gridOptionsWrapper.isEnterprise()) { return null; }

        var topPanelGui = document.createElement('div');

        var dropPanelVisibleListener = this.onDropPanelVisible.bind(this);

        this.rowGroupComp = this.rowGroupCompFactory.create();
        this.pivotComp = this.pivotCompFactory.create();

        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());

        this.rowGroupComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);

        this.destroyFunctions.push( ()=> {
            this.rowGroupComp.removeEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
            this.pivotComp.removeEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        } );

        this.onDropPanelVisible();

        return topPanelGui;
    }

    private onDropPanelVisible(): void {
        var bothVisible = this.rowGroupComp.isVisible() && this.pivotComp.isVisible();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothVisible);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothVisible);
    }

    public getRootGui(): HTMLElement {
        return this.eRootPanel.getGui();
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
        if (!this.rowGroupComp) { return; }

        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();

        if (rowGroupPanelShow===Constants.ALWAYS) {
            this.rowGroupComp.setVisible(true);
        } else if (rowGroupPanelShow===Constants.ONLY_WHEN_GROUPING) {
            var grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setVisible(grouping);
        } else {
            this.rowGroupComp.setVisible(false);
        }

        this.eRootPanel.doLayout();
    }
    
    private addWindowResizeListener(): void {
        var eventListener = this.doLayout.bind(this);
        window.addEventListener('resize', eventListener);
        this.destroyFunctions.push( ()=> window.removeEventListener('resize', eventListener) );
    }

    private periodicallyDoLayout() {
        if (!this.finished) {
            var intervalMillis = this.gridOptionsWrapper.getLayoutInterval();
            // if interval is negative, this stops the layout from happening
            if (intervalMillis>0){
                this.frameworkFactory.setTimeout( () => {
                    this.doLayout();
                    this.gridPanel.periodicallyCheck();
                    this.periodicallyDoLayout();
                }, intervalMillis);
            } else {
                // if user provided negative number, we still do the check every 5 seconds,
                // in case the user turns the number positive again
                this.frameworkFactory.setTimeout( () => {
                    this.periodicallyDoLayout();
                }, 5000);
            }
        }
    }

    public showToolPanel(show: any) {
        if (show && !this.toolPanel) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            this.toolPanelShowing = false;
            return;
        }

        this.toolPanelShowing = show;
        if (this.toolPanel) {
            this.toolPanel.setVisible(show);
            this.eRootPanel.doLayout();
        }
    }

    public isToolPanelShowing() {
        return this.toolPanelShowing;
    }

    @PreDestroy
    private destroy() {
        this.finished = true;

        this.eGridDiv.removeChild(this.eRootPanel.getGui());
        this.logger.log('Grid DOM removed');

        this.destroyFunctions.forEach(func => func());
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
            this.rowRenderer.drawVirtualRowsWithLock();
            var event = {
                clientWidth: this.eRootPanel.getGui().clientWidth,
                clientHeight: this.eRootPanel.getGui().clientHeight
            };
            this.eventService.dispatchEvent(Events.EVENT_GRID_SIZE_CHANGED, event);
        }
    }
}
