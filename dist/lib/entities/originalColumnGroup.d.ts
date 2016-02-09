// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { OriginalColumnGroupChild } from "./originalColumnGroupChild";
import { ColGroupDef } from "./colDef";
export declare class OriginalColumnGroup implements OriginalColumnGroupChild {
    private colGroupDef;
    private children;
    private groupId;
    private expandable;
    private expanded;
    constructor(colGroupDef: ColGroupDef, groupId: string);
    setExpanded(expanded: boolean): void;
    isExpandable(): boolean;
    isExpanded(): boolean;
    getGroupId(): string;
    setChildren(children: OriginalColumnGroupChild[]): void;
    getChildren(): OriginalColumnGroupChild[];
    getColGroupDef(): ColGroupDef;
    getColumnGroupShow(): string;
    calculateExpandable(): void;
}
