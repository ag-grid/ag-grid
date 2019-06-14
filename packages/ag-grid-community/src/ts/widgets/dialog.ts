import { DragListenerParams } from "../dragAndDrop/dragService";
import { Resizable, ResizableStructure } from "../rendering/resizable";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";
import { PopupComponent } from "./popupComponent";
import { Component } from "./component";
import { Maximizable, IMaximizable } from "../rendering/maximizable";
import { Positionable } from "../rendering/positionable";
import { Movable, IMovable } from "../rendering/movable";
import { _ } from "../utils";

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

@Positionable
@Movable
@Resizable
@Maximizable
export class Dialog extends PopupComponent implements IMovable, IMaximizable {

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

    private closable = true;

    protected config: DialogOptions | undefined;
    protected popupParent: HTMLElement;
    protected moveElement: HTMLElement;
    protected moveElementDragListener: DragListenerParams;

    @Autowired('popupService') popupService: PopupService;

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
    postConstruct() {
        const {
            component,
            closable,
            title,
        } = this.config;

        const eGui = this.getGui();
        this.moveElement = this.eTitleBar;

        if (component) { this.setBodyComponent(component); }
        if (title) { this.setTitle(title); }

        this.setClosable(closable != null ? closable : this.closable);

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

    //  used by the Positionable Mixin
    protected renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop } = this.config;
        this.close = this.popupService.addPopup(
            false,
            eGui,
            true,
            this.destroy.bind(this),
            undefined,
            alwaysOnTop
        );

        eGui.focus();
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

    public setHeight(height: number) {
        const eGui = this.getGui();
        _.setFixedHeight(this.eContentWrapper, eGui.clientHeight - this.eTitleBar.offsetHeight);
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