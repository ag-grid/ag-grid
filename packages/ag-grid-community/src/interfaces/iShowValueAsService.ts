import type { LocaleTextFunc } from 'ag-stack';

import type { ColumnState, ColumnStateParams } from '../columns/columnStateUtils';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type {
    ShowValueAs,
    ShowValueAsResult,
    ShowValueAsStateValue,
    ShowValueAsType,
    ShowValueAsValueEditorOptions,
} from '../entities/colDef-showValueAs';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType } from '../events';
import type { ChangedPath } from '../utils/changedPath';
import type { IRowNode } from './iRowNode';
import type { MenuItemDef } from './menuItem';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IShowValueAsService {
    /** Pre-computes `column.showValueAs` from the colDef (called on column create / colDef change). `applyInitial`
     *  is true only at creation — `showValueAsInitial` is create-only and must not be re-imposed on later changes. */
    resolveColumn(column: AgColumn, applyInitial: boolean): void;
    /** The colDef-declared selection (mode name or object form) for column state; `null` when disabled or none. */
    colDefSelection(colDef: ColDef): ShowValueAsStateValue;
    /** Serialises a column's active mode for column state (mode name, or `{ type, params, precision }` when those
     *  must be preserved); `null` when there is no mode. */
    toColState(column: AgColumn): ShowValueAsStateValue;
    /** Whether the column's mode is currently applying (not dormant in the current view). */
    isApplying(column: AgColumn): boolean;
    /** Whether any of the given value columns has an active mode — memoised for the per-aggregation check. */
    anyValueColHasActiveMode(valueColumns: AgColumn[] | undefined): boolean;
    /** Refresh the aggregate-dependent (Show Values As) cells across all rendered rows — for a general view refresh. */
    refreshRenderedCells(): void;
    /** Refresh the aggregate-dependent (Show Values As) cells in rendered rows the caller did not already refresh
     *  (identified by `nodes`/`path`) — for the post-edit re-aggregation top-up. */
    refreshRenderedCellsExcept(nodes: Set<RowNode> | null, path: ChangedPath | null): void;
    /** Transforms a column's raw value at a node into the value to display, or `null` for a blank cell. Call only when {@link isApplying} is true. */
    transform(column: AgColumn, rowNode: IRowNode, rawValue: any): ShowValueAsResult | null;
    /** Formats a transformed value, honouring `showValueAsFormatter` then the mode's default formatter. */
    formatValue(column: AgColumn, rowNode: IRowNode | null, transformedValue: any, rawValue: any): string | null;
    /** Applies the `showValueAs` column state (used by `applyColumnState`). */
    syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void;
    /** The active mode's localised label while it is applying (for the header indicator / screen-reader aria); `null` when none or dormant. */
    getActiveModeLabel(column: AgColumn): string | null;
    /** Tooltip (`"<label>: <description>"`) for the active mode — shared by the column menu and header indicator; `null` when none. */
    getActiveModeTooltip(column: AgColumn): string | null;
    /** Whether the column should offer the "Show Values As" column-menu submenu: a value or numeric column
     *  (numeric ones are promoted to value columns on demand), or any column the user opted in via `showValueAsConfig`. */
    isMenuEligible(column: AgColumn): boolean;
    /** Builds the column-menu "Show Values As" submenu items (None + selectable modes, active one checked). */
    getMenuItems(column: AgColumn, localeTextFunc: LocaleTextFunc): MenuItemDef[];
    /** Sets the active mode at runtime (column menu). A redraw only, unless the mode needs an aggregated total
     *  on a not-yet-aggregated column, in which case the column is promoted to a value column (re-aggregates once). */
    setColumnShowValueAs(column: AgColumn, selection: ShowValueAsType | ShowValueAs | null): void;
    /** Opens the built-in number-input popup for a base mode, committing the entered value via `onApply`. */
    openValueEditor(
        column: AgColumn,
        type: ShowValueAsType,
        onApply: (value: number) => void,
        options: ShowValueAsValueEditorOptions | undefined,
        localeTextFunc: LocaleTextFunc
    ): void;
}
