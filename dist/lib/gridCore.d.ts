// Type definitions for ag-grid-community v21.1.1
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
    loggerFactory: LoggerFactory;
    private columnApi;
    private gridApi;
    private clipboardService;
    private gridPanel;
    private sideBarComp;
    private eRootWrapperBody;
    private doingVirtualPaging;
    private logger;
    init(): void;
    private onGridSizeChanged;
    private addRtlSupport;
    getRootGui(): HTMLElement;
    isSideBarVisible(): boolean;
    setSideBarVisible(show: boolean): void;
    closeToolPanel(): void;
    getSideBar(): SideBarDef;
    refreshSideBar(): void;
    setSideBar(def: SideBarDef | string | boolean): void;
    getOpenedToolPanel(): string;
    openToolPanel(key: string): void;
    isToolPanelShowing(): boolean;
    destroy(): void;
    ensureNodeVisible(comparator: any, position?: string): void;
}
