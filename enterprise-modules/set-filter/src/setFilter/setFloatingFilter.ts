import { Autowired, Component, IFloatingFilter, RefSelector, ValueFormatterService, Column, IFloatingFilterParams, AgInputTextField } from "@ag-grid-community/core";
import { SetFilterModel } from "./setFilterModel";

export class SetFloatingFilterComp extends Component implements IFloatingFilter {

    @RefSelector('eFloatingFilterText')
    private eFloatingFilterText: AgInputTextField;

    @Autowired('valueFormatterService')
    private valueFormatterService: ValueFormatterService;

    private column: Column;

    constructor() {
        super(`<div class="ag-floating-filter-input" role="presentation"><ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field></div>`);
    }

    public init(params: IFloatingFilterParams): void {
        this.eFloatingFilterText.setDisabled(true);
        this.column = params.column;
    }

    public onParentModelChanged(parentModel: SetFilterModel): void {
        if (!parentModel) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        // also supporting old filter model for backwards compatibility
        const values: string[] | null = (parentModel instanceof Array) ? parentModel : parentModel.values;

        if (!values || values.length === 0) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        // format all the values, if a formatter is provided
        const formattedValues = values.map(value => {
            const formattedValue =
                this.valueFormatterService.formatValue(this.column, null, null, value);
            return formattedValue != null ? formattedValue : value;
        });

        const arrayToDisplay = formattedValues.length > 10 ? formattedValues.slice(0, 10).concat('...') : formattedValues;
        const valuesString = `(${values.length}) ${arrayToDisplay.join(",")}`;

        this.eFloatingFilterText.setValue(valuesString);
    }

}
