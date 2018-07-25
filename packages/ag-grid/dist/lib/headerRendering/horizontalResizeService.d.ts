// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface HorizontalResizeParams {
    eResizeBar: HTMLElement;
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
    private onDragStart(params, mouseEvent);
    private setResizeIcons();
    private onDragStop(params, mouseEvent);
    private resetIcons();
    private onDragging(params, mouseEvent);
}
