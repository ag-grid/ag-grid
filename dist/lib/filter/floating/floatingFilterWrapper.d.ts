// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../../entities/column";
import { Component } from "../../widgets/component";
export declare class FloatingFilterWrapper extends Component {
    private static filterToFloatingFilterNames;
    private static TEMPLATE;
    private columnHoverService;
    private eventService;
    private beans;
    private gridOptionsWrapper;
    private userComponentFactory;
    private gridApi;
    private columnApi;
    private filterManager;
    private menuFactory;
    private eFloatingFilterBody;
    private eButtonWrapper;
    private eButtonShowMainFilter;
    private readonly column;
    private suppressFilterButton;
    private floatingFilterCompPromise;
    constructor(column: Column);
    private postConstruct;
    private setupFloatingFilter;
    private setupLeftPositioning;
    private setupSyncWithFilter;
    private showParentFilter;
    private setupColumnHover;
    private onColumnHover;
    private setupWidth;
    private onColumnWidthChanged;
    private setupWithFloatingFilter;
    private parentFilterInstance;
    private getFloatingFilterInstance;
    private createDynamicParams;
    private getFilterComponentPrototype;
    private setupEmpty;
    private currentParentModel;
    private onParentModelChanged;
    private onFloatingFilterChanged;
}
