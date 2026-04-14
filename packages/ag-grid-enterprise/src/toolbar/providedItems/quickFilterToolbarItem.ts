import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _createElement, _createIconNoSpan } from 'ag-grid-community';

export class QuickFilterToolbarItem extends Component implements IToolbarItemComp {
    private eInput!: HTMLInputElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input' });
    }

    public init(params: IToolbarItemParams): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const label = localeTextFunc('toolbarQuickFilter', 'Quick Filter');

        const eIcon = _createIconNoSpan('search', this.beans);
        if (eIcon) {
            const eIconWrapper = _createElement({
                tag: 'span',
                cls: 'ag-toolbar-input-icon',
                attrs: { 'aria-hidden': 'true' },
            });
            eIconWrapper.appendChild(eIcon);
            this.getGui().appendChild(eIconWrapper);
        }

        this.eInput = _createElement({ tag: 'input' });
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
    }

    public refresh(_params: IToolbarItemParams): boolean {
        this.eInput.value = this.gos.get('quickFilterText') ?? '';
        return true;
    }
}
