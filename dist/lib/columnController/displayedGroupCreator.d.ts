// Type definitions for ag-grid v5.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { GroupInstanceIdCreator } from "./groupInstanceIdCreator";
import { ColumnGroupChild } from "../entities/columnGroupChild";
export declare class DisplayedGroupCreator {
    private columnUtils;
    createDisplayedGroups(sortedVisibleColumns: Column[], balancedColumnTree: OriginalColumnGroupChild[], groupInstanceIdCreator: GroupInstanceIdCreator): ColumnGroupChild[];
    private createFakePath(balancedColumnTree);
    private getOriginalPathForColumn(balancedColumnTree, column);
}
