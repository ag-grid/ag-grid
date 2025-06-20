import type { RowNode } from 'ag-grid-community';

import type { IFile } from './data';

/**
 * Returns true if maybeDescendant is a descendant of parent.
 */
function isDescendant(parent: IFile, maybeDescendant: IFile): boolean {
    if (!parent.children) return false;
    for (const child of parent.children) {
        if (child === maybeDescendant || isDescendant(child, maybeDescendant)) {
            return true;
        }
    }
    return false;
}

/**
 * Moves a node in the tree using AG Grid row nodes in a single traversal.
 * - If asChild is true, moves source as a child of target.
 * - Otherwise, moves source as a sibling above target.
 * Returns a new root array.
 * Prevents moving a node into its own descendant.
 */
export function moveRowNode(rowData: IFile[], source: IFile, target: IFile | null, asChild: boolean): IFile[] {
    if (!source || !target || source === target || isDescendant(source, target)) {
        return rowData;
    }
    let inserted = false;
    const traverse = (children: IFile[]): IFile[] => {
        const result: IFile[] = [];
        for (const node of children) {
            if (node === source) {
                continue; // Skip (remove) the source node
            }
            // Insert as sibling above target
            if (!inserted && !asChild && node === target) {
                result.push(source);
                inserted = true;
            }
            // Recurse into children
            const children = node.children ? traverse(node.children) : undefined;
            // Insert as child of target
            if (!inserted && asChild && node === target) {
                result.push({ ...node, children: [...(children ?? []), source] });
                inserted = true;
                continue;
            }
            result.push(children ? { ...node, children } : node);
        }
        return result;
    };
    const newTree = traverse(rowData);
    if (!inserted) {
        newTree.push(source); // If not inserted (e.g. target not found), append at root
    }
    return newTree;
}

/**
 * Returns the row node and drop indicator position for AG Grid's setRowDropPositionIndicator.
 * - If target is a folder with children, returns above the first child.
 * - If target is a folder with no children, returns inside the folder.
 * - Otherwise, returns above the target.
 */
export function getFileDropIndicator(
    source: RowNode<IFile> | null | undefined,
    target: RowNode<IFile> | null | undefined
): { row: RowNode<IFile>; dropIndicatorPosition: 'above' | 'below' | 'inside' } | null {
    if (!source || !target || !target.data) {
        return null;
    }
    if (target.data.type === 'folder') {
        const firstChild = target.childrenAfterGroup && target.childrenAfterGroup[0];
        if (firstChild) {
            return { row: firstChild, dropIndicatorPosition: 'above' };
        }
        return { row: target, dropIndicatorPosition: 'inside' };
    }
    return { row: target, dropIndicatorPosition: 'above' };
}
