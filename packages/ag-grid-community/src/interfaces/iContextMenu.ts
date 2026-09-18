import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType } from '../events';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { Column } from './iColumn';
import type { IRowNode } from './iRowNode';
import type { DefaultColumnMenuItem, DefaultMenuItem, MenuItemDef } from './menuItem';
import type { GetNoteParams } from './notes';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface MenuItemProviderParams {
    /** The column that was right-clicked, if any. */
    column: Column | null;
    /**
     * The column whose data the click acts on. `null` when the click was not on a cell, or was on a cell with no data
     * of its own, such as a row number or a selection checkbox.
     */
    dataColumn: Column | null;
    /** The row that was right-clicked, if any. */
    node: IRowNode | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface MenuItemMapParams {
    column: AgColumn | null;
    node: RowNode | null;
    source: ColumnEventType;
    /** The element the menu was opened from, for restoring focus. */
    sourceElement: () => HTMLElement;
    noteParams?: GetNoteParams;
}

/**
 * A stock menu item built by a provider: one item, a group of items the menu wraps in separators, or `null` when the
 * key is the provider's but the item is not available.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type MappedMenuItem = MenuItemDef | MenuItemDef[] | null;

/**
 * Implemented by a service whose feature owns some of the stock menu items: which of them a right-click offers by
 * default, and how each key becomes a menu item. The menu services decide the order in which providers are consulted.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface IMenuItemProvider {
    getContextMenuItems(params: MenuItemProviderParams): DefaultMenuItem[];
    /** Returns `undefined` for a key this provider does not own. */
    mapMenuItem(key: DefaultColumnMenuItem, params: MenuItemMapParams): MappedMenuItem | undefined;
}

export interface IContextMenuService {
    hideActiveMenu(): void;
    getContextMenuPosition(rowNode?: RowNode | null, column?: AgColumn | null): { x: number; y: number };
    showContextMenu(params: EventShowContextMenuParams & { anchorToElement?: HTMLElement }): void;
    handleContextMenuMouseEvent(
        mouseEvent: MouseEvent | undefined,
        touchEvent: TouchEvent | undefined,
        rowComp: RowCtrl | null,
        cellCtrl: CellCtrl | null
    ): void;
}

export interface ShowContextMenuParams {
    /** The row node associated with the Context Menu */
    rowNode?: IRowNode | null;
    /** The column associated with the Context Menu */
    column?: Column | null;
    /** The value that will be passed to the Context Menu (useful with `getContextMenuItems`). If none is passed, and `rowNode` and `column` are provided, this will be the respective Cell value */
    value: any;
    source: 'api' | 'ui';
}

export interface IContextMenuParams extends ShowContextMenuParams {
    /** The x position for the Context Menu, if no value is given and `rowNode` and `column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    x?: number;
    /** The y position for the Context Menu, if no value is given and `rowNode` and `column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    y?: number;
}

export interface MouseShowContextMenuParams {
    mouseEvent: MouseEvent;
}

export interface TouchShowContextMenuParam {
    touchEvent: TouchEvent;
}

export type EventShowContextMenuParams = (MouseShowContextMenuParams | TouchShowContextMenuParam) &
    ShowContextMenuParams;
