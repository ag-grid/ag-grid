import type { Context } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { isColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColumnInstanceId } from '../interfaces/iColumn';
import { _exists } from '../main-umd-noStyles';
import { depthFirstOriginalTreeSearch } from './columnFactory';
import type { ColumnState, ColumnStateParams } from './columnStateService';
import { CONTROLS_COLUMN_ID_PREFIX } from './controlsColService';

export const GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn' as const;

// Possible candidate for reuse (alot of recursive traversal duplication)
export function _getColumnsFromTree(rootColumns: (AgColumn | AgProvidedColumnGroup)[]): AgColumn[] {
    const result: AgColumn[] = [];

    const recursiveFindColumns = (childColumns: (AgColumn | AgProvidedColumnGroup)[]): void => {
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

export function getWidthOfColsInList(columnList: AgColumn[]) {
    return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
}

export function _destroyColumnTree(
    context: Context,
    oldTree: (AgColumn | AgProvidedColumnGroup)[] | null | undefined,
    newTree?: (AgColumn | AgProvidedColumnGroup)[] | null
): void {
    const oldObjectsById: { [id: ColumnInstanceId]: (AgColumn | AgProvidedColumnGroup) | null } = {};

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

export function isColumnGroupAutoCol(col: AgColumn): boolean {
    const colId = col.getId();
    return colId.startsWith(GROUP_AUTO_COLUMN_ID);
}

export function isColumnControlsCol(col: AgColumn): boolean {
    return col.getColId().startsWith(CONTROLS_COLUMN_ID_PREFIX);
}

export function convertColumnTypes(type: string | string[]): string[] {
    let typeKeys: string[] = [];

    if (type instanceof Array) {
        typeKeys = type;
    } else if (typeof type === 'string') {
        typeKeys = type.split(',');
    }
    return typeKeys;
}

export const getValueFactory =
    (stateItem: ColumnState | null, defaultState: ColumnStateParams | undefined) =>
    <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(
        key1: U,
        key2?: S
    ): { value1: ColumnStateParams[U] | undefined; value2: ColumnStateParams[S] | undefined } => {
        const obj: { value1: ColumnStateParams[U] | undefined; value2: ColumnStateParams[S] | undefined } = {
            value1: undefined,
            value2: undefined,
        };
        let calculated: boolean = false;

        if (stateItem) {
            if (stateItem[key1] !== undefined) {
                obj.value1 = stateItem[key1];
                calculated = true;
            }
            if (_exists(key2) && stateItem[key2] !== undefined) {
                obj.value2 = stateItem[key2];
                calculated = true;
            }
        }

        if (!calculated && defaultState) {
            if (defaultState[key1] !== undefined) {
                obj.value1 = defaultState[key1];
            }
            if (_exists(key2) && defaultState[key2] !== undefined) {
                obj.value2 = defaultState[key2];
            }
        }

        return obj;
    };
