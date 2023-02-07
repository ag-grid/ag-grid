import {
    _,
    AgInputTextField,
    AgPromise,
    Autowired,
    ColumnModel,
    Component,
    IFloatingFilterComp,
    IFloatingFilterParams,
    RefSelector,
} from '@ag-grid-community/core';
import { GroupFilter } from './groupFilter';

export class GroupFloatingFilterComp extends Component implements IFloatingFilterComp<GroupFilter> {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    @RefSelector('eFloatingFilterText') private readonly eFloatingFilterText: AgInputTextField;

    private params: IFloatingFilterParams<GroupFilter>;
    private parentFilterInstance: GroupFilter;

    constructor() {
        super(/* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>
        `);
    }

    public init(params: IFloatingFilterParams<GroupFilter>): AgPromise<void> {
        this.params = params;

        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();

        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
            .addGuiEventListener('click', () => this.params.showParentFilter());

        return new AgPromise(resolve => {
            this.params.parentFilterInstance(parentFilterInstance => {
                this.parentFilterInstance = parentFilterInstance;
                this.addManagedListener(parentFilterInstance, GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, () => this.onSelectedColumnChanged());
                this.addManagedListener(parentFilterInstance, GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
                resolve();
            });
        });
    }

    public onParentModelChanged(): void {
        this.updateDisplayedValue();
    }

    private updateDisplayedValue(): void {
        if (!this.parentFilterInstance) {
            return;
        }
        const selectedFilter = this.parentFilterInstance.getSelectedFilter();
        if (!selectedFilter) {
            this.eFloatingFilterText.setValue('');
            this.eFloatingFilterText.setDisplayed(false);
            return;
        }
        this.eFloatingFilterText.setDisplayed(true);
        if (selectedFilter.getModelAsString) {
            const filterModel = selectedFilter.getModel();
            this.eFloatingFilterText.setValue(filterModel == null ? '' : selectedFilter.getModelAsString(filterModel));
        } else {
            this.eFloatingFilterText.setValue('');
        }
    }

    private onSelectedColumnChanged(): void {
        this.updateDisplayedValue();
    }

    private onColumnRowGroupChanged(): void {
        this.updateDisplayedValue();
    }

    public destroy(): void {
        super.destroy();
    }
}
