// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ColumnGroupChild } from "./columnGroupChild";
import { ColGroupDef } from "./colDef";
import Column from "./column";
import { AbstractColDef } from "./colDef";
export default class ColumnGroup implements ColumnGroupChild {
    private children;
    private displayedChildren;
    private groupId;
    private instanceId;
    private expandable;
    private expanded;
    private colGroupDef;
    constructor(colGroupDef: ColGroupDef, groupId: string, instanceId: number);
    getHeaderName(): string;
    getGroupId(): string;
    getInstanceId(): number;
    setExpanded(expanded: boolean): void;
    isExpandable(): boolean;
    isExpanded(): boolean;
    getColGroupDef(): ColGroupDef;
    isChildInThisGroupDeepSearch(wantedChild: ColumnGroupChild): boolean;
    getActualWidth(): number;
    getMinimumWidth(): number;
    addChild(child: ColumnGroupChild): void;
    getDisplayedChildren(): ColumnGroupChild[];
    getDisplayedLeafColumns(): Column[];
    getDefinition(): AbstractColDef;
    private addDisplayedLeafColumns(leafColumns);
    getChildren(): ColumnGroupChild[];
    getColumnGroupShow(): string;
    calculateExpandable(): void;
    calculateDisplayedColumns(): void;
}
