import {Bean, Context, Autowired} from "../../context/context";
import {RowNode} from "../../entities/rowNode";
import {Utils as _} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {SelectionController} from "../../selectionController";
import {EventService} from "../../eventService";
import {IRowNodeStage, StageExecuteParams} from "../../interfaces/iRowNodeStage";
import {ColumnController} from "../../columnController/columnController";

@Bean('flattenStage')
export class FlattenStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;

    public execute(params: StageExecuteParams): RowNode[] {
        let rootNode = params.rowNode;

        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        let result: RowNode[] = [];

        // putting value into a wrapper so it's passed by reference
        let nextRowTop: NumberWrapper = {value: 0};

        let skipLeafNodes = this.columnController.isPivotMode();

        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        let showRootNode = skipLeafNodes && rootNode.leafGroup;
        let topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;

        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        this.resetRowTops(rootNode);

        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);

        // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
        let includeGroupTotalFooter = !showRootNode && this.gridOptionsWrapper.isGroupIncludeTotalFooter();
        if (includeGroupTotalFooter) {
            this.ensureFooterNodeExists(rootNode);
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }

        return result;
    }

    private resetRowTops(rowNode: RowNode): void {
        rowNode.clearRowTop();
        if (rowNode.hasChildren()) {
            if (rowNode.childrenAfterGroup) {
                for (let i = 0; i<rowNode.childrenAfterGroup.length; i++) {
                    this.resetRowTops(rowNode.childrenAfterGroup[i])
                }
            }
            if (rowNode.sibling) {
                rowNode.sibling.clearRowTop();
            }
        }
    }

    private recursivelyAddToRowsToDisplay(rowsToFlatten: RowNode[], result: RowNode[],
                                          nextRowTop: NumberWrapper, skipLeafNodes: boolean, uiLevel: number) {
        if (_.missingOrEmpty(rowsToFlatten)) { return; }

        let groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
        let hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();

        // these two are mutually exclusive, so if first set, we don't set the second
        let groupRemoveSingleChildren = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        let groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();

        for (let i = 0; i < rowsToFlatten.length; i++) {
            let rowNode = rowsToFlatten[i];

            // check all these cases, for working out if this row should be included in the final mapped list
            let isParent = rowNode.hasChildren();
            let isGroupSuppressedNode = groupSuppressRow && isParent;
            let isSkippedLeafNode = skipLeafNodes && !isParent;
            let isRemovedSingleChildrenGroup = groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
            let isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren && isParent && rowNode.leafGroup && rowNode.childrenAfterGroup.length === 1;

            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all')
            let neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            let isHiddenOpenParent = hideOpenParents && rowNode.expanded && (!neverAllowToExpand);

            let thisRowShouldBeRendered = !isSkippedLeafNode && !isGroupSuppressedNode && !isHiddenOpenParent && !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;

            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
            }

            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) { continue; }

            if (isParent) {

                let excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;

                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {

                    // if the parent was excluded, then ui level is that of the parent
                    let uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result,
                        nextRowTop, skipLeafNodes, uiLevelForChildren);

                    // put a footer in if user is looking for it
                    if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                        this.ensureFooterNodeExists(rowNode);
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevel);
                    }
                } else {

                }
            } else if (rowNode.master && rowNode.expanded) {
                let detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(detailNode, result, nextRowTop, uiLevel);
            }
        }
    }

    // duplicated method, it's also in floatingRowModel
    private addRowNodeToRowsToDisplay(rowNode: RowNode, result: RowNode[], nextRowTop: NumberWrapper, uiLevel: number): void {
        result.push(rowNode);
        if (_.missing(rowNode.rowHeight)) {
            let rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
            rowNode.setRowHeight(rowHeight);
        }
        rowNode.setUiLevel(uiLevel);
        rowNode.setRowTop(nextRowTop.value);
        rowNode.setRowIndex(result.length - 1);
        nextRowTop.value += rowNode.rowHeight;
    }

    private ensureFooterNodeExists(groupNode: RowNode): void {
        // only create footer node once, otherwise we have daemons and
        // the animate screws up with the daemons hanging around
        if (_.exists(groupNode.sibling)) { return; }

        let footerNode = new RowNode();
        this.context.wireBean(footerNode);
        Object.keys(groupNode).forEach(function (key) {
            (<any>footerNode)[key] = (<any>groupNode)[key];
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
            let detailNode = new RowNode();
            this.context.wireBean(detailNode);
            detailNode.detail = true;
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
    value: number
}