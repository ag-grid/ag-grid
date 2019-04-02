import { DragService, DragListenerParams } from "../dragAndDrop/dragService";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";
import { PopupComponent } from "./popupComponent";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { DialogEvent } from "../events";
import { _ } from "../utils";
import { Component } from "./component";

type ResizableSides = 'topLeft' |
                      'top' |
                      'topRight' |
                      'right' |
                      'bottomRight' |
                      'bottom' |
                      'bottomLeft' |
                      'left';

type ResizableStructure = {
    [key in ResizableSides]?: boolean;
};

export interface DialogOptions {
    component?: Component;
    movable?: boolean;
    resizable?: boolean | ResizableStructure;
    closable?: boolean;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    centered?: boolean;
}

export class Dialog extends PopupComponent {

    public static EVENT_MOVE = 'dialogMoved';
    public static EVENT_RESIZE = 'dialogResized';

    private static TEMPLATE =
        `<div class="ag-dialog">
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
            <div ref="eTitleBar" class="ag-dialog-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-dialog-title-bar-title"></span>
                <div ref="eTitleBarButtons">
                    <span ref="eClose" class="ag-dialog-button-close"></span>
                </div>
            </div>
            <div ref="eContentWrapper" class="ag-dialog-content-wrapper"></div>
        </div>`;

    private config: DialogOptions | undefined;
    private resizable: ResizableStructure = {};
    private movable = false;
    private closable = true;
    private isMoving = false;
    private isResizing = false;
    private dragStartPosition = {
        x: 0,
        y: 0
    };

    private position = {
        x: 0,
        y: 0
    };

    private size = {
        width: 0,
        height: 0
    };

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eContentWrapper') private eContentWrapper: HTMLElement;
    @RefSelector('eTitleBar') private eTitleBar: HTMLElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;
    @RefSelector('eClose') private eClose: HTMLElement;

    @RefSelector('eTopLeftResizer') private eTopLeftResizer: HTMLElement;
    @RefSelector('eTopResizer') private eTopResizer: HTMLElement;
    @RefSelector('eTopRightResizer') private eTopRightResizer: HTMLElement;
    @RefSelector('eRightResizer') private eRightResizer: HTMLElement;
    @RefSelector('eBottomRightResizer') private eBottomRightResizer: HTMLElement;
    @RefSelector('eBottomResizer') private eBottomResizer: HTMLElement;
    @RefSelector('eBottomLeftResizer') private eBottomLeftResizer: HTMLElement;
    @RefSelector('eLeftResizer') private eLeftResizer: HTMLElement;

    protected close: () => void;

    constructor(config?: DialogOptions) {
        super(Dialog.TEMPLATE);
        this.config = config;
    }

    @PostConstruct
    protected postConstruct() {
        const {
            component,
            centered,
            resizable,
            movable,
            closable,
            title,
            width,
            height
        } = this.config;

        let { x, y } = this.config;

        const eGui = this.getGui();

        if (component) { this.setBodyComponent(component); }
        if (resizable) { this.setResizable(resizable); }
        if (title) { this.setTitle(title); }

        this.setMovable(!!movable);

        this.setClosable(closable != null ? closable : this.closable);

        if (width) {
            _.setFixedWidth(eGui, width);
            this.size.width = width;
        }

        if (height) {
            _.setFixedHeight(eGui, height);
            this.size.height = height;
        }

        this.close = this.popupService.addPopup(
            false,
            eGui,
            false,
            this.destroy.bind(this)
        );

        this.refreshSize();

        if (centered) {
            x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
            y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);
        }

        if (x || y) {
            this.offsetDialog(x, y);
        }

