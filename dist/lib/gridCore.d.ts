// Type definitions for ag-grid v4.2.5
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
    private toolPanel;
    private statusBar;
    private rowGroupComp;
    private finished;
    private doingVirtualPaging;
    private eRootPanel;
    private toolPanelShowing;
    private windowResizeListener;
    private logger;
    constructor(loggerFactory: LoggerFactory);
    init(): void;
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
