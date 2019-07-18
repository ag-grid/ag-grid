import { Autowired } from "../../context/context";
import { DragService, DragListenerParams } from "../../dragAndDrop/dragService";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { EventService } from "../../eventService";
import { _ } from "../../utils";

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

export function Resizable<T extends { new(...args:any[]): any }>(target: T) {
    abstract class MixinClass extends target {
        RESIZE_TEMPLATE = `
            <div class="ag-resizer-wrapper">
                <div ref="eTopLeftResizer" class="ag-resizer ag-resizer-topLeft"></div>
                <div ref="eTopResizer" class="ag-resizer ag-resizer-top"></div>
                <div ref="eTopRightResizer" class="ag-resizer ag-resizer-topRight"></div>
                <div ref="eRightResizer" class="ag-resizer ag-resizer-right"></div>
                <div ref="eBottomRightResizer" class="ag-resizer ag-resizer-bottomRight"></div>
                <div ref="eBottomResizer" class="ag-resizer ag-resizer-bottom"></div>
                <div ref="eBottomLeftResizer" class="ag-resizer ag-resizer-bottomLeft"></div>
                <div ref="eLeftResizer" class="ag-resizer ag-resizer-left"></div>
            </div>
        `;

        @Autowired('dragService') dragService: DragService;

        abstract config: any;
        abstract minWidth: number;
        abstract minHeight: number;
        abstract position: { x: number; y: number; };
        abstract gridOptionsWrapper: GridOptionsWrapper;
        abstract updateDragStartPosition(x: number, y: number): void;
        abstract calculateMouseMovement(params: {
            e: MouseEvent,
            topBuffer?: number,
            anywhereWithin?: boolean,
            isLeft?: boolean,
            isTop?: boolean
        }): { movementX: number, movementY: number};
        abstract offsetElement(x: number, y: number): void;
        abstract isAlive(): boolean;
        abstract localEventService?: EventService;

        resizable: ResizableStructure = {};
        isResizable: boolean = false;

        resizerMap: {
            [key in ResizableSides]: MappedResizer
        };

        isResizing: boolean = false;

        lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        postConstruct() {
            super.postConstruct();
            const { resizable } = this.config;

            this.addResizers();
            if (resizable) { this.setResizable(resizable); }
        }

        addResizers() {
            const eGui = this.getGui();

            if (!eGui) { return; }

            const parser = new DOMParser();
            const resizers = parser.parseFromString(this.RESIZE_TEMPLATE, 'text/html').body;

            eGui.appendChild(resizers.firstChild);
            this.createMap();
        }

        createMap() {
            const eGui = this.getGui();
            this.resizerMap = {
                topLeft: { element: eGui.querySelector('[ref=eTopLeftResizer]') },
                top: { element: eGui.querySelector('[ref=eTopResizer]') },
                topRight: { element: eGui.querySelector('[ref=eTopRightResizer]') },
                right: { element: eGui.querySelector('[ref=eRightResizer]') },
                bottomRight: { element: eGui.querySelector('[ref=eBottomRightResizer]') },
                bottom: { element: eGui.querySelector('[ref=eBottomResizer]') },
                bottomLeft: { element: eGui.querySelector('[ref=eBottomLeftResizer]') },
                left: { element: eGui.querySelector('[ref=eLeftResizer]') }
            };
        }

        getResizerElement(side: ResizableSides): HTMLElement | null {
            return this.resizerMap[side].element;
        }

        onResizeStart(e: MouseEvent) {
            this.isResizing = true;
            this.updateDragStartPosition(e.clientX, e.clientY);
        }

        onResize(e: MouseEvent, side: ResizableSides) {
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
                const newWidth = oldWidth + (movementX * direction);
                let skipWidth = false;

                if (isLeft) {
                    offsetLeft = oldWidth - newWidth;
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
                const newHeight = oldHeight + (movementY * direction);
                let skipHeight = false;

                if (isTop) {
                    offsetTop = oldHeight - newHeight;
                    if (this.position.y + offsetTop <= 0 || newHeight <= this.minHeight) {
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

        onResizeEnd() {
            this.isResizing = false;

            const params = {
                type: 'resize',
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi()
            };

            if (this.localEventService) {
                this.localEventService.dispatchEvent(params);
            }
        }

        destroy() {
            super.destroy();
            this.setResizable(false);
        }

        public setResizable(resizable: boolean | ResizableStructure) {
            let isResizable = false;
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
                };
            }

            Object.keys(resizable).forEach(side => {
                const r = resizable as ResizableStructure;
                const s = side as ResizableSides;
                const val = !!r[s];
                const el = this.getResizerElement(s);

                const params: DragListenerParams = this.resizerMap[s].dragSource || {
                    eElement: el,
                    onDragStart: this.onResizeStart.bind(this),
                    onDragging: (e: MouseEvent) => this.onResize(e, s),
                    onDragStop: this.onResizeEnd.bind(this),
                };

                if (!!this.resizable[s] !== val || (!this.isAlive() && !val)) {
                    if (val) {
                        this.dragService.addDragSource(params);
                        el.style.pointerEvents = 'all';
                        isResizable = true;
                    } else {
                        this.dragService.removeDragSource(params);
                        el.style.pointerEvents = 'none';
                    }
                    this.resizerMap[s].dragSource = val ? params : undefined;
                }
            });

            this.isResizable = isResizable;
        }
    }

    return MixinClass as T;
}