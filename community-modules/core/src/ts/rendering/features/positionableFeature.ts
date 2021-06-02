import { BeanStub } from "../../context/beanStub";
import { Autowired } from "../../context/context";
import { DragListenerParams, DragService } from "../../dragAndDrop/dragService";
import { getAbsoluteHeight, getAbsoluteWidth, setFixedHeight, setFixedWidth } from "../../utils/dom";
import { PopupService } from "../../widgets/popupService";

const RESIZE_TEMPLATE = /* html */
    `<div class="ag-resizer-wrapper">
        <div ref="eTopLeftResizer" class="ag-resizer ag-resizer-topLeft"></div>
        <div ref="eTopResizer" class="ag-resizer ag-resizer-top"></div>
        <div ref="eTopRightResizer" class="ag-resizer ag-resizer-topRight"></div>
        <div ref="eRightResizer" class="ag-resizer ag-resizer-right"></div>
        <div ref="eBottomRightResizer" class="ag-resizer ag-resizer-bottomRight"></div>
        <div ref="eBottomResizer" class="ag-resizer ag-resizer-bottom"></div>
        <div ref="eBottomLeftResizer" class="ag-resizer ag-resizer-bottomLeft"></div>
        <div ref="eLeftResizer" class="ag-resizer ag-resizer-left"></div>
    </div>`;

export interface PositionableOptions {
    popup?: boolean;
    minWidth?: number | null;
    width?: number | string | null;
    minHeight?: number | null;
    height?: number | string | null;
    centered?: boolean | null;
    calculateTopBuffer?: () => number;
    x?: number | null;
    y?: number | null;
}

export type ResizableSides = 'topLeft' |
    'top' |
    'topRight' |
    'right' |
    'bottomRight' |
    'bottom' |
    'bottomLeft' |
    'left';

export type ResizableStructure = {
    [key in ResizableSides]?: boolean;
};

interface MappedResizer {
    element: HTMLElement;
    dragSource?: DragListenerParams;
}

export class PositionableFeature extends BeanStub {

    private dragStartPosition = {
        x: 0,
        y: 0
    };

    private position = {
        x: 0,
        y: 0
    };

    private size: { width: number | undefined, height: number | undefined; } = {
        width: undefined,
        height: undefined
    };

    private resizerMap: {
        [key in ResizableSides]: MappedResizer
    };

    private minWidth: number;
    private minHeight?: number;
    private positioned = false;
    private resizersAdded = false;

    private resizeListeners: DragListenerParams[] = [];
    private moveElementDragListener: DragListenerParams | undefined;

    private offsetParent: HTMLElement;

    private isResizing: boolean = false;
    private isMoving = false;
    private resizable: ResizableStructure = {};
    private movable = false;

    @Autowired('popupService') protected readonly popupService: PopupService;
    @Autowired('dragService') private readonly dragService: DragService;

    constructor(
        private readonly element: HTMLElement,
        private readonly config: PositionableOptions = { popup: false }
    ) {
        super();
    }

    public center() {
        const eGui = this.element;

        const x = (eGui.offsetParent!.clientWidth / 2) - (this.getWidth()! / 2);
        const y = (eGui.offsetParent!.clientHeight / 2) - (this.getHeight()! / 2);

        this.offsetElement(x, y);
    }

    public initialisePosition(): void {
        const { centered, minWidth, width, minHeight, height, x, y } = this.config;
        this.minHeight = minHeight || 0;
        this.minWidth = minWidth || 0;

        if (!this.offsetParent) { this.setOffsetParent(); }

        if (width) {
            this.setWidth(width);
        }

        if (height) {
            this.setHeight(height);
        }

        if (!width || !height) {
            this.refreshSize();
        }

        if (centered) {
            this.center();
        } else if (x || y) {
            this.offsetElement(x!, y!);
        }

        this.positioned = true;
    }

    public isPositioned(): boolean {
        return this.positioned;
    }

    public getPosition(): { x: number; y: number } {
        return this.position;
    }

