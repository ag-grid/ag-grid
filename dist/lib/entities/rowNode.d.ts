// Type definitions for ag-grid v5.4.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColDef } from "./colDef";
import { Column } from "./column";
export declare class RowNode {
    static EVENT_ROW_SELECTED: string;
    static EVENT_DATA_CHANGED: string;
    static EVENT_CELL_CHANGED: string;
    static EVENT_MOUSE_ENTER: string;
    static EVENT_MOUSE_LEAVE: string;
    private mainEventService;
    private gridOptionsWrapper;
    private selectionController;
    private columnController;
    private valueService;
    private rowModel;
    /** Unique ID for the node. Either provided by the grid, or user can set to match the primary
     * key in the database (or whatever data source is used). */
    id: string;
    /** The user provided data */
    data: any;
    /** The parent node to this node, or empty if top level */
    parent: RowNode;
    /** How many levels this node is from the top */
    level: number;
    /** True if this node is a group node (ie has children) */
    group: boolean;
    /** True if this node can flower (ie can be expanded, but has no direct children) */
    canFlower: boolean;
    /** True if this node is a flower */
    flower: boolean;
    /** True if this node is a group and the group is the bottom level in the tree */
    leafGroup: boolean;
    /** True if this is the first child in this group */
    firstChild: boolean;
    /** True if this is the last child in this group */
    lastChild: boolean;
    /** The index of this node in the group */
    childIndex: number;
    /** Either 'top' or 'bottom' if floating, otherwise undefined or null */
    floating: string;
    /** If using quick filter, stores a string representation of the row for searching against */
    quickFilterAggregateText: string;
    /** Groups only - True if row is a footer. Footers  have group = true and footer = true */
    footer: boolean;
    /** Groups only - The field we are grouping on eg Country*/
    field: string;
    /** Groups only - The key for the group eg Ireland, UK, USA */
    key: any;
    /** All user provided nodes */
    allLeafChildren: RowNode[];
    /** Groups only - Children of this group */
    childrenAfterGroup: RowNode[];
    /** Groups only - Filtered children of this group */
    childrenAfterFilter: RowNode[];
    /** Groups only - Sorted children of this group */
    childrenAfterSort: RowNode[];
    /** Groups only - Number of children and grand children */
    allChildrenCount: number;
    /** Children mapped by the pivot columns */
    childrenMapped: {
        [key: string]: any;
    };
    /** Groups only - True if group is expanded, otherwise false */
    expanded: boolean;
    /** Groups only - If doing footers, reference to the footer node for this group */
    sibling: RowNode;
    /** Not to be used, internal temporary map used by the grid when creating groups */
    _childrenMap: {};
    /** The height, in pixels, of this row */
    rowHeight: number;
    /** The top pixel for this row */
    rowTop: number;
    private selected;
    private eventService;
    setData(data: any): void;
    setDataAndId(data: any, id: string): void;
    setId(id: string): void;
    private dispatchLocalEvent(eventName, event?);
    setDataValue(colKey: string | ColDef | Column, newValue: any): void;
    resetQuickFilterAggregateText(): void;
    isExpandable(): boolean;
    isSelected(): boolean;
    deptFirstSearch(callback: (rowNode: RowNode) => void): void;
    calculateSelectedFromChildren(): void;
    private calculateSelectedFromChildrenBubbleUp();
    setSelectedInitialValue(selected: boolean): void;
    setSelected(newValue: boolean, clearSelection?: boolean, tailingNodeInSequence?: boolean): void;
    setSelectedParams(params: {
        newValue: boolean;
        clearSelection?: boolean;
        tailingNodeInSequence?: boolean;
        rangeSelect?: boolean;
    }): void;
    private doRowRangeSelection();
    private isParentOfNode(potentialParent);
    private calculatedSelectedForAllGroupNodes();
    selectThisNode(newValue: boolean): void;
    private selectChildNodes(newValue);
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
}
