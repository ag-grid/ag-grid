import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { createSearchIcon } from './searchIcon';

export class QuickFilterToolbarItem extends Component implements IToolbarItemComp {
    private eInput!: HTMLInputElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input' });
    }

    public init(params: IToolbarItemParams): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const label = localeTextFunc('toolbarQuickFilter', 'Quick Filter');

        this.getGui().appendChild(createSearchIcon());

        this.eInput = document.createElement('input');
        this.eInput.type = 'text';
        this.eInput.className = 'ag-toolbar-input-field';
        this.eInput.placeholder = `${label}...`;
        this.eInput.setAttribute('aria-label', label);

        const currentValue = this.gos.get('quickFilterText');
        if (currentValue) {
            this.eInput.value = currentValue;
        }

        this.addManagedElementListeners(this.eInput, {
            input: () => this.beans.gridApi.setGridOption('quickFilterText', this.eInput.value),
        });

        this.getGui().appendChild(this.eInput);
        this.updateDisabled(params.disabled);
    }

    public refresh(params: IToolbarItemParams): boolean {
        this.updateDisabled(params.disabled);
        this.eInput.value = this.gos.get('quickFilterText') ?? '';
        return true;
    }

    private updateDisabled(disabled: boolean): void {
        this.eInput.disabled = disabled;
    }
}
