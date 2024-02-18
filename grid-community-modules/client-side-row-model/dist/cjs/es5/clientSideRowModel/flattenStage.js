"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.FlattenStage = void 0;
var core_1 = require("@ag-grid-community/core");
var FlattenStage = /** @class */ (function (_super) {
    __extends(FlattenStage, _super);
    function FlattenStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FlattenStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var result = [];
        var skipLeafNodes = this.columnModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = skipLeafNodes && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        var details = this.getFlattenDetails();
        this.recursivelyAddToRowsToDisplay(details, topList, result, skipLeafNodes, 0);
        // we do not want the footer total if the gris is empty
        var atLeastOneRowPresent = result.length > 0;
        var includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && details.groupIncludeTotalFooter;
        if (includeGroupTotalFooter) {
            rootNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rootNode.sibling, result, 0);
        }
        return result;
    };
    FlattenStage.prototype.getFlattenDetails = function () {
        // these two are mutually exclusive, so if first set, we don't set the second
        var groupRemoveSingleChildren = this.gridOptionsService.get('groupRemoveSingleChildren');
        var groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsService.get('groupRemoveLowestSingleChildren');
        return {
            groupRemoveLowestSingleChildren: groupRemoveLowestSingleChildren,
            groupRemoveSingleChildren: groupRemoveSingleChildren,
            isGroupMultiAutoColumn: this.gridOptionsService.isGroupMultiAutoColumn(),
            hideOpenParents: this.gridOptionsService.get('groupHideOpenParents'),
            groupIncludeTotalFooter: this.gridOptionsService.get('groupIncludeTotalFooter'),
            getGroupIncludeFooter: this.gridOptionsService.getGroupIncludeFooter(),
        };
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (details, rowsToFlatten, result, skipLeafNodes, uiLevel) {
        if (core_1._.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            var isParent = rowNode.hasChildren();
            var isSkippedLeafNode = skipLeafNodes && !isParent;
            var isRemovedSingleChildrenGroup = details.groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
            var isRemovedLowestSingleChildrenGroup = details.groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all row groups')
            var neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            var isHiddenOpenParent = details.hideOpenParents && rowNode.expanded && !rowNode.master && !neverAllowToExpand;
            var thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel);
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
                    this.recursivelyAddToRowsToDisplay(details, rowNode.childrenAfterSort, result, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    var doesRowShowFooter = details.getGroupIncludeFooter({ node: rowNode });
                    if (doesRowShowFooter) {
                        // ensure node is available.
                        rowNode.createFooter();
                        this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
                    }
                    else {
                        // remove node if it's unnecessary.
                        rowNode.destroyFooter();
                    }
                }
            }
            else if (rowNode.master && rowNode.expanded) {
                var detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(details, detailNode, result, uiLevel);
            }
        }
    };
    // duplicated method, it's also in floatingRowModel
    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (details, rowNode, result, uiLevel) {
        result.push(rowNode);
        rowNode.setUiLevel(details.isGroupMultiAutoColumn ? 0 : uiLevel);
    };
    FlattenStage.prototype.createDetailNode = function (masterNode) {
        if (core_1._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new core_1.RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (core_1._.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], FlattenStage.prototype, "columnModel", void 0);
    __decorate([
        (0, core_1.Autowired)('beans')
    ], FlattenStage.prototype, "beans", void 0);
    FlattenStage = __decorate([
        (0, core_1.Bean)('flattenStage')
    ], FlattenStage);
    return FlattenStage;
}(core_1.BeanStub));
exports.FlattenStage = FlattenStage;
