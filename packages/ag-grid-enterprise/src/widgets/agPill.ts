import { RefPlaceholder } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

export interface PillConfig {
    onKeyDown?: (e?: KeyboardEvent) => void;
    onButtonClick?: (e?: MouseEvent) => void;
}

export class AgPill extends Component {
    private readonly eText: HTMLElement = RefPlaceholder;
    private readonly eButton: HTMLElement = RefPlaceholder;

    constructor(private readonly config: PillConfig) {
        super(/* html */ `
            <div class="ag-pill" role="option">
                <span class="ag-pill-text" data-ref="eText"></span>
                <span class="ag-button ag-pill-button" data-ref="eButton" role="presentation"></span>
            </div>
        `);
    }

    public postConstruct() {
        const { config, eButton } = this;
        const { onKeyDown, onButtonClick } = config;

        this.getGui().setAttribute('tabindex', String(this.gos.get('tabIndex')));

        this.addGuiEventListener('focus', () => {
            this.eButton.focus();
        });

        if (onKeyDown) {
            this.addGuiEventListener('keydown', onKeyDown);
        }

        if (onButtonClick) {
            this.addManagedElementListeners(eButton, {
                click: onButtonClick,
            });
        }
    }

    public toggleCloseButtonClass(className: string, force?: boolean) {
        this.eButton.classList.toggle(className, force);
    }

    public setText(text: string) {
        this.eText.textContent = text;
    }

    public getText(): string | null {
        return this.eText.textContent;
    }
}
