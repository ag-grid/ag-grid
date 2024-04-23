import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ContainerType } from "../interfaces/iAfterGuiAttachedParams";
import { RowNode } from "../entities/rowNode";
import { ShowColumnChooserParams } from "../interfaces/iColumnChooserFactory";
interface BaseShowColumnMenuParams {
    column?: Column;
}
interface BaseShowFilterMenuParams {
    column: Column;
    containerType: ContainerType;
}
interface MouseShowMenuParams {
    mouseEvent: MouseEvent | Touch;
    positionBy: 'mouse';
}
interface ButtonShowMenuParams {
    buttonElement: HTMLElement;
    positionBy: 'button';
}
interface AutoShowMenuParams {
    positionBy: 'auto';
}
export type ShowColumnMenuParams = (MouseShowMenuParams | ButtonShowMenuParams | AutoShowMenuParams) & BaseShowColumnMenuParams;
export type ShowFilterMenuParams = (MouseShowMenuParams | ButtonShowMenuParams | AutoShowMenuParams) & BaseShowFilterMenuParams;
export interface ShowContextMenuParams {
    /** The `RowNode` associated with the Context Menu */
    rowNode?: RowNode | null;
    /** The `Column` associated with the Context Menu */
    column?: Column | null;
    /** The value that will be passed to the Context Menu (useful with `getContextMenuItems`). If none is passed, and `RowNode` and `Column` are provided, this will be the respective Cell value */
    value: any;
}
interface MouseShowContextMenuParams {
    mouseEvent: MouseEvent;
}
interface TouchShowContextMenuParam {
    touchEvent: TouchEvent;
}
export type EventShowContextMenuParams = (MouseShowContextMenuParams | TouchShowContextMenuParam) & ShowContextMenuParams;
export interface IContextMenuParams extends ShowContextMenuParams {
    /** The x position for the Context Menu, if no value is given and `RowNode` and `Column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    x?: number;
    /** The y position for the Context Menu, if no value is given and `RowNode` and `Column` are provided, this will default to be middle of the cell, otherwise it will be `0`. */
    y?: number;
}
export declare class MenuService extends BeanStub {
    private readonly filterMenuFactory;
    private ctrlsService;
    private animationFrameService;
    private filterManager;
    private rowRenderer;
    private columnChooserFactory?;
    private readonly contextMenuFactory?;
    private readonly enterpriseMenuFactory?;
    private activeMenuFactory;
    private postConstruct;
    showColumnMenu(params: ShowColumnMenuParams): void;
    showFilterMenu(params: ShowFilterMenuParams): void;
    showHeaderContextMenu(column: Column | undefined, mouseEvent?: MouseEvent, touchEvent?: TouchEvent): void;
    getContextMenuPosition(rowNode?: RowNode | null, column?: Column | null): {
        x: number;
        y: number;
    };
    showContextMenu(params: EventShowContextMenuParams & {
        anchorToElement?: HTMLElement;
    }): void;
    showColumnChooser(params: ShowColumnChooserParams): void;
    hidePopupMenu(): void;
    hideColumnChooser(): void;
    isColumnMenuInHeaderEnabled(column: Column): boolean;
    isFilterMenuInHeaderEnabled(column: Column): boolean;
    isHeaderContextMenuEnabled(column?: Column): boolean;
    isHeaderMenuButtonAlwaysShowEnabled(): boolean;
    isHeaderMenuButtonEnabled(): boolean;
    isHeaderFilterButtonEnabled(column: Column): boolean;
    isFilterMenuItemEnabled(column: Column): boolean;
    isColumnMenuAnchoringEnabled(): boolean;
    areAdditionalColumnMenuItemsEnabled(): boolean;
    isLegacyMenuEnabled(): boolean;
    isFloatingFilterButtonEnabled(column: Column): boolean;
    private getColumnMenuType;
    private isFloatingFilterButtonDisplayed;
    private isSuppressMenuHide;
    private showColumnMenuCommon;
    private getRowCtrl;
    private getCellGui;
    private getContextMenuAnchorElement;
}
export {};
