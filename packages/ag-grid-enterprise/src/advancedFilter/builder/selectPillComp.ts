import type { ElementParams, RichSelectParams } from 'ag-grid-community';
import {
    AgInputTextFieldSelector,
    _setAriaLabel,
    _setAriaLabelledBy,
    _stopPropagationForAgGrid,
} from 'ag-grid-community';

import { AgRichSelect } from '../../widgets/agRichSelect';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';

export interface SelectPillParams extends RichSelectParams<AutocompleteEntry> {
    getEditorParams: () => { values?: any[] };
    wrapperClassName: string;
    ariaLabel: string;
}

const SelectPillElement: ElementParams = {
    tag: 'div',
    cls: 'ag-picker-field ag-advanced-filter-builder-pill-wrapper',
    role: 'presentation',
    children: [
        { tag: 'div', ref: 'eLabel' },
        {
            tag: 'div',
            ref: 'eWrapper',
            cls: 'ag-wrapper ag-advanced-filter-builder-pill ag-picker-collapsed',
            children: [
                {
                    tag: 'div',
                    ref: 'eDisplayField',
                    cls: 'ag-picker-field-display ag-advanced-filter-builder-pill-display',
                },
                { tag: 'ag-input-text-field', ref: 'eInput', cls: 'ag-rich-select-field-input' },
                {
                    tag: 'span',
                    ref: 'eDeselect',
                    cls: 'ag-rich-select-deselect-button ag-picker-field-icon',
                    role: 'presentation',
                },
                { tag: 'div', ref: 'eIcon', cls: 'ag-picker-field-icon', attrs: { 'aria-hidden': 'true' } },
            ],
        },
    ],
};
export class SelectPillComp extends AgRichSelect<AutocompleteEntry> {
    constructor(private readonly params: SelectPillParams) {
        super({
            ...params,
            template: SelectPillElement,
            agComponents: [AgInputTextFieldSelector],
        });
    }

    public override getFocusableElement(): HTMLElement {
        return this.eWrapper;
    }

    public override showPicker(): void {
        // avoid focus handling issues with multiple rich selects
        setTimeout(() => super.showPicker());
    }

    public override hidePicker(): void {
        // avoid focus handling issues with multiple rich selects
        setTimeout(() => super.hidePicker());
    }

    public override postConstruct(): void {
        super.postConstruct();

        const { wrapperClassName, ariaLabel } = this.params;

        this.eWrapper.classList.add(wrapperClassName);
        _setAriaLabelledBy(this.eWrapper, '');
        _setAriaLabel(this.eWrapper, ariaLabel);
    }

    protected override createPickerComponent() {
        if (!this.values) {
            const { values } = this.params.getEditorParams();
            this.values = values!;
            const key = (this.value as AutocompleteEntry).key;
            const value = values!.find((value) => value.key === key) ?? {
                key,
                displayValue: (this.value as AutocompleteEntry).displayValue,
            };
            this.value = value;
        }
        return super.createPickerComponent();
    }

    protected override onEnterKeyDown(event: KeyboardEvent): void {
        _stopPropagationForAgGrid(event);
        if (this.isPickerDisplayed) {
            super.onEnterKeyDown(event);
        } else {
            event.preventDefault();
            this.showPicker();
        }
    }
}
