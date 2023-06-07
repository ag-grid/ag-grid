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
        var skipLeafNodes = this.columnModel.isPivotMode();
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
            && this.gridOptionsService.is('groupIncludeTotalFooter');
        if (includeGroupTotalFooter) {
            rootNode.createFooter();
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }
        return result;
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (_.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        var hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        // these two are mutually exclusive, so if first set, we don't set the second
        var groupRemoveSingleChildren = this.gridOptionsService.is('groupRemoveSingleChildren');
        var groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsService.is('groupRemoveLowestSingleChildren');
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
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all row groups')
            var neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            var isHiddenOpenParent = hideOpenParents && rowNode.expanded && !rowNode.master && (!neverAllowToExpand);
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
                    if (this.gridOptionsService.is('groupIncludeFooter')) {
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevelForChildren);
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
        var isGroupMultiAutoColumn = this.gridOptionsService.isGroupMultiAutoColumn();
        result.push(rowNode);
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    };
    FlattenStage.prototype.createDetailNode = function (masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new RowNode(this.beans);
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
        Autowired('columnModel')
    ], FlattenStage.prototype, "columnModel", void 0);
    __decorate([
        Autowired('beans')
    ], FlattenStage.prototype, "beans", void 0);
    FlattenStage = __decorate([
        Bean('flattenStage')
    ], FlattenStage);
    return FlattenStage;
}(BeanStub));
export { FlattenStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdHRlblN0YWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbC9mbGF0dGVuU3RhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFHUixPQUFPLEVBR1YsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQztJQUFrQyxnQ0FBUTtJQUExQzs7SUFzSUEsQ0FBQztJQWpJVSw4QkFBTyxHQUFkLFVBQWUsTUFBMEI7UUFDckMsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUVoQyxxRUFBcUU7UUFDckUsZ0VBQWdFO1FBQ2hFLElBQU0sTUFBTSxHQUFjLEVBQUUsQ0FBQztRQUM3QiwyREFBMkQ7UUFDM0QsSUFBTSxVQUFVLEdBQWtCLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBQyxDQUFDO1FBQzdDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckQsb0ZBQW9GO1FBQ3BGLGdDQUFnQztRQUNoQyxJQUFNLFlBQVksR0FBRyxhQUFhLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUN6RCxJQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztRQUV2RSxJQUFJLENBQUMsNkJBQTZCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxGLHVEQUF1RDtRQUN2RCxJQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRS9DLElBQU0sdUJBQXVCLEdBQUcsQ0FBQyxZQUFZO1lBQ3pDLHVGQUF1RjtlQUNwRixv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