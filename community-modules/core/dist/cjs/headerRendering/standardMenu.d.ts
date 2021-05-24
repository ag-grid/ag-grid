// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { IMenuFactory } from '../interfaces/iMenuFactory';
import { Column } from '../entities/column';
import { GridBodyComp } from "../gridBodyComp/gridBodyComp";
export declare class StandardMenuFactory extends BeanStub implements IMenuFactory {
    private filterManager;
    private popupService;
    private focusController;
    private hidePopup;
    private tabListener;
    private gridBodyComp;
    registerGridComp(gridBodyComp: GridBodyComp): void;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void;
    showPopup(column: Column, positionCallback: (eMenu: HTMLElement) => void, eventSource: HTMLElement): void;
    private trapFocusWithin;
    isMenuEnabled(column: Column): boolean;
}
