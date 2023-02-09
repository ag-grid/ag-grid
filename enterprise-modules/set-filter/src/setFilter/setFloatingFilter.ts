import {
    Autowired,
    Component,
    IFloatingFilter,
    RefSelector,
    IFloatingFilterParams,
    AgInputTextField,
    ColumnModel,
    SetFilterModel,
} from '@ag-grid-community/core';

import { SetFilter } from './setFilter';
import { SetFilterModelFormatter } from './setFilterModelFormatter';
import { SetValueModel } from './setValueModel';

export class SetFloatingFilterComp<V = string> extends Component implements IFloatingFilter {
    @RefSelector('eFloatingFilterText') private readonly eFloatingFilterText: AgInputTextField;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private params: IFloatingFilterParams;
    private availableValuesListenerAdded = false;
    private readonly filterModelFormatter = new SetFilterModelFormatter();

    constructor() {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>`
        );
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: IFloatingFilterParams): void {
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();

        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
            .addGuiEventListener('click', () => params.showParentFilter());

        this.params = params;
    }

    public onParentModelChanged(parentModel: SetFilterModel): void {
        this.updateFloatingFilterText(parentModel);
    }

    private parentSetFilterInstance(cb: (instance: SetFilter<V>) => void): void {
        this.params.parentFilterInstance((filter) => {
            if (!(filter instanceof SetFilter)) {
                throw new Error('AG Grid - SetFloatingFilter expects SetFilter as its parent');
            }

            cb(filter);
        });
    }

    private addAvailableValuesListener(): void {
        this.parentSetFilterInstance((setFilter) => {
            const setValueModel = setFilter.getValueModel();

            if (!setValueModel) { return; }

            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            this.addManagedListener(
                setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, () => this.updateFloatingFilterText());
        });

        this.availableValuesListenerAdded = true;
    }

    private updateFloatingFilterText(parentModel?: SetFilterModel | null): void {
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }

        this.parentSetFilterInstance((setFilter) => {
            this.eFloatingFilterText.setValue(this.filterModelFormatter.getModelAsString(parentModel, setFilter));
        });
    }
}
