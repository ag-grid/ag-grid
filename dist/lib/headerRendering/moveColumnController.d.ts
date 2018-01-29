// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { DropListener } from "./bodyDropTarget";
import { ColumnEventType } from "../events";
export declare class MoveColumnController implements DropListener {
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
    setColumnsVisible(columns: Column[], visible: boolean, source?: ColumnEventType): void;
    setColumnsPinned(columns: Column[], pinned: string, source?: ColumnEventType): void;
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
