import { _getLocaleTextFunc } from 'ag-grid-community';
import type {
    Bean,
    BeanCollection,
    Column,
    GridOptionsService,
    GroupingApproach,
    RowNode,
    StageExecuteParams,
} from 'ag-grid-community';

export interface IRowGroupingStrategy<TData = any> extends Bean {
    execute(params: StageExecuteParams<TData>, approach: GroupingApproach): boolean | undefined | void;

    /** Called to reset the state when the strategy changes */
    reset?(): void;

    /** Gets a group or a filler node, as those nodes do not exists in ClientSideNodeManager */
    getNode(id: string): RowNode<TData> | undefined;
}

export interface GroupingRowNode<TData = any> extends RowNode<TData> {
    parent: this | null;
    allLeafChildren: this[] | null;
    childrenAfterGroup: this[] | null;
    treeParent: this | null;
    treeNodeFlags: number;
    sibling: this;
    sourceRowIndex: number;
}

/**
 * Returns if the node and all of its parents are all firstChild until ancestor node is reached
 * This is to check for [groupHideOpenParents] where we only show the expand controls for first child of a group
 *
 * @returns returns if node and all of its parents are first child until ancestor node is reached
 */
export function _isHiddenParent(node: RowNode, ancestor: RowNode, gos: GridOptionsService): boolean {
    let currentNode = node;

    const levelDiff = currentNode.level - ancestor.level;
    if (levelDiff <= 0) {
        return false;
    }

    const isHideOpenParents = gos.get('groupHideOpenParents');
    if (!isHideOpenParents) {
        return false;
    }

    for (let i = 0; i < levelDiff; i++) {
        const isFirstChild = currentNode.parent?.getFirstChild() === currentNode;
        if (!isFirstChild) {
            return false;
        }
        currentNode = currentNode.parent!;
    }
    return currentNode === ancestor;
}

export function _getGroupValue(
    column: Column | null | undefined,
    node: RowNode,
    displayedNode: RowNode,
    beans: BeanCollection
): string | null {
    const isCellBlankValue = displayedNode.key === '';
    const isGroupColForNode =
        !!displayedNode.rowGroupColumn &&
        (!column || // full width row
            column?.isRowGroupDisplayed(displayedNode.rowGroupColumn.getId())); // correct column cell
    // if value is empty and correct column
    if (isCellBlankValue && isGroupColForNode) {
        const isHiddenParent = _isHiddenParent(node, displayedNode, beans.gos);
        // ensure node is unchanged or hidden parent
        if (displayedNode === node || isHiddenParent) {
            const localeTextFunc = _getLocaleTextFunc(beans.localeSvc);
            return localeTextFunc('blanks', '(Blanks)');
        }
    }
    return null;
}
