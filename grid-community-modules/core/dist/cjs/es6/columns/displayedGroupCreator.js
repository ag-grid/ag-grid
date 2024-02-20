"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayedGroupCreator = void 0;
const columnGroup_1 = require("../entities/columnGroup");
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
// takes in a list of columns, as specified by the column definitions, and returns column groups
let DisplayedGroupCreator = class DisplayedGroupCreator extends beanStub_1.BeanStub {
    createDisplayedGroups(
    // all displayed columns sorted - this is the columns the grid should show
    sortedVisibleColumns, 
    // creates unique id's for the group
    groupInstanceIdCreator, 
    // whether it's left, right or center col
    pinned, 
    // we try to reuse old groups if we can, to allow gui to do animation
    oldDisplayedGroups) {
        const oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups);
        /**
         * The following logic starts at the leaf level of columns, iterating through them to build their parent
         * groups when the parents match.
         *
         * The created groups are then added to an array, and similarly iterated on until we reach the top level.
         *
         * When row groups have no original parent, it's added to the result.
         */
        const topLevelResultCols = [];
        // this is an array of cols or col groups at one level of depth, starting from leaf and ending at root
        let groupsOrColsAtCurrentLevel = sortedVisibleColumns;
        while (groupsOrColsAtCurrentLevel.length) {
            // store what's currently iterating so the function can build the next level of col groups
            const currentlyIterating = groupsOrColsAtCurrentLevel;
            groupsOrColsAtCurrentLevel = [];
            // store the index of the last row which was different from the previous row, this is used as a slice
            // index for finding the children to group together
            let lastGroupedColIdx = 0;
            // create a group of children from lastGroupedColIdx to the provided `to` parameter
            const createGroupToIndex = (to) => {
                const from = lastGroupedColIdx;
                lastGroupedColIdx = to;
                const previousNode = currentlyIterating[from];
                const previousNodeProvided = previousNode instanceof columnGroup_1.ColumnGroup ? previousNode.getProvidedColumnGroup() : previousNode;
                const previousNodeParent = previousNodeProvided.getOriginalParent();
                if (previousNodeParent == null) {
                    // if the last node was different, and had a null parent, then we add all the nodes to the final
                    // results)
                    for (let i = from; i < to; i++) {
                        topLevelResultCols.push(currentlyIterating[i]);
                    }
                    return;
                }
                // the parent differs from the previous node, so we create a group from the previous node
                // and add all to the result array, except the current node.
                const newGroup = this.createColumnGroup(previousNodeParent, groupInstanceIdCreator, oldColumnsMapped, pinned);
                for (let i = from; i < to; i++) {
                    newGroup.addChild(currentlyIterating[i]);
                }
                groupsOrColsAtCurrentLevel.push(newGroup);
            };
            for (let i = 1; i < currentlyIterating.length; i++) {
                const thisNode = currentlyIterating[i];
                const thisNodeProvided = thisNode instanceof columnGroup_1.ColumnGroup ? thisNode.getProvidedColumnGroup() : thisNode;
                const thisNodeParent = thisNodeProvided.getOriginalParent();
                const previousNode = currentlyIterating[lastGroupedColIdx];
                const previousNodeProvided = previousNode instanceof columnGroup_1.ColumnGroup ? previousNode.getProvidedColumnGroup() : previousNode;
                const previousNodeParent = previousNodeProvided.getOriginalParent();
                if (thisNodeParent !== previousNodeParent) {
                    createGroupToIndex(i);
                }
            }
            if (lastGroupedColIdx < currentlyIterating.length) {
                createGroupToIndex(currentlyIterating.length);
            }
        }
        this.setupParentsIntoColumns(topLevelResultCols, null);
        return topLevelResultCols;
    }
    createColumnGroup(providedGroup, groupInstanceIdCreator, oldColumnsMapped, pinned) {
        const groupId = providedGroup.getGroupId();
        const instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        const uniqueId = columnGroup_1.ColumnGroup.createUniqueId(groupId, instanceId);
        let columnGroup = oldColumnsMapped[uniqueId];
        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getProvidedColumnGroup() !== providedGroup) {
            columnGroup = null;
        }
        if ((0, generic_1.exists)(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        }
        else {
            columnGroup = new columnGroup_1.ColumnGroup(providedGroup, groupId, instanceId, pinned);
            this.context.createBean(columnGroup);
        }
        return columnGroup;
    }
    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    mapOldGroupsById(displayedGroups) {
        const result = {};
        const recursive = (columnsOrGroups) => {
            columnsOrGroups.forEach(columnOrGroup => {
                if (columnOrGroup instanceof columnGroup_1.ColumnGroup) {
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
            if (columnsOrGroup instanceof columnGroup_1.ColumnGroup) {
                const columnGroup = columnsOrGroup;
                this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    }
};
DisplayedGroupCreator = __decorate([
    (0, context_1.Bean)('displayedGroupCreator')
], DisplayedGroupCreator);
exports.DisplayedGroupCreator = DisplayedGroupCreator;
