import type { ColumnNameService } from '../../../columns/columnNameService';
import type { BeanCollection } from '../../../context/context';
import type { IFilter } from '../../../interfaces/iFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { Component, RefPlaceholder } from '../../../widgets/component';
import type { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParent } from '../floatingFilter';

// optional floating filter for user provided filters - instead of providing a floating filter,
// they can provide a getModelAsString() method on the filter instead. this class just displays
// the string returned from getModelAsString()
export class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp<IFilter & IFloatingFilterParent> {
    private columnNameService: ColumnNameService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.columnNameService = beans.columnNameService;
    }

    private readonly eFloatingFilterText: AgInputTextField = RefPlaceholder;

    private params: IFloatingFilterParams;

    constructor() {
        super(
            /* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field data-ref="eFloatingFilterText"></ag-input-text-field>
            </div>`,
            [AgInputTextField]
        );
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: IFloatingFilterParams): void {
        this.params = params;
        const displayName = this.columnNameService.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }

    public onParentModelChanged(parentModel: any): void {
        if (parentModel == null) {
            this.eFloatingFilterText.setValue('');
            return;
        }

        this.params.parentFilterInstance((filterInstance) => {
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

    public onParamsUpdated(params: IFloatingFilterParams): void {
        this.refresh(params);
    }

    public refresh(params: IFloatingFilterParams): void {
        this.init(params);
    }
}
