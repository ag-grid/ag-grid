/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
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
var context_1 = require("../../context/context");
var rowNode_1 = require("../../entities/rowNode");
var utils_1 = require("../../utils");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var selectionController_1 = require("../../selectionController");
var eventService_1 = require("../../eventService");
var columnController_1 = require("../../columnController/columnController");
var FlattenStage = (function () {
    function FlattenStage() {
    }
    FlattenStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var result = [];
        // putting value into a wrapper so it's passed by reference
        var nextRowTop = { value: 0 };
        var skipLeafNodes = this.columnController.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = skipLeafNodes && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        this.resetRowTops(rootNode);
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);
        return result;
    };
    FlattenStage.prototype.resetRowTops = function (rowNode) {
        rowNode.clearRowTop();
        if (rowNode.group) {
            if (rowNode.childrenAfterGroup) {
                for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                    this.resetRowTops(rowNode.childrenAfterGroup[i]);
                }
            }
            if (rowNode.sibling) {
                rowNode.sibling.clearRowTop();
            }
        }
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (utils_1.Utils.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        var hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();
        var removeSingleChildrenGroups = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            var isGroupSuppressedNode = groupSuppressRow && rowNode.group;
            var isSkippedLeafNode = skipLeafNodes && !rowNode.group;
            var isHiddenOpenParent = hideOpenParents && rowNode.expanded;
            var isRemovedSingleChildrenGroup = removeSingleChildrenGroups && rowNode.group && rowNode.childrenAfterGroup.length === 1;
            var thisRowShouldBeRendered = !isSkippedLeafNode && !isGroupSuppressedNode && !isHiddenOpenParent && !isRemovedSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
            }
            if (rowNode.group) {
                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || isRemovedSingleChildrenGroup) {
                    // if the parent was excluded, then ui level is that of the parent
                    var uiLevelForChildren = isRemovedSingleChildrenGroup ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                        this.ensureFooterNodeExists(rowNode);
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevel);
                    }
                }
                else {
                }
            }
            else if (rowNode.canFlower && rowNode.expanded) {
                var flowerNode = this.createFlowerNode(rowNode);
                this.addRowNodeToRowsToDisplay(flowerNode, result, nextRowTop, uiLevel);
            }
        }
    };
    // duplicated method, it's also in floatingRowModel
    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (rowNode, result, nextRowTop, uiLevel) {
        result.push(rowNode);
        if (utils_1.Utils.missing(rowNode.rowHeight)) {
            var rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
            rowNode.setRowHeight(rowHeight);
        }
        rowNode.setUiLevel(uiLevel);
        rowNode.setRowTop(nextRowTop.value);
        rowNode.setRowIndex(result.length - 1);
        nextRowTop.value += rowNode.rowHeight;
    };
    FlattenStage.prototype.ensureFooterNodeExists = function (groupNode) {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (utils_1.Utils.exists(groupNode.sibling)) {
            return;
        }
        var footerNode = new rowNode_1.RowNode();
        this.context.wireBean(footerNode);
        Object.keys(groupNode).forEach(function (key) {
            footerNode[key] = groupNode[key];
        });
        footerNode.footer = true;
        footerNode.rowTop = null;
        footerNode.oldRowTop = null;
        if (utils_1.Utils.exists(footerNode.id)) {
            footerNode.id = 'rowGroupFooter_' + footerNode.id;
        }
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
    };
    FlattenStage.prototype.createFlowerNode = function (parentNode) {
        if (utils_1.Utils.exists(parentNode.childFlower)) {
            return parentNode.childFlower;
        }
        else {
            var flowerNode = new rowNode_1.RowNode();
            this.context.wireBean(flowerNode);
            flowerNode.flower = true;
            flowerNode.parent = parentNode;
            if (utils_1.Utils.exists(parentNode.id)) {
                flowerNode.id = 'flowerNode_' + parentNode.id;
            }
            flowerNode.data = parentNode.data;
            flowerNode.level = parentNode.level + 1;
            parentNode.childFlower = flowerNode;
            return flowerNode;
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], FlattenStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], FlattenStage.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], FlattenStage.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], FlattenStage.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], FlattenStage.prototype, "columnController", void 0);
    FlattenStage = __decorate([
        context_1.Bean('flattenStage')
    ], FlattenStage);
    return FlattenStage;
}());
exports.FlattenStage = FlattenStage;
