// ag-grid-enterprise v8.0.0
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
    GroupStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        var newRowNodes = params.newRowNodes;
        var groupedCols = this.columnController.getRowGroupColumns();
        var expandByDefault;
        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        }
        else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        if (newRowNodes) {
            this.insertRowNodes(newRowNodes, rootNode, groupedCols, expandByDefault, includeParents);
        }
        else {
            this.recursivelyGroup(rootNode, groupedCols, 0, expandByDefault, includeParents);
            // remove single children only works when doing a new grouping, it is not compatible with
            // inserting / removing rows, as the group which a new record may belong to may have already
            // been snipped out.
            if (this.gridOptionsWrapper.isGroupRemoveSingleChildren()) {
                this.recursivelyDeptFirstRemoveSingleChildren(rootNode, includeParents);
            }
        }
        this.recursivelySetLevelOnChildren(rootNode, 0);
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
            this.bucketIntoChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level, includeParents);
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
    GroupStage.prototype.bucketIntoChildrenAfterGroup = function (rowNode, groupColumn, expandByDefault, level, includeParents) {
        var _this = this;
        rowNode.childrenAfterGroup = [];
        rowNode.childrenMapped = {};
        rowNode.allLeafChildren.forEach(function (child) {
            _this.placeNodeIntoNextGroup(rowNode, child, groupColumn, expandByDefault, level, includeParents);
        });
    };
    GroupStage.prototype.insertRowNodes = function (newRowNodes, rootNode, groupColumns, expandByDefault, includeParents) {
        var _this = this;
        newRowNodes.forEach(function (rowNode) {
            var nextGroup = rootNode;
            groupColumns.forEach(function (groupColumn, level) {
                nextGroup = _this.placeNodeIntoNextGroup(nextGroup, rowNode, groupColumn, expandByDefault, level, includeParents);
            });
            rowNode.parent = nextGroup;
        });
    };
    GroupStage.prototype.placeNodeIntoNextGroup = function (previousGroup, nodeToPlace, groupColumn, expandByDefault, level, includeParents) {
        var groupKey = this.getKeyForNode(groupColumn, nodeToPlace);
        var nextGroup = previousGroup.childrenMapped[groupKey];
        if (!nextGroup) {
            nextGroup = this.createGroup(groupColumn, groupKey, previousGroup, expandByDefault, level, includeParents);
            previousGroup.childrenMapped[groupKey] = nextGroup;
            previousGroup.childrenAfterGroup.push(nextGroup);
        }
        nextGroup.allLeafChildren.push(nodeToPlace);
        return nextGroup;
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
        var nextGroup = new main_1.RowNode();
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
}());
exports.GroupStage = GroupStage;
