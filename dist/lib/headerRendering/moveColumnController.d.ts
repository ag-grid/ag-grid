// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
export declare class MoveColumnController {
    private loggerFactory;
    private columnController;
    private gridPanel;
    private dragAndDropService;
    private gridOptionsWrapper;
    private needToMoveLeft;
    private needToMoveRight;
    private movingIntervalId;
    private intervalCount;
    private logger;
    private pinned;
    private centerContainer;
    private lastDraggingEvent;
    private failedMoveAttempts;
    private eContainer;
    constructor(pinned: string, eContainer: HTMLElement);
    init(): void;
    getIconName(): string;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(): void;
    private normaliseX(x);
    private checkCenterForScrolling(xAdjustedForScroll);
    onDragging(draggingEvent: DraggingEvent, fromEnter?: boolean): void;
    private normaliseDirection(hDirection);
    private calculateOldIndex(movingCols);
    private attemptMoveColumns(dragSourceType, allMovingColumns, hDirection, xAdjusted, fromEnter);
    private calculateValidMoves(movingCols, draggingRight, x);
    private isColumnHidden(displayedColumns, col);
    private ensureIntervalStarted();
    private ensureIntervalCleared();
    private moveInterval();
}
