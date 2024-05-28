import type { Context } from '../context/context';
import { type InternalColumn, isColumn } from '../entities/column';
import { type InternalProvidedColumnGroup, isProvidedColumnGroup } from '../entities/providedColumnGroup';
import type { ColumnInstanceId } from '../interfaces/iColumn';
import { GROUP_AUTO_COLUMN_ID } from './autoColService';
import { depthFirstOriginalTreeSearch } from './columnFactory';

// Possible candidate for reuse (alot of recursive traversal duplication)
export function getColumnsFromTree(rootColumns: (InternalColumn | InternalProvidedColumnGroup)[]): InternalColumn[] {
    const result: InternalColumn[] = [];

    const recursiveFindColumns = (childColumns: (InternalColumn | InternalProvidedColumnGroup)[]): void => {
        for (let i = 0; i < childColumns.length; i++) {
            const child = childColumns[i];
            if (isColumn(child)) {
                result.push(child);
            } else if (isProvidedColumnGroup(child)) {
                recursiveFindColumns(child.getChildren());
            }
        }
    };

    recursiveFindColumns(rootColumns);

    return result;
}

export function getWidthOfColsInList(columnList: InternalColumn[]) {
    return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
}

export function destroyColumnTree(
    context: Context,
    oldTree: (InternalColumn | InternalProvidedColumnGroup)[] | null | undefined,
    newTree?: (InternalColumn | InternalProvidedColumnGroup)[] | null
): void {
    const oldObjectsById: { [id: ColumnInstanceId]: (InternalColumn | InternalProvidedColumnGroup) | null } = {};

    if (!oldTree) {
        return;
    }

    // add in all old columns to be destroyed
    depthFirstOriginalTreeSearch(null, oldTree, (child) => {
        oldObjectsById[child.getInstanceId()] = child;
    });

    // however we don't destroy anything in the new tree. if destroying the grid, there is no new tree
    if (newTree) {
        depthFirstOriginalTreeSearch(null, newTree, (child) => {
            oldObjectsById[child.getInstanceId()] = null;
        });
    }

    // what's left can be destroyed
    const colsToDestroy = Object.values(oldObjectsById).filter((item) => item != null);
    context.destroyBeans(colsToDestroy);
}

export function isColumnGroupAutoCol(col: InternalColumn): boolean {
    const colId = col.getId();
    return colId.startsWith(GROUP_AUTO_COLUMN_ID);
}
