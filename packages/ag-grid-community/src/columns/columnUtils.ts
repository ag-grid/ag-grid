import type { AgPropertyChangedSource } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _isSortDefValid, getSortDefFromInput, isSortDirectionValid } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { Column } from '../interfaces/iColumn';
import type { ColumnState } from './columnStateUtils';

export const GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
export const SELECTION_COLUMN_ID = 'ag-Grid-SelectionColumn';
export const ROW_NUMBERS_COLUMN_ID = 'ag-Grid-RowNumbersColumn';
export const GROUP_HIERARCHY_COLUMN_ID_PREFIX = 'ag-Grid-HierarchyColumn';

export function getWidthOfColsInList(columnList: AgColumn[]): number {
    let width = 0;
    for (let i = 0, len = columnList.length; i < len; ++i) {
        width += columnList[i].actualWidth;
    }
    return width;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isColumnGroupAutoCol(col: Column): boolean {
    return (col as AgColumn).colKind === 'auto-group';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isColumnSelectionCol(col: Column): boolean {
    return (col as AgColumn).colKind === 'selection';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isRowNumberCol(col: Column): boolean {
    return (col as AgColumn).colKind === 'row-number';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function isSpecialCol(col: Column): boolean {
    const colKind = (col as AgColumn).colKind;
    return colKind === 'selection' || colKind === 'row-number';
}

export function convertColumnTypes(type: string | string[]): string[] {
    if (Array.isArray(type)) {
        return type;
    }
    return typeof type === 'string' ? type.split(',') : [];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _convertColumnEventSourceType(source: AgPropertyChangedSource): ColumnEventType {
    // The two enums don't match, so convert.
    return source === 'optionsUpdated' ? 'gridOptionsChanged' : source;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getColumnStateFromColDef(beans: BeanCollection, colDef: ColDef, colId: string): ColumnState {
    const sortDef = getSortDefFromColDef(colDef);
    const showValuesAs = beans.showValuesAsSvc?.colDefSelection(colDef) ?? undefined;
    return sortDef
        ? { ...colDef, colId, sort: sortDef.direction, sortType: sortDef.type, showValuesAs }
        : { ...colDef, colId, sort: undefined, showValuesAs };
}

export function getSortDefFromColDef(colDef: ColDef) {
    const { sort, initialSort } = colDef;
    const sortIsValid = _isSortDefValid(sort) || isSortDirectionValid(sort);
    const initialSortIsValid = _isSortDefValid(initialSort) || isSortDirectionValid(initialSort);
    if (sortIsValid) {
        return getSortDefFromInput(sort);
    }
    if (initialSortIsValid) {
        return getSortDefFromInput(initialSort);
    }
    return null;
}

/** Destroys every still-alive node via flat lists (not `.children`, which a reused group may have replaced);
 *  the `isAlive()` guard de-dups nodes reachable via multiple paths (hierarchy cols sit in colDefList + wrappers).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _destroyColumnTreeAll = (
    cols: readonly AgColumn[] | null,
    allGroups: readonly AgProvidedColumnGroup[] | null
): void => {
    if (cols) {
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            if (col.isAlive()) {
                col.destroy();
            }
        }
    }
    if (allGroups) {
        for (let i = 0, len = allGroups.length; i < len; ++i) {
            const group = allGroups[i];
            if (group.isAlive()) {
                group.destroy();
            }
        }
    }
};

/** Destroys prev-build nodes absent from the new build. Walks flat prev lists, not `.children`:
 *  orphans whose parent's array was replaced are otherwise unreachable.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _destroyColumnTreeUnused = (
    prevCols: readonly AgColumn[],
    prevAllGroups: readonly AgProvidedColumnGroup[],
    buildToken: number
): void => {
    for (let i = 0, len = prevCols.length; i < len; ++i) {
        const col = prevCols[i];
        if (col.buildToken !== buildToken && col.isAlive()) {
            col.destroy();
        }
    }
    for (let i = 0, len = prevAllGroups.length; i < len; ++i) {
        const group = prevAllGroups[i];
        if (group.buildToken !== buildToken && group.isAlive()) {
            group.destroy();
        }
    }
};

/** Calls `callback` for each leaf `ColDef`, recursing into `ColGroupDef` children; not called on groups. */
export function forEachColDef(columnDefs: (ColDef | ColGroupDef)[], callback: (colDef: ColDef) => void): void {
    for (let i = 0, len = columnDefs.length; i < len; ++i) {
        const def = columnDefs[i];
        if ('children' in def) {
            forEachColDef(def.children, callback);
        } else {
            callback(def);
        }
    }
}
