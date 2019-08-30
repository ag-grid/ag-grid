import { Autowired, Component, IFloatingFilter, RefSelector, ValueFormatterService, Column, IFloatingFilterParams } from "ag-grid-community";
import { SetFilterModel } from "./setFilterModel";

export class SetFloatingFilterComp extends Component implements IFloatingFilter {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: HTMLInputElement;

    @Autowired('valueFormatterService')
    private valueFormatterService: ValueFormatterService;

    private column: Column;

    constructor() {
        super(`<div class="ag-input-wrapper" role="presentation"><input ref="eFloatingFilterText" class="ag-floating-filter-input"></div>`);
    }

    public init(params: IFloatingFilterParams): void {
        this.eFloatingFilterText.disabled = true;
        this.column = params.column;
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

        // format all the values, if a formatter is provided
        for (var i = 0; i < values.length; i++) {
            const valueUnformatted = values[i];
            const valueFormatted =
                this.valueFormatterService.formatValue(this.column, null, null, valueUnformatted);
            if (valueFormatted != null) {
                values[i] = valueFormatted;
            }
        }

        const arrayToDisplay = values.length > 10 ? values.slice(0, 10).concat('...') : values;
        const valuesString = `(${values.length}) ${arrayToDisplay.join(",")}`;

        this.eFloatingFilterText.value = valuesString;
    }

}
