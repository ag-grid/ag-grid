// ag-grid-enterprise v18.0.1
import { Component } from "ag-grid/main";
import { BaseColumnItem } from "./columnSelectComp";
export declare type ColumnItem = BaseColumnItem & Component;
export declare class ColumnContainerComp extends Component {
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
    private destroyColumnComps();
    private recursivelyAddGroupComps(columnGroup, dept, groupsExist);
    onGroupExpanded(): void;
    private fireExpandedEvent();
    private recursivelyAddColumnComps(column, dept, groupsExist);
    private recursivelyAddComps(tree, dept, groupsExist);
    destroy(): void;
    doSetExpandedAll(value: boolean): void;
    setFilterText(filterText: string): void;
    private updateVisibilityOfRows();
    private createFilterResults();
    private recursivelySetVisibility(columnTree, parentGroupsOpen, filterResults);
    doSetSelectedAll(checked: boolean): void;
}
