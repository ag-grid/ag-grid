import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { Component } from '../../../widgets/component';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { Autowired } from '../../../context/context';
import { ColumnController } from '../../../columnController/columnController';

// optional floating filter for user provided filters - instead of providing a floating filter,
// they can provide a getModelAsString() method on the filter instead. this class just displays
// the string returned from getModelAsString()
export class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp {
    @RefSelector('eFloatingFilterText') private eFloatingFilterText: AgInputTextField;
    @Autowired('columnController') private columnController: ColumnController;

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
        const displayName = this.columnController.getDisplayNameForColumn(params.column, 'header', true);
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} Filter Input`);
    }

    public onParentModelChanged(parentModel: any): void {
        if (!parentModel) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        this.params.parentFilterInstance(filterInstance => {
            // getModelAsString should be present, as we check this
            // in floatingFilterWrapper
            if (filterInstance.getModelAsString) {
                const modelAsString = filterInstance.getModelAsString(parentModel);
                this.eFloatingFilterText.setValue(modelAsString);
            }
        });
    }
}
