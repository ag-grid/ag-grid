import type { IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { Component, _warn } from 'ag-grid-community';

import { createToolbarInput } from './toolbarItemUtils';

export class QuickFilterToolbarItem extends Component implements IToolbarItemComp {
    private eInput!: HTMLInputElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input' });
    }

    public init(_params: IToolbarItemParams): void {
        if (!this.gos.isModuleRegistered('QuickFilter')) {
            _warn(302, {
                itemName: 'quickFilter',
                moduleName: 'QuickFilter',
                ...this.gos.getModuleErrorParams(),
            });
            this.setDisplayed(false);
            return;
        }

        const localeTextFunc = this.getLocaleTextFunc();
        const label = localeTextFunc('toolbarQuickFilter', 'Filter');
        const eGui = this.getGui();

        const { eIconWrapper, eInput } = createToolbarInput(this.beans, {
            label,
            iconName: 'filter',
            initialValue: this.gos.get('quickFilterText'),
        });
        if (eIconWrapper) {
            eGui.appendChild(eIconWrapper);
        }
        this.eInput = eInput;
        eGui.appendChild(this.eInput);

        this.addManagedElementListeners(this.eInput, {
            input: () => this.gos.updateGridOptions({ options: { quickFilterText: this.eInput.value } }),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        if (!this.eInput) {
            return false;
        }
        this.eInput.value = this.gos.get('quickFilterText') ?? '';
        return true;
    }
}
