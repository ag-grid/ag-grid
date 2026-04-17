import type { AgPropertyChangedSource } from '../agStack/interfaces/iProperties';
import { _exists } from '../agStack/utils/generic';
import { _getSortDefFromInput, _isSortDefValid, _isSortDirectionValid, isColumn } from '../entities/agColumn';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import { depthFirstOriginalTreeSearch } from './columnFactoryUtils';
import type { ColumnState, ColumnStateParams } from './columnStateUtils';

export const GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
export const SELECTION_COLUMN_ID = 'ag-Grid-SelectionColumn';
export const ROW_NUMBERS_COLUMN_ID = 'ag-Grid-RowNumbersColumn';
export const GROUP_HIERARCHY_COLUMN_ID_PREFIX = 'ag-Grid-HierarchyColumn';

// Possible candidate for reuse (alot of recursive traversal duplication)
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Destroys nodes in `oldTree` that are NOT in `newTree`. Used for column-set transitions. */
export function _destroyColumnTree(
    oldTree: (AgColumn | AgProvidedColumnGroup)[] | null | undefined,
    newTree?: (AgColumn | AgProvidedColumnGroup)[] | null
): void {
    if (!oldTree) {
        return;
    }
    if (!newTree) {
        // Walk post-order, destroy each live node in place. isAlive() doubles as the dedup
        // guard for nodes reachable via multiple paths.
        depthFirstOriginalTreeSearch(null, oldTree, destroyIfAlive);
        return;
    }
    // Build a keep-set from newTree, then post-order destroy oldTree skipping any keep-set hits.
    const keep = new Set<AgColumn | AgProvidedColumnGroup>();
    depthFirstOriginalTreeSearch(null, newTree, (node) => {
        keep.add(node);
    });
    depthFirstOriginalTreeSearch(null, oldTree, (node) => {
        if (!keep.has(node)) {
            destroyIfAlive(node);
        }
    });
}

const destroyIfAlive = (node: AgColumn | AgProvidedColumnGroup): void => {
    if (node.isAlive()) {
        node.destroy();
    }
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isColumnGroupAutoCol(col: AgColumn): boolean {
    const colId = col.getId();
    return colId.startsWith(GROUP_AUTO_COLUMN_ID);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isColumnSelectionCol(col: ColKey): boolean {
    const id = typeof col === 'string' ? col : 'getColId' in col ? col.getColId() : col.colId;
    return id?.startsWith(SELECTION_COLUMN_ID) ?? false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isRowNumberCol(col: ColKey): boolean {
    const id = typeof col === 'string' ? col : 'getColId' in col ? col.getColId() : col.colId;
    return id?.startsWith(ROW_NUMBERS_COLUMN_ID) ?? false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isSpecialCol(col: ColKey): boolean {
    return isColumnSelectionCol(col) || isRowNumberCol(col);
}

export function convertColumnTypes(type: string | string[]): string[] {
    if (Array.isArray(type)) {
        return type;
    }
    return typeof type === 'string' ? type.split(',') : [];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _areColIdsEqual(colsA: AgColumn[] | null, colsB: AgColumn[] | null): boolean {
    if (colsA === colsB) {
        return true;
    }
    if (colsA == null || colsB == null) {
        return false;
    }
    const len = colsA.length;
    if (len !== colsB.length) {
        return false;
    }
    for (let i = 0; i < len; ++i) {
        if (colsA[i].colId !== colsB[i].colId) {
            return false;
        }
    }
    return true;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _convertColumnEventSourceType(source: AgPropertyChangedSource): ColumnEventType {
    // unfortunately they do not match so need to perform conversion
    return source === 'optionsUpdated' ? 'gridOptionsChanged' : source;
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getColumnStateFromColDef(colDef: ColDef, colId: string): ColumnState {
    const state: ColumnState = {
        ...colDef,
        sort: undefined,
        colId,
    };
    const sortDef = _getSortDefFromColDef(colDef);
    if (sortDef) {
        state.sort = sortDef.direction;
        state.sortType = sortDef.type;
    }

    return state;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getSortDefFromColDef(colDef: ColDef) {
    const { sort, initialSort } = colDef;
    const sortIsValid = _isSortDefValid(sort) || _isSortDirectionValid(sort);
    const initialSortIsValid = _isSortDefValid(initialSort) || _isSortDirectionValid(initialSort);

    if (sortIsValid) {
        return _getSortDefFromInput(sort);
    }
    if (initialSortIsValid) {
        return _getSortDefFromInput(initialSort);
    }

    return null;
}
