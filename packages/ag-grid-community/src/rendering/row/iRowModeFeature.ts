import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent } from '../../events';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { CellCtrl } from '../cell/cellCtrl';
import type { ICellRenderer } from '../cellRenderers/iCellRenderer';

export interface IRowModeFeature {
    initialiseComp(): void;
    refreshRow(params: RefreshRowsParams): void;
    shouldCreateCellSections(): boolean;
    getAllCellCtrls(): CellCtrl[];
    recreateCell(cellCtrl: CellCtrl): void;
    destroyCells(): void;
    isSuppressMouseEvent(mouseEvent: MouseEvent): boolean;
    onDisplayedColumnsChanged(): void;
    onVirtualColumnsChanged(): void;
    onColumnMoved(): void;
    onSpannedCellsUpdated(pinned: ColumnPinnedType): void;

    // Optional — only FullWidthRowFeature implements these
    getModeCellRenderer?(): ICellRenderer | null | undefined;
    setupFocus?(): void;
    onFullWidthRowFocused?(event?: CellFocusedEvent): void;
    getFullWidthElement?(): HTMLElement | null;
    getFullWidthNavigationColumn?(): AgColumn;
    onKeyboardNavigate?(keyboardEvent: KeyboardEvent): void;
    onTabKeyDown?(keyboardEvent: KeyboardEvent): void;
    onRowMouseDown?(mouseEvent: MouseEvent): void;
    setupDetailRowAutoHeight?(eGui: HTMLElement): void;
}
