import { RefSelector } from "./componentAnnotations";
import { PostConstruct, Autowired } from "../context/context";
import { Component } from "./component";
import { PopupService } from "./popupService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { _ } from "../utils";

export interface PanelOptions {
    component?: Component;
    hideTitleBar?: boolean;
    closable?: boolean;
    title?: string;
    minWidth?: number;
    width?: number | string;
    minHeight?: number;
    height?: number | string;
    centered?: boolean;
    x?: number;
    y?: number;
}

export class AgPanel extends Component {

    private static TEMPLATE =
        `<div class="ag-panel" tabindex="-1">
            <div ref="eTitleBar" class="ag-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-title-bar-title"></span>
                <div ref="eTitleBarButtons" class="ag-title-bar-buttons"></div>
            </div>
            <div ref="eContentWrapper" class="ag-panel-content-wrapper"></div>
        </div>`;

    protected static CLOSE_BTN_TEMPLATE = `<div class="ag-button"></div>`;

    @Autowired('popupService') protected popupService: PopupService;
    @Autowired('gridOptionsWrapper') protected gridOptionsWrapper: GridOptionsWrapper;

    protected closable = true;
    protected config: PanelOptions | undefined;

    protected closeButtonComp: Component;
    protected popupParent: HTMLElement;
    protected minWidth: number;
    protected minHeight?: number;
    protected positioned = false;

    protected dragStartPosition = {
        x: 0,
        y: 0
    };

    protected position = {
        x: 0,
        y: 0
    };

    protected size: { width: number | undefined, height: number | undefined } = {
        width:undefined,
        height: undefined
    };

    public close: () => void;

    @RefSelector('eContentWrapper') protected eContentWrapper: HTMLElement;
    @RefSelector('eTitleBar') protected eTitleBar: HTMLElement;
    @RefSelector('eTitleBarButtons') protected eTitleBarButtons: HTMLElement;
    @RefSelector('eTitle') protected eTitle: HTMLElement;

    constructor(config?: PanelOptions) {
        super(AgPanel.TEMPLATE);
        this.config = config;
    }

    @PostConstruct
    protected postConstruct() {
        const {
            component,
            closable,
            hideTitleBar,
            title,
            minWidth,
            width,
            minHeight,
            height,
            centered,
            x,
            y
        } = this.config;

        const eGui = this.getGui();

        if (component) { this.setBodyComponent(component); }

        if (!hideTitleBar) {
            if (title) { this.setTitle(title); }
            this.setClosable(closable != null ? closable : this.closable);
        } else {
            _.addCssClass(this.eTitleBar, 'ag-hidden');
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

        if (this.positioned) { return; }

        this.minHeight = minHeight != null ? minHeight : 250;
        this.minWidth = minWidth != null ? minWidth : 250;

        this.popupParent = this.popupService.getPopupParent();

        if (width) {
            this.setWidth(width);
        }

        if (height) {
            this.setHeight(height);
        }

        if (this.renderComponent) {
            this.renderComponent();
        }

        if (!width || !height) {
            this.refreshSize();
        }

        if (centered) {
            this.center();
        } else if (x || y) {
            this.offsetElement(x, y);
        }

        this.positioned = true;
        this.eContentWrapper.style.height = '0';
    }

    protected renderComponent() {
        const eGui = this.getGui();
        eGui.focus();

        this.close = () => {
            eGui.parentElement.removeChild(eGui);
            this.destroy();
        };
    }

    protected updateDragStartPosition(x: number, y: number) {
        this.dragStartPosition = { x, y };
    }

    protected calculateMouseMovement(params: {
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

    protected offsetElement(x = 0, y = 0) {
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

    public getHeight(): number {
        return this.size.height;
    }

    public setHeight(height: number | string) {
        const eGui = this.getGui();
        let isPercent = false;
        if (typeof height === 'string' && height.indexOf('%') !== -1) {
            _.setFixedHeight(eGui, height);
            height = _.getAbsoluteHeight(eGui);
            isPercent = true;
        } else {
            height = Math.max(this.minHeight, height as number);
            const offsetParent = eGui.offsetParent;
            if (offsetParent && offsetParent.clientHeight && (height + this.position.y > offsetParent.clientHeight)) {
                height = offsetParent.clientHeight - this.position.y;
            }
        }

        if (this.size.height === height) { return; }

        this.size.height = height;

        if (!isPercent) {
            _.setFixedHeight(eGui, height);
        } else {
            eGui.style.maxHeight = 'unset';
            eGui.style.minHeight = 'unset';
        }
    }

    public getWidth(): number {
        return this.size.width;
    }

    public setWidth(width: number | string) {
        const eGui = this.getGui();
        let isPercent = false;
        if (typeof width === 'string' && width.indexOf('%') !== -1) {
            _.setFixedWidth(eGui, width);
            width = _.getAbsoluteWidth(eGui);
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
            _.setFixedWidth(eGui, width);
        } else {
            eGui.style.maxWidth = 'unset';
            eGui.style.minWidth = 'unset';
        }
    }

    public center() {
        const eGui = this.getGui();

        const x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
        const y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);

        this.offsetElement(x, y);
    }

    public setClosable(closable: boolean) {
        if (closable !== this.closable) {
            this.closable = closable;
        }

        if (closable) {
            const closeButtonComp = this.closeButtonComp = new Component(AgPanel.CLOSE_BTN_TEMPLATE);
            this.getContext().wireBean(closeButtonComp);

            const eGui = closeButtonComp.getGui();
            eGui.appendChild(_.createIconNoSpan('close', this.gridOptionsWrapper));

            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addDestroyableEventListener(eGui, 'click', this.onBtClose.bind(this));
        } else if (this.closeButtonComp) {
            const eGui = this.closeButtonComp.getGui();
            eGui.parentElement.removeChild(eGui);
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

        _.addCssClass(eGui, 'ag-button');

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

    // called when user hits the 'x' in the top right
    private onBtClose() {
        this.close();
    }

    public destroy(): void {
        super.destroy();

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