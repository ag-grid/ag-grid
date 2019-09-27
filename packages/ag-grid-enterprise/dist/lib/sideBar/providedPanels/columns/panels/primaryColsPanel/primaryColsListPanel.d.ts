// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community/main";
import { BaseColumnItem } from "./primaryColsPanel";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";
export declare type ColumnItem = BaseColumnItem & Component;
export declare class PrimaryColsListPanel extends Component {
    private gridOptionsWrapper;
    private columnController;
    private globalEventService;
    private columnApi;
    private allowDragging;
    private params;
    private columnTree;
    private columnComps;
    private filterText;
    private expandGroupsByDefault;
    static TEMPLATE: string;
    constructor();
    init(params: ToolPanelColumnCompParams, allowDragging: boolean): void;
    onColumnsChanged(): void;
    private destroyColumnComps;
    private recursivelyAddGroupComps;
    onGroupExpanded(): void;
    private fireExpandedEvent;
    private recursivelyAddColumnComps;
    private recursivelyAddComps;
    destroy(): void;
    doSetExpandedAll(value: boolean): void;
    setFilterText(filterText: string): void;
    private updateVisibilityOfRows;
    private createFilterResults;
    private recursivelySetVisibility;
    doSetSelectedAll(checked: boolean): void;
}
