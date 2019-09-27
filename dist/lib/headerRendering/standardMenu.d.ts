// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { Column } from "../entities/column";
export declare class StandardMenuFactory implements IMenuFactory {
    private eventService;
    private filterManager;
    private popupService;
    private gridOptionsWrapper;
    private hidePopup;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void;
    showPopup(column: Column, positionCallback: (eMenu: HTMLElement) => void): void;
    isMenuEnabled(column: Column): boolean;
}
