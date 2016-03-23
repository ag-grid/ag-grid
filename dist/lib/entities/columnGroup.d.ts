// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnGroupChild } from "./columnGroupChild";
import { ColGroupDef } from "./colDef";
import { Column } from "./column";
import { AbstractColDef } from "./colDef";
import { OriginalColumnGroup } from "./originalColumnGroup";
export declare class ColumnGroup implements ColumnGroupChild {
    static HEADER_GROUP_SHOW_OPEN: string;
    static HEADER_GROUP_SHOW_CLOSED: string;
    private children;
    private displayedChildren;
    private groupId;
    private instanceId;
    private originalColumnGroup;
    constructor(originalColumnGroup: OriginalColumnGroup, groupId: string, instanceId: number);
    getHeaderName(): string;
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
    isExpandable(): boolean;
    isExpanded(): boolean;
    setExpanded(expanded: boolean): void;
    private addDisplayedLeafColumns(leafColumns);
    private addLeafColumns(leafColumns);
    getChildren(): ColumnGroupChild[];
    getColumnGroupShow(): string;
    calculateDisplayedColumns(): void;
}
