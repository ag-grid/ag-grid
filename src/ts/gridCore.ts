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
import {Events} from "./events";
import {Utils as _} from "./utils";
import {Autowired, Bean, Context, Optional, PostConstruct, PreDestroy, Qualifier} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {FocusedCellController} from "./focusedCellController";
import {Component} from "./widgets/component";
import {ICompFactory} from "./interfaces/iCompFactory";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {PaginationComp} from "./rowModels/pagination/paginationComp";
import {GridApi} from "./gridApi";
import {IToolPanel} from "./interfaces/iToolPanel";

@Bean('gridCore')
export class GridCore {

    private static TEMPLATE = '<div class="ag-root-wrapper"></div>';

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

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @Optional('rowGroupCompFactory') private rowGroupCompFactory: ICompFactory;
    @Optional('pivotCompFactory') private pivotCompFactory: ICompFactory;
    @Optional('toolPanelComp') private toolPanelComp: IToolPanel;
    @Optional('statusBar') private statusBar: Component;

    private rowGroupComp: Component;
    private pivotComp: Component;

    private finished: boolean;
    private doingVirtualPaging: boolean;

    private eGridWrapper: HTMLElement;

    private logger: Logger;

    private destroyFunctions: Function[] = [];

    constructor(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('GridCore');
    }

    @PostConstruct
    public init(): void {

        let eSouthPanel = this.createSouthPanel();

        let eColumnDropZone = this.createNorthPanel();

        this.eGridWrapper = _.loadTemplate(GridCore.TEMPLATE);

        if (eColumnDropZone) {
            this.eGridWrapper.appendChild(eColumnDropZone);
        }

        let eCenter = _.loadTemplate(`<div class="ag-root-wrapper-body"></div>`);
        eCenter.appendChild(this.gridPanel.getGui());
        if (this.toolPanelComp) {
            eCenter.appendChild(this.toolPanelComp.getGui());
        }

        this.eGridWrapper.appendChild(eCenter);

        if (eSouthPanel) {
            this.eGridWrapper.appendChild(eSouthPanel);
        }

        // parts of the CSS need to know if we are in 'for print' mode or not,
        // so we add a class to allow applying CSS based on this.
        if (this.gridOptionsWrapper.isAutoHeight()) {
            _.addCssClass(this.eGridWrapper, 'ag-layout-auto-height');
        } else {
            _.addCssClass(this.eGridWrapper, 'ag-layout-normal');
            // kept to limit breaking changes, ag-scrolls was renamed to ag-layout-normal
            _.addCssClass(this.eGridWrapper, 'ag-scrolls');
        }

        // see what the grid options are for default of toolbar
        this.showToolPanel(this.gridOptionsWrapper.isShowToolPanel());

        this.eGridDiv.appendChild(this.eGridWrapper);

        // if using angular, watch for quickFilter changes
        if (this.$scope) {
            let quickFilterUnregisterFn = this.$scope.$watch(this.quickFilterOnScope, (newFilter: any) => this.filterManager.setQuickFilter(newFilter) );
            this.destroyFunctions.push(quickFilterUnregisterFn);
        }

        this.addWindowResizeListener();

        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();

        this.finished = false;
        this.periodicallyDoLayout();

        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));

        this.onRowGroupChanged();

        this.logger.log('ready');
    }

    private addRtlSupport(): void {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            _.addCssClass(this.eGridWrapper, 'ag-rtl');
        } else {
            _.addCssClass(this.eGridWrapper, 'ag-ltr');
        }
    }

    private createNorthPanel(): HTMLElement {

        if (!this.gridOptionsWrapper.isEnterprise()) {
            return null;
        }

        let topPanelGui = document.createElement('div');

        let dropPanelVisibleListener = this.onDropPanelVisible.bind(this);

        this.rowGroupComp = this.rowGroupCompFactory.create();
        this.pivotComp = this.pivotCompFactory.create();

        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());

        this.rowGroupComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);

        this.destroyFunctions.push(() => {
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

    public getRootGui(): HTMLElement {
        return this.eGridWrapper;
    }

    private createSouthPanel(): HTMLElement {

        if (!this.statusBar && this.gridOptionsWrapper.isEnableStatusBar()) {
            console.warn('ag-Grid: status bar is only available in ag-Grid-Enterprise');
        }

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
            this.destroyFunctions.push(paginationComp.destroy.bind(paginationComp));
        }

        return eSouthPanel;
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

    private addWindowResizeListener(): void {
        let eventListener = this.gridPanel.checkViewportSize.bind(this.gridPanel);
        window.addEventListener('resize', eventListener);
        this.destroyFunctions.push(() => window.removeEventListener('resize', eventListener));
    }

    private periodicallyDoLayout() {
        if (!this.finished) {
            let intervalMillis = this.gridOptionsWrapper.getLayoutInterval();
            // if interval is negative, this stops the layout from happening
            if (intervalMillis > 0) {
                this.frameworkFactory.setTimeout(() => {
                        this.gridPanel.checkViewportSize();
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

        this.gridPanel.checkViewportSize();
    }

    public isToolPanelShowing() {
        return this.toolPanelComp.isToolPanelShowing();
    }

    @PreDestroy
    private destroy() {
        this.finished = true;

        this.eGridDiv.removeChild(this.eGridWrapper);
        this.logger.log('Grid DOM removed');

        this.destroyFunctions.forEach(func => func());
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
