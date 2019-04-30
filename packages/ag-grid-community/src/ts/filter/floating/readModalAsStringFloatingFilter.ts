import {IFloatingFilterComp, IFloatingFilterParams} from "./floatingFilter";
import {Component} from "../../widgets/component";
import {RefSelector} from "../../widgets/componentAnnotations";

export class ReadModelAsStringFloatingFilterComp extends Component implements IFloatingFilterComp {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: HTMLInputElement;

    private params: IFloatingFilterParams;

    constructor() {
        super(`<div class="ag-input-text-wrapper"><input ref="eFloatingFilterText" class="ag-floating-filter-input"></div>`);
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

        this.params.parentFilterInstance( filterInstance => {
            // getModelAsString should be present, as we check this
            // in floatingFilterWrapper
            if (filterInstance.getModelAsString) {
                const modelAsString = filterInstance.getModelAsString(parentModel);
                this.eFloatingFilterText.value = modelAsString;
            }
        });
    }
}
