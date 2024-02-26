import {
    _,
    Autowired,
    Bean,
    BeanStub,
    ColumnModel,
    IRowNodeStage,
    RowNode,
    StageExecuteParams,
    Beans,
    WithoutGridCommon,
    GetGroupIncludeFooterParams,
    GridOptions
} from "@ag-grid-community/core";

interface FlattenDetails {
    hideOpenParents: boolean;
    groupRemoveSingleChildren: boolean;
    groupRemoveLowestSingleChildren: boolean;
    groupIncludeTotalFooter: boolean;
    isGroupMultiAutoColumn: boolean;
    getGroupIncludeFooter: (params: WithoutGridCommon<GetGroupIncludeFooterParams<any, any>>) => boolean;
}

@Bean('flattenStage')
export class FlattenStage extends BeanStub implements IRowNodeStage {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('beans') private beans: Beans;

    public execute(params: StageExecuteParams): RowNode[] {
        const rootNode = params.rowNode;

        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        const result: RowNode[] = [];
        const skipLeafNodes = this.columnModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        const showRootNode = skipLeafNodes && rootNode.leafGroup;
        const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;

        const details = this.getFlattenDetails();

        this.recursivelyAddToRowsToDisplay(details, topList, result, skipLeafNodes, 0);

        // we do not want the footer total if the gris is empty
        const atLeastOneRowPresent = result.length > 0;

        const includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && details.groupIncludeTotalFooter;

        if (includeGroupTotalFooter) {
            rootNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rootNode.sibling, result, 0);
        }

        return result;
    }

    private getFlattenDetails(): FlattenDetails {
        // these two are mutually exclusive, so if first set, we don't set the second
        const groupRemoveSingleChildren = this.gridOptionsService.get('groupRemoveSingleChildren');
        const groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsService.get('groupRemoveLowestSingleChildren');

        return {
            groupRemoveLowestSingleChildren,
            groupRemoveSingleChildren,
            isGroupMultiAutoColumn: this.gridOptionsService.isGroupMultiAutoColumn(),
            hideOpenParents : this.gridOptionsService.get('groupHideOpenParents'),
            groupIncludeTotalFooter : this.gridOptionsService.get('groupIncludeTotalFooter'),
            getGroupIncludeFooter : this.gridOptionsService.getGroupIncludeFooter(),
        };
    }

    private recursivelyAddToRowsToDisplay(
        details: FlattenDetails,
        rowsToFlatten: RowNode[] | null,
        result: RowNode[],
        skipLeafNodes: boolean,
        uiLevel: number
    ) {
        if (_.missingOrEmpty(rowsToFlatten)) {
            return;
        }

        for (let i = 0; i < rowsToFlatten!.length; i++) {
            const rowNode = rowsToFlatten![i];
            // check all these cases, for working out if this row should be included in the final mapped list
            const isParent = rowNode.hasChildren();

            const isSkippedLeafNode = skipLeafNodes && !isParent;

            const isRemovedSingleChildrenGroup =
                details.groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup!.length === 1;

            const isRemovedLowestSingleChildrenGroup =
                details.groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup!.length === 1;

            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all row groups')
            const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;

            const isHiddenOpenParent = details.hideOpenParents && rowNode.expanded && !rowNode.master && !neverAllowToExpand;

            const thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;

            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel);
            }

            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) { continue; }

            if (isParent) {
                const excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;

                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {
                    // if the parent was excluded, then ui level is that of the parent
                    const uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(
                        details,
                        rowNode.childrenAfterSort,
                        result,
                        skipLeafNodes,
                        uiLevelForChildren
                    );

                    // put a footer in if user is looking for it
                    const doesRowShowFooter = details.getGroupIncludeFooter({ node: rowNode });
                    if (doesRowShowFooter) {
                        // ensure node is available.
                        rowNode.createFooter();
                        this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
                    } else {
                        // remove node if it's unnecessary.
                        rowNode.destroyFooter();
                    }
                }
            } else if (rowNode.master && rowNode.expanded) {
                const detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(details, detailNode, result, uiLevel);
            }
        }
    }

    // duplicated method, it's also in floatingRowModel
    private addRowNodeToRowsToDisplay(
        details: FlattenDetails,
        rowNode: RowNode,
        result: RowNode[],
        uiLevel: number
    ): void {
        result.push(rowNode);
        rowNode.setUiLevel(details.isGroupMultiAutoColumn ? 0 : uiLevel);
    }

    private createDetailNode(masterNode: RowNode): RowNode {
        if (_.exists(masterNode.detailNode)) { return masterNode.detailNode; }

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
}