import { AgEvent, BeanStub, Column, IMenuFactory, ContainerType } from '@ag-grid-community/core';
export interface TabSelectedEvent extends AgEvent {
    key: string;
}
export declare class EnterpriseMenuFactory extends BeanStub implements IMenuFactory {
    private readonly popupService;
    private readonly focusService;
    private readonly ctrlsService;
    private readonly columnModel;
    private readonly filterManager;
    private readonly menuUtils;
    private readonly menuService;
    private lastSelectedTab;
    private activeMenu;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column | undefined, mouseEvent: MouseEvent | Touch, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterButtonClick(column: Column | undefined, eventSource: HTMLElement, containerType: ContainerType, filtersOnly?: boolean): void;
    private showMenu;
    private addStopAnchoring;
    private getMenuParams;
    private createMenu;
    private dispatchVisibleChangedEvent;
    isMenuEnabled(column: Column): boolean;
    showMenuAfterContextMenuEvent(column: Column<any> | undefined, mouseEvent?: MouseEvent | null, touchEvent?: TouchEvent | null): void;
}
