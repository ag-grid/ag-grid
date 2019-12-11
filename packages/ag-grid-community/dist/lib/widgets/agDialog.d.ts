import { PanelOptions, AgPanel } from "./agPanel";
export declare type ResizableSides = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left';
export declare type ResizableStructure = {
    [key in ResizableSides]?: boolean;
};
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
export declare class AgDialog extends AgPanel {
    private RESIZE_TEMPLATE;
    private MAXIMIZE_BTN_TEMPLATE;
    private dragService;
    private moveElement;
    private moveElementDragListener;
    private resizable;
    private isResizable;
    private movable;
    private isMoving;
    private isMaximizable;
    private isMaximized;
    private maximizeListeners;
    private maximizeButtonComp;
    private maximizeIcon;
    private minimizeIcon;
    private resizeListenerDestroy;
    private resizerMap;
    private isResizing;
    private lastPosition;
    protected config: DialogOptions | undefined;
    constructor(config?: DialogOptions);
    protected postConstruct(): void;
    protected renderComponent(): void;
    private addResizers;
    private createMap;
    private getResizerElement;
    private onResizeStart;
    private onResize;
    private onResizeEnd;
    private onMoveStart;
    private onMove;
    private onMoveEnd;
    private toggleMaximize;
    private refreshMaximizeIcon;
    private clearMaximizebleListeners;
    destroy(): void;
    setResizable(resizable: boolean | ResizableStructure): void;
    setMovable(movable: boolean): void;
    setMaximizable(maximizable: boolean): void;
}
