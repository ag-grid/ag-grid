// ag-grid-enterprise v4.1.4
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var GroupStage = (function () {
    function GroupStage() {
    }
    GroupStage.prototype.execute = function (rowsToGroup) {
        var result;
        var groupedCols = this.columnController.getRowGroupColumns();
        if (groupedCols.length > 0) {
            var expandByDefault;
            if (this.gridOptionsWrapper.isGroupSuppressRow()) {
                expandByDefault = -1;
            }
            else {
                expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
            }
            result = this.group(rowsToGroup, groupedCols, expandByDefault);
        }
        else {
            result = rowsToGroup;
        }
        return result;
    };
    GroupStage.prototype.group = function (rowNodes, groupedCols, expandByDefault) {
        var topMostGroup = new main_1.RowNode();
        this.context.wireBean(topMostGroup);
        topMostGroup.level = -1;
        topMostGroup.children = [];
        topMostGroup._childrenMap = {};
        var allGroups = [];
        allGroups.push(topMostGroup);
        var levelToInsertChild = groupedCols.length - 1;
        var i;
        var currentLevel;
        var node;
        var currentGroup;
        var groupKey;
        var nextGroup;
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        // start at -1 and go backwards, as all the positive indexes
        // are already used by the nodes.
        var index = -1;
        for (i = 0; i < rowNodes.length; i++) {
            node = rowNodes[i];
            // all leaf nodes have the same level in this grouping, which is one level after the last group
            node.level = levelToInsertChild + 1;
            for (currentLevel = 0; currentLevel < groupedCols.length; currentLevel++) {
                var groupColumn = groupedCols[currentLevel];
                groupKey = this.valueService.getValue(groupColumn, node);
                if (currentLevel === 0) {
                    currentGroup = topMostGroup;
                }
                // if group doesn't exist yet, create it
                nextGroup = currentGroup._childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = new main_1.RowNode();
                    this.context.wireBean(nextGroup);
                    nextGroup.group = true;
                    nextGroup.field = groupColumn.getColDef().field;
                    nextGroup.id = index--;
                    nextGroup.key = groupKey;
                    nextGroup.expanded = this.isExpanded(expandByDefault, currentLevel);
                    nextGroup.children = [];
                    // for top most level, parent is null
                    nextGroup.parent = null;
                    nextGroup.allChildrenCount = 0;
                    nextGroup.level = currentGroup.level + 1;
                    // this is a temporary map, we remove at the end of this method
                    nextGroup._childrenMap = {};
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
    GroupStage.prototype.isExpanded = function (expandByDefault, level) {
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
    __decorate([
        main_1.Autowired('selectionController'), 
        __metadata('design:type', main_1.SelectionController)
    ], GroupStage.prototype, "selectionController", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], GroupStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], GroupStage.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('valueService'), 
        __metadata('design:type', main_1.ValueService)
    ], GroupStage.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('eventService'), 
        __metadata('design:type', main_1.EventService)
    ], GroupStage.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], GroupStage.prototype, "context", void 0);
    GroupStage = __decorate([
        main_1.Bean('groupStage'), 
        __metadata('design:paramtypes', [])
    ], GroupStage);
    return GroupStage;
})();
exports.GroupStage = GroupStage;
