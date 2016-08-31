/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var columnUtils_1 = require("./columnUtils");
var columnGroup_1 = require("../entities/columnGroup");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var context_1 = require("../context/context");
var context_2 = require("../context/context");
// takes in a list of columns, as specified by the column definitions, and returns column groups
var DisplayedGroupCreator = (function () {
    function DisplayedGroupCreator() {
    }
    DisplayedGroupCreator.prototype.createDisplayedGroups = function (sortedVisibleColumns, balancedColumnTree, groupInstanceIdCreator) {
        var _this = this;
        var result = [];
        var previousRealPath;
        var previousOriginalPath;
        // go through each column, then do a bottom up comparison to the previous column, and start
        // to share groups if they converge at any point.
        sortedVisibleColumns.forEach(function (currentColumn) {
            var currentOriginalPath = _this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
            var currentRealPath = [];
            var firstColumn = !previousOriginalPath;
            for (var i = 0; i < currentOriginalPath.length; i++) {
                if (firstColumn || currentOriginalPath[i] !== previousOriginalPath[i]) {
                    // new group needed
                    var originalGroup = currentOriginalPath[i];
                    var groupId = originalGroup.getGroupId();
                    var instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
                    var newGroup = new columnGroup_1.ColumnGroup(originalGroup, groupId, instanceId);
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
                var leafGroup = currentRealPath[currentRealPath.length - 1];
                leafGroup.addChild(currentColumn);
            }
            previousRealPath = currentRealPath;
            previousOriginalPath = currentOriginalPath;
        });
        return result;
    };
    DisplayedGroupCreator.prototype.createFakePath = function (balancedColumnTree) {
        var result = [];
        var currentChildren = balancedColumnTree;
        // this while look does search on the balanced tree, so our result is the right length
        var index = 0;
        while (currentChildren && currentChildren[0] && currentChildren[0] instanceof originalColumnGroup_1.OriginalColumnGroup) {
            // putting in a deterministic fake id, in case the API in the future needs to reference the col
            result.push(new originalColumnGroup_1.OriginalColumnGroup(null, 'FAKE_PATH_' + index));
            currentChildren = currentChildren[0].getChildren();
            index++;
        }
        return result;
    };
    DisplayedGroupCreator.prototype.getOriginalPathForColumn = function (balancedColumnTree, column) {
        var result = [];
        var found = false;
        recursePath(balancedColumnTree, 0);
        // it's possible we didn't find a path. this happens if the column is generated
        // by the grid, in that the definition didn't come from the client. in this case,
        // we create a fake original path.
        if (found) {
            return result;
        }
        else {
            return this.createFakePath(balancedColumnTree);
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
        context_2.Autowired('columnUtils'), 
        __metadata('design:type', columnUtils_1.ColumnUtils)
    ], DisplayedGroupCreator.prototype, "columnUtils", void 0);
    DisplayedGroupCreator = __decorate([
        context_1.Bean('displayedGroupCreator'), 
        __metadata('design:paramtypes', [])
    ], DisplayedGroupCreator);
    return DisplayedGroupCreator;
})();
exports.DisplayedGroupCreator = DisplayedGroupCreator;
