/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var columnGroup_1 = require("../entities/columnGroup");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var array_1 = require("../utils/array");
var generic_1 = require("../utils/generic");
// takes in a list of columns, as specified by the column definitions, and returns column groups
var DisplayedGroupCreator = /** @class */ (function (_super) {
    __extends(DisplayedGroupCreator, _super);
    function DisplayedGroupCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
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
                var leafGroup = array_1.last(currentRealPath);
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
        if (generic_1.exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        }
        else {
            columnGroup = new columnGroup_1.ColumnGroup(originalGroup, groupId, instanceId, pinned);
            this.context.createBean(columnGroup);
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
    DisplayedGroupCreator.prototype.getOriginalPathForColumn = function (balancedColumnTree, column) {
        var result = [];
        var found = false;
        var recursePath = function (columnTree, dept) {
            for (var i = 0; i < columnTree.length; i++) {
                // quit the search, so 'result' is kept with the found result
                if (found) {
                    return;
                }
                var node = columnTree[i];
                if (node instanceof originalColumnGroup_1.OriginalColumnGroup) {
                    var nextNode = node;
                    recursePath(nextNode.getChildren(), dept + 1);
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
        console.warn('could not get path');
        return null;
    };
    DisplayedGroupCreator = __decorate([
        context_1.Bean('displayedGroupCreator')
    ], DisplayedGroupCreator);
    return DisplayedGroupCreator;
}(beanStub_1.BeanStub));
exports.DisplayedGroupCreator = DisplayedGroupCreator;

//# sourceMappingURL=displayedGroupCreator.js.map
