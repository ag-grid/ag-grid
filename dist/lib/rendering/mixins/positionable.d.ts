// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { PopupService } from "../../widgets/popupService";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
export declare function Positionable<T extends {
    new (...args: any[]): any;
}>(target: T): {
    new (...args: any[]): {
        [x: string]: any;
        popupService: PopupService;
        gridOptionsWrapper: GridOptionsWrapper;
        renderComponent?(): void;
        config: any;
        popupParent: HTMLElement;
        minWidth: number;
        minHeight?: number;
        positioned: boolean;
        dragStartPosition: {
            x: number;
            y: number;
        };
        position: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
        postConstruct(): void;
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
        refreshSize(): void;
        offsetElement(x?: number, y?: number): void;
        getHeight(): number;
        setHeight(height: string | number): void;
        getWidth(): number;
        setWidth(width: string | number): void;
        center(): void;
    };
} & T;
