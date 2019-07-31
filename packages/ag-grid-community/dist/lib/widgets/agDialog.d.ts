// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DragListenerParams } from "../dragAndDrop/dragService";
import { PopupService } from "./popupService";
import { ResizableStructure } from "../rendering/mixins/resizable";
import { PanelOptions, AgPanel } from "./agPanel";
export interface DialogOptions extends PanelOptions {
    eWrapper?: HTMLElement;
    modal?: boolean;
    alwaysOnTop?: boolean;
    movable?: boolean;
    resizable?: boolean | ResizableStructure;
    maximizable?: boolean;
    x?: number;
    y?: number;
    centered?: boolean;
}
declare const AgDialog_base: {
    new (...args: any[]): {
        [x: string]: any;
        addDestroyableEventListener(...args: any[]): () => void;
        MAXIMIZE_BTN_TEMPLATE: string;
        config: any;
        position: {
            x: number;
            y: number;
        };
        eTitleBar: HTMLElement;
        offsetElement(x: number, y: number): void;
        gridOptionsWrapper: import("../gridOptionsWrapper").GridOptionsWrapper;
        isMaximizable: boolean;
        isMaximized: boolean;
        maximizeListeners: (() => void)[];
        maximizeButtonComp: import("./component").Component;
        maximizeIcon: HTMLElement;
        minimizeIcon: HTMLElement;
        resizeListenerDestroy: () => void;
        lastPosition: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        postConstruct(): void;
        setMaximizable(maximizable: boolean): void;
        toggleMaximize(): void;
        refreshMaximizeIcon(): void;
        clearMaximizebleListeners(): void;
        destroy(): void;
    };
} & {
    new (...args: any[]): {
        [x: string]: any;
        dragService: import("../dragAndDrop/dragService").DragService;
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
} & typeof AgPanel;
export declare class AgDialog extends AgDialog_base {
    moveElement: HTMLElement;
    moveElementDragListener: DragListenerParams;
    config: DialogOptions | undefined;
    popupService: PopupService;
    constructor(config?: DialogOptions);
    postConstruct(): void;
    renderComponent(): void;
}
export {};
