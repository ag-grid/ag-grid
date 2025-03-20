import type { ElementParams, RichSelectParams } from 'ag-grid-community';
import {
    AgInputTextFieldSelector,
    _setAriaLabel,
    _setAriaLabelledBy,
    _setDisplayed,
    _stopPropagationForAgGrid,
} from 'ag-grid-community';

import { AgRichSelect } from '../../widgets/agRichSelect';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';

export interface AddDropdownCompParams extends RichSelectParams<AutocompleteEntry> {
    wrapperClassName?: string;
    ariaLabel: string;
}

const AddDropdownCompElement: ElementParams = {
    tag: 'div',
    cls: 'ag-picker-field',
    role: 'presentation',
    children: [
        { tag: 'div', ref: 'eLabel' },
        {
            tag: 'div',
            ref: 'eWrapper',
            cls: 'ag-wrapper ag-picker-collapsed',
            children: [
                { tag: 'div', ref: 'eDisplayField', cls: 'ag-picker-field-display' },
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
export class AddDropdownComp extends AgRichSelect {
    constructor(private readonly params: AddDropdownCompParams) {
        super({
            ...params,
            template: AddDropdownCompElement,
            agComponents: [AgInputTextFieldSelector],
        });
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

        _setDisplayed(this.eDisplayField, false);
        if (wrapperClassName) {
            this.eWrapper.classList.add(wrapperClassName);
        }
        _setAriaLabelledBy(this.eWrapper, '');
        _setAriaLabel(this.eWrapper, ariaLabel);
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
