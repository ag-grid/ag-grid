/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var GroupCreator = (function () {
    function GroupCreator() {
    }
    GroupCreator.prototype.init = function (valueService, gridOptionsWrapper) {
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
    };
    GroupCreator.prototype.group = function (rowNodes, groupedCols, expandByDefault) {
        var topMostGroup = {
            level: -1,
            children: [],
            _childrenMap: {}
        };
        var allGroups = [];
        allGroups.push(topMostGroup);
        var levelToInsertChild = groupedCols.length - 1;
        var i;
        var currentLevel;
        var node;
        var data;
        var currentGroup;
        var groupKey;
        var nextGroup;
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        // start at -1 and go backwards, as all the positive indexes
        // are already used by the nodes.
        var index = -1;
        for (i = 0; i < rowNodes.length; i++) {
            node = rowNodes[i];
            data = node.data;
            // all leaf nodes have the same level in this grouping, which is one level after the last group
            node.level = levelToInsertChild + 1;
            for (currentLevel = 0; currentLevel < groupedCols.length; currentLevel++) {
                var groupColumn = groupedCols[currentLevel];
                groupKey = this.valueService.getValue(groupColumn.getColDef(), data, node);
                if (currentLevel === 0) {
                    currentGroup = topMostGroup;
                }
                // if group doesn't exist yet, create it
                nextGroup = currentGroup._childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = {
                        group: true,
                        field: groupColumn.getColDef().field,
                        id: index--,
                        key: groupKey,
                        expanded: this.isExpanded(expandByDefault, currentLevel),
                        children: [],
                        // for top most level, parent is null
                        parent: null,
                        allChildrenCount: 0,
                        level: currentGroup.level + 1,
                        _childrenMap: {} //this is a temporary map, we remove at the end of this method
                    };
                    if (includeParents) {
                        nextGroup.parent = currentGroup === topMostGroup ? null : currentGroup;
                    }
                    currentGroup._childrenMap[groupKey] = nextGroup;
                    currentGroup.children.push(nextGroup);
                    allGroups.push(nextGroup);
                }
                nextGroup.allChildrenCount++;
                if (currentLevel == levelToInsertChild) {
                    if (includeParents) {
                        node.parent = nextGroup === topMostGroup ? null : nextGroup;
                    }
                    nextGroup.children.push(node);
                }
                else {
                    currentGroup = nextGroup;
                }
            }
        }
        //remove the temporary map
        for (i = 0; i < allGroups.length; i++) {
            delete allGroups[i]._childrenMap;
        }
        return topMostGroup.children;
    };
    GroupCreator.prototype.isExpanded = function (expandByDefault, level) {
        if (typeof expandByDefault === 'number') {
            if (expandByDefault === -1) {
                return true;
            }
            else {
                return level < expandByDefault;
            }
        }
        else {
            return false;
        }
    };
    return GroupCreator;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GroupCreator;
