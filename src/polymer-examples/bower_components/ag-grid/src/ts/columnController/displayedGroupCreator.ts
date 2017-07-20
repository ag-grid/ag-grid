import {ColumnUtils} from "./columnUtils";
import {Column} from "../entities/column";
import {OriginalColumnGroupChild} from "../entities/originalColumnGroupChild";
import {GroupInstanceIdCreator} from "./groupInstanceIdCreator";
import {ColumnGroupChild} from "../entities/columnGroupChild";
import {ColumnGroup} from "../entities/columnGroup";
import {OriginalColumnGroup} from "../entities/originalColumnGroup";
import {Bean, Context} from "../context/context";
import {Utils as _} from "../utils";
import {Autowired} from "../context/context";

// takes in a list of columns, as specified by the column definitions, and returns column groups
@Bean('displayedGroupCreator')
export class DisplayedGroupCreator {

    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('context') private context: Context;

    public createDisplayedGroups(
        // all displayed columns sorted - this is the columns the grid should show
        sortedVisibleColumns: Column[],
        // the tree of columns, as provided by the users, used to know what groups columns roll up into
        balancedColumnTree: OriginalColumnGroupChild[],
        // create's unique id's for the group
        groupInstanceIdCreator: GroupInstanceIdCreator,
        // we try to reuse old groups if we can, to allow gui to do animation
        oldDisplayedGroups?: ColumnGroupChild[]): ColumnGroupChild[] {

        let result: ColumnGroupChild[] = [];

        let previousRealPath: ColumnGroup[];
        let previousOriginalPath: OriginalColumnGroup[];

        let oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups);

        // go through each column, then do a bottom up comparison to the previous column, and start
        // to share groups if they converge at any point.
        sortedVisibleColumns.forEach( (currentColumn: Column)=> {

            let currentOriginalPath = this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
            let currentRealPath: ColumnGroup[] = [];
            let firstColumn = !previousOriginalPath;

            for (let i = 0; i<currentOriginalPath.length; i++) {
                if (firstColumn || currentOriginalPath[i]!==previousOriginalPath[i]) {
                    // new group needed
                    let newGroup = this.createColumnGroup(currentOriginalPath[i], groupInstanceIdCreator, oldColumnsMapped);
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

            let noColumnGroups = currentRealPath.length===0;
            if (noColumnGroups) {
                // if we are not grouping, then the result of the above is an empty
                // path (no groups), and we just add the column to the root list.
                result.push(currentColumn);
            } else {
                let leafGroup = currentRealPath[currentRealPath.length-1];
                leafGroup.addChild(currentColumn);
            }

            previousRealPath = currentRealPath;
            previousOriginalPath = currentOriginalPath;
        });

        this.setupParentsIntoColumns(result, null);

        return result;
    }

    private createColumnGroup(originalGroup: OriginalColumnGroup,
                              groupInstanceIdCreator: GroupInstanceIdCreator,
                              oldColumnsMapped: {[key: string]: ColumnGroup}): ColumnGroup {

        let groupId = originalGroup.getGroupId();
        let instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        let uniqueId = ColumnGroup.createUniqueId(groupId, instanceId);

        let columnGroup = oldColumnsMapped[uniqueId];

        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getOriginalColumnGroup()!==originalGroup) {
            columnGroup = null;
        }

        if (_.exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        } else {
            columnGroup = new ColumnGroup(originalGroup, groupId, instanceId);
            this.context.wireBean(columnGroup);
        }

        return columnGroup;
    }

    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    private mapOldGroupsById(displayedGroups: ColumnGroupChild[]): {[uniqueId: string]: ColumnGroup} {
        let result: {[uniqueId: string]: ColumnGroup} = {};

        let recursive = (columnsOrGroups: ColumnGroupChild[])=> {
            columnsOrGroups.forEach( columnOrGroup => {
                if (columnOrGroup instanceof ColumnGroup) {
                    let columnGroup = <ColumnGroup> columnOrGroup;
                    result[columnOrGroup.getUniqueId()] = columnGroup;
                    recursive(columnGroup.getChildren());
                }
            });
        };

        if (displayedGroups) {
            recursive(displayedGroups);
        }

        return result;
    }

    private setupParentsIntoColumns(columnsOrGroups: ColumnGroupChild[], parent: ColumnGroupChild): void {
        columnsOrGroups.forEach( columnsOrGroup => {
            columnsOrGroup.setParent(parent);
            if (columnsOrGroup instanceof ColumnGroup) {
                let columnGroup = <ColumnGroup> columnsOrGroup;
                this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    }

    private createFakePath(balancedColumnTree: OriginalColumnGroupChild[]): OriginalColumnGroup[] {
        let result: OriginalColumnGroup[] = [];
        let currentChildren = balancedColumnTree;
        // this while look does search on the balanced tree, so our result is the right length
        let index = 0;
        while (currentChildren && currentChildren[0] && currentChildren[0] instanceof OriginalColumnGroup) {
            // putting in a deterministic fake id, in case the API in the future needs to reference the col
            result.push(new OriginalColumnGroup(null, 'FAKE_PATH_' + index, true));
            currentChildren = (<OriginalColumnGroup>currentChildren[0]).getChildren();
            index++;
        }
        return result;
    }

    private getOriginalPathForColumn(balancedColumnTree: OriginalColumnGroupChild[], column: Column): OriginalColumnGroup[] {

        let result: OriginalColumnGroup[] = [];
        let found = false;

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

            for (let i = 0; i<balancedColumnTree.length; i++) {
                if (found) {
                    // quit the search, so 'result' is kept with the found result
                    return;
                }
                let node = balancedColumnTree[i];
                if (node instanceof OriginalColumnGroup) {
                    let nextNode = <OriginalColumnGroup> node;
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