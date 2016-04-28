// Type definitions for ag-grid v4.1.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
export declare class MoveColumnController {
    private loggerFactory;
    private columnController;
    private gridPanel;
    private dragAndDropService;
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
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(): void;
    private adjustXForScroll(draggingEvent);
    private workOutNewIndex(displayedColumns, allColumns, draggingEvent, xAdjustedForScroll);
    private checkCenterForScrolling(xAdjustedForScroll);
    onDragging(draggingEvent: DraggingEvent): void;
    private checkColIndexAndMove(draggingEvent, xAdjustedForScroll);
    private getNewIndexForColMovingLeft(displayedColumns, allColumns, dragColumnOrGroup, x);
    private getNewIndexForColMovingRight(displayedColumns, allColumns, dragColumnOrGroup, x);
    private getColumnsAndOrphans(columnOrGroup);
    private ensureIntervalStarted();
    private ensureIntervalCleared();
    private moveInterval();
}
