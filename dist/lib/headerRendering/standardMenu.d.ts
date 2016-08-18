// Type definitions for ag-grid v5.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { Column } from "../entities/column";
export declare class StandardMenuFactory implements IMenuFactory {
    private filterManager;
    private popupService;
    private gridOptionsWrapper;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void;
    showPopup(column: Column, positionCallback: (eMenu: HTMLElement) => void): void;
    isMenuEnabled(column: Column): boolean;
}
