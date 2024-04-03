import { Autowired } from "../context/context";
import { PanelOptions, AgPanel } from "./agPanel";
import { Component } from "./component";
import { setDisplayed } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
import { PopupService } from "./popupService";
import { ResizableStructure } from "../rendering/features/positionableFeature";

export type ResizableSides = 'topLeft' |
    'top' |
    'topRight' |
    'right' |
    'bottomRight' |
    'bottom' |
    'bottomLeft' |
    'left';

export interface DialogOptions extends PanelOptions {
    eWrapper?: HTMLElement;
    modal?: boolean;
    movable?: boolean;
    alwaysOnTop?: boolean;
    maximizable?: boolean;
    afterGuiAttached?: () => void;
    closedCallback?: (event?: MouseEvent | TouchEvent | KeyboardEvent) => void;
}

export class AgDialog extends AgPanel<DialogOptions> {

    @Autowired('popupService') private popupService: PopupService;

    private isMaximizable: boolean = false;
    private isMaximized: boolean = false;
    private maximizeListeners: (() => void)[] = [];
    private maximizeButtonComp: Component | undefined;
    private maximizeIcon: Element | undefined;
    private minimizeIcon: Element | undefined;
    private resizeListenerDestroy: (() => void) | null | undefined = null;

    private lastPosition = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    constructor(config: DialogOptions) {
        super({...config, popup: true });
    }

    protected postConstruct() {
        const eGui = this.getGui();
        const { movable, resizable, maximizable } = this.config;

        this.addCssClass('ag-dialog');

        super.postConstruct();

        this.addManagedListener(eGui, 'focusin', (e: FocusEvent) => {
            this.popupService.bringPopupToFront(eGui);
        });

        if (movable) { this.setMovable(movable); }
        if (maximizable) { this.setMaximizable(maximizable); }
        if (resizable) { this.setResizable(resizable); }
    }

    protected renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop, modal, title, afterGuiAttached  } = this.config;
        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            modal,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: this.onClosed.bind(this),
            alwaysOnTop,
            ariaLabel: title || translate('ariaLabelDialog', 'Dialog'),
            afterGuiAttached
        });

        if (addPopupRes) {
            this.close = addPopupRes.hideFunc;
        }
    }

    private onClosed(event?: MouseEvent | TouchEvent | KeyboardEvent): void {
        this.destroy();
        this.config.closedCallback?.(event);
    }

    private toggleMaximize() {
        const position = this.positionableFeature.getPosition();
        if (this.isMaximized) {
            const { x, y, width, height } = this.lastPosition;
            this.setWidth(width);
            this.setHeight(height);
            this.positionableFeature.offsetElement(x, y);
        } else {
            this.lastPosition.width = this.getWidth()!;
            this.lastPosition.height = this.getHeight()!;
            this.lastPosition.x = position.x;
            this.lastPosition.y = position.y;
            this.positionableFeature.offsetElement(0, 0);
            this.setHeight('100%');
            this.setWidth('100%');
        }

        this.isMaximized = !this.isMaximized;
        this.refreshMaximizeIcon();
    }

    private refreshMaximizeIcon() {
        setDisplayed(this.maximizeIcon!, !this.isMaximized);
        setDisplayed(this.minimizeIcon!, this.isMaximized);
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

    protected destroy(): void {
        this.maximizeButtonComp = this.destroyBean(this.maximizeButtonComp);

        this.clearMaximizebleListeners();
        super.destroy();
    }

    public setResizable(resizable: boolean | ResizableStructure) {
        this.positionableFeature.setResizable(resizable);
    }

    public setMovable(movable: boolean) {
        this.positionableFeature.setMovable(movable, this.eTitleBar);
    }

    public setMaximizable(maximizable: boolean) {
        if (!maximizable) {
            this.clearMaximizebleListeners();

            if (this.maximizeButtonComp) {
                this.destroyBean(this.maximizeButtonComp);
                this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
            }
            return;
        }

        const eTitleBar = this.eTitleBar;

        if (!eTitleBar || maximizable === this.isMaximizable) { return; }

        const maximizeButtonComp = this.buildMaximizeAndMinimizeElements();
        this.refreshMaximizeIcon();

        maximizeButtonComp.addManagedListener(maximizeButtonComp.getGui(), 'click', this.toggleMaximize.bind(this));

        this.addTitleBarButton(maximizeButtonComp, 0);

        this.maximizeListeners.push(
            this.addManagedListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this))!
        );

        this.resizeListenerDestroy = this.addManagedListener(this, 'resize', () => {
            this.isMaximized = false;
            this.refreshMaximizeIcon();
        });
    }

    private buildMaximizeAndMinimizeElements(): Component{
        const maximizeButtonComp = this.maximizeButtonComp =
        this.createBean(new Component(/* html */`<div class="ag-dialog-button"></span>`));

        const eGui = maximizeButtonComp.getGui();

        this.maximizeIcon = createIconNoSpan('maximize', this.gos)!;
        eGui.appendChild(this.maximizeIcon);
        this.maximizeIcon.classList.add('ag-panel-title-bar-button-icon');

        this.minimizeIcon = createIconNoSpan('minimize', this.gos)!;
        eGui.appendChild(this.minimizeIcon);
        this.minimizeIcon.classList.add('ag-panel-title-bar-button-icon');

        return maximizeButtonComp;
    }
}
