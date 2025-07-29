import type { DropIndicatorPosition } from 'ag-grid-community';

export interface IFile {
    id: string;
    parentId?: string;
    name: string;
    type: 'file' | 'folder';
    dateModified?: string;
    size?: number;
}

export interface FileDropPosition {
    parentId: string | undefined;
    source: IFile;
    target: IFile;
    position: DropIndicatorPosition;
}

const indexOfFile = (files: IFile[], file: IFile): number => files.findIndex((f) => f.id === file.id);

export function getFileDropPosition(
    files: IFile[],
    source: IFile | null | undefined,
    target: IFile | null | undefined,
    reorderOnly: boolean
): FileDropPosition | null {
    if (!source) {
        return null;
    }

    if (!target) {
        target = files.findLast((f) => f.parentId === undefined) ?? source;
    }

    if (target === source) {
        return null;
    }

    let parentId = getNewParentId(source, target, reorderOnly);

    let dropIndicatorPosition: DropIndicatorPosition = 'inside';

    if (parentId === undefined || target.id !== parentId) {
        let indexOfTarget = indexOfFile(files, target);
        const indexOfSource = indexOfFile(files, source);

        const direction = indexOfSource > indexOfTarget ? 1 : -1;
        dropIndicatorPosition = direction === 1 ? 'above' : 'below';

        for (let i = 0; i < files.length; i++) {
            const index = Math.abs(indexOfTarget + direction * i) % files.length;
            const item = files[index];
            if (item !== source && item.parentId === parentId) {
                indexOfTarget = index;
                target = item;
                break;
            }
        }
    }

    return { parentId, source, target, position: dropIndicatorPosition };
}

/**
 * Moves a file or folder in a flat tree structure using parentId.
 * - Prevents moving a folder into itself or its descendants.
 * - Handles reordering among siblings and moving to a new parent.
 * - Returns a new array, does not mutate the input.
 */
export function moveFiles(files: IFile[], { source, target, parentId, position }: FileDropPosition): IFile[] {
    if (target && isDescendant(source, target, files)) {
        return files; // Prevent moving a folder into itself or its descendants
    }

    if (source.parentId !== parentId) {
        source = { ...source, parentId }; // Update parentId if it has changed
    }

    const above = position === 'above';

    const result: IFile[] = [];
    let inserted = false;
    for (const file of files) {
        const shouldInsert = !inserted && file.id === target.id;

        if (shouldInsert && above) {
            result.push(source);
            inserted = true;
        }

        if (file.id !== source.id) {
            result.push(file);
        }

        if (shouldInsert && !above) {
            result.push(source);
            inserted = true;
        }
    }

    if (!inserted) {
        result.push(source);
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
