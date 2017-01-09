// ag-grid-enterprise v7.1.0
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
var main_1 = require("ag-grid/main");
var GroupStage = (function () {
    function GroupStage() {
        // we use a sequence variable so that each time we do a grouping, we don't
        // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
        // when it tries to animate between rows. we set to -1 as others row id 0 will be shared
        // with the other rows.
        this.groupIdSequence = new main_1.NumberSequence(1);
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
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.recursivelyGroup(rowNode, groupedCols, 0, expandByDefault, includeParents);
        if (this.gridOptionsWrapper.isGroupRemoveSingleChildren()) {
            this.recursivelyDeptFirstRemoveSingleChildren(rowNode, includeParents);
        }
        this.recursivelySetLevelOnChildren(rowNode, 0);
    };
    GroupStage.prototype.recursivelySetLevelOnChildren = function (rowNode, level) {
        for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
            var childNode = rowNode.childrenAfterGroup[i];
            childNode.level = level;
            if (childNode.group) {
                this.recursivelySetLevelOnChildren(childNode, level + 1);
            }
        }
    };
    GroupStage.prototype.recursivelyDeptFirstRemoveSingleChildren = function (rowNode, includeParents) {
        if (main_1.Utils.missingOrEmpty(rowNode.childrenAfterGroup)) {
            return;
        }
        for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
            var childNode = rowNode.childrenAfterGroup[i];
            if (childNode.group) {
                this.recursivelyDeptFirstRemoveSingleChildren(childNode, includeParents);
                if (childNode.childrenAfterGroup.length <= 1) {
                    var nodeToMove = childNode.childrenAfterGroup[0];
                    rowNode.childrenAfterGroup[i] = nodeToMove;
                    // we check if parent
                    if (includeParents) {
                        nodeToMove.parent = rowNode;
                    }
                }
            }
        }
    };
    GroupStage.prototype.recursivelyGroup = function (rowNode, groupColumns, level, expandByDefault, includeParents) {
        var _this = this;
        var groupingThisLevel = level < groupColumns.length;
        rowNode.leafGroup = level === groupColumns.length;
        if (groupingThisLevel) {
            var groupColumn = groupColumns[level];
            this.setChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level, includeParents);
            rowNode.childrenAfterGroup.forEach(function (child) {
                _this.recursivelyGroup(child, groupColumns, level + 1, expandByDefault, includeParents);
            });
        }
        else {
            rowNode.childrenAfterGroup = rowNode.allLeafChildren;
            rowNode.childrenAfterGroup.forEach(function (child) {
                child.parent = rowNode;
            });
        }
    };
    GroupStage.prototype.setChildrenAfterGroup = function (rowNode, groupColumn, expandByDefault, level, includeParents) {
        var _this = this;
        rowNode.childrenAfterGroup = [];
        rowNode.childrenMapped = {};
        rowNode.allLeafChildren.forEach(function (child) {
            var groupKey = _this.getKeyForNode(groupColumn, child);
            var groupForChild = rowNode.childrenMapped[groupKey];
            if (!groupForChild) {
                groupForChild = _this.createGroup(groupColumn, groupKey, rowNode, expandByDefault, level, includeParents);
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
    GroupStage.prototype.createGroup = function (groupColumn, groupKey, parent, expandByDefault, level, includeParents) {
        var nextGroup = new RowNode();
        this.context.wireBean(nextGroup);
        nextGroup.group = true;
        nextGroup.field = groupColumn.getColDef().field;
        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        nextGroup.id = (this.groupIdSequence.next() * -1).toString();
        nextGroup.key = groupKey;
        nextGroup.expanded = this.isExpanded(expandByDefault, level);
        nextGroup.allLeafChildren = [];
        nextGroup.allChildrenCount = 0;
        nextGroup.rowGroupIndex = level;
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
        __metadata('design:type', (typeof (_a = typeof main_1.SelectionController !== 'undefined' && main_1.SelectionController) === 'function' && _a) || Object)
    ], GroupStage.prototype, "selectionController", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', (typeof (_b = typeof main_1.GridOptionsWrapper !== 'undefined' && main_1.GridOptionsWrapper) === 'function' && _b) || Object)
    ], GroupStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], GroupStage.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('valueService'), 
        __metadata('design:type', (typeof (_c = typeof main_1.ValueService !== 'undefined' && main_1.ValueService) === 'function' && _c) || Object)
    ], GroupStage.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('eventService'), 
        __metadata('design:type', (typeof (_d = typeof main_1.EventService !== 'undefined' && main_1.EventService) === 'function' && _d) || Object)
    ], GroupStage.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', (typeof (_e = typeof main_1.Context !== 'undefined' && main_1.Context) === 'function' && _e) || Object)
    ], GroupStage.prototype, "context", void 0);
    GroupStage = __decorate([
        main_1.Bean('groupStage'), 
        __metadata('design:paramtypes', [])
    ], GroupStage);
    return GroupStage;
    var _a, _b, _c, _d, _e;
}());
exports.GroupStage = GroupStage;
