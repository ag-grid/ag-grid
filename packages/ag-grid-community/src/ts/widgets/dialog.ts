import { DragService, DragListenerParams } from "../dragAndDrop/dragService";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";
import { PopupComponent } from "./popupComponent";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { DialogEvent } from "../events";
import { EventService } from "../eventService";
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

interface DialogOptions {
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

    public static MOVE_EVENT = 'dialogMoved';
    public static RESIZE_EVENT = 'dialogResized';

    private static TEMPLATE =
        `<div class="ag-dialog">
            <div ref="eTopLeftResizer" class="ag-resizer ag-resizer-topLeft"></div>
            <div ref="eTopResizer" class="ag-resizer ag-resizer-top"></div>
            <div ref="eTopRightResizer" class="ag-resizer ag-resizer-topRight"></div>
            <div ref="eRightResizer" class="ag-resizer ag-resizer-right"></div>
            <div ref="eBottomRightResizer" class="ag-resizer ag-resizer-bottomRight"></div>
            <div ref="eBottomResizer" class="ag-resizer ag-resizer-bottom"></div>
            <div ref="eBottomLeftResizer" class="ag-resizer ag-resizer-bottomLeft"></div>
            <div ref="eLeftResizer" class="ag-resizer ag-resizer-left"></div>
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
    @Autowired('eventService') private eventService: EventService;

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
        const { resizable, movable, closable, title, width, height } = this.config;
        const eGui = this.getGui();

        if (resizable) {
            this.setResizable(resizable);
        }

        if (title) {
            this.setTitle(title);
        }

        this.setMovable(!!movable);
        this.setClosable(!!closable);

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
            this.getGui(),
            false,
            this.destroy.bind(this)
        );

        this.addDestroyableEventListener(this.eClose, 'click', this.onBtClose.bind(this));
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

    private onDialogResizeStart() {
        this.isResizing = true;
        _.addCssClass((this.getGui().offsetParent as HTMLElement), 'ag-unselectable');
    }

    private onDialogResize(e: MouseEvent, side: ResizableSides) {
        if (!this.isResizing) { return; }

        const eGui = this.getGui();
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

            this.setWidth(oldWidth + (e.movementX * direction), true);

            if (isLeft) {
                offsetLeft = oldWidth - this.getWidth();
            }
        }

        if (isVertical) {
            const direction = isTop ? -1 : 1;
            const oldHeight = this.getHeight();

            this.setHeight(oldHeight + (e.movementY * direction), true);

            if (isTop) {
                offsetTop = oldHeight - this.getHeight();
            }
        }

        if (offsetLeft || offsetTop) {
            this.offsetDialog(
                this.position.x + offsetLeft,
                this.position.y + offsetTop
            );
        }

        this.buildParamsAndDispatchEvent(Dialog.RESIZE_EVENT);
    }

    private onDialogResizeEnd() {
        this.isResizing = false;
        _.removeCssClass((this.getGui().offsetParent as HTMLElement), 'ag-unselectable');
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

    private onDialogMoveStart() {
        this.isMoving = true;
    }

    private onDialogMove(e: MouseEvent) {
        if (!this.isMoving) { return; }
        const { x, y } = this.position;

        this.offsetDialog(x + e.movementX, y + e.movementY);

        this.buildParamsAndDispatchEvent(Dialog.MOVE_EVENT);
    }

    private offsetDialog(x: number, y: number) {
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
        return this.eContentWrapper.clientHeight;
    }

    public getBodyWidth(): number {
        return this.eContentWrapper.clientWidth;
    }

    public setTitle(title: string) {
        this.eTitle.innerText = title;
    }

    public getHeight(): number {
        this.refreshSize();

        return this.size.height;
    }

    public setHeight(height: number, silent?: boolean) {
        let newHeight = Math.max(10, height);
        const eGui = this.getGui();

        if (newHeight + this.position.y > eGui.offsetParent.clientHeight) {
            newHeight = eGui.offsetParent.clientHeight - this.position.y;
        }

        if (this.size.width === newHeight) { return; }

        this.size.height = newHeight;
        _.setFixedHeight(eGui, newHeight);
        _.setFixedHeight(this.eContentWrapper, newHeight - this.eTitleBar.offsetHeight);

        if (!silent) {
            this.buildParamsAndDispatchEvent(Dialog.RESIZE_EVENT);
        }
    }

    public getWidth(): number {
        this.refreshSize();

        return this.size.width;
    }

    public setWidth(width: number, silent?: boolean) {
        let newWidth = Math.max(10, width);
        const eGui = this.getGui();

        if (newWidth + this.position.x > eGui.offsetParent.clientWidth) {
            newWidth = eGui.offsetParent.clientWidth - this.position.x;
        }

        if (this.size.width === newWidth) { return; }

        this.size.width = newWidth;
        _.setFixedWidth(eGui, newWidth);

        if (!silent) {
            this.buildParamsAndDispatchEvent(Dialog.RESIZE_EVENT);
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