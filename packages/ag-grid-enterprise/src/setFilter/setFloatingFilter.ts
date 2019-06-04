import { Component, IFloatingFilter, RefSelector } from "ag-grid-community";
import { SetFilterModel } from "./setFilterModel";

export class SetFloatingFilterComp extends Component implements IFloatingFilter {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: HTMLInputElement;

    constructor() {
        super(`<div class="ag-input-text-wrapper"><input ref="eFloatingFilterText" class="ag-floating-filter-input"></div>`);
    }

    public init(): void {
        this.eFloatingFilterText.disabled = true;
    }

    public onParentModelChanged(parentModel: SetFilterModel): void {
        if (!parentModel) {
            this.eFloatingFilterText.value = '';
            return;
        }

        // also supporting old filter model for backwards compatibility
        const values: string[] | null = (parentModel instanceof Array) ? parentModel : parentModel.values;

        if (!values || values.length === 0) {
            this.eFloatingFilterText.value = '';
            return;
        }

        const arrayToDisplay = values.length > 10 ? values.slice(0, 10).concat('...') : values;
        const valuesString = `(${values.length}) ${arrayToDisplay.join(",")}`;

        this.eFloatingFilterText.value = valuesString;
    }

}
