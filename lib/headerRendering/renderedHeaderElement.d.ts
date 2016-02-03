// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import Column from "../entities/column";
import GridOptionsWrapper from "../gridOptionsWrapper";
import { AbstractColDef } from "../entities/colDef";
export default class RenderedHeaderElement {
    private eRoot;
    private dragStartX;
    private gridOptionsWrapper;
    constructor(eRoot: HTMLElement, gridOptionsWrapper: GridOptionsWrapper);
    destroy(): void;
    refreshFilterIcon(): void;
    refreshSortIcon(): void;
    onDragStart(): void;
    onDragging(dragChange: number, finished: boolean): void;
    onIndividualColumnResized(column: Column): void;
    getGui(): HTMLElement;
    protected getGridOptionsWrapper(): GridOptionsWrapper;
    addDragHandler(eDraggableElement: any): void;
    stopDragging(listenersToRemove: any, dragChange: number): void;
    protected addHeaderClassesFromCollDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement): void;
}
