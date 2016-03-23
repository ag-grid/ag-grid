// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { EventService } from "../eventService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { SelectionController } from "../selectionController";
export declare class RowNode {
    static EVENT_ROW_SELECTED: string;
    /** Unique ID for the node. Can be thought of as the index of the row in the original list. */
    id: number;
    /** The user provided data */
    data: any;
    /** The parent node to this node, or empty if top level */
    parent: RowNode;
    /** How many levels this node is from the top */
    level: number;
    /** True if this node is a group node (ie has children) */
    group: boolean;
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
    /** Groups only - Children of this group */
    children: RowNode[];
    /** Groups only - The field we are grouping on eg Country*/
    field: string;
    /** Groups only - The key for the group eg Ireland, UK, USA */
    key: any;
    /** Groups only - Filtered children of this group */
    childrenAfterFilter: RowNode[];
    /** Groups only - Sorted children of this group */
    childrenAfterSort: RowNode[];
    /** Groups only - Number of children and grand children */
    allChildrenCount: number;
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
    private mainEventService;
    private gridOptionsWrapper;
    private selectionController;
    constructor(mainEventService: EventService, gridOptionsWrapper: GridOptionsWrapper, selectionController: SelectionController);
    resetQuickFilterAggregateText(): void;
    isSelected(): boolean;
    deptFirstSearch(callback: (rowNode: RowNode) => void): void;
    calculateSelectedFromChildren(): void;
    private calculateSelectedFromChildrenBubbleUp();
    setSelectedInitialValue(selected: boolean): void;
    /** Returns true if this row is selected */
    setSelected(newValue: boolean, clearSelection?: boolean, tailingNodeInSequence?: boolean): void;
    selectThisNode(newValue: boolean): void;
    private selectChildNodes(newValue);
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
}
