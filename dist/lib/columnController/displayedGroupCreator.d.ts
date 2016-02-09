// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import ColumnUtils from "./columnUtils";
import Column from "../entities/column";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import GroupInstanceIdCreator from "./groupInstanceIdCreator";
import { ColumnGroupChild } from "../entities/columnGroupChild";
export default class DisplayedGroupCreator {
    private columnUtils;
    init(columnUtils: ColumnUtils): void;
    createDisplayedGroups(sortedVisibleColumns: Column[], balancedColumnTree: OriginalColumnGroupChild[], groupInstanceIdCreator: GroupInstanceIdCreator): ColumnGroupChild[];
    private createFakePath(balancedColumnTree);
    private getOriginalPathForColumn(balancedColumnTree, column);
}
