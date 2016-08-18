// ag-grid-enterprise v5.2.0
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
    GroupStage.prototype.execute = function (rowNode) {
        var groupedCols = this.columnController.getRowGroupColumns();
        var expandByDefault;
        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        }
        else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }
        // putting this in a wrapper, so it's pass by reference
        var groupId = { value: -1 };
        this.recursivelyGroup(rowNode, groupedCols, 0, expandByDefault, groupId);
    };
    GroupStage.prototype.recursivelyGroup = function (rowNode, groupColumns, level, expandByDefault, groupId) {
        var _this = this;
        var groupingThisLevel = level < groupColumns.length;
        rowNode.leafGroup = level === groupColumns.length;
        if (groupingThisLevel) {
            var groupColumn = groupColumns[level];
            this.setChildrenAfterGroup(rowNode, groupColumn, groupId, expandByDefault, level);
            rowNode.childrenAfterGroup.forEach(function (child) {
                _this.recursivelyGroup(child, groupColumns, level + 1, expandByDefault, groupId);
            });
        }
        else {
            rowNode.childrenAfterGroup = rowNode.allLeafChildren;
            rowNode.childrenAfterGroup.forEach(function (child) {
                child.level = level;
                child.parent = rowNode;
            });
        }
    };
    GroupStage.prototype.setChildrenAfterGroup = function (rowNode, groupColumn, groupId, expandByDefault, level) {
        var _this = this;
        rowNode.childrenAfterGroup = [];
        rowNode.childrenMapped = {};
        rowNode.allLeafChildren.forEach(function (child) {
            var groupKey = _this.getKeyForNode(groupColumn, child);
            var groupForChild = rowNode.childrenMapped[groupKey];
            if (!groupForChild) {
                groupForChild = _this.createGroup(groupColumn, groupKey, rowNode, groupId, expandByDefault, level);
                rowNode.childrenMapped[groupKey] = groupForChild;
                rowNode.childrenAfterGroup.push(groupForChild);
            }
            groupForChild.allLeafChildren.push(child);
        });
    };
    GroupStage.prototype.getKeyForNode = function (groupColumn, rowNode) {
        var value = this.valueService.getValue(groupColumn, rowNode);
        var result;
        var keyCreator = groupColumn.getColDef().keyCreator;
        if (keyCreator) {
            result = keyCreator({ value: value });
        }
        else {
            result = value;
        }
        return result;
    };
    GroupStage.prototype.createGroup = function (groupColumn, groupKey, parent, groupId, expandByDefault, level) {
        var nextGroup = new main_1.RowNode();
        this.context.wireBean(nextGroup);
        nextGroup.group = true;
        nextGroup.field = groupColumn.getColDef().field;
        nextGroup.id = groupId.value.toString();
        nextGroup.key = groupKey;
        nextGroup.expanded = this.isExpanded(expandByDefault, level);
        nextGroup.allLeafChildren = [];
        nextGroup.allChildrenCount = 0;
        nextGroup.level = level;
        groupId.value--;
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        nextGroup.parent = includeParents ? parent : null;
        return nextGroup;
    };
    GroupStage.prototype.isExpanded = function (expandByDefault, level) {
        if (expandByDefault === -1) {
            return true;
        }
        else {
            return level < expandByDefault;
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
