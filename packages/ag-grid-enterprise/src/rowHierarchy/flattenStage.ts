import type {
    ClientSideRowModelStage,
    GridOptions,
    IRowNodeStage,
    NamedBean,
    RowNode,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { _createRowNodeFooter, _destroyRowNodeFooter } from '../aggregation/footerUtils';
import type { FlattenDetails } from './flattenUtils';
import {
    _getFlattenDetails,
    _isRemovedLowestSingleChildrenGroup,
    _isRemovedSingleChildrenGroup,
    _shouldRowBeRendered,
} from './flattenUtils';

export class FlattenStage extends BeanStub implements IRowNodeStage<RowNode[]>, NamedBean {
    beanName = 'flattenStage' as const;

    public refreshProps: Set<keyof GridOptions<any>> = new Set([
        'groupHideParentOfSingleChild',
        'groupRemoveSingleChildren',
        'groupRemoveLowestSingleChildren',
        'groupTotalRow',
        'masterDetail',
    ]);
    public step: ClientSideRowModelStage = 'map';

    public execute(params: StageExecuteParams): RowNode[] {
        const rootNode = params.rowNode;

        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        const result: RowNode[] = [];
        const skipLeafNodes = this.beans.colModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        const showRootNode = skipLeafNodes && rootNode.leafGroup && rootNode.aggData;
        const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;

        const details = _getFlattenDetails(this.gos);

        this.recursivelyAddToRowsToDisplay(details, topList, result, skipLeafNodes, 0);

        // we do not want the footer total if the grid is empty
        const atLeastOneRowPresent = result.length > 0;
        const grandTotalRow = details.grandTotalRow;

        const includeGrandTotalRow =
            !showRootNode &&
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            atLeastOneRowPresent &&
            grandTotalRow;

        if (includeGrandTotalRow) {
            _createRowNodeFooter(rootNode, this.beans);
            // want to not render the footer row here if pinned via grid options
            if (grandTotalRow === 'pinnedBottom' || grandTotalRow === 'pinnedTop') {
                this.beans.pinnedRowModel?.setGrandTotalPinned(grandTotalRow === 'pinnedBottom' ? 'bottom' : 'top');
            } else {
                const addToTop = grandTotalRow === 'top';
                this.addRowNodeToRowsToDisplay(details, rootNode.sibling, result, 0, addToTop);
            }
        }

        return result;
    }

    private recursivelyAddToRowsToDisplay(
        details: FlattenDetails,
        rowsToFlatten: RowNode[] | null,
        result: RowNode[],
        skipLeafNodes: boolean,
        uiLevel: number
    ) {
        if (!rowsToFlatten?.length) {
            return;
        }

        for (let i = 0; i < rowsToFlatten!.length; i++) {
            const rowNode = rowsToFlatten![i];

            // check all these cases, for working out if this row should be included in the final mapped list
            const isParent = rowNode.hasChildren();

            const isRemovedSingleChildrenGroup = _isRemovedSingleChildrenGroup(details, rowNode, isParent);

            const isRemovedLowestSingleChildrenGroup = _isRemovedLowestSingleChildrenGroup(details, rowNode, isParent);

            const thisRowShouldBeRendered = _shouldRowBeRendered(
                details,
                rowNode,
                isParent,
                skipLeafNodes,
                isRemovedSingleChildrenGroup,
                isRemovedLowestSingleChildrenGroup
            );

            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel);
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
                    const doesRowShowFooter = details.groupTotalRow({ node: rowNode });
                    if (!doesRowShowFooter) {
                        _destroyRowNodeFooter(rowNode);
                    }

                    // if the parent was excluded, then ui level is that of the parent
                    const uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    if (doesRowShowFooter === 'top') {
                        _createRowNodeFooter(rowNode, this.beans);
                        this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
                    }

                    this.recursivelyAddToRowsToDisplay(
                        details,
                        rowNode.childrenAfterSort,
                        result,
                        skipLeafNodes,
                        uiLevelForChildren
                    );

                    if (doesRowShowFooter === 'bottom') {
                        _createRowNodeFooter(rowNode, this.beans);
                        this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
                    }
                }
            } else {
                const detailNode = this.beans.masterDetailSvc?.getDetail(rowNode);
                if (detailNode) {
                    this.addRowNodeToRowsToDisplay(details, detailNode, result, uiLevel);
                }
            }
        }
    }

    // duplicated method, it's also in floatingRowModel
    private addRowNodeToRowsToDisplay(
        details: FlattenDetails,
        rowNode: RowNode,
        result: RowNode[],
        uiLevel: number,
        addToTop?: boolean
    ): void {
        if (addToTop) {
            result.unshift(rowNode);
        } else {
            result.push(rowNode);
        }
        rowNode.setUiLevel(details.isGroupMultiAutoColumn ? 0 : uiLevel);
    }
}
