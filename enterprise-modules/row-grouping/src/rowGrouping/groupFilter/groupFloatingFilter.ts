import {
    _,
    AgInputTextField,
    AgPromise,
    Component,
    IFloatingFilterComp,
    IFloatingFilterParams,
    RefSelector,
} from '@ag-grid-community/core';
import { GroupFilter } from './groupFilter';

export class GroupFloatingFilterComp extends Component implements IFloatingFilterComp<GroupFilter> {
    @RefSelector('eFloatingFilterText') private eFloatingFilterText: AgInputTextField;

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
        this.eFloatingFilterText.setDisabled(true);
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
        const activeFilter = this.parentFilterInstance.getActiveFilter();
        if (activeFilter?.getModelAsString) {
            const filterModel = activeFilter.getModel();
            this.eFloatingFilterText.setValue(filterModel == null ? '' : activeFilter.getModelAsString(filterModel));
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
