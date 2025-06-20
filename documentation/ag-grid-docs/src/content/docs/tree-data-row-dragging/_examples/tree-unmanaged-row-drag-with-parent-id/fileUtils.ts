import type { DropIndicatorPosition } from 'ag-grid-community';

export interface IFile {
    id: string;
    parentId?: string;
    name: string;
    type: 'file' | 'folder';
    dateModified?: string;
    size?: number;
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

export interface FileDropIndicator {
    parentId: string | undefined;
    index: number;
    file: IFile;
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
        // Insert at root: if there is a last node with no parent, set file to that and position to below
        const rootNodes = files.filter((f) => !f.parentId);
        if (rootNodes.length > 0) {
            file = rootNodes[rootNodes.length - 1];
            index = rootNodes.length;
            dropIndicatorPosition = 'below';
        }
        parentId = undefined;
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
        }
        dropIndicatorPosition = filtered.length && index === siblings.length ? 'below' : 'above';
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
    source: IFile,
    target: IFile | null | undefined,
    reorderOnly: boolean
): IFile[] {
    if (source === target) {
        return files;
    }
    const ctx = getFileDropIndicator(files, source, target, reorderOnly);
    if (!ctx) {
        return files;
    }
    if (target && isDescendant(source, target, files)) {
        return files;
    }
    const filtered = files.filter((f) => f.id !== source.id);
    let newIndex = ctx.index;
    const newFile: IFile = { ...source, parentId: ctx.parentId };
    const result: IFile[] = [];
    let siblingIdx = 0;
    let inserted = false;
    for (const file of filtered) {
        if (file.parentId === ctx.parentId) {
            if (siblingIdx === newIndex && !inserted) {
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
    if (source.id === target.id) {
        return true;
    }
    // Build a map for O(1) lookups
    const idMap = new Map<string, IFile>();
    for (const file of files) {
        idMap.set(file.id, file);
    }
    let parent = target.parentId;
    while (parent) {
        if (parent === source.id) {
            return true;
        }
        parent = idMap.get(parent)?.parentId;
    }
    return false;
}
