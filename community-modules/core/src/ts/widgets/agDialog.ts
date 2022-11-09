import { Autowired } from "../context/context";
import { PanelOptions, AgPanel } from "./agPanel";
import { Component } from "./component";
import { setDisplayed } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
import { PopupService } from "./popupService";
import { ResizableStructure } from "../rendering/features/positionableFeature";
import { getLocaleTextFunc } from '../localeFunctions';

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
}

export class AgDialog extends AgPanel {

    @Autowired('popupService') private popupService: PopupService;

    private isMaximizable: boolean = false;
    private isMaximized: boolean = false;
    private maximizeListeners: (() => void)[] = [];
    private maximizeButtonComp: Component | undefined;
    private maximizeIcon: HTMLElement | undefined;
    private minimizeIcon: HTMLElement | undefined;
    private resizeListenerDestroy: (() => void) | null | undefined = null;

    private lastPosition = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    protected config: DialogOptions | undefined;

    constructor(config: DialogOptions) {
        super({ ...config, popup: true });
    }

    protected postConstruct() {
        const eGui = this.getGui();
        const { movable, resizable, maximizable } = this.config as DialogOptions;

        this.addCssClass('ag-dialog');

        super.postConstruct();

        this.addManagedListener(eGui, 'focusin', (e: FocusEvent) => {
            if (eGui.contains(e.relatedTarget as HTMLElement)) { return; }
            this.popupService.bringPopupToFront(eGui);
        });

        if (movable) { this.setMovable(movable); }
        if (maximizable) { this.setMaximizable(maximizable); }
        if (resizable) { this.setResizable(resizable); }
    }

    protected renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop, modal, title } = this.config as DialogOptions;
        const translate = getLocaleTextFunc(this.gridOptionsService);

        const addPopupRes = this.popupService.addPopup({
            modal,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: this.destroy.bind(this),
            alwaysOnTop,
            ariaLabel: title || translate('ariaLabelDialog', 'Dialog')
        });

        if (addPopupRes) {
            this.close = addPopupRes.hideFunc;
        }
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

        const maximizeButtonComp = this.maximizeButtonComp =
            this.createBean(new Component(/* html */`<div class="ag-dialog-button"></span>`));

        const eGui = maximizeButtonComp.getGui();

        eGui.appendChild(this.maximizeIcon = createIconNoSpan('maximize', this.gridOptionsService)!);
        this.maximizeIcon.classList.add('ag-panel-title-bar-button-icon');

        eGui.appendChild(this.minimizeIcon = createIconNoSpan('minimize', this.gridOptionsService)!);
        this.minimizeIcon.classList.add('ag-panel-title-bar-button-icon');
        setDisplayed(this.minimizeIcon, false);

        maximizeButtonComp.addManagedListener(eGui, 'click', this.toggleMaximize.bind(this));

        this.addTitleBarButton(maximizeButtonComp, 0);

        this.maximizeListeners.push(
            this.addManagedListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this))!
        );

        this.resizeListenerDestroy = this.addManagedListener(this, 'resize', () => {
            this.isMaximized = false;
            this.refreshMaximizeIcon();
        });
    }
}
