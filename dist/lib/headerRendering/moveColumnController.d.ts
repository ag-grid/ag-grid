// Type definitions for ag-grid v5.0.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
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
    constructor(pinned: string);
    init(): void;
    getIconName(): string;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(): void;
    private adjustXForScroll(draggingEvent);
    private workOutNewIndex(displayedColumns, allColumns, dragColumn, direction, xAdjustedForScroll);
    private checkCenterForScrolling(xAdjustedForScroll);
    onDragging(draggingEvent: DraggingEvent, fromEnter?: boolean): void;
    private attemptMoveColumns(allMovingColumns, dragDirection, xAdjustedForScroll, fromEnter);
    private getNewIndexForColMovingLeft(displayedColumns, allColumns, dragColumn, x);
    private getNewIndexForColMovingRight(displayedColumns, allColumns, dragColumnOrGroup, x);
    private ensureIntervalStarted();
    private ensureIntervalCleared();
    private moveInterval();
}
