import type { Context } from '../context/context';
import type { ColumnInstanceId } from '../entities/column';
import { Column } from '../entities/column';
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import type { IProvidedColumn } from '../interfaces/iProvidedColumn';
import { GROUP_AUTO_COLUMN_ID } from './autoColService';
import { depthFirstOriginalTreeSearch } from './columnFactory';

// Possible candidate for reuse (alot of recursive traversal duplication)
export function getColumnsFromTree(rootColumns: IProvidedColumn[]): Column[] {
    const result: Column[] = [];

    const recursiveFindColumns = (childColumns: IProvidedColumn[]): void => {
        for (let i = 0; i < childColumns.length; i++) {
            const child = childColumns[i];
            if (child instanceof Column) {
                result.push(child);
            } else if (child instanceof ProvidedColumnGroup) {
                recursiveFindColumns(child.getChildren());
            }
        }
    };

    recursiveFindColumns(rootColumns);

    return result;
}

export function getWidthOfColsInList(columnList: Column[]) {
    return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
}

export function destroyColumnTree(
    context: Context,
    oldTree: IProvidedColumn[] | null | undefined,
    newTree?: IProvidedColumn[] | null
): void {
    const oldObjectsById: { [id: ColumnInstanceId]: IProvidedColumn | null } = {};

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

export function isColumnGroupAutoCol(col: Column): boolean {
    const colId = col.getId();
    return colId.startsWith(GROUP_AUTO_COLUMN_ID);
}
