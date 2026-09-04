import { _getInnerWidth, _setAriaLabel, _setAriaLabelledBy } from 'ag-stack';

import type { ElementParams, RichSelectParams } from 'ag-grid-community';
import { AgInputTextFieldSelector, _stopPropagationForAgGrid } from 'ag-grid-community';

import { AgRichSelect } from '../../widgets/agRichSelect';
import type { AutocompleteEntry } from '../autocomplete/autocompleteParams';

interface SelectPillParams extends RichSelectParams<AutocompleteEntry> {
    getEditorParams: () => { values?: any[] };
    wrapperClassName: string;
    ariaLabel: string;
    /** Caps how wide the picker may grow: wider than the builder itself and a dropdown reads as a second panel. */
    eBuilder: HTMLElement;
    maxPickerWidth?: number;
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

        const listComponent = super.createPickerComponent();
        // Opening reseeds the picker's width from `minPickerWidth`, so both the cap and the arming are per-open.
        const maxWidth = Math.min(this.params.maxPickerWidth ?? Infinity, _getInnerWidth(this.params.eBuilder));
        listComponent.setContentWidthCallback((width) => this.growPickerToContent(width, maxWidth));
        return listComponent;
    }

    /** The pill's width reflects the current value, not the options it lists, so size the picker from the rows. */
    private growPickerToContent(width: number, maxWidth: number): boolean {
        const ePicker = this.pickerComponent?.getGui();
        if (!ePicker) {
            return true; // nothing was measured, which is not the same as no room left
        }

        const target = Math.min(width, maxWidth);
        // The seeded `min-width` is the floor, so reading it back is what keeps a narrower row from shrinking it.
        if (target > parseFloat(ePicker.style.minWidth || '0')) {
            ePicker.style.minWidth = `${target}px`;
            this.alignPickerToComponent();
        }

        return target < maxWidth;
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
