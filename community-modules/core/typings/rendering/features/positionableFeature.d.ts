import { BeanStub } from "../../context/beanStub";
import { PopupService } from "../../widgets/popupService";
export interface PositionableOptions {
    popup?: boolean;
    minWidth?: number | null;
    width?: number | string | null;
    minHeight?: number | null;
    height?: number | string | null;
    centered?: boolean | null;
    calculateTopBuffer?: () => number;
    /**
     * Used for when a popup needs to be resized by an element within itself
     * In that case, the feature will configured as `popup=false` but the offsetParent
     * needs to be the popupParent.
     */
    forcePopupParentAsOffsetParent?: boolean;
    x?: number | null;
    y?: number | null;
}
export declare type ResizableSides = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left';
export declare type ResizableStructure = {
    [key in ResizableSides]?: boolean;
};
export declare class PositionableFeature extends BeanStub {
    private readonly element;
    private dragStartPosition;
    private position;
    private lastSize;
    private resizerMap;
    private minWidth;
    private minHeight?;
    private positioned;
    private resizersAdded;
    private config;
    private resizeListeners;
    private moveElementDragListener;
    private offsetParent;
    private boundaryEl;
    private isResizing;
    private isMoving;
    private resizable;
    private movable;
    private currentResizer;
    protected readonly popupService: PopupService;
    private readonly dragService;
    constructor(element: HTMLElement, config?: PositionableOptions);
    center(): void;
    initialisePosition(): void;
    isPositioned(): boolean;
    getPosition(): {
        x: number;
        y: number;
    };
    setMovable(movable: boolean, moveElement: HTMLElement): void;
    setResizable(resizable: boolean | ResizableStructure): void;
    removeSizeFromEl(): void;
    restoreLastSize(): void;
    getHeight(): number | undefined;
    setHeight(height: number | string): void;
    getWidth(): number | undefined;
    setWidth(width: number | string): void;
    offsetElement(x?: number, y?: number): void;
    private setPosition;
    private updateDragStartPosition;
    private calculateMouseMovement;
    private shouldSkipX;
    private shouldSkipY;
    private createResizeMap;
    private addResizers;
    private removeResizers;
    private getResizerElement;
    private onResizeStart;
    private getSiblings;
    private getMinSizeOfSiblings;
    private applySizeToSiblings;
    private onResize;
    private onResizeEnd;
    private refreshSize;
    private onMoveStart;
    private onMove;
    private onMoveEnd;
    private setOffsetParent;
    private findBoundaryElement;
    private clearResizeListeners;
    protected destroy(): void;
}
