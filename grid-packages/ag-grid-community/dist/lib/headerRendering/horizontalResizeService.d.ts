export interface HorizontalResizeParams {
    eResizeBar: HTMLElement;
    dragStartPixels?: number;
    onResizeStart: (shiftKey: boolean) => void;
    onResizing: (delta: number) => void;
    onResizeEnd: (delta: number) => void;
}
export declare class HorizontalResizeService {
    private gridOptionsWrapper;
    private dragService;
    private eGridDiv;
    private draggingStarted;
    private dragStartX;
    private resizeAmount;
    private oldBodyCursor;
    private oldMsUserSelect;
    private oldWebkitUserSelect;
    addResizeBar(params: HorizontalResizeParams): () => void;
    private onDragStart;
    private setResizeIcons;
    private onDragStop;
    private resetIcons;
    private onDragging;
}
