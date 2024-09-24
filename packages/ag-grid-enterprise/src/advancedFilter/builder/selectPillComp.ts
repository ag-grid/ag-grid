import type { RichSelectParams } from 'ag-grid-community';
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

export class SelectPillComp extends AgRichSelect<AutocompleteEntry> {
    constructor(private readonly params: SelectPillParams) {
        super({
            ...params,
            template: /* html */ `
                <div class="ag-picker-field ag-advanced-filter-builder-pill-wrapper" role="presentation">
                    <div data-ref="eLabel"></div>
                    <div data-ref="eWrapper" class="ag-wrapper ag-advanced-filter-builder-pill ag-picker-collapsed">
                        <div data-ref="eDisplayField" class="ag-picker-field-display ag-advanced-filter-builder-pill-display"></div>
                        <ag-input-text-field data-ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <span data-ref="eDeselect" class="ag-rich-select-deselect-button ag-picker-field-icon" role="presentation"></span>
                        <div data-ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`,
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
