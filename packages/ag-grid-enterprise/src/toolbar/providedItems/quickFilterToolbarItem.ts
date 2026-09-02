import { _debounce } from 'ag-stack';

import type {
    GridInputTextField,
    IInputToolbarItemParams,
    IToolbarItemComp,
    IToolbarItemParams,
} from 'ag-grid-community';
import { AgInputTextField, Component } from 'ag-grid-community';

import { INPUT_DEBOUNCE_MS, createToolbarInput } from './toolbarItemUtils';

export class QuickFilterToolbarItem extends Component implements IToolbarItemComp {
    private eInputField!: GridInputTextField;
    private eInput!: HTMLInputElement;

    constructor() {
        super({ tag: 'div', cls: 'ag-toolbar-item ag-toolbar-input' });
    }

    public init(params: IToolbarItemParams<any, any, IInputToolbarItemParams>): void {
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
        const setQuickFilterText = (quickFilterText: string) =>
            this.gos.updateGridOptions({ options: { quickFilterText } });

        this.eInputField = this.createManagedBean<GridInputTextField>(
            new AgInputTextField({
                clearButton: true,
                autoComplete: params.toolbarItemParams?.browserAutoComplete,
                onValueClear: () => {
                    clearTimeout(quickFilterTextTimeout);
                    setQuickFilterText('');
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

        const updateQuickFilterText = _debounce(this, () => setQuickFilterText(this.eInput.value), INPUT_DEBOUNCE_MS);

        this.addManagedElementListeners(this.eInput, {
            input: () => (quickFilterTextTimeout = updateQuickFilterText()),
        });

        // An external write (`setGridOption`, a state restore) filters the rows, so the input must follow.
        // A write from this input is a no-op here: the field already holds that value, so `setValue` bails out.
        this.addManagedPropertyListener('quickFilterText', ({ currentValue }) => {
            clearTimeout(quickFilterTextTimeout);
            this.eInputField.setValue(currentValue ?? '', true);
        });
    }

    public refresh(params: IToolbarItemParams<any, any, IInputToolbarItemParams>): boolean {
        if (!this.eInput) {
            return false;
        }
        this.eInputField.setAutoComplete(params.toolbarItemParams?.browserAutoComplete);
        this.eInputField.setValue(this.gos.get('quickFilterText'), true);
        return true;
    }
}
