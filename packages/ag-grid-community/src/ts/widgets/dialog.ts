import { DragService, DragListenerParams } from "../dragAndDrop/dragService";
import { Resizable, ResizableStructure } from "../rendering/resizable";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";
import { PopupComponent } from "./popupComponent";
import { _ } from "../utils";
import { Component } from "./component";

export interface DialogOptions {
    alwaysOnTop?: boolean;
    component?: Component;
    movable?: boolean;
    resizable?: boolean | ResizableStructure;
    maximizable?: boolean;
    closable?: boolean;
    title?: string;
    minWidth?: number;
    width?: number;
    minHeight?: number;
    height?: number;
    x?: number;
    y?: number;
    centered?: boolean;
}
@Resizable
export class Dialog extends PopupComponent {

    private static TEMPLATE =
        `<div class="ag-dialog" tabindex="-1">
            <div ref="eTitleBar" class="ag-dialog-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-dialog-title-bar-title"></span>
                <div ref="eTitleBarButtons" class="ag-dialog-title-bar-buttons"></div>
            </div>
            <div ref="eContentWrapper" class="ag-dialog-content-wrapper"></div>
        </div>`;

    private static CLOSE_BTN_TEMPLATE =
        `<div class="ag-dialog-button">
            <span class="ag-icon ag-icon-cross"></span>
        </div>
        `;

    private config: DialogOptions | undefined;

    private movable = false;
    private closable = true;
    private isMoving = false;

    private minWidth: number;
    private minHeight: number;
    private popupParent: HTMLElement;
    private titleBarDragSource: DragListenerParams | undefined;

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

    @Autowired('dragService') private dragService: DragService;
    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eContentWrapper') private eContentWrapper: HTMLElement;
    @RefSelector('eTitleBar') private eTitleBar: HTMLElement;
    @RefSelector('eTitleBarButtons') private eTitleBarButtons: HTMLElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;

    private closeButtonComp: Component;

    public close: () => void;

    constructor(config?: DialogOptions) {
        super(Dialog.TEMPLATE);
        this.config = config;
    }

    @PostConstruct
    protected postConstruct() {
        const {
            alwaysOnTop,
            component,
            centered,
            movable,
            closable,
            title,
            minWidth,
            width,
            minHeight,
            height
        } = this.config;

        let { x, y } = this.config;

        const eGui = this.getGui();

        this.popupParent = this.popupService.getPopupParent();
        this.minHeight = minHeight != null ? minHeight : 250;
        this.minWidth = minWidth != null ? minWidth : 250;

        if (component) { this.setBodyComponent(component); }
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
            true,
            this.destroy.bind(this),
            undefined,
            alwaysOnTop
        );

        this.refreshSize();

        eGui.focus();

