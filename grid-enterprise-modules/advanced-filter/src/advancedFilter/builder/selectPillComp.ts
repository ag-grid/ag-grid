import { AgRichSelect, AutocompleteEntry, RichSelectParams, VirtualList } from "@ag-grid-community/core";

export class SelectPillComp extends AgRichSelect<AutocompleteEntry> {
    constructor(config: RichSelectParams<AutocompleteEntry>, private readonly getEditorParams: () => { values?: any[] }, private readonly cssClass: string) {
        super({
            ...config ?? {},
            template: /* html */`
                <div class="ag-picker-field ag-advanced-filter-builder-pill-wrapper" role="presentation">
                    <div ref="eLabel"></div>
                    <div ref="eWrapper" class="ag-wrapper ag-advanced-filter-builder-pill ag-picker-collapsed">
                        <div ref="eDisplayField" class="ag-picker-field-display ag-advanced-filter-builder-pill-display"></div>
                        <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`,
        });
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.eWrapper.classList.add(this.cssClass);
    }

    protected createPickerComponent(): VirtualList {
        if (!this.values) {
            const { values } = this.getEditorParams();
            this.values = values!;
            const key = this.value.key;
            const value = values!.find(value => value.key === key) ?? {
                key,
                displayValue: this.value.displayValue
            };
            this.value = value;
        }
        return super.createPickerComponent();
    }
}
