import { IFloatingFilterComp, IFloatingFilterParams } from "../floatingFilter";
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";

// optional floating filter for user provided filters - instead of providing a floating filter,
// they can provide a getModelAsString() method on the filter instead. this class just displays
// the string returned from getModelAsString()
export class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: HTMLInputElement;

    private params: IFloatingFilterParams;

    constructor() {
        super(`<div class="ag-input-wrapper" role="presentation"><input ref="eFloatingFilterText" class="ag-floating-filter-input"></div>`);
    }

    public init(params: IFloatingFilterParams): void {
        this.params = params;
        this.eFloatingFilterText.disabled = true;
    }

    public onParentModelChanged(parentModel: any): void {
        if (!parentModel) {
            this.eFloatingFilterText.value = '';
            return;
        }

        this.params.parentFilterInstance(filterInstance => {
            // getModelAsString should be present, as we check this
            // in floatingFilterWrapper
            if (filterInstance.getModelAsString) {
                const modelAsString = filterInstance.getModelAsString(parentModel);
                this.eFloatingFilterText.value = modelAsString;
            }
        });
    }
}
