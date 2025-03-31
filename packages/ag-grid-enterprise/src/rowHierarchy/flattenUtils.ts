import type {
    GetGroupIncludeFooterParams,
    GridOptions,
    GridOptionsService,
    RowNode,
    WithoutGridCommon,
} from 'ag-grid-community';
import { _getGrandTotalRow, _getGroupTotalRowCallback, _isGroupMultiAutoColumn } from 'ag-grid-community';

export interface FlattenDetails {
    hideOpenParents: boolean;
    groupHideParentOfSingleChild: GridOptions['groupHideParentOfSingleChild'];
    isGroupMultiAutoColumn: boolean;
    grandTotalRow: GridOptions['grandTotalRow'];
    groupTotalRow: (params: WithoutGridCommon<GetGroupIncludeFooterParams<any, any>>) => 'top' | 'bottom' | undefined;
}

export function _getFlattenDetails(gos: GridOptionsService): FlattenDetails {
    let groupHideParentOfSingleChild = gos.get('groupHideParentOfSingleChild');
    if (!groupHideParentOfSingleChild) {
        groupHideParentOfSingleChild = gos.get('groupRemoveSingleChildren');
        if (!groupHideParentOfSingleChild && gos.get('groupRemoveLowestSingleChildren')) {
            groupHideParentOfSingleChild = 'leafGroupsOnly';
        }
    }
    return {
        groupHideParentOfSingleChild,
        isGroupMultiAutoColumn: _isGroupMultiAutoColumn(gos),
        hideOpenParents: gos.get('groupHideOpenParents'),
        grandTotalRow: _getGrandTotalRow(gos),
        groupTotalRow: _getGroupTotalRowCallback(gos),
    };
}

export function _isRemovedSingleChildrenGroup(details: FlattenDetails, rowNode: RowNode, isParent: boolean): boolean {
    return details.groupHideParentOfSingleChild === true && isParent && rowNode.childrenAfterGroup!.length === 1;
}

export function _isRemovedLowestSingleChildrenGroup(
    details: FlattenDetails,
    rowNode: RowNode,
    isParent: boolean
): boolean | undefined {
    return (
        details.groupHideParentOfSingleChild === 'leafGroupsOnly' &&
        isParent &&
        rowNode.leafGroup &&
        rowNode.childrenAfterGroup!.length === 1
    );
}

export function _shouldRowBeRendered(
    details: FlattenDetails,
    rowNode: RowNode,
    isParent: boolean,
    skipLeafNodes: boolean,
    isRemovedSingleChildrenGroup: boolean,
    isRemovedLowestSingleChildrenGroup: boolean | undefined
): boolean {
    const isSkippedLeafNode = skipLeafNodes && !isParent;

    // hide open parents means when group is open, we don't show it. we also need to make sure the
    // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
    // the UI will never allow expanding leaf groups, however the user might via the API (or menu option 'expand all row groups')
    const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;

    const isHiddenOpenParent = details.hideOpenParents && rowNode.expanded && !rowNode.master && !neverAllowToExpand;

    return (
        !isSkippedLeafNode &&
        !isHiddenOpenParent &&
        !isRemovedSingleChildrenGroup &&
        !isRemovedLowestSingleChildrenGroup
    );
}
