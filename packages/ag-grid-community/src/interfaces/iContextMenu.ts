import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { Column } from './iColumn';

export interface IContextMenuService {
    hideActiveMenu(): void;
    getContextMenuPosition(rowNode?: RowNode | null, column?: AgColumn | null): { x: number; y: number };
    showContextMenu(params: EventShowContextMenuParams & { anchorToElement?: HTMLElement }): void;
    handleContextMenuMouseEvent(
        mouseEvent: MouseEvent | undefined,
        touchEvent: TouchEvent | undefined,
        rowComp: RowCtrl | null,
        cellCtrl: CellCtrl
    ): void;
}

export interface ShowContextMenuParams {
    /** The `RowNode` associated with the Context Menu */
    rowNode?: RowNode | null;
    /** The `Column` associated with the Context Menu */
    column?: Column | null;
    /** The value that will be passed to the Context Menu (useful with `getContextMenuItems`). If none is passed, and `RowNode` and `Column` are provided, this will be the respective Cell value */
    value: any;
}

export interface IContextMenuParams extends ShowContextMenuParams {
    /** The x position for the Context Menu, if no value is given and `RowNode` and `Column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    x?: number;
    /** The y position for the Context Menu, if no value is given and `RowNode` and `Column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
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
