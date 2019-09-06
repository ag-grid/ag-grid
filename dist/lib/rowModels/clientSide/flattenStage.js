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
var context_1 = require("../../context/context");
var rowNode_1 = require("../../entities/rowNode");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var selectionController_1 = require("../../selectionController");
var eventService_1 = require("../../eventService");
var columnController_1 = require("../../columnController/columnController");
var utils_1 = require("../../utils");
var FlattenStage = /** @class */ (function () {
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
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);
        // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
        var includeGroupTotalFooter = !showRootNode && this.gridOptionsWrapper.isGroupIncludeTotalFooter();
        if (includeGroupTotalFooter) {
            this.ensureFooterNodeExists(rootNode);
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }
        return result;
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (utils_1._.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        var hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();
        // these two are mutually exclusive, so if first set, we don't set the second
        var groupRemoveSingleChildren = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        var groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            var isParent = rowNode.hasChildren();
            var isGroupSuppressedNode = groupSuppressRow && isParent;
            var isSkippedLeafNode = skipLeafNodes && !isParent;
            var isRemovedSingleChildrenGroup = groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
            var isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren && isParent && rowNode.leafGroup && rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all')
            var neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            var isHiddenOpenParent = hideOpenParents && rowNode.expanded && (!neverAllowToExpand);
            var thisRowShouldBeRendered = !isSkippedLeafNode && !isGroupSuppressedNode && !isHiddenOpenParent && !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
            }
            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) {
                continue;
            }
            if (isParent) {
                var excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {
                    // if the parent was excluded, then ui level is that of the parent
                    var uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                        this.ensureFooterNodeExists(rowNode);
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevel);
                    }
                }
            }
            else if (rowNode.master && rowNode.expanded) {
                var detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(detailNode, result, nextRowTop, uiLevel);
            }
        }
    };
    // duplicated method, it's also in floatingRowModel
    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (rowNode, result, nextRowTop, uiLevel) {
        result.push(rowNode);
        var isGroupMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    };
    FlattenStage.prototype.ensureFooterNodeExists = function (groupNode) {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (utils_1._.exists(groupNode.sibling)) {
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
        if (utils_1._.exists(footerNode.id)) {
            footerNode.id = 'rowGroupFooter_' + footerNode.id;
        }
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
    };
    FlattenStage.prototype.createDetailNode = function (masterNode) {
        if (utils_1._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        else {
            var detailNode = new rowNode_1.RowNode();
            this.context.wireBean(detailNode);
            detailNode.detail = true;
            detailNode.selectable = false;
            // flower was renamed to 'detail', but keeping for backwards compatibility
            detailNode.flower = detailNode.detail;
            detailNode.parent = masterNode;
            if (utils_1._.exists(masterNode.id)) {
                detailNode.id = 'detail_' + masterNode.id;
            }
            detailNode.data = masterNode.data;
            detailNode.level = masterNode.level + 1;
            masterNode.detailNode = detailNode;
            masterNode.childFlower = masterNode.detailNode; // for backwards compatibility
            return detailNode;
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
