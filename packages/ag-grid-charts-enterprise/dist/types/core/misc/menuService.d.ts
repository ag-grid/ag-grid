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
interface BaseShowContextMenuParams {
    rowNode?: RowNode | null;
    column?: Column | null;
    value: any;
    anchorToElement: HTMLElement;
}
interface MouseShowContextMenuParams {
    mouseEvent: MouseEvent;
}
interface TouchShowContextMenuParam {
    touchEvent: TouchEvent;
}
export type ShowContextMenuParams = (MouseShowContextMenuParams | TouchShowContextMenuParam) & BaseShowContextMenuParams;
export declare class MenuService extends BeanStub {
    private readonly enterpriseMenuFactory?;
    private readonly filterMenuFactory;
    private readonly contextMenuFactory?;
    private ctrlsService;
    private animationFrameService;
    private columnChooserFactory;
    private filterManager;
    private activeMenuFactory;
    private postConstruct;
    showColumnMenu(params: ShowColumnMenuParams): void;
    showFilterMenu(params: ShowFilterMenuParams): void;
    showHeaderContextMenu(column: Column | undefined, mouseEvent?: MouseEvent, touchEvent?: TouchEvent): void;
    showContextMenu(params: ShowContextMenuParams): void;
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
}
export {};
