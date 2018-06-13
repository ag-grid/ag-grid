// Type definitions for ag-grid v18.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { LoggerFactory } from "./logger";
import { Component } from "./widgets/component";
export declare class GridCore extends Component {
    private static TEMPLATE_NORMAL;
    private static TEMPLATE_ENTERPRISE;
    private enterprise;
    private gridOptions;
    private gridOptionsWrapper;
    private rowModel;
    private frameworkFactory;
    private columnController;
    private rowRenderer;
    private filterManager;
    private eventService;
    private eGridDiv;
    private $scope;
    private quickFilterOnScope;
    private popupService;
    private focusedCellController;
    private context;
    loggerFactory: LoggerFactory;
    private columnApi;
    private gridApi;
    private rowGroupCompFactory;
    private pivotCompFactory;
    private statusBar;
    private gridPanel;
    private toolPanelComp;
    private finished;
    private doingVirtualPaging;
    private logger;
    constructor();
    init(): void;
    private addLayoutClass();
    getPreferredWidth(): number;
    private addRtlSupport();
    getRootGui(): HTMLElement;
    showToolPanel(show: any): void;
    isToolPanelShowing(): boolean;
    destroy(): void;
    ensureNodeVisible(comparator: any, position?: string): void;
}
