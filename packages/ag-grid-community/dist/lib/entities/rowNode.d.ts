// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgEvent } from "../events";
import { Column } from "./column";
import { RowNodeCache, RowNodeCacheParams } from "../rowModels/cache/rowNodeCache";
import { RowNodeBlock } from "../rowModels/cache/rowNodeBlock";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { DetailGridInfo } from "../gridApi";
export interface SetSelectedParams {
    newValue: boolean;
    clearSelection?: boolean;
    suppressFinishActions?: boolean;
    rangeSelect?: boolean;
    groupSelectsFiltered?: boolean;
}
export interface RowNodeEvent extends AgEvent {
    node: RowNode;
}
export interface DataChangedEvent extends RowNodeEvent {
    oldData: any;
    newData: any;
    update: boolean;
}
export interface CellChangedEvent extends RowNodeEvent {
    column: Column;
    newValue: any;
}
export declare class RowNode implements IEventEmitter {
    private static OBJECT_ID_SEQUENCE;
    static EVENT_ROW_SELECTED: string;
    static EVENT_DATA_CHANGED: string;
    static EVENT_CELL_CHANGED: string;
    static EVENT_ALL_CHILDREN_COUNT_CHANGED: string;
    static EVENT_MOUSE_ENTER: string;
    static EVENT_MOUSE_LEAVE: string;
    static EVENT_HEIGHT_CHANGED: string;
    static EVENT_TOP_CHANGED: string;
    static EVENT_FIRST_CHILD_CHANGED: string;
    static EVENT_LAST_CHILD_CHANGED: string;
    static EVENT_CHILD_INDEX_CHANGED: string;
    static EVENT_ROW_INDEX_CHANGED: string;
    static EVENT_EXPANDED_CHANGED: string;
    static EVENT_SELECTABLE_CHANGED: string;
    static EVENT_UI_LEVEL_CHANGED: string;
    static EVENT_DRAGGING_CHANGED: string;
    private mainEventService;
    private gridOptionsWrapper;
    private selectionController;
    private columnController;
    private valueService;
    private rowModel;
    private context;
    private valueCache;
    private columnApi;
    private gridApi;
    /** Unique ID for the node. Either provided by the grid, or user can set to match the primary
     * key in the database (or whatever data source is used). */
    id: string;
    /** The group data */
    groupData: any;
    /** The aggregated data */
    aggData: any;
    /** The user provided data */
    data: any;
    /** The parent node to this node, or empty if top level */
    parent: RowNode | null;
    /** How many levels this node is from the top */
    level: number;
    /** How many levels this node is from the top in the UI (different to the level when removing parents)*/
    uiLevel: number;
    /** If doing in memory grouping, this is the index of the group column this cell is for.
     * This will always be the same as the level, unless we are collapsing groups ie groupRemoveSingleChildren = true */
    rowGroupIndex: number | null;
    /** True if this node is a group node (ie has children) */
    group: boolean | undefined;
    /** True if this row is getting dragged */
    dragging: boolean;
    /** True if this row is a master row, part of master / detail (ie row can be expanded to show detail) */
    master: boolean;
    /** True if this row is a detail row, part of master / detail (ie child row of an expanded master row)*/
    detail: boolean;
    /** If this row is a master row that was expanded, this points to the associated detail row. */
    detailNode: RowNode;
    /** If master detail, this contains details about the detail grid */
    detailGridInfo: DetailGridInfo | null;
    /** Same as master, kept for legacy reasons */
    canFlower: boolean;
    /** Same as detail, kept for legacy reasons */
    flower: boolean;
    /** Same as detailNode, kept for legacy reasons */
    childFlower: RowNode;
    /** True if this node is a group and the group is the bottom level in the tree */
    leafGroup: boolean;
    /** True if this is the first child in this group */
    firstChild: boolean;
    /** True if this is the last child in this group */
    lastChild: boolean;
    /** The index of this node in the group */
    childIndex: number;
    /** The index of this node in the grid, only valid if node is displayed in the grid, otherwise it should be ignored as old index may be present */
    rowIndex: number;
    /** Either 'top' or 'bottom' if row pinned, otherwise undefined or null */
    rowPinned: string;
    /** If using quick filter, stores a string representation of the row for searching against */
    quickFilterAggregateText: string;
    /** Groups only - True if row is a footer. Footers  have group = true and footer = true */
    footer: boolean;
    /** Groups only - The field we are grouping on eg Country*/
    field: string | null;
    /** Groups only - the row group column for this group */
    rowGroupColumn: Column | null;
    /** Groups only - The key for the group eg Ireland, UK, USA */
    key: any;
    /** Used by server side row model, true if this row node is a stub */
    stub: boolean;
    /** All user provided nodes */
    allLeafChildren: RowNode[];
    /** Groups only - Children of this group */
    childrenAfterGroup: RowNode[];
    /** Groups only - Filtered children of this group */
    childrenAfterFilter: RowNode[];
    /** Groups only - Sorted children of this group */
    childrenAfterSort: RowNode[];
    /** Groups only - Number of children and grand children */
    allChildrenCount: number | null;
    /** Children mapped by the pivot columns */
    childrenMapped: {
        [key: string]: any;
    } | null;
    /** Server Side Row Model Only - the children are in an infinite cache */
    childrenCache: RowNodeCache<RowNodeBlock, RowNodeCacheParams> | null;
    /** Groups only - True if group is expanded, otherwise false */
    expanded: boolean;
    /** Groups only - If doing footers, reference to the footer node for this group */
    sibling: RowNode;
    /** The height, in pixels, of this row */
    rowHeight: number;
    /** Dynamic row heights are done on demand, only when row is visible. However for row virtualisation
     * we need a row height to do the 'what rows are in viewport' maths. So we assign a row height to each
     * row based on defaults and rowHeightEstimated=true, then when the row is needed for drawing we do
     * the row height calculation and set rowHeightEstimated=false.*/
    rowHeightEstimated: boolean;
    /** The top pixel for this row */
    rowTop: number;
    /** The top pixel for this row last time, makes sense if data set was ordered or filtered,
     * it is used so new rows can animate in from their old position. */
    oldRowTop: number;
    /** True if this node is a daemon. This means row is not part of the model. Can happen when then
     * the row is selected and then the user sets a different ID onto the node. The nodes is then
     * representing a different entity, so the selection controller, if the node is selected, takes
     * a copy where daemon=true. */
    daemon: boolean;
    /** True by default - can be overridden via gridOptions.isRowSelectable(rowNode) */
    selectable: boolean;
    /** Used by the value service, stores values for a particular change detection turn. */
    __cacheData: {
        [colId: string]: any;
    };
    __cacheVersion: number;
    /** Used by sorting service - to give deterministic sort to groups. Previously we
     * just id for this, however id is a string and had slower sorting compared to numbers. */
    __objectId: number;
    /** True when nodes with the same id are being removed and added as part of the same batch transaction */
    alreadyRendered: boolean;
    private selected;
    private eventService;
    setData(data: any): void;
    private updateDataOnDetailNode;
    private createDataChangedEvent;
    private createLocalRowEvent;
    updateData(data: any): void;
    getRowIndexString(): string;
    private createDaemonNode;
    setDataAndId(data: any, id: string | undefined): void;
    private checkRowSelectable;
    setRowSelectable(newVal: boolean): void;
    setId(id: string): void;
    isPixelInRange(pixel: number): boolean;
    clearRowTop(): void;
    setFirstChild(firstChild: boolean): void;
    setLastChild(lastChild: boolean): void;
    setChildIndex(childIndex: number): void;
    setRowTop(rowTop: number | null): void;
    setDragging(dragging: boolean): void;
    setAllChildrenCount(allChildrenCount: number | null): void;
    setRowHeight(rowHeight: number | undefined | null, estimated?: boolean): void;
    setRowIndex(rowIndex: number): void;
    setUiLevel(uiLevel: number): void;
    setExpanded(expanded: boolean): void;
    private createGlobalRowEvent;
    private dispatchLocalEvent;
    setDataValue(colKey: string | Column, newValue: any): void;
    setGroupValue(colKey: string | Column, newValue: any): void;
    setAggData(newAggData: any): void;
    hasChildren(): boolean;
    isEmptyRowGroupNode(): boolean;
    private dispatchCellChangedEvent;
    resetQuickFilterAggregateText(): void;
    isExpandable(): boolean;
    isSelected(): boolean;
    depthFirstSearch(callback: (rowNode: RowNode) => void): void;
    calculateSelectedFromChildren(): void;
    setSelectedInitialValue(selected: boolean): void;
    setSelected(newValue: boolean, clearSelection?: boolean, suppressFinishActions?: boolean): void;
    isRowPinned(): boolean;
    setSelectedParams(params: SetSelectedParams): number;
    private doRowRangeSelection;
    isParentOfNode(potentialParent: RowNode): boolean;
    selectThisNode(newValue: boolean): boolean;
    private selectChildNodes;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    getFirstChildOfFirstChild(rowGroupColumn: Column | null): RowNode;
}
