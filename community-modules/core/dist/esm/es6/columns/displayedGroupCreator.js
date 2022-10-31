/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ColumnGroup } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { last } from "../utils/array";
import { exists } from "../utils/generic";
// takes in a list of columns, as specified by the column definitions, and returns column groups
let DisplayedGroupCreator = class DisplayedGroupCreator extends BeanStub {
    createDisplayedGroups(
    // all displayed columns sorted - this is the columns the grid should show
    sortedVisibleColumns, 
    // the tree of columns, as provided by the users, used to know what groups columns roll up into
    balancedColumnTree, 
    // creates unique id's for the group
    groupInstanceIdCreator, 
    // whether it's left, right or center col
    pinned, 
    // we try to reuse old groups if we can, to allow gui to do animation
    oldDisplayedGroups) {
        const result = [];
        let previousRealPath;
        let previousOriginalPath;
        const oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups);
        // go through each column, then do a bottom up comparison to the previous column, and start
        // to share groups if they converge at any point.
        sortedVisibleColumns.forEach((currentColumn) => {
            const currentOriginalPath = this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
            const currentRealPath = [];
            const firstColumn = !previousOriginalPath;
            for (let i = 0; i < currentOriginalPath.length; i++) {
                if (firstColumn || currentOriginalPath[i] !== previousOriginalPath[i]) {
                    // new group needed
                    const newGroup = this.createColumnGroup(currentOriginalPath[i], groupInstanceIdCreator, oldColumnsMapped, pinned);
                    currentRealPath[i] = newGroup;
                    // if top level, add to result, otherwise add to parent
                    if (i == 0) {
                        result.push(newGroup);
                    }
                    else {
                        currentRealPath[i - 1].addChild(newGroup);
                    }
                }
                else {
                    // reuse old group
                    currentRealPath[i] = previousRealPath[i];
                }
            }
            const noColumnGroups = currentRealPath.length === 0;
            if (noColumnGroups) {
                // if we are not grouping, then the result of the above is an empty
                // path (no groups), and we just add the column to the root list.
                result.push(currentColumn);
            }
            else {
                const leafGroup = last(currentRealPath);
                leafGroup.addChild(currentColumn);
            }
            previousRealPath = currentRealPath;
            previousOriginalPath = currentOriginalPath;
        });
        this.setupParentsIntoColumns(result, null);
        return result;
    }
    createColumnGroup(providedGroup, groupInstanceIdCreator, oldColumnsMapped, pinned) {
        const groupId = providedGroup.getGroupId();
        const instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        const uniqueId = ColumnGroup.createUniqueId(groupId, instanceId);
        let columnGroup = oldColumnsMapped[uniqueId];
        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getProvidedColumnGroup() !== providedGroup) {
            columnGroup = null;
        }
        if (exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        }
        else {
            columnGroup = new ColumnGroup(providedGroup, groupId, instanceId, pinned);
            this.context.createBean(columnGroup);
        }
        return columnGroup;
    }
    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    mapOldGroupsById(displayedGroups) {
        const result = {};
        const recursive = (columnsOrGroups) => {
            columnsOrGroups.forEach(columnOrGroup => {
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
    setupParentsIntoColumns(columnsOrGroups, parent) {
        columnsOrGroups.forEach(columnsOrGroup => {
            columnsOrGroup.setParent(parent);
            if (columnsOrGroup instanceof ColumnGroup) {
                const columnGroup = columnsOrGroup;
                this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    }
    getOriginalPathForColumn(balancedColumnTree, column) {
        const result = [];
        let found = false;
        const recursePath = (columnTree, dept) => {
            for (let i = 0; i < columnTree.length; i++) {
                // quit the search, so 'result' is kept with the found result
                if (found) {
                    return;
                }
                const node = columnTree[i];
                if (node instanceof ProvidedColumnGroup) {
                    recursePath(node.getChildren(), dept + 1);
                    result[dept] = node;
                }
                else if (node === column) {
                    found = true;
                }
            }
        };
        recursePath(balancedColumnTree, 0);
        // it's possible we didn't find a path. this happens if the column is generated
        // by the grid (auto-group), in that the definition didn't come from the client. in this case,
        // we create a fake original path.
        if (found) {
            return result;
        }
        console.warn('AG Grid: could not get path');
        return null;
    }
};
DisplayedGroupCreator = __decorate([
    Bean('displayedGroupCreator')
], DisplayedGroupCreator);
export { DisplayedGroupCreator };
