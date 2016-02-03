// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { OriginalColumnGroupChild } from "./originalColumnGroupChild";
import { ColGroupDef } from "./colDef";
export declare class OriginalColumnGroup implements OriginalColumnGroupChild {
    private colGroupDef;
    private children;
    private groupId;
    constructor(colGroupDef: ColGroupDef, groupId: string);
    getGroupId(): string;
    setChildren(children: OriginalColumnGroupChild[]): void;
    getChildren(): OriginalColumnGroupChild[];
    getColGroupDef(): ColGroupDef;
}
