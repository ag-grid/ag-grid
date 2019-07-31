// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DragListenerParams, DragService } from "../../dragAndDrop/dragService";
export declare function Movable<T extends {
    new (...args: any[]): any;
}>(target: T): {
    new (...args: any[]): {
        [x: string]: any;
        dragService: DragService;
        config: any;
        moveElement: HTMLElement;
        moveElementDragListener: DragListenerParams;
        updateDragStartPosition(x: number, y: number): void;
        calculateMouseMovement(params: {
            e: MouseEvent;
            topBuffer?: number;
            anywhereWithin?: boolean;
            isLeft?: boolean;
            isTop?: boolean;
        }): {
            movementX: number;
            movementY: number;
        };
        position: {
            x: number;
            y: number;
        };
        getBodyHeight(): number;
        offsetElement(x: number, y: number): void;
        movable: boolean;
        isMoving: boolean;
        postConstruct(): void;
        onMoveStart(e: MouseEvent): void;
        onMove(e: MouseEvent): void;
        onMoveEnd(): void;
        destroy(): void;
        setMovable(movable: boolean): void;
    };
} & T;
