import { _getLocaleTextFunc } from 'ag-grid-community';
import type { BeanCollection, Column, GridOptionsService, RowNode } from 'ag-grid-community';

/**
 * Returns if the node and all of its parents are all firstChild until ancestor node is reached
 * This is to check for [groupHideOpenParents] where we only show the expand controls for first child of a group
 *
 * @return returns if node and all of its parents are first child until ancestor node is reached
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
        const isFirstChild = currentNode.parent?.childrenAfterSort?.[0] === currentNode;
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
