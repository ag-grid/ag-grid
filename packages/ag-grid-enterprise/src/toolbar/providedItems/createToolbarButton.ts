import type {
    BeanCollection,
    ElementParams,
    GridOptionsService,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
} from 'ag-grid-community';
import { Component, RefPlaceholder, _createIconNoSpan } from 'ag-grid-community';

const ToolbarButtonElement: ElementParams = {
    tag: 'button',
    cls: 'ag-toolbar-item ag-toolbar-button',
    attrs: { type: 'button' },
    children: [
        { tag: 'span', ref: 'eIcon', cls: 'ag-toolbar-button-icon', attrs: { 'aria-hidden': 'true' } },
        { tag: 'span', ref: 'eLabel', cls: 'ag-toolbar-button-label' },
    ],
};

export interface ToolbarButtonConfig {
    icon: IconName;
    localeKey: string;
    defaultLabel: string;
    onAction: (beans: BeanCollection, eGui: HTMLElement, gos: GridOptionsService) => void;
    onInit?: (comp: Component, gos: GridOptionsService, beans: BeanCollection) => void;
}

export function createToolbarButton(config: ToolbarButtonConfig): new () => IToolbarItemComp {
    class ToolbarButton extends Component implements IToolbarItemComp {
        private readonly eIcon: HTMLElement = RefPlaceholder;
        private readonly eLabel: HTMLElement = RefPlaceholder;

        constructor() {
            super(ToolbarButtonElement);
        }

        public postConstruct(): void {
            const icon = _createIconNoSpan(config.icon, this.beans);
            if (icon) {
                this.eIcon.appendChild(icon);
            }

            const label = this.getLocaleTextFunc()(config.localeKey, config.defaultLabel);
            this.eLabel.textContent = label;
            this.getGui().setAttribute('aria-label', label);
            this.getGui().setAttribute('title', label);

            this.addManagedElementListeners(this.getGui(), {
                click: () => config.onAction(this.beans, this.getGui(), this.gos),
            });
        }

        public init(params: IToolbarItemParams): void {
            this.refresh(params);
            config.onInit?.(this, this.gos, this.beans);
        }

        public refresh(params: IToolbarItemParams): boolean {
            this.eLabel.classList.toggle('ag-hidden', params.display !== 'iconAndLabel');
            return true;
        }
    }
    return ToolbarButton;
}
