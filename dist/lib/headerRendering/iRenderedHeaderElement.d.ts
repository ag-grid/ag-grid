// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export interface IRenderedHeaderElement {
    destroy(): void;
    onIndividualColumnResized(column: Column): void;
    getGui(): HTMLElement;
}