        this.addDestroyableEventListener(eGui, 'mousedown', (e) => {
            _.addCssClass(eGui.offsetParent as HTMLElement, 'ag-unselectable');
            if ((e.target as HTMLElement).contains(this.eClose)) {
                return;
            }
            this.popupService.bringPopupToFront(eGui);
        });
        this.addDestroyableEventListener(this.eClose, 'click', this.onBtClose.bind(this));
    }

    private updateDragStartPosition(x: number, y: number) {
        this.dragStartPosition = { x, y };
    }

    private getResizerElement(side: ResizableSides): HTMLElement | null {
        const map = {
            topLeft: this.eTopLeftResizer,
            top: this.eTopResizer,
            topRight: this.eTopRightResizer,
            right: this.eRightResizer,
            bottomRight: this.eBottomRightResizer,
            bottom: this.eBottomResizer,
            bottomLeft: this.eBottomLeftResizer,
            left: this.eLeftResizer
        };

        return map[side];
    }

    public setResizable(resizable: boolean | ResizableStructure) {
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

            const params: DragListenerParams = {
                eElement: el,
                onDragStart: this.onDialogResizeStart.bind(this),
                onDragging: (e: MouseEvent) => this.onDialogResize(e, s),
                onDragStop: this.onDialogResizeEnd.bind(this),
            };

            if (!!this.resizable[s] !== val) {
                if (val) {
                    this.dragService.addDragSource(params);
                    el.style.pointerEvents = 'all';
                } else {
                    this.dragService.addDragSource(params);
                    el.style.pointerEvents = 'none';
                }
            }
        });
    }

    private onDialogResizeStart(e: MouseEvent) {
        this.isResizing = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onDialogResize(e: MouseEvent, side: ResizableSides) {
        if (!this.isResizing) { return; }

        const isLeft = !!side.match(/left/i);
        const isRight = !!side.match(/right/i);
        const isTop = !!side.match(/top/i);
        const isBottom = !!side.match(/bottom/i);
        const isHorizontal = isLeft || isRight;
        const isVertical = isTop || isBottom;

        let offsetLeft = 0;
        let offsetTop = 0;

        if (isHorizontal) {
            const direction = isLeft ? -1 : 1;
            const oldWidth = this.getWidth();
            const movementX = e.clientX - this.dragStartPosition.x;

            this.setWidth(oldWidth + (movementX * direction), true);

            if (isLeft) {
                offsetLeft = oldWidth - this.getWidth();
            }
        }

        if (isVertical) {
            const direction = isTop ? -1 : 1;
            const oldHeight = this.getHeight();
            const movementY = e.clientY - this.dragStartPosition.y;

            this.setHeight(oldHeight + (movementY * direction), true);

            if (isTop) {
                offsetTop = oldHeight - this.getHeight();
            }
        }

        this.updateDragStartPosition(e.clientX, e.clientY);

        if (offsetLeft || offsetTop) {
            this.offsetDialog(
                this.position.x + offsetLeft,
                this.position.y + offsetTop
            );
        }

        this.buildParamsAndDispatchEvent(Dialog.EVENT_RESIZE);
    }

    private onDialogResizeEnd() {
        this.isResizing = false;
    }

    private refreshSize() {
        const { width, height } = this.size;

        if (!width) {
            this.setWidth(this.getGui().offsetWidth, true);
        }

        if (!height) {
            this.setHeight(this.getGui().offsetHeight, true);
        }
    }

    public setMovable(movable: boolean) {
        if (movable !== this.movable) {
            this.movable = movable;

            const params: DragListenerParams = {
                eElement: this.eTitleBar,
                onDragStart: this.onDialogMoveStart.bind(this),
                onDragging: this.onDialogMove.bind(this),
                onDragStop: this.onDialogMoveEnd.bind(this)
            };

            this.dragService[movable ? 'addDragSource' : 'removeDragSource'](params);
        }
    }

    private onDialogMoveStart(e: MouseEvent) {
        this.isMoving = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onDialogMove(e: MouseEvent) {
        if (!this.isMoving) { return; }
        const movementX = e.clientX - this.dragStartPosition.x;
        const movementY = e.clientY - this.dragStartPosition.y;
        const { x, y } = this.position;

        this.offsetDialog(x + movementX, y + movementY);

        this.updateDragStartPosition(e.clientX, e.clientY);

        this.buildParamsAndDispatchEvent(Dialog.EVENT_MOVE);
    }

    private offsetDialog(x = 0, y = 0) {
        const ePopup = this.getGui();

        this.popupService.positionPopup({
            ePopup,
            x,
            y,
            keepWithinBounds: true
        });

        this.position.x = parseInt(ePopup.style.left, 10);
        this.position.y = parseInt(ePopup.style.top, 10);
    }

    private onDialogMoveEnd() {
        this.isMoving = false;
    }

    public setClosable(closable: boolean) {
        if (closable !== this.closable) {
            this.closable = closable;
        }

        const eGui = this.getGui();

        _.addOrRemoveCssClass(eGui, 'ag-dialog-closable', closable);
    }

    private buildParamsAndDispatchEvent(type: string) {
        const event: DialogEvent = {
            type,
            dialog: this,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
        };

        if (type !== Dialog.EVENT_DESTROYED) {
            event.x = this.position.x;
            event.y = this.position.y;
            event.width = this.getWidth();
            event.height = this.getHeight();
        }

        this.dispatchEvent(event);
    }

    public setBodyComponent(bodyComponent: Component) {
        bodyComponent.setContainer(this);
        this.eContentWrapper.appendChild(bodyComponent.getGui());
    }

    public getBodyHeight(): number {
        return _.getInnerHeight(this.eContentWrapper);
    }

    public getBodyWidth(): number {
        return _.getInnerWidth(this.eContentWrapper);
    }

    public setTitle(title: string) {
        this.eTitle.innerText = title;
    }

    public getHeight(): number {
        return this.size.height;
    }

    public setHeight(height: number, silent?: boolean) {
        let newHeight = Math.max(250, height);
        const eGui = this.getGui();

        if (newHeight + this.position.y > eGui.offsetParent.clientHeight) {
            newHeight = eGui.offsetParent.clientHeight - this.position.y;
        }

        if (this.size.height === newHeight) { return; }

        this.size.height = newHeight;
        _.setFixedHeight(eGui, newHeight);
        _.setFixedHeight(this.eContentWrapper, eGui.clientHeight - this.eTitleBar.offsetHeight);

        if (!silent) {
            this.buildParamsAndDispatchEvent(Dialog.EVENT_RESIZE);
        }
    }

    public getWidth(): number {
        return this.size.width;
    }

    public setWidth(width: number, silent?: boolean) {
        let newWidth = Math.max(250, width);
        const eGui = this.getGui();

        if (newWidth + this.position.x > eGui.offsetParent.clientWidth) {
            newWidth = eGui.offsetParent.clientWidth - this.position.x;
        }

        if (this.size.width === newWidth) { return; }

        this.size.width = newWidth;
        _.setFixedWidth(eGui, newWidth);

        if (!silent) {
            this.buildParamsAndDispatchEvent(Dialog.EVENT_RESIZE);
        }
    }

    // called when user hits the 'x' in the top right
    private onBtClose() {
        this.close();
    }

    public destroy(): void {
        super.destroy();
        this.buildParamsAndDispatchEvent(Dialog.EVENT_DESTROYED);
    }
}