import type {
    BeanCollection,
    ElementParams,
    GridOptionsService,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
} from 'ag-grid-community';
import { Component, RefPlaceholder, _createIconNoSpan, _setDisplayed } from 'ag-grid-community';

const ToolbarButtonElement: ElementParams = {
    tag: 'button',
    cls: 'ag-toolbar-item ag-toolbar-button',
    attrs: { type: 'button' },
    children: [
        { tag: 'span', ref: 'eIcon', cls: 'ag-toolbar-button-icon', attrs: { 'aria-hidden': 'true' } },
        { tag: 'span', ref: 'eLabel', cls: 'ag-toolbar-button-label' },
    ],
};

interface ToolbarButtonConfig {
    icon: IconName;
    localeKey: string;
    defaultLabel: string;
    onAction: (beans: BeanCollection, eGui: HTMLElement, gos: GridOptionsService) => void;
    onInit?: (comp: Component, gos: GridOptionsService, beans: BeanCollection) => void;
    /** Re-evaluated on refresh to update visibility after runtime option changes */
    shouldDisplay?: (gos: GridOptionsService, beans: BeanCollection) => boolean;
}

class ToolbarButton extends Component implements IToolbarItemComp {
    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    protected config!: ToolbarButtonConfig;

    constructor() {
        super(ToolbarButtonElement);
    }

    public postConstruct(): void {
        const { config } = this;
        const icon = _createIconNoSpan(config.icon, this.beans);
        if (icon) {
            this.eIcon.appendChild(icon);
        }

        const label = this.getLocaleTextFunc()(config.localeKey, config.defaultLabel);
        this.eLabel.textContent = label;
        const eGui = this.getGui();
        eGui.setAttribute('aria-label', label);
        eGui.setAttribute('title', label);

        this.addManagedElementListeners(eGui, {
            click: () => config.onAction(this.beans, eGui, this.gos),
        });
    }

    public init(params: IToolbarItemParams): void {
        this.config.onInit?.(this, this.gos, this.beans);
        this.refresh(params);
    }

    public refresh(params: IToolbarItemParams): boolean {
        _setDisplayed(this.eLabel, params.display === 'iconAndLabel');
        if (this.config.shouldDisplay) {
            this.setDisplayed(this.config.shouldDisplay(this.gos, this.beans));
        }
        return true;
    }
}

export function createToolbarButton(config: ToolbarButtonConfig): new () => IToolbarItemComp {
    return class extends ToolbarButton {
        override config = config;
    };
}
