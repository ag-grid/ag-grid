import { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParent } from '../floatingFilter';
import { Component } from '../../../widgets/component';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { Autowired } from '../../../context/context';
import { ColumnModel } from '../../../columns/columnModel';
import { IFilter } from '../../../interfaces/iFilter';
import { getLocaleTextFunc } from '../../../localeFunctions';

// optional floating filter for user provided filters - instead of providing a floating filter,
// they can provide a getModelAsString() method on the filter instead. this class just displays
// the string returned from getModelAsString()
export class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp<IFilter & IFloatingFilterParent> {

    @RefSelector('eFloatingFilterText') private eFloatingFilterText: AgInputTextField;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private params: IFloatingFilterParams;

    constructor() {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>`);
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: IFloatingFilterParams): void {
        this.params = params;
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = getLocaleTextFunc(this.gridOptionsService);
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }

    public onParentModelChanged(parentModel: any): void {
        if (!parentModel) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        this.params.parentFilterInstance(filterInstance => {
            // it would be nice to check if getModelAsString was present before creating this component,
            // however that is not possible, as React Hooks and VueJS don't attached the methods to the Filter until
            // AFTER the filter is created, not allowing inspection before this (we create floating filters as columns
            // are drawn, but the parent filters are only created when needed).
            if (filterInstance.getModelAsString) {
                const modelAsString = filterInstance.getModelAsString(parentModel);
                this.eFloatingFilterText.setValue(modelAsString);
            }
        });
    }
}
