/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
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
    FlattenStage.prototype.execute = function (rootNode) {
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var result = [];
        // putting value into a wrapper so it's passed by reference
        var nextRowTop = { value: 0 };
        var pivotMode = this.columnController.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = pivotMode && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, pivotMode);
        return result;
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop, reduce) {
        if (utils_1.Utils.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            var skipBecauseSuppressRow = groupSuppressRow && rowNode.group;
            var skipBecauseReduce = reduce && !rowNode.group;
            var skipGroupNode = skipBecauseReduce || skipBecauseSuppressRow;
            if (!skipGroupNode) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop);
            }
            if (rowNode.group && rowNode.expanded) {
                this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, reduce);
                // put a footer in if user is looking for it
                if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                    var footerNode = this.createFooterNode(rowNode);
                    this.addRowNodeToRowsToDisplay(footerNode, result, nextRowTop);
                }
            }
        }
    };
    // duplicated method, it's also in floatingRowModel
    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (rowNode, result, nextRowTop) {
        result.push(rowNode);
        rowNode.rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
        rowNode.rowTop = nextRowTop.value;
        nextRowTop.value += rowNode.rowHeight;
    };
    FlattenStage.prototype.createFooterNode = function (groupNode) {
        var footerNode = new rowNode_1.RowNode();
        this.context.wireBean(footerNode);
        Object.keys(groupNode).forEach(function (key) {
            footerNode[key] = groupNode[key];
        });
        footerNode.footer = true;
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
        return footerNode;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], FlattenStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], FlattenStage.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], FlattenStage.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], FlattenStage.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], FlattenStage.prototype, "columnController", void 0);
    FlattenStage = __decorate([
        context_1.Bean('flattenStage'), 
        __metadata('design:paramtypes', [])
    ], FlattenStage);
    return FlattenStage;
})();
exports.FlattenStage = FlattenStage;
