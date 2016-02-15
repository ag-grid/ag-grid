// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { DragService } from "./dragService";
import HeaderRenderer from "./headerRenderer";
import { ColumnController } from "../columnController/columnController";
import Column from "../entities/column";
import GridPanel from "../gridPanel/gridPanel";
import GridOptionsWrapper from "../gridOptionsWrapper";
export declare class MoveColumnController {
    private column;
    private lastDelta;
    private clickPositionOnHeader;
    private startLeftPosition;
    private scrollSinceStart;
    private hoveringOverPixelLastTime;
    private eFloatingCloneCell;
    private eHeaderCell;
    private headerRenderer;
    private columnController;
    private floatPadding;
    private gridPanel;
    private needToMoveLeft;
    private needToMoveRight;
    private movingIntervalId;
    private intervalCount;
    private centreWidth;
    private addMovingCssToGrid;
    constructor(column: Column, eDraggableElement: HTMLElement, eRoot: HTMLElement, eHeaderCell: HTMLElement, headerRenderer: HeaderRenderer, columnController: ColumnController, dragService: DragService, gridPanel: GridPanel, gridOptionsWrapper: GridOptionsWrapper);
    private onDragStart(event);
    private onDragging(delta, finished);
    private ensureIntervalStarted();
    private ensureIntervalCleared();
    private moveInterval();
    private getColumnsAndOrphans(column);
}
