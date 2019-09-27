// ag-grid-enterprise v21.2.2
import { Component, IToolPanelComp, IToolPanelParams } from "ag-grid-community/main";
export interface ToolPanelColumnCompParams extends IToolPanelParams {
    suppressRowGroups: boolean;
    suppressValues: boolean;
    suppressPivots: boolean;
    suppressPivotMode: boolean;
    suppressSideButtons: boolean;
    suppressColumnFilter: boolean;
    suppressColumnSelectAll: boolean;
    suppressColumnExpandAll: boolean;
    contractColumnSelection: boolean;
}
export declare class ColumnToolPanel extends Component implements IToolPanelComp {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private gridApi;
    private eventService;
    private initialised;
    private params;
    private childDestroyFuncs;
    constructor();
    setVisible(visible: boolean): void;
    init(params: ToolPanelColumnCompParams): void;
    private addComponent;
    destroyChildren(): void;
    refresh(): void;
    destroy(): void;
}
