// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { Column } from "../entities/column";
export declare class StandardMenuFactory implements IMenuFactory {
    private filterManager;
    private popupService;
    private gridOptionsWrapper;
    showMenu(column: Column, eventSource: HTMLElement): void;
    isMenuEnabled(column: Column): boolean;
}
