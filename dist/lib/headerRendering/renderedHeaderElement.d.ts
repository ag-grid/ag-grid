// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import Column from "../entities/column";
import GridOptionsWrapper from "../gridOptionsWrapper";
import { AbstractColDef } from "../entities/colDef";
export default class RenderedHeaderElement {
    private gridOptionsWrapper;
    constructor(gridOptionsWrapper: GridOptionsWrapper);
    destroy(): void;
    refreshFilterIcon(): void;
    refreshSortIcon(): void;
    onIndividualColumnResized(column: Column): void;
    getGui(): HTMLElement;
    protected getGridOptionsWrapper(): GridOptionsWrapper;
    protected addHeaderClassesFromCollDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement): void;
}
