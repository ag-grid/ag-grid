import type { AgPropertyChangedSource } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _isSortDefValid, getSortDefFromInput, isSortDirectionValid } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType, ColumnHeaderNameChangedEvent } from '../events';
import type { Column } from '../interfaces/iColumn';
import type { ColumnState } from './columnStateUtils';
import type { ColumnTreeBuild } from './columnTree/columnTreeBuilder';

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

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * For listeners holding a group copy keyed by groupId (e.g. tool panel trees), which never hear the grid group's
 * own `headerNameChanged`. A missing columnGroup means a column rename or bulk change, so treat it as affecting every group.
 */
export function _isHeaderNameChangeForGroup(event: ColumnHeaderNameChangedEvent, groupId: string): boolean {
    return !event.columnGroup || event.columnGroup.getGroupId() === groupId;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getColumnStateFromColDef(beans: BeanCollection, colDef: ColDef, colId: string): ColumnState {
    // the state of an update: `initialSort` applies only at creation (`SortService.initCol`)
    const sort = colDef.sort;
    const sortDef = _isSortDefValid(sort) || isSortDirectionValid(sort) ? getSortDefFromInput(sort) : null;
    const showValuesAs = beans.showValuesAsSvc?.colDefSelection(colDef) ?? undefined;
    // state `headerName` is a UI rename that outranks `headerValueGetter`, so `colDef.headerName` must not become one
    return sortDef
        ? { ...colDef, colId, sort: sortDef.direction, sortType: sortDef.type, showValuesAs, headerName: undefined }
        : { ...colDef, colId, sort: undefined, showValuesAs, headerName: undefined };
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
 *  the `isAlive()` guard de-dups nodes reachable via multiple paths (hierarchy cols sit in the columns + wrappers).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _destroyColumnTreeAll = (build: ColumnTreeBuild | null): void => {
    if (!build) {
        return;
    }
    const cols = build.columns;
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        if (col.isAlive()) {
            col.destroy();
        }
    }
    const allGroups = build.allGroups;
    for (let i = 0, len = allGroups.length; i < len; ++i) {
        const group = allGroups[i];
        if (group.isAlive()) {
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
