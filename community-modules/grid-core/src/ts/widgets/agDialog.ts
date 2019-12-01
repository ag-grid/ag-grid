import { DragListenerParams, DragService } from "../dragAndDrop/dragService";
import { Autowired } from "../context/context";
import { PanelOptions, AgPanel } from "./agPanel";
import { Component } from "./component";
import { _ } from "../utils";

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

export class AgDialog extends AgPanel {

    private RESIZE_TEMPLATE = `
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

    private MAXIMIZE_BTN_TEMPLATE = `<div class="ag-dialog-button"></span>`;

    @Autowired('dragService') private dragService: DragService;

    private moveElement: HTMLElement;
    private moveElementDragListener: DragListenerParams;
    private resizable: ResizableStructure = {};
    private isResizable: boolean = false;
    private movable = false;
    private isMoving = false;
    private isMaximizable: boolean = false;
    private isMaximized: boolean = false;
    private maximizeListeners: (() => void)[] = [];
    private maximizeButtonComp: Component;
    private maximizeIcon: HTMLElement;
    private minimizeIcon: HTMLElement;
    private resizeListenerDestroy: () => void | null = null;

    private resizerMap: {
        [key in ResizableSides]: MappedResizer
    };

    private isResizing: boolean = false;

    private lastPosition = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    protected config: DialogOptions | undefined;

    constructor(config?: DialogOptions) {
        super(config);
    }

    protected postConstruct() {
        const eGui = this.getGui();
        const { movable, resizable, maximizable } = this.config;

        _.addCssClass(eGui, 'ag-dialog');
        this.moveElement = this.eTitleBar;

        super.postConstruct();

        this.addDestroyableEventListener(eGui, 'focusin', (e: FocusEvent) => {
            if (eGui.contains(e.relatedTarget as HTMLElement)) { return; }
            this.popupService.bringPopupToFront(eGui);
        });

        if (movable) {
            this.setMovable(movable);
        }

        if (maximizable) { this.setMaximizable(maximizable); }

        this.addResizers();
        if (resizable) { this.setResizable(resizable); }
    }

    protected renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop, modal } = this.config;

        this.close = this.popupService.addPopup(
            modal,
            eGui,
            true,
            this.destroy.bind(this),
            undefined,
            alwaysOnTop
        );

        eGui.focus();
    }

    private addResizers() {
        const eGui = this.getGui();

        if (!eGui) { return; }

        const parser = new DOMParser();
        const resizers = parser.parseFromString(this.RESIZE_TEMPLATE, 'text/html').body;

        eGui.appendChild(resizers.firstChild);
        this.createMap();
    }

    private createMap() {
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

    private getResizerElement(side: ResizableSides): HTMLElement | null {
        return this.resizerMap[side].element;
    }

    private onResizeStart(e: MouseEvent) {
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

    private onResizeEnd() {
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

    private onMoveStart(e: MouseEvent) {
        this.isMoving = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onMove(e: MouseEvent) {
        if (!this.isMoving) { return; }
        const { x, y } = this.position;
        const { movementX, movementY } = this.calculateMouseMovement({
            e,
            isTop: true,
            anywhereWithin: true,
            topBuffer: this.getHeight() - this.getBodyHeight()
        });

        this.offsetElement(x + movementX, y + movementY);

        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onMoveEnd() {
        this.isMoving = false;
    }

    private toggleMaximize() {
        if (this.isMaximized) {
            const {x, y, width, height } = this.lastPosition;

            this.setWidth(width);
            this.setHeight(height);
            this.offsetElement(x, y);
        } else {
            this.lastPosition.width = this.getWidth();
            this.lastPosition.height = this.getHeight();
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
            this.offsetElement(0, 0);
            this.setHeight('100%');
            this.setWidth('100%');
        }

        this.isMaximized = !this.isMaximized;
        this.refreshMaximizeIcon();
    }

    private refreshMaximizeIcon() {
        _.addOrRemoveCssClass(this.maximizeIcon, 'ag-hidden', this.isMaximized);
        _.addOrRemoveCssClass(this.minimizeIcon, 'ag-hidden', !this.isMaximized);
    }

    private clearMaximizebleListeners() {
        if (this.maximizeListeners.length) {
            this.maximizeListeners.forEach(destroyListener => destroyListener());
            this.maximizeListeners.length = 0;
        }

        if (this.resizeListenerDestroy) {
            this.resizeListenerDestroy();
            this.resizeListenerDestroy = null;
        }
    }

    public destroy(): void {
        super.destroy();
        this.setResizable(false);
        this.setMovable(false);
        if (this.maximizeButtonComp) {
            this.maximizeButtonComp.destroy();
            this.maximizeButtonComp = undefined;
        }

        this.clearMaximizebleListeners();
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

    public setMovable(movable: boolean) {
        if (movable !== this.movable) {
            this.movable = movable;

            const params: DragListenerParams = this.moveElementDragListener || {
                eElement: this.moveElement,
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
    }

    public setMaximizable(maximizable: boolean) {

        if (maximizable === false) {
            this.clearMaximizebleListeners();

            if (this.maximizeButtonComp) {
                this.maximizeButtonComp.destroy();
                this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
            }
            return;
        }

        const eTitleBar = this.eTitleBar;
        if (!eTitleBar || maximizable === this.isMaximizable) { return; }

        const maximizeButtonComp = this.maximizeButtonComp = new Component(this.MAXIMIZE_BTN_TEMPLATE);
        this.getContext().wireBean(maximizeButtonComp);

        const eGui = maximizeButtonComp.getGui();
        eGui.appendChild(this.maximizeIcon = _.createIconNoSpan('maximize', this.gridOptionsWrapper));
        eGui.appendChild(this.minimizeIcon = _.createIconNoSpan('minimize', this.gridOptionsWrapper));
        _.addCssClass(this.minimizeIcon, 'ag-hidden');

        maximizeButtonComp.addDestroyableEventListener(eGui, 'click', this.toggleMaximize.bind(this));
        this.addTitleBarButton(maximizeButtonComp, 0);

        this.maximizeListeners.push(
            this.addDestroyableEventListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this))
        );

        this.resizeListenerDestroy = this.addDestroyableEventListener(this, 'resize', () => {
            this.isMaximized = false;
            this.refreshMaximizeIcon();
        });
    }
}