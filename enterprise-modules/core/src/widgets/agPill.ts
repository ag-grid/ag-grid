import { RefPlaceholder } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';

export interface PillConfig {
    onButtonKeyDown?: (e?: KeyboardEvent) => void;
    onButtonClick?: (e?: MouseEvent) => void;
}

export class AgPill extends Component {
    private readonly eText: HTMLElement = RefPlaceholder;
    private readonly eButton: HTMLElement = RefPlaceholder;

    constructor(private readonly config: PillConfig) {
        super(/* html */ `
            <div class="ag-pill">
                <span class="ag-pill-text" data-ref="eText"></span>
                <button class="ag-pill-button" data-ref="eButton"></button>
            </div>
        `);
    }

    public postConstruct() {
        const { config, eButton } = this;
        const { onButtonKeyDown, onButtonClick } = config;

        this.getGui().setAttribute('tabindex', String(this.gos.get('tabIndex')));

        this.addGuiEventListener('focus', () => {
            this.eButton.focus();
        });

        if (!onButtonKeyDown && !onButtonClick) {
            return;
        }

        this.addManagedElementListeners(eButton, {
            keydown: onButtonKeyDown,
            click: onButtonClick,
        });
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
