import type { DropIndicatorPosition } from 'ag-grid-community';

export interface IFile {
    id: string;
    parentId?: string;
    name: string;
    type: 'file' | 'folder';
    dateModified?: string;
    size?: number;
}

export interface FileDropIndicator {
    parentId: string | undefined;
    target: IFile | null | undefined;
    dropIndicatorPosition: DropIndicatorPosition;
}

export function getFileDropIndicator(
    files: IFile[],
    source: IFile | null | undefined,
    target: IFile | null | undefined,
    reorderOnly: boolean
): FileDropIndicator | null {
    if (!source) {
        return null;
    }

    let dropIndicatorPosition: DropIndicatorPosition = 'below';

    if (!target) {
        target = files.findLast((f) => !f.parentId) ?? source;
    }
    if (target === source) {
        return null;
    }

    let parentId = getNewParentId(source, target, reorderOnly);

    // Always find the nearest sibling to target with the same parent as source
    let targetIdx = files.length - 1;
    if (target) {
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.id === target.id) {
                targetIdx = i;
                break;
            }
        }
    }

    let minDist = Number.MAX_SAFE_INTEGER;
    let siblingIdx = -1;
    for (let i = 0; i < files.length; i++) {
        const item = files[i];
        if (item.parentId === parentId) {
            const dist = Math.abs(i - targetIdx);
            if (dist !== 0 && dist < minDist) {
                minDist = dist;
                target = item;
                siblingIdx = i;
            }
        }
    }

    // if (siblingIdx < targetIdx) {
    // dropIndicatorPosition = 'below';
    // } else if (siblingIdx > targetIdx) {
    // dropIndicatorPosition = 'above';
    // }

    if (target && target.id === parentId) {
        dropIndicatorPosition = 'inside';
    }

    return { parentId, target, dropIndicatorPosition };
}

/**
 * Finds the nearest sibling to target with the same parent as source,
 * and computes the dropIndicatorPosition (above, below, inside).
 */

/**
 * Moves a file or folder in a flat tree structure using parentId.
 * - Prevents moving a folder into itself or its descendants.
 * - Handles reordering among siblings and moving to a new parent.
 * - Returns a new array, does not mutate the input.
 */
export function moveFiles(
    files: IFile[],
    source: IFile | null | undefined,
    target: IFile | null | undefined,
    reorderOnly: boolean
): IFile[] {
    if (source === target || !source) {
        return files;
    }
    if (target && isDescendant(source, target, files)) {
        return files; // Prevent moving a folder into itself or its descendants
    }

    const filtered = files.filter((f) => f.id !== source.id);
    const ctx = getFileDropIndicator(files, source, target, reorderOnly);

    const newFile: IFile = { ...source, parentId: ctx?.parentId };

    if (!ctx) {
        // Insert at root (parentId undefined), at the end
        filtered.push(newFile);
        return filtered;
    }

    const result: IFile[] = [];
    let inserted = false;
    for (const file of filtered) {
        result.push(file);
        // Insert after the target sibling
        if (!inserted && ctx.target && file.id === ctx.target.id && file.parentId === ctx.parentId) {
            result.push(newFile);
            inserted = true;
        }
    }
    if (!inserted) {
        let lastIdx = -1;
        for (let i = result.length - 1; i >= 0; i--) {
            if (result[i].parentId === ctx.parentId) {
                lastIdx = i;
                break;
            }
        }
        if (lastIdx >= 0) {
            result.splice(lastIdx + 1, 0, newFile);
        } else {
            result.push(newFile);
        }
    }
    return result;
}

/**
 * Returns true if target is a descendant of source (or the same node).
 * Used to prevent invalid moves.
 */
function isDescendant(source: IFile, target: IFile, files: IFile[]): boolean {
    if (source.id === target.id) return true;
    let parent = target.parentId;
    while (parent) {
        if (parent === source.id) return true;
        parent = files.find((f) => f.id === parent)?.parentId;
    }
    return false;
}

/**
 * Returns the new parentId for a move operation.
 */
function getNewParentId(source: IFile, target: IFile | null | undefined, reorderOnly: boolean): string | undefined {
    if (reorderOnly) {
        return source.parentId;
    }
    if (!target) {
        return reorderOnly ? source.parentId : undefined;
    }
    if (target.type === 'folder') {
        return target.id;
    }
    return target.parentId;
}
