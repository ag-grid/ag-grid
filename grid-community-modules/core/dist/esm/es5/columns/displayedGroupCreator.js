var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ColumnGroup } from "../entities/columnGroup";
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { exists } from "../utils/generic";
// takes in a list of columns, as specified by the column definitions, and returns column groups
var DisplayedGroupCreator = /** @class */ (function (_super) {
    __extends(DisplayedGroupCreator, _super);
    function DisplayedGroupCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayedGroupCreator.prototype.createDisplayedGroups = function (
    // all displayed columns sorted - this is the columns the grid should show
    sortedVisibleColumns, 
    // creates unique id's for the group
    groupInstanceIdCreator, 
    // whether it's left, right or center col
    pinned, 
    // we try to reuse old groups if we can, to allow gui to do animation
    oldDisplayedGroups) {
        var _this = this;
        var oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups);
        /**
         * The following logic starts at the leaf level of columns, iterating through them to build their parent
         * groups when the parents match.
         *
         * The created groups are then added to an array, and similarly iterated on until we reach the top level.
         *
         * When row groups have no original parent, it's added to the result.
         */
        var topLevelResultCols = [];
        // this is an array of cols or col groups at one level of depth, starting from leaf and ending at root
        var groupsOrColsAtCurrentLevel = sortedVisibleColumns;
        var _loop_1 = function () {
            // store what's currently iterating so the function can build the next level of col groups
            var currentlyIterating = groupsOrColsAtCurrentLevel;
            groupsOrColsAtCurrentLevel = [];
            // store the index of the last row which was different from the previous row, this is used as a slice
            // index for finding the children to group together
            var lastGroupedColIdx = 0;
            // create a group of children from lastGroupedColIdx to the provided `to` parameter
            var createGroupToIndex = function (to) {
                var from = lastGroupedColIdx;
                lastGroupedColIdx = to;
                var previousNode = currentlyIterating[from];
                var previousNodeProvided = previousNode instanceof ColumnGroup ? previousNode.getProvidedColumnGroup() : previousNode;
                var previousNodeParent = previousNodeProvided.getOriginalParent();
                if (previousNodeParent == null) {
                    // if the last node was different, and had a null parent, then we add all the nodes to the final
                    // results)
                    for (var i = from; i < to; i++) {
                        topLevelResultCols.push(currentlyIterating[i]);
                    }
                    return;
                }
                // the parent differs from the previous node, so we create a group from the previous node
                // and add all to the result array, except the current node.
                var newGroup = _this.createColumnGroup(previousNodeParent, groupInstanceIdCreator, oldColumnsMapped, pinned);
                for (var i = from; i < to; i++) {
                    newGroup.addChild(currentlyIterating[i]);
                }
                groupsOrColsAtCurrentLevel.push(newGroup);
            };
            for (var i = 1; i < currentlyIterating.length; i++) {
                var thisNode = currentlyIterating[i];
                var thisNodeProvided = thisNode instanceof ColumnGroup ? thisNode.getProvidedColumnGroup() : thisNode;
                var thisNodeParent = thisNodeProvided.getOriginalParent();
                var previousNode = currentlyIterating[lastGroupedColIdx];
                var previousNodeProvided = previousNode instanceof ColumnGroup ? previousNode.getProvidedColumnGroup() : previousNode;
                var previousNodeParent = previousNodeProvided.getOriginalParent();
                if (thisNodeParent !== previousNodeParent) {
                    createGroupToIndex(i);
                }
            }
            if (lastGroupedColIdx < currentlyIterating.length) {
                createGroupToIndex(currentlyIterating.length);
            }
        };
        while (groupsOrColsAtCurrentLevel.length) {
            _loop_1();
        }
        this.setupParentsIntoColumns(topLevelResultCols, null);
        return topLevelResultCols;
    };
    DisplayedGroupCreator.prototype.createColumnGroup = function (providedGroup, groupInstanceIdCreator, oldColumnsMapped, pinned) {
        var groupId = providedGroup.getGroupId();
        var instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        var uniqueId = ColumnGroup.createUniqueId(groupId, instanceId);
        var columnGroup = oldColumnsMapped[uniqueId];
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
    };
    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    DisplayedGroupCreator.prototype.mapOldGroupsById = function (displayedGroups) {
        var result = {};
        var recursive = function (columnsOrGroups) {
            columnsOrGroups.forEach(function (columnOrGroup) {
                if (columnOrGroup instanceof ColumnGroup) {
                    var columnGroup = columnOrGroup;
                    result[columnOrGroup.getUniqueId()] = columnGroup;
                    recursive(columnGroup.getChildren());
                }
            });
        };
        if (displayedGroups) {
            recursive(displayedGroups);
        }
        return result;
    };
    DisplayedGroupCreator.prototype.setupParentsIntoColumns = function (columnsOrGroups, parent) {
        var _this = this;
        columnsOrGroups.forEach(function (columnsOrGroup) {
            columnsOrGroup.setParent(parent);
            if (columnsOrGroup instanceof ColumnGroup) {
                var columnGroup = columnsOrGroup;
                _this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    };
    DisplayedGroupCreator = __decorate([
        Bean('displayedGroupCreator')
    ], DisplayedGroupCreator);
    return DisplayedGroupCreator;
}(BeanStub));
export { DisplayedGroupCreator };
