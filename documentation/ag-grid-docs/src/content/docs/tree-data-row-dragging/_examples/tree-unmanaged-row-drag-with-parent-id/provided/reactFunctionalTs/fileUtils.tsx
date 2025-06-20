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
    index: number;
    file: IFile | null | undefined;
    dropIndicatorPosition: DropIndicatorPosition;
}

export function getFileDropIndicator(
    files: IFile[],
    source: IFile | null | undefined,
    target: IFile | null | undefined,
    reorderOnly: boolean
): FileDropIndicator | null {
    if (!source || target === source) {
        return null;
    }

    let file = target ?? source;
    let index = 0;
    let parentId: string | undefined;
    let dropIndicatorPosition: DropIndicatorPosition = 'none';

    if (!target) {
        // Append in the root
        index = files.length;
        dropIndicatorPosition = 'none';
    } else if (target.type === 'folder') {
        parentId = target.id;
        const children = files.filter((f) => f.parentId === target.id);
        if (children.length > 0) {
            file = children[0]; // above first child
            dropIndicatorPosition = 'above';
            index = 0;
        } else {
            dropIndicatorPosition = 'inside'; // No children, drop inside the folder
            index = 0;
        }
    } else {
        parentId = getNewParentId(source, target, reorderOnly);
        const filtered = files.filter((f) => f.id !== source.id);
        const siblings = filtered.filter((f) => f.parentId === parentId);
        index = siblings.findIndex((f) => f.id === target.id);
        if (index === -1) {
            index = siblings.length;
        } else {
            index = index + 1; // always insert after target
        }
        dropIndicatorPosition = 'below';
    }

    return { parentId, index, file, dropIndicatorPosition };
}

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
    const ctx = getFileDropIndicator(files, source, target, reorderOnly);
    if (!ctx) {
        // Insert at root (parentId undefined), at the end
        const filtered = files.filter((f) => f.id !== source.id);
        const newFile: IFile = { ...source, parentId: undefined };
        const result: IFile[] = [];
        for (const file of filtered) {
            result.push(file);
        }
        // Always insert at the end of root
        result.push(newFile);
        return result;
    }
    const filtered = files.filter((f) => f.id !== source.id);
    const newFile: IFile = { ...source, parentId: ctx.parentId };
    const result: IFile[] = [];
    let siblingIdx = 0;
    let inserted = false;
    for (const file of filtered) {
        if (file.parentId === ctx.parentId) {
            if (siblingIdx === ctx.index && !inserted) {
                result.push(newFile);
                inserted = true;
            }
            siblingIdx++;
        }
        result.push(file);
    }
    if (!inserted) {
        result.push(newFile);
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
        return undefined;
    }
    if (target.type === 'folder') {
        return target.id;
    } else {
        return target.parentId;
    }
}
