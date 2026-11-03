import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { AgColumnHeader } from '../headerRendering/cells/column/agColumnHeader';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { CellPosition } from './iCellPosition';

export interface RowNumbersOptions extends Pick<
    ColDef,
    | 'contextMenuItems'
    | 'context'
    | 'onCellClicked'
    | 'onCellContextMenu'
    | 'onCellDoubleClicked'
    | 'headerTooltip'
    | 'headerStyle'
    | 'headerComponent'
    | 'headerComponentParams'
    | 'suppressHeaderKeyboardEvent'
    | 'suppressNavigable'
    | 'tooltip'
    | 'tooltipField'
    | 'tooltipValueGetter'
    | 'tooltipComponent'
    | 'tooltipComponentParams'
    | 'tooltipComponentSelector'
    | 'valueGetter'
    | 'valueFormatter'
    | 'maxWidth'
    | 'cellRenderer'
    | 'cellRendererSelector'
    | 'cellRendererParams'
> {
    /**
     * Set to `true` to prevent selecting all the currently visible cells in the row when clicking a Row Number.
     * @default false
     */
    suppressCellSelectionIntegration?: boolean;

    /** Set to `true` to add a resizer to each Row Number cell that allows row resizing.
     * @default false
     */
    enableRowResizer?: boolean;

    /**
     * The minimum width for the row number column.
     * @default 60
     */
    minWidth?: number;

    /**
     * The default width for the row number column.
     * When set, the column never auto-sizes narrower than it, unless `maxWidth` is smaller.
     * Updating `rowNumbers` keeps a width the user has resized the column to, within its new `minWidth` and `maxWidth`, unless the update sets a different `width` of at least `minWidth`.
     * @default 60
     */
    width?: number;

    /**
     * Whether this column is resizable.
     * @default false
     */
    resizable?: boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowNumbersService {
    column: AgColumn | null;
    refreshCols(): AgColumn<any> | null;
    /** Restore the colDef width and let the next autosize measure from scratch, for a column state reset. */
    resetColumnState(source: ColumnEventType): void;
    setupForHeader(comp: AgColumnHeader): void;
    handleMouseDownOnCell(cell: CellPosition, mouseEvent: MouseEvent): boolean;
    handleKeyDownOnCell(cell: CellPosition, event: KeyboardEvent): boolean;
    /** Selects all cells on Space or Enter on the row number header, after `suppressHeaderKeyboardEvent`. */
    handleKeyDownOnHeader(column: AgColumn, event: KeyboardEvent): void;
    createRowNumbersRowResizerFeature(ctrl: CellCtrl): IRowNumbersRowResizeFeature | undefined;
}

export interface IRowNumbersRowResizeFeature {
    refreshRowResizer(): void;
    destroy(): void;
}
