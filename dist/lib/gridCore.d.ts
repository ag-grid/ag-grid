// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from "./logger";
export declare class GridCore {
    private gridOptions;
    private gridOptionsWrapper;
    private paginationController;
    private rowModel;
    private columnController;
    private rowRenderer;
    private filterManager;
    private eventService;
    private gridPanel;
    private eGridDiv;
    private $scope;
    private quickFilterOnScope;
    private popupService;
    private focusedCellController;
    private rowGroupCompFactory;
    private pivotCompFactory;
    private toolPanel;
    private statusBar;
    private rowGroupComp;
    private pivotComp;
    private finished;
    private doingVirtualPaging;
    private eRootPanel;
    private toolPanelShowing;
    private logger;
    private destroyFunctions;
    constructor(loggerFactory: LoggerFactory);
    init(): void;
    private createNorthPanel();
    private onDropPanelVisible();
    getRootGui(): HTMLElement;
    private createSouthPanel();
    private onRowGroupChanged();
    private addWindowResizeListener();
    private periodicallyDoLayout();
    showToolPanel(show: any): void;
    isToolPanelShowing(): boolean;
    private destroy();
    ensureNodeVisible(comparator: any): void;
    doLayout(): void;
}
