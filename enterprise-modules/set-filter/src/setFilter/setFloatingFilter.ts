import {
    FilterChangedEvent,
    Autowired,
    Component,
    IFloatingFilter,
    RefSelector,
    ValueFormatterService,
    IFloatingFilterParams,
    AgInputTextField
} from '@ag-grid-community/core';

import { SetFilterModel } from './setFilterModel';
import { SetFilter } from './setFilter';
import { SetValueModel } from './setValueModel';

export class SetFloatingFilterComp extends Component implements IFloatingFilter {
    @RefSelector('eFloatingFilterText') private eFloatingFilterText: AgInputTextField;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

    private params: IFloatingFilterParams;
    private lastKnownModel: SetFilterModel;
    private availableValuesListenerAdded = false;

    constructor() {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>`
        );
    }

    public init(params: IFloatingFilterParams): void {
        this.eFloatingFilterText.setDisabled(true);
        this.params = params;
    }

    // unlike other filters, what we show in the floating filter can be different, even
    // if another filter changes. this is due to how set filter restricts its values based
    // on selections in other filters, e.g. if you filter Language to English, then the set filter
    // on Country will only show English speaking countries. Thus the list of items to show
    // in the floating filter can change.
    public onAvailableValuesChanged(filterChangedEvent: FilterChangedEvent): void {
        this.updateSetFilterText();
    }

    public onParentModelChanged(parentModel: SetFilterModel): void {
        this.lastKnownModel = parentModel;
        this.updateSetFilterText();
    }

    private addAvailableValuesListener(): void {
        this.params.parentFilterInstance((setFilter: SetFilter) => {
            const setValueModel = setFilter.getValueModel();
            this.addDestroyableEventListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, this.onAvailableValuesChanged.bind(this));
        });

        this.availableValuesListenerAdded = true;
    }

    private updateSetFilterText(): void {
        if (!this.lastKnownModel) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }

        // also supporting old filter model for backwards compatibility
        const values = this.lastKnownModel instanceof Array ? this.lastKnownModel as string[] : this.lastKnownModel.values;

        if (!values || values.length === 0) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        this.params.parentFilterInstance((setFilter: SetFilter) => {
            const valueModel = setFilter.getValueModel();
            const availableValues = values.filter(valueModel.isValueAvailable.bind(valueModel));

            // format all the values, if a formatter is provided
            const formattedValues = availableValues.map(value => {
                const formattedValue = this.valueFormatterService.formatValue(this.params.column, null, null, value);
                return formattedValue != null ? formattedValue : value;
            });

            const arrayToDisplay = formattedValues.length > 10 ? formattedValues.slice(0, 10).concat('...') : formattedValues;
            const valuesString = `(${formattedValues.length}) ${arrayToDisplay.join(',')}`;

            this.eFloatingFilterText.setValue(valuesString);
        });
    }
}
