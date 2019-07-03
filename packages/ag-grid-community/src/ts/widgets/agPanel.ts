import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { Positionable } from "../rendering/mixins/positionable";
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
}

export class AgPanel extends Positionable(Component) {

    private static TEMPLATE =
        `<div class="ag-panel" tabindex="-1">
            <div ref="eTitleBar" class="ag-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-title-bar-title"></span>
                <div ref="eTitleBarButtons" class="ag-title-bar-buttons"></div>
            </div>
            <div ref="eContentWrapper" class="ag-panel-content-wrapper"></div>
        </div>`;

    protected static CLOSE_BTN_TEMPLATE = `<div class="ag-button"></div>`;

    protected closable = true;
    config: PanelOptions | undefined;

    @RefSelector('eContentWrapper') protected eContentWrapper: HTMLElement;
    @RefSelector('eTitleBar') protected eTitleBar: HTMLElement;
    @RefSelector('eTitleBarButtons') protected eTitleBarButtons: HTMLElement;
    @RefSelector('eTitle') protected eTitle: HTMLElement;

    private closeButtonComp: Component;

    public close: () => void;

    constructor(config?: PanelOptions) {
        super(AgPanel.TEMPLATE);
        this.config = config;
    }

    @PostConstruct
    postConstruct() {
        const {
            component,
            closable,
            hideTitleBar,
            title,
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

        super.postConstruct();
        this.eContentWrapper.style.height = '0';
    }

    //  used by the Positionable Mixin
    renderComponent() {
        const eGui = this.getGui();
        eGui.focus();

        this.close = () => {
            eGui.parentElement.removeChild(eGui);
            this.destroy();
        };
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