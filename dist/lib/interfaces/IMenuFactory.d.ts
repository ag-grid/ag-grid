// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
export interface IMenuFactory {
    showMenu(column: Column, eventSource: HTMLElement): void;
    isMenuEnabled(column: Column): boolean;
}