    public setMovable(movable: boolean, moveElement: HTMLElement) {
        if (!this.config.popup || movable === this.movable) { return; }

        this.movable = movable;

        const params: DragListenerParams = this.moveElementDragListener || {
            eElement: moveElement,
            onDragStart: this.onMoveStart.bind(this),
            onDragging: this.onMove.bind(this),
            onDragStop: this.onMoveEnd.bind(this)
        };

        if (movable) {
            this.dragService.addDragSource(params);
            this.moveElementDragListener = params;
        } else {
            this.dragService.removeDragSource(params);
            this.moveElementDragListener = undefined;
        }
    }

    public setResizable(resizable: boolean | ResizableStructure) {
        if (resizable) { this.addResizers(); }

        this.clearResizeParams();

        if (typeof resizable === 'boolean') {
            resizable = {
                topLeft: resizable,
                top: resizable,
                topRight: resizable,
                right: resizable,
                bottomRight: resizable,
                bottom: resizable,
                bottomLeft: resizable,
                left: resizable
            } as ResizableStructure;
        }

        Object.keys(resizable).forEach((side: ResizableSides) => {
            const resizableStructure = resizable as ResizableStructure;
            const val = !!resizableStructure[side];
            const resizerEl = this.getResizerElement(side);

            const params: DragListenerParams = {
                eElement: resizerEl!,
                onDragStart: this.onResizeStart.bind(this),
                onDragging: (e: MouseEvent) => this.onResize(e, side),
                onDragStop: this.onResizeEnd.bind(this),
            };

            if (!!this.resizable[side] !== val || (!this.isAlive() && !val)) {
                if (val) {
                    this.dragService.addDragSource(params);
                    this.resizeListeners.push(params);
                    resizerEl!.style.pointerEvents = 'all';
                } else {
                    resizerEl!.style.pointerEvents = 'none';
                }
            }
        });
    }

    public getHeight(): number | undefined {
        return this.size.height;
    }

    public setHeight(height: number | string) {
        const eGui = this.element;
        let isPercent = false;

        if (typeof height === 'string' && height.indexOf('%') !== -1) {
            setFixedHeight(eGui, height);
            height = getAbsoluteHeight(eGui);
            isPercent = true;
        } else {
            height = Math.max(this.minHeight!, height as number);
            const offsetParent = eGui.offsetParent;
            if (offsetParent && offsetParent.clientHeight && (height + this.position.y > offsetParent.clientHeight)) {
                height = offsetParent.clientHeight - this.position.y;
            }
        }

        if (this.size.height === height) { return; }

        this.size.height = height;

        if (!isPercent) {
            setFixedHeight(eGui, height);
        } else {
            eGui.style.maxHeight = 'unset';
            eGui.style.minHeight = 'unset';
        }
    }

    public getWidth(): number | undefined {
        return this.size.width;
    }

    public setWidth(width: number | string) {
        const eGui = this.element;
        let isPercent = false;

        if (typeof width === 'string' && width.indexOf('%') !== -1) {
            setFixedWidth(eGui, width);
            width = getAbsoluteWidth(eGui);
            isPercent = true;
        } else {
            width = Math.max(this.minWidth, width as number);
            const offsetParent = eGui.offsetParent;

            if (offsetParent && offsetParent.clientWidth && (width + this.position.x > offsetParent.clientWidth)) {
                width = offsetParent.clientWidth - this.position.x;
            }
        }

        if (this.size.width === width) { return; }

        this.size.width = width;
        if (!isPercent) {
            setFixedWidth(eGui, width);
        } else {
            eGui.style.maxWidth = 'unset';
            eGui.style.minWidth = 'unset';
        }
    }

    public offsetElement(x = 0, y = 0) {
        const ePopup = this.element;

        this.popupService.positionPopup({
            ePopup,
            x,
            y,
            minWidth: this.minWidth,
            minHeight: this.minHeight,
            keepWithinBounds: true
        });

        this.position.x = parseInt(ePopup.style.left!, 10);
        this.position.y = parseInt(ePopup.style.top!, 10);
    }

    private updateDragStartPosition(x: number, y: number) {
        this.dragStartPosition = { x, y };
    }

