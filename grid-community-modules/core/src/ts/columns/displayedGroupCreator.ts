import { Column, ColumnPinnedType } from "../entities/column";
import { IProvidedColumn } from "../interfaces/iProvidedColumn";
import { GroupInstanceIdCreator } from "./groupInstanceIdCreator";
import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { ColumnGroup } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { last } from "../utils/array";
import { exists } from "../utils/generic";

// takes in a list of columns, as specified by the column definitions, and returns column groups
@Bean('displayedGroupCreator')
export class DisplayedGroupCreator extends BeanStub {

    public createDisplayedGroups(
        // all displayed columns sorted - this is the columns the grid should show
        sortedVisibleColumns: Column[],
        // the tree of columns, as provided by the users, used to know what groups columns roll up into
        balancedColumnTree: IProvidedColumn[],
        // creates unique id's for the group
        groupInstanceIdCreator: GroupInstanceIdCreator,
        // whether it's left, right or center col
        pinned: ColumnPinnedType,
        // we try to reuse old groups if we can, to allow gui to do animation
        oldDisplayedGroups?: IHeaderColumn[]): IHeaderColumn[] {

        const result: IHeaderColumn[] = [];

        let previousRealPath: ColumnGroup[];
        let previousOriginalPath: ProvidedColumnGroup[];

        const oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups!);

        // go through each column, then do a bottom up comparison to the previous column, and start
        // to share groups if they converge at any point.
        sortedVisibleColumns.forEach((currentColumn: Column) => {

            const currentOriginalPath = this.getOriginalPathForColumn(balancedColumnTree, currentColumn)!;
            const currentRealPath: ColumnGroup[] = [];
            const firstColumn = !previousOriginalPath;

            for (let i = 0; i < currentOriginalPath.length; i++) {
                if (firstColumn || currentOriginalPath[i] !== previousOriginalPath[i]) {
                    // new group needed
                    const newGroup = this.createColumnGroup(
                        currentOriginalPath[i],
                        groupInstanceIdCreator,
                        oldColumnsMapped,
                        pinned);

                    currentRealPath[i] = newGroup;
                    // if top level, add to result, otherwise add to parent
                    if (i == 0) {
                        result.push(newGroup);
                    } else {
                        currentRealPath[i - 1].addChild(newGroup);
                    }
                } else {
                    // reuse old group
                    currentRealPath[i] = previousRealPath[i];
                }
            }

            const noColumnGroups = currentRealPath.length === 0;
            if (noColumnGroups) {
                // if we are not grouping, then the result of the above is an empty
                // path (no groups), and we just add the column to the root list.
                result.push(currentColumn);
            } else {
                const leafGroup = last(currentRealPath);
                leafGroup.addChild(currentColumn);
            }

            previousRealPath = currentRealPath;
            previousOriginalPath = currentOriginalPath;
        });

        this.setupParentsIntoColumns(result, null);

        return result;
    }

    private createColumnGroup(
            providedGroup: ProvidedColumnGroup,
            groupInstanceIdCreator: GroupInstanceIdCreator,
            oldColumnsMapped: {[key: string]: ColumnGroup},
            pinned: ColumnPinnedType
        ): ColumnGroup {

        const groupId = providedGroup.getGroupId();
        const instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        const uniqueId = ColumnGroup.createUniqueId(groupId, instanceId);

        let columnGroup: ColumnGroup | null = oldColumnsMapped[uniqueId];

        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getProvidedColumnGroup() !== providedGroup) {
            columnGroup = null;
        }

        if (exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        } else {
            columnGroup = new ColumnGroup(providedGroup, groupId, instanceId, pinned);
            this.context.createBean(columnGroup);
        }

        return columnGroup;
    }

    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    private mapOldGroupsById(displayedGroups: IHeaderColumn[]): {[uniqueId: string]: ColumnGroup} {
        const result: {[uniqueId: string]: ColumnGroup} = {};

        const recursive = (columnsOrGroups: IHeaderColumn[] | null) => {
            columnsOrGroups!.forEach(columnOrGroup => {
                if (columnOrGroup instanceof ColumnGroup) {
                    const columnGroup = columnOrGroup;
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

    private setupParentsIntoColumns(columnsOrGroups: IHeaderColumn[] | null, parent: ColumnGroup | null): void {
        columnsOrGroups!.forEach(columnsOrGroup => {
            columnsOrGroup.setParent(parent);
            if (columnsOrGroup instanceof ColumnGroup) {
                const columnGroup = columnsOrGroup;
                this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    }

    private getOriginalPathForColumn(balancedColumnTree: IProvidedColumn[], column: Column): ProvidedColumnGroup[] | null {
        const result: ProvidedColumnGroup[] = [];
        let found = false;

        const recursePath = (columnTree: IProvidedColumn[], dept: number): void => {
            for (let i = 0; i < columnTree.length; i++) {
                // quit the search, so 'result' is kept with the found result
                if (found) { return; }

                const node = columnTree[i];

                if (node instanceof ProvidedColumnGroup) {
                    recursePath(node.getChildren(), dept + 1);
                    result[dept] = node;
                } else if (node === column) {
                    found = true;
                }
            }
        };

        recursePath(balancedColumnTree, 0);

        // it's possible we didn't find a path. this happens if the column is generated
        // by the grid (auto-group), in that the definition didn't come from the client. in this case,
        // we create a fake original path.
        if (found) { return result; }

        console.warn('AG Grid: could not get path');

        return null;
    }
}
