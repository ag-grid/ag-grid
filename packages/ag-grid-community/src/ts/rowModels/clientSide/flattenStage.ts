import { Bean, Context, Autowired } from "../../context/context";
import { RowNode } from "../../entities/rowNode";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { SelectionController } from "../../selectionController";
import { EventService } from "../../eventService";
import { IRowNodeStage, StageExecuteParams } from "../../interfaces/iRowNodeStage";
import { ColumnController } from "../../columnController/columnController";
import { _ } from "../../utils";

@Bean('flattenStage')
export class FlattenStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;

    public execute(params: StageExecuteParams): RowNode[] {
        const rootNode = params.rowNode;

        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        const result: RowNode[] = [];

        // putting value into a wrapper so it's passed by reference
        const nextRowTop: NumberWrapper = {value: 0};

        const skipLeafNodes = this.columnController.isPivotMode();

        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        const showRootNode = skipLeafNodes && rootNode.leafGroup;
        const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;

        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);

        // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
        const includeGroupTotalFooter = !showRootNode && this.gridOptionsWrapper.isGroupIncludeTotalFooter();
        if (includeGroupTotalFooter) {
            this.ensureFooterNodeExists(rootNode);
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }

        return result;
    }

    private recursivelyAddToRowsToDisplay(rowsToFlatten: RowNode[], result: RowNode[],
                                          nextRowTop: NumberWrapper, skipLeafNodes: boolean, uiLevel: number) {
        if (_.missingOrEmpty(rowsToFlatten)) { return; }

        const groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        const hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();

        // these two are mutually exclusive, so if first set, we don't set the second
        const groupRemoveSingleChildren = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        const groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();

        for (let i = 0; i < rowsToFlatten.length; i++) {
            const rowNode = rowsToFlatten[i];

            // check all these cases, for working out if this row should be included in the final mapped list
            const isParent = rowNode.hasChildren();
            const isGroupSuppressedNode = groupSuppressRow && isParent;
            const isSkippedLeafNode = skipLeafNodes && !isParent;
            const isRemovedSingleChildrenGroup = groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
            const isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren && isParent && rowNode.leafGroup && rowNode.childrenAfterGroup.length === 1;

            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all')
            const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            const isHiddenOpenParent = hideOpenParents && rowNode.expanded && (!neverAllowToExpand);

            const thisRowShouldBeRendered = !isSkippedLeafNode && !isGroupSuppressedNode && !isHiddenOpenParent && !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;

            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
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
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result,
                        nextRowTop, skipLeafNodes, uiLevelForChildren);

                    // put a footer in if user is looking for it
                    if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                        this.ensureFooterNodeExists(rowNode);
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevel);
                    }
                }
            } else if (rowNode.master && rowNode.expanded) {
                const detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(detailNode, result, nextRowTop, uiLevel);
            }
        }
    }

    // duplicated method, it's also in floatingRowModel
    private addRowNodeToRowsToDisplay(rowNode: RowNode, result: RowNode[], nextRowTop: NumberWrapper, uiLevel: number): void {
        result.push(rowNode);
        const isGroupMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    }

    private ensureFooterNodeExists(groupNode: RowNode): void {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (_.exists(groupNode.sibling)) { return; }

        const footerNode = new RowNode();
        this.context.wireBean(footerNode);
        Object.keys(groupNode).forEach(function(key) {
            (footerNode as any)[key] = (groupNode as any)[key];
        });
        footerNode.footer = true;
        footerNode.rowTop = null;
        footerNode.oldRowTop = null;
        if (_.exists(footerNode.id)) {
            footerNode.id = 'rowGroupFooter_' + footerNode.id;
        }
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
    }

    private createDetailNode(masterNode: RowNode): RowNode {

        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        } else {
            const detailNode = new RowNode();
            this.context.wireBean(detailNode);
            detailNode.detail = true;
            detailNode.selectable = false;
            // flower was renamed to 'detail', but keeping for backwards compatibility
            detailNode.flower = detailNode.detail;
            detailNode.parent = masterNode;
            if (_.exists(masterNode.id)) {
                detailNode.id = 'detail_' + masterNode.id;
            }
            detailNode.data = masterNode.data;
            detailNode.level = masterNode.level + 1;
            masterNode.detailNode = detailNode;
            masterNode.childFlower = masterNode.detailNode; // for backwards compatibility
            return detailNode;
        }

    }
}

interface NumberWrapper {
    value: number;
}