    private calculateMouseMovement(params: {
        e: MouseEvent,
        topBuffer?: number,
        anywhereWithin?: boolean,
        isLeft?: boolean,
        isTop?: boolean;
    }): { movementX: number, movementY: number; } {
        const parentRect = this.offsetParent.getBoundingClientRect();
        const { e, isLeft, isTop, anywhereWithin, topBuffer } = params;
        let movementX = e.clientX - this.dragStartPosition.x;
        let movementY = e.clientY - this.dragStartPosition.y;
        const width = this.getWidth();
        const height = this.getHeight();

        // skip if cursor is outside of popupParent horizontally
        let skipX = (
            parentRect.left >= e.clientX && this.position.x <= 0 ||
            parentRect.right <= e.clientX && parentRect.right <= this.position.x + parentRect.left + width!
        );

        if (!skipX) {
            if (isLeft) {
                skipX = (
                    // skip if we are moving to the left and the cursor
                    // is positioned to the right of the left side anchor
                    (movementX < 0 && e.clientX > this.position.x + parentRect.left) ||
                    // skip if we are moving to the right and the cursor
                    // is positioned to the left of the dialog
                    (movementX > 0 && e.clientX < this.position.x + parentRect.left)
                );
            } else {
                if (anywhereWithin) {
                    // if anywhereWithin is true, we allow to move
                    // as long as the cursor is within the dialog
                    skipX = (
                        (movementX < 0 && e.clientX > this.position.x + parentRect.left + width!) ||
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left)
                    );
                } else {
                    skipX = (
                        // if the movement is bound to the right side of the dialog
                        // we skip if we are moving to the left and the cursor
                        // is to the right of the dialog
                        (movementX < 0 && e.clientX > this.position.x + parentRect.left + width!) ||
                        // or skip if we are moving to the right and the cursor
                        // is to the left of the right side anchor
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left + width!)
                    );
                }
            }
        }

        movementX = skipX ? 0 : movementX;

        // skip if cursor is outside of popupParent vertically
        let skipY = (
            parentRect.top >= e.clientY && this.position.y <= 0 ||
            parentRect.bottom <= e.clientY && parentRect.bottom <= this.position.y + parentRect.top + height!
        );

        if (!skipY) {
            const offsetY = this.config.popup ? 0 : this.element.offsetTop;
            if (isTop) {
                skipY = (
                    // skip if we are moving to towards top and the cursor is
                    // below the top anchor + topBuffer
                    // note: topBuffer is used when moving the dialog using the title bar
                    (movementY < 0 && e.clientY > this.position.y + parentRect.top + offsetY + (topBuffer || 0)) ||
                    // skip if we are moving to the bottom and the cursor is
                    // above the top anchor
                    (movementY > 0 && e.clientY < this.position.y + parentRect.top + offsetY)
                );
            } else {
                skipY = (
                    // skip if we are moving towards the top and the cursor
                    // is below the bottom anchor
                    (movementY < 0 && e.clientY > this.position.y + parentRect.top + offsetY + height!) ||
                    // skip if we are moving towards the bottom and the cursor
                    // is above the bottom anchor
                    (movementY > 0 && e.clientY < this.position.y + parentRect.top + offsetY + height!)
                );
            }
        }

        movementY = skipY ? 0 : movementY;

        return { movementX, movementY };
    }

    private createResizeMap() {
        const eGui = this.element;

        this.resizerMap = {
            topLeft: { element: eGui.querySelector('[ref=eTopLeftResizer]') as HTMLElement },
            top: { element: eGui.querySelector('[ref=eTopResizer]') as HTMLElement },
            topRight: { element: eGui.querySelector('[ref=eTopRightResizer]') as HTMLElement },
            right: { element: eGui.querySelector('[ref=eRightResizer]') as HTMLElement },
            bottomRight: { element: eGui.querySelector('[ref=eBottomRightResizer]') as HTMLElement },
            bottom: { element: eGui.querySelector('[ref=eBottomResizer]') as HTMLElement },
            bottomLeft: { element: eGui.querySelector('[ref=eBottomLeftResizer]') as HTMLElement },
            left: { element: eGui.querySelector('[ref=eLeftResizer]') as HTMLElement }
        };
    }

    private addResizers() {
        if (this.resizersAdded) { return; }
        const eGui = this.element;

        if (!eGui) { return; }

        const parser = new DOMParser();
        const resizers = parser.parseFromString(RESIZE_TEMPLATE, 'text/html').body;

        eGui.appendChild(resizers.firstChild!);
        this.createResizeMap();
        this.resizersAdded = true;
    }

    private getResizerElement(side: ResizableSides): HTMLElement | null {
        return this.resizerMap[side].element;
    }

    private onResizeStart(e: MouseEvent) {
        if (!this.positioned) { this.initialisePosition(); }

        this.isResizing = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onResize(e: MouseEvent, side: ResizableSides) {
        if (!this.isResizing) { return; }

        const isLeft = !!side.match(/left/i);
        const isRight = !!side.match(/right/i);
        const isTop = !!side.match(/top/i);
        const isBottom = !!side.match(/bottom/i);
        const isHorizontal = isLeft || isRight;
        const isVertical = isTop || isBottom;
        const { movementX, movementY } = this.calculateMouseMovement({ e, isLeft, isTop });

        let offsetLeft = 0;
        let offsetTop = 0;

        if (isHorizontal && movementX) {
            const direction = isLeft ? -1 : 1;
            const oldWidth = this.getWidth();
            const newWidth = oldWidth! + (movementX * direction);
            let skipWidth = false;

            if (isLeft) {
                offsetLeft = oldWidth! - newWidth;
                if (this.position.x + offsetLeft <= 0 || newWidth <= this.minWidth) {
                    skipWidth = true;
                    offsetLeft = 0;
                }
            }

            if (!skipWidth) {
                this.setWidth(newWidth);
            }
        }

        if (isVertical && movementY) {
            const direction = isTop ? -1 : 1;
            const oldHeight = this.getHeight();
            const newHeight = oldHeight! + (movementY * direction);
            let skipHeight = false;

            if (isTop) {
                offsetTop = oldHeight! - newHeight;
                if (this.position.y + offsetTop <= 0 || newHeight <= this.minHeight!) {
                    skipHeight = true;
                    offsetTop = 0;
                }
            }

            if (!skipHeight) {
                this.setHeight(newHeight);
            }
        }

        this.updateDragStartPosition(e.clientX, e.clientY);

        if (offsetLeft || offsetTop) {
            this.offsetElement(
                this.position.x + offsetLeft,
                this.position.y + offsetTop
            );
        }
    }

    private onResizeEnd() {
        this.isResizing = false;

        const params = {
            type: 'resize',
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };

        this.dispatchEvent(params);
    }

    private refreshSize() {
        const { width, height } = this.size;
        const eGui = this.element;

        if (this.config.popup) {
            if (!width) {
                this.setWidth(eGui.offsetWidth);
            }

            if (!height) {
                this.setHeight(eGui.offsetHeight);
            }
        } else {
            this.size.width = this.element.offsetWidth;
            this.size.height = this.element.offsetHeight;
        }
    }

    private onMoveStart(e: MouseEvent) {
        this.isMoving = true;
        if (!this.positioned) { this.initialisePosition(); }
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onMove(e: MouseEvent) {
        if (!this.isMoving) { return; }
        const { x, y } = this.position;
        let topBuffer;

        if (this.config && this.config.calculateTopBuffer) {
            topBuffer = this.config.calculateTopBuffer();
        }

        const { movementX, movementY } = this.calculateMouseMovement({
            e,
            isTop: true,
            anywhereWithin: true,
            topBuffer
        });

        this.offsetElement(x + movementX, y + movementY);
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onMoveEnd() {
        this.isMoving = false;
    }

    private setOffsetParent() {
        this.offsetParent = this.config.popup ? this.popupService.getPopupParent() : this.element.offsetParent as HTMLElement;
    }

    private clearResizeParams(): void {
        while (this.resizeListeners.length) {
            const params = this.resizeListeners.pop()!;
            this.dragService.removeDragSource(params);
        }
    }

    protected destroy() {
        super.destroy();

        if (this.moveElementDragListener) {
            this.dragService.removeDragSource(this.moveElementDragListener);
        }

        this.clearResizeParams();
    }
}