import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { getInnerHeight, getInnerWidth, setDisplayed } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
import { PositionableFeature, PositionableOptions, ResizableStructure } from "../rendering/features/positionableFeature";

export interface PanelOptions extends PositionableOptions {
    component?: Component;
    hideTitleBar?: boolean | null;
    closable?: boolean | null;
    resizable?: boolean | ResizableStructure;
    title?: string | null;
    cssIdentifier?: string | null;
}

export class AgPanel extends Component {

    protected static CLOSE_BTN_TEMPLATE = /* html */ `<div class="ag-button"></div>`;
    protected closable = true;
    protected config: PanelOptions | undefined;

    protected closeButtonComp: Component | undefined;
    protected positionableFeature: PositionableFeature;
    public close: () => void;

    @RefSelector('eContentWrapper') protected readonly eContentWrapper: HTMLElement;
    @RefSelector('eTitleBar') protected readonly eTitleBar: HTMLElement;
    @RefSelector('eTitleBarButtons') protected readonly eTitleBarButtons: HTMLElement;
    @RefSelector('eTitle') protected readonly eTitle: HTMLElement;

    constructor(config?: PanelOptions) {
        super(AgPanel.getTemplate(config));
        this.config = config;
    }

    private static getTemplate(config?: PanelOptions) {
        const cssIdentifier = (config && config.cssIdentifier) || 'default';
        return /* html */ `<div class="ag-panel ag-${cssIdentifier}-panel" tabindex="-1">
            <div ref="eTitleBar" class="ag-panel-title-bar ag-${cssIdentifier}-panel-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-panel-title-bar-title ag-${cssIdentifier}-panel-title-bar-title"></span>
                <div ref="eTitleBarButtons" class="ag-panel-title-bar-buttons ag-${cssIdentifier}-panel-title-bar-buttons"></div>
            </div>
            <div ref="eContentWrapper" class="ag-panel-content-wrapper ag-${cssIdentifier}-panel-content-wrapper"></div>
        </div>`;
    }

    @PostConstruct
    protected postConstruct() {
        const {
            component,
            closable,
            hideTitleBar,
            title,
            minWidth = 250,
            width,
            minHeight = 250,
            height,
            centered,
            popup,
            x,
            y
        } = this.config as PanelOptions;

        this.positionableFeature = new PositionableFeature(this.getGui(), {
            minWidth, width, minHeight, height, centered, x, y, popup,
            calculateTopBuffer: () => this.positionableFeature.getHeight()! - this.getBodyHeight()
        });

        this.createManagedBean(this.positionableFeature);

        const eGui = this.getGui();

        if (component) { this.setBodyComponent(component); }

        if (!hideTitleBar) {
            if (title) { this.setTitle(title); }
            this.setClosable(closable != null ? closable : this.closable);
        } else {
            setDisplayed(this.eTitleBar, false);
        }

        this.addManagedListener(this.eTitleBar, 'mousedown', (e: MouseEvent) => {
            const eDocument = this.gridOptionsService.getDocument();
            if (
                eGui.contains(e.relatedTarget as HTMLElement) ||
                eGui.contains(eDocument.activeElement) ||
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

        if (popup && this.positionableFeature.isPositioned()) { return; }

        if (this.renderComponent) {
            this.renderComponent();
        }

        this.positionableFeature.initialisePosition();
        this.eContentWrapper.style.height = '0';
    }

    protected renderComponent() {
        const eGui = this.getGui();
        eGui.focus();

        this.close = () => {
            eGui.parentElement!.removeChild(eGui);
            this.destroy();
        };
    }

    public getHeight(): number | undefined {
        return this.positionableFeature.getHeight();
    }

    public setHeight(height: number | string): void {
        this.positionableFeature.setHeight(height);
    }

    public getWidth(): number | undefined {
        return this.positionableFeature.getWidth();
    }

    public setWidth(width: number | string): void {
        this.positionableFeature.setWidth(width);
    }

    public setClosable(closable: boolean) {
        if (closable !== this.closable) {
            this.closable = closable;
        }

        if (closable) {
            const closeButtonComp = this.closeButtonComp = new Component(AgPanel.CLOSE_BTN_TEMPLATE);
            this.getContext().createBean(closeButtonComp);

            const eGui = closeButtonComp.getGui();
            const child = createIconNoSpan('close', this.gridOptionsService)!;
            child.classList.add('ag-panel-title-bar-button-icon');
            eGui.appendChild(child);

            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addManagedListener(eGui, 'click', this.onBtClose.bind(this));
        } else if (this.closeButtonComp) {
            const eGui = this.closeButtonComp.getGui();
            eGui.parentElement!.removeChild(eGui);

            this.closeButtonComp = this.destroyBean(this.closeButtonComp);
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

        button.addCssClass('ag-panel-title-bar-button');

        const eGui = button.getGui();

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
        return getInnerHeight(this.eContentWrapper);
    }

    public getBodyWidth(): number {
        return getInnerWidth(this.eContentWrapper);
    }

    public setTitle(title: string) {
        this.eTitle.innerText = title;
    }

    // called when user hits the 'x' in the top right
    private onBtClose() {
        this.close();
    }

    protected destroy(): void {
        if (this.closeButtonComp) {
            this.closeButtonComp = this.destroyBean(this.closeButtonComp);
        }

        const eGui = this.getGui();

        if (eGui && eGui.offsetParent) {
            this.close();
        }

        super.destroy();
    }
}
