import type { RichSelectParams } from 'ag-grid-community';
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

export class AddDropdownComp extends AgRichSelect {
    constructor(private readonly params: AddDropdownCompParams) {
        super({
            ...params,
            template: /* html */ `
                <div class="ag-picker-field" role="presentation">
                    <div data-ref="eLabel"></div>
                    <div data-ref="eWrapper" class="ag-wrapper ag-picker-collapsed">
                        <div data-ref="eDisplayField" class="ag-picker-field-display"></div>
                        <ag-input-text-field data-ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <span data-ref="eDeselect" class="ag-rich-select-deselect-button ag-picker-field-icon" role="presentation"></span>
                        <div data-ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`,
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
