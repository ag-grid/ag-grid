import { AgRichSelect, AutocompleteEntry, RichSelectParams, _ } from "@ag-grid-community/core";

export interface AddDropdownCompParams extends RichSelectParams<AutocompleteEntry> {
    wrapperClassName?: string;
}

export class AddDropdownComp extends AgRichSelect {
    constructor(private readonly params: AddDropdownCompParams) {
        super({
            ...params,
            template: /* html */`
                <div class="ag-picker-field" role="presentation">
                    <div ref="eLabel"></div>
                    <div ref="eWrapper" class="ag-wrapper ag-picker-collapsed">
                        <div ref="eDisplayField" class="ag-picker-field-display"></div>
                        <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`,
        });
    }

    protected postConstruct(): void {
        super.postConstruct();
        _.setDisplayed(this.eDisplayField, false);
        const { wrapperClassName } = this.params;
        if (wrapperClassName) {
            this.eWrapper.classList.add(wrapperClassName);
        }
    }

    protected onEnterKeyDown(event: KeyboardEvent): void {
        _.stopPropagationForAgGrid(event);
        if (this.isPickerDisplayed) {
            super.onEnterKeyDown(event);
        } else {
            event.preventDefault();
            this.showPicker();
        }
    }
}
