var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { _, Autowired, Bean, BeanStub, RowNode } from "@ag-grid-community/core";
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
        // putting value into a wrapper so it's passed by reference
        var nextRowTop = { value: 0 };
        var skipLeafNodes = this.columnController.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = skipLeafNodes && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);
        // we do not want the footer total if the gris is empty
        var atLeastOneRowPresent = result.length > 0;
        var includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && this.gridOptionsWrapper.isGroupIncludeTotalFooter();
        if (includeGroupTotalFooter) {
            this.ensureFooterNodeExists(rootNode);
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }
        return result;
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (_.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        var hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();
        // these two are mutually exclusive, so if first set, we don't set the second
        var groupRemoveSingleChildren = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        var groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            var isParent = rowNode.hasChildren();
            var isSkippedLeafNode = skipLeafNodes && !isParent;
            var isRemovedSingleChildrenGroup = groupRemoveSingleChildren &&
                isParent &&
                rowNode.childrenAfterGroup.length === 1;
            var isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all')
            var neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            var isHiddenOpenParent = hideOpenParents && rowNode.expanded && (!neverAllowToExpand);
            var thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
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
        var isGroupMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        result.push(rowNode);
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    };
    FlattenStage.prototype.ensureFooterNodeExists = function (groupNode) {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (_.exists(groupNode.sibling)) {
            return;
        }
        var footerNode = new RowNode();
        this.context.createBean(footerNode);
        Object.keys(groupNode).forEach(function (key) {
            footerNode[key] = groupNode[key];
        });
        footerNode.footer = true;
        footerNode.setRowTop(null);
        footerNode.setRowIndex(null);
        // manually set oldRowTop to null so we discard any
        // previous information about its position.
        footerNode.oldRowTop = null;
        if (_.exists(footerNode.id)) {
            footerNode.id = 'rowGroupFooter_' + footerNode.id;
        }
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
    };
    FlattenStage.prototype.createDetailNode = function (masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new RowNode();
        this.context.createBean(detailNode);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate([
        Autowired('columnController')
    ], FlattenStage.prototype, "columnController", void 0);
    FlattenStage = __decorate([
        Bean('flattenStage')
    ], FlattenStage);
    return FlattenStage;
}(BeanStub));
export { FlattenStage };
