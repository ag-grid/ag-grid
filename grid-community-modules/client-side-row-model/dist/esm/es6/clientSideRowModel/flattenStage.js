var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, RowNode } from "@ag-grid-community/core";
let FlattenStage = class FlattenStage extends BeanStub {
    execute(params) {
        const rootNode = params.rowNode;
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        const result = [];
        // putting value into a wrapper so it's passed by reference
        const nextRowTop = { value: 0 };
        const skipLeafNodes = this.columnModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        const showRootNode = skipLeafNodes && rootNode.leafGroup;
        const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);
        // we do not want the footer total if the gris is empty
        const atLeastOneRowPresent = result.length > 0;
        const includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && this.gridOptionsService.is('groupIncludeTotalFooter');
        if (includeGroupTotalFooter) {
            rootNode.createFooter();
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }
        return result;
    }
    recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (_.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        const hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        // these two are mutually exclusive, so if first set, we don't set the second
        const groupRemoveSingleChildren = this.gridOptionsService.is('groupRemoveSingleChildren');
        const groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsService.is('groupRemoveLowestSingleChildren');
        for (let i = 0; i < rowsToFlatten.length; i++) {
            const rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            const isParent = rowNode.hasChildren();
            const isSkippedLeafNode = skipLeafNodes && !isParent;
            const isRemovedSingleChildrenGroup = groupRemoveSingleChildren &&
                isParent &&
                rowNode.childrenAfterGroup.length === 1;
            const isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all row groups')
            const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            const isHiddenOpenParent = hideOpenParents && rowNode.expanded && !rowNode.master && (!neverAllowToExpand);
            const thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
            }
            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) {
                continue;
            }
            if (isParent) {
                const excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {
                    // if the parent was excluded, then ui level is that of the parent
                    const uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    if (this.gridOptionsService.is('groupIncludeFooter')) {
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevelForChildren);
                    }
                }
            }
            else if (rowNode.master && rowNode.expanded) {
                const detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(detailNode, result, nextRowTop, uiLevel);
            }
        }
    }
    // duplicated method, it's also in floatingRowModel
    addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel) {
        const isGroupMultiAutoColumn = this.gridOptionsService.isGroupMultiAutoColumn();
        result.push(rowNode);
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    }
    createDetailNode(masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        const detailNode = new RowNode(this.beans);
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
    }
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
export { FlattenStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdHRlblN0YWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbC9mbGF0dGVuU3RhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFHUixPQUFPLEVBR1YsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFhLFNBQVEsUUFBUTtJQUsvQixPQUFPLENBQUMsTUFBMEI7UUFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUVoQyxxRUFBcUU7UUFDckUsZ0VBQWdFO1FBQ2hFLE1BQU0sTUFBTSxHQUFjLEVBQUUsQ0FBQztRQUM3QiwyREFBMkQ7UUFDM0QsTUFBTSxVQUFVLEdBQWtCLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBQyxDQUFDO1FBQzdDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDckQsb0ZBQW9GO1FBQ3BGLGdDQUFnQztRQUNoQyxNQUFNLFlBQVksR0FBRyxhQUFhLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUN6RCxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztRQUV2RSxJQUFJLENBQUMsNkJBQTZCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxGLHVEQUF1RDtRQUN2RCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxZQUFZO1lBQ3pDLHVGQUF1RjtlQUNwRixvQkFBb0I7ZUFDcEIsSUFB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