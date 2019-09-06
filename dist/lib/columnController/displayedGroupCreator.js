/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var columnUtils_1 = require("./columnUtils");
var columnGroup_1 = require("../entities/columnGroup");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var context_2 = require("../context/context");
var utils_1 = require("../utils");
// takes in a list of columns, as specified by the column definitions, and returns column groups
var DisplayedGroupCreator = /** @class */ (function () {
    function DisplayedGroupCreator() {
    }
    DisplayedGroupCreator.prototype.createDisplayedGroups = function (
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
        var _this = this;
        var result = [];
        var previousRealPath;
        var previousOriginalPath;
        var oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups);
        // go through each column, then do a bottom up comparison to the previous column, and start
        // to share groups if they converge at any point.
        sortedVisibleColumns.forEach(function (currentColumn) {
            var currentOriginalPath = _this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
            var currentRealPath = [];
            var firstColumn = !previousOriginalPath;
            for (var i = 0; i < currentOriginalPath.length; i++) {
                if (firstColumn || currentOriginalPath[i] !== previousOriginalPath[i]) {
                    // new group needed
                    var newGroup = _this.createColumnGroup(currentOriginalPath[i], groupInstanceIdCreator, oldColumnsMapped, pinned);
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
            var noColumnGroups = currentRealPath.length === 0;
            if (noColumnGroups) {
                // if we are not grouping, then the result of the above is an empty
                // path (no groups), and we just add the column to the root list.
                result.push(currentColumn);
            }
            else {
                var leafGroup = utils_1._.last(currentRealPath);
                leafGroup.addChild(currentColumn);
            }
            previousRealPath = currentRealPath;
            previousOriginalPath = currentOriginalPath;
        });
        this.setupParentsIntoColumns(result, null);
        return result;
    };
    DisplayedGroupCreator.prototype.createColumnGroup = function (originalGroup, groupInstanceIdCreator, oldColumnsMapped, pinned) {
        var groupId = originalGroup.getGroupId();
        var instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        var uniqueId = columnGroup_1.ColumnGroup.createUniqueId(groupId, instanceId);
        var columnGroup = oldColumnsMapped[uniqueId];
        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getOriginalColumnGroup() !== originalGroup) {
            columnGroup = null;
        }
        if (utils_1._.exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        }
        else {
            columnGroup = new columnGroup_1.ColumnGroup(originalGroup, groupId, instanceId, pinned);
            this.context.wireBean(columnGroup);
        }
        return columnGroup;
    };
    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    DisplayedGroupCreator.prototype.mapOldGroupsById = function (displayedGroups) {
        var result = {};
        var recursive = function (columnsOrGroups) {
            columnsOrGroups.forEach(function (columnOrGroup) {
                if (columnOrGroup instanceof columnGroup_1.ColumnGroup) {
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
            if (columnsOrGroup instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = columnsOrGroup;
                _this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    };
    // private createFakePath(balancedColumnTree: OriginalColumnGroupChild[], column: Column): OriginalColumnGroup[] {
    //     let fakePath: OriginalColumnGroup[] = [];
    //     let currentChildren = balancedColumnTree;
    //     // this while loop does search on the balanced tree, so our result is the right length
    //     let index = 0;
    //     while (currentChildren && currentChildren[0] && currentChildren[0] instanceof OriginalColumnGroup) {
    //         // putting in a deterministic fake id, in case the API in the future needs to reference the col
    //         let fakeGroup = new OriginalColumnGroup(null, 'FAKE_PATH_' + index, true);
    //         this.context.wireBean(fakeGroup);
    //
    //         // fakePath.setChildren(children);
    //
    //         fakePath.push(fakeGroup);
    //         currentChildren = (<OriginalColumnGroup>currentChildren[0]).getChildren();
    //         index++;
    //     }
    //
    //     fakePath.forEach( (fakePathGroup: OriginalColumnGroup, i: number) => {
    //         let lastItemInList = i === fakePath.length-1;
    //         let child = lastItemInList ? column : fakePath[i+1];
    //         fakePathGroup.setChildren([child]);
    //     });
    //
    //     return fakePath;
    // }
    DisplayedGroupCreator.prototype.getOriginalPathForColumn = function (balancedColumnTree, column) {
        var result = [];
        var found = false;
        recursePath(balancedColumnTree, 0);
        // it's possible we didn't find a path. this happens if the column is generated
        // by the grid (auto-group), in that the definition didn't come from the client. in this case,
        // we create a fake original path.
        if (found) {
            return result;
        }
        else {
            console.warn('could not get path');
            return null;
            // return this.createFakePath(balancedColumnTree, column);
        }
        function recursePath(balancedColumnTree, dept) {
            for (var i = 0; i < balancedColumnTree.length; i++) {
                if (found) {
                    // quit the search, so 'result' is kept with the found result
                    return;
                }
                var node = balancedColumnTree[i];
                if (node instanceof originalColumnGroup_1.OriginalColumnGroup) {
                    var nextNode = node;
                    recursePath(nextNode.getChildren(), dept + 1);
                    result[dept] = node;
                }
                else {
                    if (node === column) {
                        found = true;
                    }
                }
            }
        }
    };
    __decorate([
        context_1.Autowired('columnUtils'),
        __metadata("design:type", columnUtils_1.ColumnUtils)
    ], DisplayedGroupCreator.prototype, "columnUtils", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_2.Context)
    ], DisplayedGroupCreator.prototype, "context", void 0);
    DisplayedGroupCreator = __decorate([
        context_2.Bean('displayedGroupCreator')
    ], DisplayedGroupCreator);
    return DisplayedGroupCreator;
}());
exports.DisplayedGroupCreator = DisplayedGroupCreator;
