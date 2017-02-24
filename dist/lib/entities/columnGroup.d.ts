// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnGroupChild } from "./columnGroupChild";
import { ColGroupDef } from "./colDef";
import { Column } from "./column";
import { AbstractColDef } from "./colDef";
import { OriginalColumnGroup } from "./originalColumnGroup";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
export declare class ColumnGroup implements ColumnGroupChild {
    static HEADER_GROUP_SHOW_OPEN: string;
    static HEADER_GROUP_SHOW_CLOSED: string;
    static EVENT_LEFT_CHANGED: string;
    static EVENT_DISPLAYED_CHILDREN_CHANGED: string;
    static createUniqueId(groupId: string, instanceId: number): string;
    gridOptionsWrapper: GridOptionsWrapper;
    private children;
    private displayedChildren;
    private groupId;
    private instanceId;
    private originalColumnGroup;
    private left;
    private oldLeft;
    private localEventService;
    private parent;
    constructor(originalColumnGroup: OriginalColumnGroup, groupId: string, instanceId: number);
    reset(): void;
    getParent(): ColumnGroupChild;
    setParent(parent: ColumnGroupChild): void;
    getUniqueId(): string;
    checkLeft(): void;
    getLeft(): number;
    getOldLeft(): number;
    setLeft(left: number): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    getGroupId(): string;
    getInstanceId(): number;
    isChildInThisGroupDeepSearch(wantedChild: ColumnGroupChild): boolean;
    getActualWidth(): number;
    getMinWidth(): number;
    addChild(child: ColumnGroupChild): void;
    getDisplayedChildren(): ColumnGroupChild[];
    getLeafColumns(): Column[];
    getDisplayedLeafColumns(): Column[];
    getDefinition(): AbstractColDef;
    getColGroupDef(): ColGroupDef;
    isPadding(): boolean;
    isExpandable(): boolean;
    isExpanded(): boolean;
    setExpanded(expanded: boolean): void;
    private addDisplayedLeafColumns(leafColumns);
    private addLeafColumns(leafColumns);
    getChildren(): ColumnGroupChild[];
    getColumnGroupShow(): string;
    getOriginalColumnGroup(): OriginalColumnGroup;
    calculateDisplayedColumns(): void;
}
