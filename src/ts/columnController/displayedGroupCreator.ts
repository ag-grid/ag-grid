import {ColumnUtils} from "./columnUtils";
import {Column} from "../entities/column";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {GroupInstanceIdCreator} from "./groupInstanceIdCreator";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnGroup} from "../entities/columnGroup";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import {Autowired} from "../context/context";

// takes in a list of columns, as specified by the column definitions, and returns column groups
@Bean('displayedGroupCreator')
export class DisplayedGroupCreator {

    @Autowired('columnUtils') private columnUtils: ColumnUtils;

    public createDisplayedGroups(sortedVisibleColumns: Column[],
                                 balancedColumnTree: OriginalColumnGroupChild[],
                                 groupInstanceIdCreator: GroupInstanceIdCreator): ColumnGroupChild[] {

        var result: ColumnGroupChild[] = [];

        var previousRealPath: ColumnGroup[];
        var previousOriginalPath: OriginalColumnGroup[];

        // go through each column, then do a bottom up comparison to the previous column, and start
        // to share groups if they converge at any point.
        sortedVisibleColumns.forEach( (currentColumn: Column)=> {

            var currentOriginalPath = this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
            var currentRealPath: ColumnGroup[] = [];
            var firstColumn = !previousOriginalPath;

            for (var i = 0; i<currentOriginalPath.length; i++) {
                if (firstColumn || currentOriginalPath[i]!==previousOriginalPath[i]) {
                    // new group needed
                    var originalGroup = currentOriginalPath[i];
                    var groupId = originalGroup.getGroupId();
                    var instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
                    var newGroup = new ColumnGroup(originalGroup, groupId, instanceId);
                    currentRealPath[i] = newGroup;
                    // if top level, add to result, otherwise add to parent
                    if (i==0) {
                        result.push(newGroup);
                    } else {
                        currentRealPath[i-1].addChild(newGroup);
                    }
                } else {
                    // reuse old group
                    currentRealPath[i] = previousRealPath[i];
                }
            }

            var noColumnGroups = currentRealPath.length===0;
            if (noColumnGroups) {
                // if we are not grouping, then the result of the above is an empty
                // path (no groups), and we just add the column to the root list.
                result.push(currentColumn);
            } else {
                var leafGroup = currentRealPath[currentRealPath.length-1];
                leafGroup.addChild(currentColumn);
            }

            previousRealPath = currentRealPath;
            previousOriginalPath = currentOriginalPath;
        });

        return result;
    }

    private createFakePath(balancedColumnTree: OriginalColumnGroupChild[]): OriginalColumnGroup[] {
        var result: OriginalColumnGroup[] = [];
        var currentChildren = balancedColumnTree;
        // this while look does search on the balanced tree, so our result is the right length
        var index = 0;
        while (currentChildren && currentChildren[0] && currentChildren[0] instanceof OriginalColumnGroup) {
            // putting in a deterministic fake id, in case the API in the future needs to reference the col
            result.push(new OriginalColumnGroup(null, 'FAKE_PATH_' + index));
            currentChildren = (<OriginalColumnGroup>currentChildren[0]).getChildren();
            index++;
        }
        return result;
    }

    private getOriginalPathForColumn(balancedColumnTree: OriginalColumnGroupChild[], column: Column): OriginalColumnGroup[] {

        var result: OriginalColumnGroup[] = [];
        var found = false;

        recursePath(balancedColumnTree, 0);

        // it's possible we didn't find a path. this happens if the column is generated
        // by the grid, in that the definition didn't come from the client. in this case,
        // we create a fake original path.
        if (found) {
            return result;
        } else {
            return this.createFakePath(balancedColumnTree);
        }

        function recursePath(balancedColumnTree: OriginalColumnGroupChild[], dept: number): void {

            for (var i = 0; i<balancedColumnTree.length; i++) {
                if (found) {
                    // quit the search, so 'result' is kept with the found result
                    return;
                }
                var node = balancedColumnTree[i];
                if (node instanceof OriginalColumnGroup) {
                    var nextNode = <OriginalColumnGroup> node;
                    recursePath(nextNode.getChildren(), dept+1);
                    result[dept] = node;
                } else {
                    if (node === column) {
                        found = true;
                    }
                }
            }
        }
    }
}