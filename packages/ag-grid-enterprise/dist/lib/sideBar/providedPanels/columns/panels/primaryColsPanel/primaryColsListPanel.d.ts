// ag-grid-enterprise v19.1.3
import { Component } from "ag-grid-community/main";
import { BaseColumnItem } from "./primaryColsPanel";
export declare type ColumnItem = BaseColumnItem & Component;
export declare class PrimaryColsListPanel extends Component {
    private gridOptionsWrapper;
    private columnController;
    private globalEventService;
    private context;
    private props;
    private columnTree;
    private columnComps;
    private filterText;
    private expandGroupsByDefault;
    static TEMPLATE: string;
    constructor();
    init(): void;
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
//# sourceMappingURL=primaryColsListPanel.d.ts.map