
import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
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
import {PreDestroy, Bean, Qualifier, Autowired, PostConstruct, Optional, Context} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {FocusedCellController} from "./focusedCellController";
import {Component} from "./widgets/component";
import {ICompFactory} from "./interfaces/iCompFactory";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {PaginationComp} from "./rowModels/pagination/paginationComp";

@Bean('gridCore')
export class GridCore {

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
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
    @Autowired('context') private context: Context;

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

        let eSouthPanel = this.createSouthPanel();

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

        let createTopPanelGui = this.createNorthPanel();

        this.eRootPanel = new BorderLayout({
            center: this.gridPanel.getLayout(),
            east: eastPanel,
            west: westPanel,
            north: createTopPanelGui,
            south: eSouthPanel,
            dontFill: this.gridOptionsWrapper.isForPrint(),
            fillHorizontalOnly: this.gridOptionsWrapper.isAutoHeight(),
            name: 'eRootPanel'
        });

        // parts of the CSS need to know if we are in 'for print' mode or not,
        // so we add a class to allow applying CSS based on this.
        if (this.gridOptionsWrapper.isForPrint()) {
            _.addCssClass(this.eRootPanel.getGui(), 'ag-layout-for-print');
            // kept to limit breaking changes, ag-no-scrolls was renamed to ag-layout-for-print
            _.addCssClass(this.eRootPanel.getGui(), 'ag-no-scrolls');
        } else if (this.gridOptionsWrapper.isAutoHeight()) {
            _.addCssClass(this.eRootPanel.getGui(), 'ag-layout-auto-height');
        } else {
            _.addCssClass(this.eRootPanel.getGui(), 'ag-layout-normal');
            // kept to limit breaking changes, ag-scrolls was renamed to ag-layout-normal
            _.addCssClass(this.eRootPanel.getGui(), 'ag-scrolls');
        }

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

        let topPanelGui = document.createElement('div');

        let dropPanelVisibleListener = this.onDropPanelVisible.bind(this);

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
        let bothVisible = this.rowGroupComp.isVisible() && this.pivotComp.isVisible();
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

        let statusBarEnabled = this.statusBar && this.gridOptionsWrapper.isEnableStatusBar();
        let isPaging = this.gridOptionsWrapper.isPagination();
        let paginationPanelEnabled = isPaging
            && !this.gridOptionsWrapper.isForPrint()
            && !this.gridOptionsWrapper.isSuppressPaginationPanel();

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
            this.destroyFunctions.push(paginationComp.destroy.bind(paginationComp));
        }

        return eSouthPanel;
    }

    private onRowGroupChanged(): void {
        if (!this.rowGroupComp) { return; }

        let rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();

        if (rowGroupPanelShow===Constants.ALWAYS) {
            this.rowGroupComp.setVisible(true);
        } else if (rowGroupPanelShow===Constants.ONLY_WHEN_GROUPING) {
            let grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setVisible(grouping);
        } else {
            this.rowGroupComp.setVisible(false);
        }

        this.eRootPanel.doLayout();
    }
    
    private addWindowResizeListener(): void {
        let eventListener = this.doLayout.bind(this);
        window.addEventListener('resize', eventListener);
        this.destroyFunctions.push( ()=> window.removeEventListener('resize', eventListener) );
    }

    private periodicallyDoLayout() {
        if (!this.finished) {
            let intervalMillis = this.gridOptionsWrapper.getLayoutInterval();
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
            this.gridPanel.ensureIndexVisible(indexToSelect);
        }
    }

    public doLayout() {
        // need to do layout first, as drawVirtualRows and setPinnedColHeight
        // need to know the result of the resizing of the panels.
        let sizeChanged = this.eRootPanel.doLayout();
        // not sure why, this is a hack, but if size changed, it may need to be called
        // again - as the size change can change whether scrolls are visible or not (i think).
        // to see why, take this second 'doLayout' call out, and see example in docs for
        // width & height, the grid will flicker as it doesn't get laid out correctly with
        // one call to doLayout()
        if (sizeChanged) {
            this.eRootPanel.doLayout();
        }
        // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
        if (sizeChanged) {
            this.rowRenderer.redrawAfterScroll();
            let event = {
                clientWidth: this.eRootPanel.getGui().clientWidth,
                clientHeight: this.eRootPanel.getGui().clientHeight
            };
            this.eventService.dispatchEvent(Events.EVENT_GRID_SIZE_CHANGED, event);
        }
    }
}