        if (centered) {
            x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
            y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);
        }

        if (x || y) {
            this.offsetDialog(x, y);
        }

        this.addDestroyableEventListener(this.eTitleBar, 'mousedown', (e: MouseEvent) => {
            if (
                eGui.contains(e.relatedTarget as HTMLElement) ||
                eGui.contains(document.activeElement) ||
                this.eTitleBarButtons.contains(e.target as HTMLElement)
            ) {
                e.preventDefault();
                return;
            }

            const focusEl = this.eContentWrapper.querySelector('button, [href], input, select, textarea, [tabindex]');

            if (focusEl) {
                (focusEl as HTMLElement).focus();
            }
        });
        this.addDestroyableEventListener(eGui, 'focusin', (e: FocusEvent) => {
            if (eGui.contains(e.relatedTarget as HTMLElement)) { return; }
            this.popupService.bringPopupToFront(eGui);
        });
    }

    private updateDragStartPosition(x: number, y: number) {
        this.dragStartPosition = { x, y };
    }

    private calculateMouseMovement(params: {
        e: MouseEvent,
        topBuffer?: number,
        anywhereWithin?: boolean,
        isLeft?: boolean,
        isTop?: boolean
    }): { movementX: number, movementY: number} {
        const parentRect = this.popupParent.getBoundingClientRect();
        const { e, isLeft, isTop, anywhereWithin, topBuffer } = params;
        let movementX = e.clientX - this.dragStartPosition.x;
        let movementY = e.clientY - this.dragStartPosition.y;
        const width = this.getWidth();
        const height = this.getHeight();

        // skip if cursor is outside of popupParent horizontally
        let skipX = (
            parentRect.left >= e.clientX && this.position.x <= 0 ||
            parentRect.right <= e.clientX && parentRect.right <= this.position.x + parentRect.left + width
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
                        (movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left)
                    );
                } else {
                    skipX = (
                        // if the movement is bound to the right side of the dialog
                        // we skip if we are moving to the left and the cursor
                        // is to the right of the dialog
                        (movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                        // or skip if we are moving to the right and the cursor
                        // is to the left of the right side anchor
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left + width)
                    );
                }
            }
        }

        movementX = skipX ? 0 : movementX;

        const skipY = (
            // skip if cursor is outside of popupParent vertically
            parentRect.top >= e.clientY && this.position.y <= 0 ||
            parentRect.bottom <= e.clientY && parentRect.bottom <= this.position.y + parentRect.top + height ||
            isTop && (
                // skip if we are moving to towards top and the cursor is
                // below the top anchor + topBuffer
                // note: topBuffer is used when moving the dialog using the title bar
                (movementY < 0 && e.clientY > this.position.y + parentRect.top + (topBuffer || 0)) ||
                // skip if we are moving to the bottom and the cursor is
                // above the top anchor
                (movementY > 0 && e.clientY < this.position.y + parentRect.top)
            ) ||
            // we are anchored to the bottom of the dialog
            !isTop && (
                // skip if we are moving towards the top and the cursor
                // is below the bottom anchor
                (movementY < 0 && e.clientY > this.position.y + parentRect.top + height) ||

                // skip if we are moving towards the bottom and the cursor
                // is above the bottom anchor
                (movementY > 0 && e.clientY < this.position.y + parentRect.top + height)
            )
        );

        movementY = skipY ? 0 : movementY;

        return { movementX, movementY };
    }

    private refreshSize() {
        const { width, height } = this.size;

        if (!width) {
            this.setWidth(this.getGui().offsetWidth);
        }

        if (!height) {
            this.setHeight(this.getGui().offsetHeight);
        }
    }

    public setMovable(movable: boolean) {
        if (movable !== this.movable) {
            this.movable = movable;

            const params: DragListenerParams = this.titleBarDragSource || {
                eElement: this.eTitleBar,
                onDragStart: this.onDialogMoveStart.bind(this),
                onDragging: this.onDialogMove.bind(this),
                onDragStop: this.onDialogMoveEnd.bind(this)
            };

            if (movable) {
                this.dragService.addDragSource(params);
                this.titleBarDragSource = params;
            } else {
                this.dragService.removeDragSource(params);
                this.titleBarDragSource = undefined;
            }
        }
    }

    private onDialogMoveStart(e: MouseEvent) {
        this.isMoving = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private onDialogMove(e: MouseEvent) {
        if (!this.isMoving) { return; }
        const { x, y } = this.position;
        const { movementX, movementY } = this.calculateMouseMovement({
            e,
            isTop: true,
            anywhereWithin: true,
            topBuffer: this.getHeight() - this.getBodyHeight()
        });

        this.offsetDialog(x + movementX, y + movementY);

        this.updateDragStartPosition(e.clientX, e.clientY);
    }

    private offsetDialog(x = 0, y = 0) {
        const ePopup = this.getGui();

        this.popupService.positionPopup({
            ePopup,
            x,
            y,
            minWidth: this.minWidth,
            minHeight: this.minHeight,
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

        if (closable) {
            const closeButtonComp = this.closeButtonComp = new Component(Dialog.CLOSE_BTN_TEMPLATE);
            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addDestroyableEventListener(closeButtonComp.getGui(), 'click', this.onBtClose.bind(this));
        } else if (this.closeButtonComp) {
            this.closeButtonComp.destroy();
            this.closeButtonComp = undefined;
        }
    }

    public setBodyComponent(bodyComponent: Component) {
        bodyComponent.setParentComponent(this);
        this.eContentWrapper.appendChild(bodyComponent.getGui());
    }

    public addTitleBarButton(button: Component, position?: number) {
        const eTitleBarButtons = this.eTitleBarButtons;
        const buttons = eTitleBarButtons.children;
        const len = buttons.length;

        if (position == null) {
            position = len;
        }

        position = Math.max(0, Math.min(position, len));

        const eGui = button.getGui();

        _.addCssClass(eGui, 'ag-dialog-button');

        if (position === 0) {
            eTitleBarButtons.insertAdjacentElement('afterbegin', eGui);
        } else if (position === len) {
            eTitleBarButtons.insertAdjacentElement('beforeend', eGui);
        } else {
            buttons[position - 1].insertAdjacentElement('afterend', eGui);
        }

        button.setParentComponent(this);
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

    public setHeight(height: number) {
        let newHeight = Math.max(this.minHeight, height);
        const eGui = this.getGui();

        if (newHeight + this.position.y > eGui.offsetParent.clientHeight) {
            newHeight = eGui.offsetParent.clientHeight - this.position.y;
        }

        if (this.size.height === newHeight) { return; }

        this.size.height = newHeight;
        _.setFixedHeight(eGui, newHeight);
        _.setFixedHeight(this.eContentWrapper, eGui.clientHeight - this.eTitleBar.offsetHeight);
    }

    public getWidth(): number {
        return this.size.width;
    }

    public setWidth(width: number) {
        let newWidth = Math.max(this.minWidth, width);
        const eGui = this.getGui();

        if (newWidth + this.position.x > eGui.offsetParent.clientWidth) {
            newWidth = eGui.offsetParent.clientWidth - this.position.x;
        }

        if (this.size.width === newWidth) { return; }

        this.size.width = newWidth;
        _.setFixedWidth(eGui, newWidth);
    }

    // called when user hits the 'x' in the top right
    private onBtClose() {
        this.close();
    }

    public destroy(): void {
        super.destroy();

        this.setMovable(false);
        if (this.closeButtonComp) {
            this.closeButtonComp.destroy();
            this.closeButtonComp = undefined;
        }

        const eGui = this.getGui();

        if (eGui && eGui.offsetParent) {
            this.close();
        }
    }
}