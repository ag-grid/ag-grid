import type { IMenuConfigParams, IMenuItemComp, IMenuItemParams } from 'ag-grid-community';

export interface CustomMenuItemParams extends IMenuItemParams {
    buttonValue: string;
}

export class MenuItem implements IMenuItemComp {
    eGui!: HTMLDivElement;
    eButton!: HTMLButtonElement;
    eventListener!: () => void;

    init(params: CustomMenuItemParams): void {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `
            <span class="ag-menu-option-part ag-menu-option-icon" role="presentation"></span>
            <span class="ag-menu-option-part ag-menu-option-text">${params.name}</span>
            <span class="ag-menu-option-part ag-menu-option-shortcut"><button class="alert-button">${params.buttonValue}</button></span>
            <span class="ag-menu-option-part ag-menu-option-popup-pointer">
                ${params.subMenu ? '<span class="ag-icon ag-icon-small-right" unselectable="on" role="presentation"></span>' : ''}
            </span>
        `;
        this.eButton = this.eGui.querySelector('.alert-button')!;
        this.eventListener = () => alert(`${params.name} clicked`);
        this.eButton.addEventListener('click', this.eventListener);
    }

    getGui(): HTMLElement {
        return this.eGui;
    }

    configureDefaults(): boolean | IMenuConfigParams {
        return true;
    }

    destroy(): void {
        if (this.eButton) {
            this.eButton.removeEventListener('click', this.eventListener);
        }
    }
}
