import type { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { CellFocusedEvent } from '../../events';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { INotesFeature } from '../../interfaces/notes';
import type { CellCtrl } from '../cell/cellCtrl';
import type { ICellRenderer } from '../cellRenderers/iCellRenderer';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type FullWidthTarget = {
    compBean: BeanStub;
    element: HTMLElement;
    column: AgColumn;
    pinned: ColumnPinnedType;
};

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

    // Optional Features
    getModeCellRenderers?(): (ICellRenderer | null | undefined)[];
    setupFocus?(): void;
    onRowFocused?(event?: CellFocusedEvent): void;
    getRowContentElement?(): HTMLElement | null;
    getNavigationColumn?(): AgColumn;
    onKeyboardNavigate?(keyboardEvent: KeyboardEvent): void;
    onTabKeyDown?(keyboardEvent: KeyboardEvent): void;
    onRowMouseDown?(mouseEvent: MouseEvent): void;
    setupDetailRowAutoHeight?(eGui: HTMLElement): void;
    prepareInitialCellCtrls?(): void;
    getInitialCellCtrls?(containerType: RowContainerType): CellCtrl[] | null;

    // Target resolution
    getTargets?(): FullWidthTarget[];
    getTarget?(element?: EventTarget | null): FullWidthTarget | undefined;
    findInfoForEvent?(event?: Event): { column: AgColumn; pinned: ColumnPinnedType } | undefined;

    // Notes
    getNotesFeature?(): INotesFeature | undefined;

    // CSS classes hook
    addInitialRowClasses?(classes: string[]): void;
}
