import { Component } from "../widgets/component";
import { PostConstruct } from "../context/context";
import { DragService, DragListenerParams } from "../dragAndDrop/dragService";
import { _ } from "../utils";
import { IComponent } from "../interfaces/iComponent";

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

export function Resizable<T extends { new(...args:any[]): IComponent<any> }>(target: T) {
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

        MAXIMIZE_BTN_TEMPLATE =
        `<div class="ag-dialog-button">
            <span class="ag-icon ag-icon-maximize"></span>
            <span class="ag-icon ag-icon-minimize ag-hidden"></span>
        </span>
        `;

        abstract config: any;
        abstract dragService: DragService;
        abstract position: { x: number; y: number; };
        abstract eTitleBar: HTMLElement;
        abstract minWidth: number;
        abstract minHeight: number;
        abstract getWidth(): number;
        abstract setWidth(width: number): void;
        abstract getHeight(): number;
        abstract setHeight(height: number): void;
        abstract updateDragStartPosition(x: number, y: number): void;
        abstract calculateMouseMovement(params: {
            e: MouseEvent,
            topBuffer?: number,
            anywhereWithin?: boolean,
            isLeft?: boolean,
            isTop?: boolean
        }): { movementX: number, movementY: number};
        abstract offsetDialog(x: number, y: number): void;
        abstract addTitleBarButton(button: Component, position?: number): void;
        abstract addDestroyableEventListener(...args: any[]): () => void;
        abstract isAlive(): boolean;

        resizable: ResizableStructure = {};
        isResizable: boolean = false;

        resizerMap: {
            [key in ResizableSides]: MappedResizer
        };

        isResizing: boolean = false;
        isMaximizable: boolean = false;
        isMaximized: boolean = false;
        maximizeListeners: (() => void)[] = [];
        maximizeButtonComp: Component;

        lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        @PostConstruct
        addResizer() {
            const { resizable, maximizable } = this.config;

            this.addResizers();
            if (resizable) { this.setResizable(resizable); }
            if (this.isResizable && maximizable) { this.setMaximizable(maximizable); }
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

        setResizable(resizable: boolean | ResizableStructure) {
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
                    onDragStart: this.onDialogResizeStart.bind(this),
                    onDragging: (e: MouseEvent) => this.onDialogResize(e, s),
                    onDragStop: this.onDialogResizeEnd.bind(this),
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

        onDialogResizeStart(e: MouseEvent) {
            this.isResizing = true;
            this.updateDragStartPosition(e.clientX, e.clientY);
        }

        onDialogResize(e: MouseEvent, side: ResizableSides) {
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
                this.offsetDialog(
                    this.position.x + offsetLeft,
                    this.position.y + offsetTop
                );
            }

            this.isMaximized = false;
        }

        onDialogResizeEnd() {
            this.isResizing = false;
        }

        setMaximizable(maximizable: boolean) {
            if (maximizable === false) {
                this.clearMaximizebleListeners();
                if (this.maximizeButtonComp) {
                    this.maximizeButtonComp.destroy();
                    this.maximizeButtonComp = undefined;
                }
                return;
            }

            const eTitleBar = this.eTitleBar;
            if (!this.isResizable || !eTitleBar || maximizable === this.isMaximizable) { return; }

            const maximizeButtonComp = this.maximizeButtonComp = new Component(this.MAXIMIZE_BTN_TEMPLATE);
            maximizeButtonComp.addDestroyableEventListener(maximizeButtonComp.getGui(), 'click', this.toggleMaximize.bind(this));
            this.addTitleBarButton(maximizeButtonComp, 0);

            this.maximizeListeners.push(
                this.addDestroyableEventListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this))
            );
        }

        toggleMaximize() {
            const maximizeButton = this.maximizeButtonComp.getGui();
            const maximizeEl = maximizeButton.querySelector('.ag-icon-maximize') as HTMLElement;
            const minimizeEl = maximizeButton.querySelector('.ag-icon-minimize') as HTMLElement;
            if (this.isMaximized) {
                const {x, y, width, height } = this.lastPosition;

                this.setWidth(width);
                this.setHeight(height);
                this.offsetDialog(x, y);
            } else {
                this.lastPosition.width = this.getWidth();
                this.lastPosition.height = this.getHeight();
                this.lastPosition.x = this.position.x;
                this.lastPosition.y = this.position.y;
                this.offsetDialog(0, 0);
                this.setHeight(Infinity);
                this.setWidth(Infinity);
            }

            this.isMaximized = !this.isMaximized;
            _.addOrRemoveCssClass(maximizeEl, 'ag-hidden', this.isMaximized);
            _.addOrRemoveCssClass(minimizeEl, 'ag-hidden', !this.isMaximized);
        }

        clearMaximizebleListeners() {
            if (this.maximizeListeners.length) {
                this.maximizeListeners.forEach(destroyListener => destroyListener());
                this.maximizeListeners.length = 0;
            }
        }

        destroy() {
            super.destroy();
            if (this.maximizeButtonComp) {
                this.maximizeButtonComp.destroy();
                this.maximizeButtonComp = undefined;
            }

            this.clearMaximizebleListeners();
            this.setResizable(false);
        }
    }

    return MixinClass;
}