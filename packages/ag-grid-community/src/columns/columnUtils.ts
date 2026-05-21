import type { AgPropertyChangedSource } from '../agStack/interfaces/iProperties';
import { _exists } from '../agStack/utils/generic';
import { _getSortDefFromInput, _isSortDefValid, _isSortDirectionValid } from '../entities/agColumn';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import { depthFirstOriginalTreeSearch } from './columnFactoryUtils';
import type { ColumnState, ColumnStateParams } from './columnStateUtils';

export const GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
export const SELECTION_COLUMN_ID = 'ag-Grid-SelectionColumn';
export const ROW_NUMBERS_COLUMN_ID = 'ag-Grid-RowNumbersColumn';
export const GROUP_HIERARCHY_COLUMN_ID_PREFIX = 'ag-Grid-HierarchyColumn';

export function getWidthOfColsInList(columnList: AgColumn[]) {
    return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Destroys nodes in `oldTree` that are NOT in `newTree`. Used for column-set transitions. */
export function _destroyColumnTree(
    oldTree: (AgColumn | AgProvidedColumnGroup)[] | null | undefined,
    newTree?: (AgColumn | AgProvidedColumnGroup)[] | null
): void {
    if (!oldTree || oldTree === newTree) {
        return;
    }
    if (!newTree) {
        // `isAlive()` (inside `_destroyColIfAlive`) doubles as the de-duplication guard for nodes
        // reachable via multiple paths.
        depthFirstOriginalTreeSearch(null, oldTree, _destroyColIfAlive);
        return;
    }
    const keep = new Set<AgColumn | AgProvidedColumnGroup>();
    depthFirstOriginalTreeSearch(null, newTree, (node) => {
        keep.add(node);
    });
    depthFirstOriginalTreeSearch(null, oldTree, (node) => {
        if (!keep.has(node)) {
            _destroyColIfAlive(node);
        }
    });
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *  Destroys a column or group if it's still alive. Safe to call with null/undefined. */
export function _destroyColIfAlive(col: AgColumn | AgProvidedColumnGroup | null | undefined): void {
    if (col?.isAlive()) {
        col.destroy();
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isColumnGroupAutoCol(col: AgColumn): boolean {
    return col.colId.startsWith(GROUP_AUTO_COLUMN_ID);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isGroupHierarchyCol(col: AgColumn): boolean {
    return col.colId.startsWith(GROUP_HIERARCHY_COLUMN_ID_PREFIX);
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
export function _convertColumnEventSourceType(source: AgPropertyChangedSource): ColumnEventType {
    // unfortunately they do not match so need to perform conversion
    return source === 'optionsUpdated' ? 'gridOptionsChanged' : source;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _columnsMatch(column: AgColumn, key: ColKey): boolean {
    return column === key || column.colId == key || column.colDef === key;
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
