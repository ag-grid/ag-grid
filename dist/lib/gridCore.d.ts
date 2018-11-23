// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { LoggerFactory } from "./logger";
import { Component } from "./widgets/component";
import { SideBarDef } from "./entities/sideBar";
export declare class GridCore extends Component {
    private static TEMPLATE_NORMAL;
    private static TEMPLATE_ENTERPRISE;
    private enterprise;
    private gridOptions;
    private gridOptionsWrapper;
    private rowModel;
    private frameworkFactory;
    private resizeObserverService;
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
    private gridPanel;
    private sideBarComp;
    private eRootWrapperBody;
    private finished;
    private doingVirtualPaging;
    private logger;
    constructor();
    init(): void;
    private onGridSizeChanged;
    getPreferredWidth(): number;
    private addRtlSupport;
    getRootGui(): HTMLElement;
    isSideBarVisible(): boolean;
    setSideBarVisible(show: boolean): void;
    closeToolPanel(): void;
    getSideBar(): SideBarDef;
    setSideBar(def: SideBarDef | string | boolean): void;
    getOpenedToolPanel(): string;
    openToolPanel(key: string): void;
    isToolPanelShowing(): boolean;
    destroy(): void;
    ensureNodeVisible(comparator: any, position?: string): void;
}
//# sourceMappingURL=gridCore.d.ts.map