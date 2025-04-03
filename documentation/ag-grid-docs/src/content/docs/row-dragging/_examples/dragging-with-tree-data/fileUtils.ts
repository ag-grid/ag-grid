export interface IFile {
    id: string;
    filePath: string[];
    type: 'file' | 'folder';
    dateModified?: string;
    size?: number;
}

/**
 * Move a file or a folder. This is a pure function, it does not modify the original data.
 * @param files the list of files
 * @param source the file or folder to move
 * @param target the target file or folder to move to
 * @param reorderOnly if true, the move is a reorder only operation, not a move to a different folder
 * @returns the new list of files
 */
export function moveFiles(
    files: IFile[],
    source: IFile,
    target: IFile | null | undefined,
    reorderOnly: boolean
): IFile[] {
    if (source === target) {
        return files; // invalid move - no-op
    }

    const sourcePath = source.filePath; // folder or file to move
    let newParentPath: string[] | undefined; // folder to drop into is where we are going to move the file/folder to

    if (reorderOnly) {
        newParentPath = pathParent(sourcePath);
        if (target && !pathInSameFolder(sourcePath, target.filePath)) {
            return files; // invalid move - we are moving to a different folder
        }
    } else if (target) {
        newParentPath = target.filePath;
        if (target.type !== 'folder') {
            newParentPath = pathParent(newParentPath); // if over a file, we take the parent folder
        }
    }

    if (pathStartsWith(newParentPath, sourcePath)) {
        return files; // invalid move - we are moving a parent folder into one of its child folders
    }

    let splitIndex: number;
    if (target) {
        splitIndex = files.indexOf(target);
        if (splitIndex > files.indexOf(source)) {
            ++splitIndex; // If we are moving to the top, we move after the target
        }
    } else {
        splitIndex = files.length; // we move at the end
    }

    // All the rows before the split index not starting with the source path
    const rowsBefore = files.slice(0, splitIndex).filter((item) => !pathStartsWith(item.filePath, sourcePath));

    // All the rows starting with the source path, with the path updated
    const rowsMiddle = files
        .filter((item) => pathStartsWith(item.filePath, sourcePath))
        .map((item) => ({ ...item, filePath: pathReplaceBase(item.filePath, sourcePath, newParentPath) }));

    // All the rows after the split index not starting with the source path
    const rowsAfter = files.slice(splitIndex).filter((item) => !pathStartsWith(item.filePath, sourcePath));

    // Merge the three parts and update the grid row data
    return [...rowsBefore, ...rowsMiddle, ...rowsAfter];
}

/** Get the parent path of a path */
function pathParent(path: string[]): string[] {
    return path.slice(0, -1);
}

/** Check the given path is a subpath or equal to the given base path */
function pathStartsWith(path: string[] | undefined, base: string[]): boolean {
    return !!path && path.length >= base.length && base.every((part, i) => path[i] === part);
}

/** Check if two entries are exactly in the same folder. e.g. pathInSameFolder([a,b], [a,c]) => true */
function pathInSameFolder(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((part, i) => i === a.length - 1 || part === b[i]);
}

/** Replace the base of a path. e.g. pathReplaceBase([a,b,c], [a,b], [x,y]) => [x,y,c] */
function pathReplaceBase(path: string[], oldBase: string[], newBase: string[] = []): string[] {
    return newBase.concat(path.slice(oldBase.length - 1));
}

/** Gets the file extension from a filename */
function fileExtension(filename: string): string {
    const i = filename.lastIndexOf('.');
    return i === -1 ? '' : filename.slice(i + 1);
}

/** Get the CSS icon class for a file or folder */
export function getFileCssIcon(type: 'file' | 'folder' | undefined, filename: string): string {
    if (type !== 'file') {
        return 'far fa-folder';
    }
    switch (fileExtension(filename)) {
        case 'xls':
            return 'far fa-file-excel';
        case 'pdf':
            return 'far fa-file-pdf';
        case 'mp3':
        case 'wav':
            return 'far fa-file-audio';
    }
    return 'far fa-file-alt';
}
