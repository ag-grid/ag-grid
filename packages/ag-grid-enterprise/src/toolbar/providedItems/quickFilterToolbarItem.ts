import { _debounce } from 'ag-stack';

import type { GridInputTextField, IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import { AgInputTextField, Component } from 'ag-grid-community';

import { createToolbarInput } from './toolbarItemUtils';

const INPUT_DEBOUNCE_MS = 300;

export class QuickFilterToolbarItem extends Component implements IToolbarItemComp {
    private eInputField!: GridInputTextField;
    private eInput!: HTMLInputElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input' });
    }

    public init(_params: IToolbarItemParams): void {
        if (!this.gos.isModuleRegistered('QuickFilter')) {
            this.beans.log.error(302, {
                itemName: 'agQuickFilterToolbarItem',
                moduleName: 'QuickFilter',
                ...this.gos.getModuleErrorParams(),
            });
            this.setDisplayed(false);
            return;
        }

        const localeTextFunc = this.getLocaleTextFunc();
        const label = localeTextFunc('toolbarQuickFilter', 'Filter');
        const eGui = this.getGui();
        let quickFilterTextTimeout: number | undefined;

        this.eInputField = this.createManagedBean<GridInputTextField>(
            new AgInputTextField({
                clearButton: true,
                onValueClear: () => {
                    clearTimeout(quickFilterTextTimeout);
                    this.gos.updateGridOptions({ options: { quickFilterText: '' } });
                },
            })
        );
        const { eIconWrapper, eInput } = createToolbarInput(this.beans, this.eInputField, {
            label,
            iconName: 'filter',
            initialValue: this.gos.get('quickFilterText'),
        });
        if (eIconWrapper) {
            eGui.appendChild(eIconWrapper);
        }
        this.eInput = eInput;
        eGui.appendChild(this.eInputField.getGui());

        const updateQuickFilterText = _debounce(
            this,
            () => this.gos.updateGridOptions({ options: { quickFilterText: this.eInput.value } }),
            INPUT_DEBOUNCE_MS
        );

        this.addManagedElementListeners(this.eInput, {
            input: () => (quickFilterTextTimeout = updateQuickFilterText()),
        });
    }

    public refresh(_params: IToolbarItemParams): boolean {
        if (!this.eInput) {
            return false;
        }
        this.eInputField.setValue(this.gos.get('quickFilterText'), true);
        return true;
    }
}
