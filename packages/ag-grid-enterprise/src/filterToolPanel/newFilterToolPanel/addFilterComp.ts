import type { AgSelect, AgSelectParams, ElementParams, ListOption } from 'ag-grid-community';
import { AgSelectSelector, Component, RefPlaceholder } from 'ag-grid-community';

import { translateForFilterPanel } from './filterPanelUtils';

const AddFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-card ag-filter-card-add',
    children: [{ tag: 'ag-select', ref: 'eSelect' }],
};

export class AddFilterComp extends Component<'filterSelected'> {
    private eSelect: AgSelect = RefPlaceholder;

    constructor(private readonly options: ListOption[]) {
        super();
    }

    public postConstruct(): void {
        const selectParams: AgSelectParams = {
            options: this.options,
            placeholder: translateForFilterPanel(this, 'addFilterCard'),
            onValueChange: (id) =>
                this.dispatchLocalEvent({
                    type: 'filterSelected',
                    id,
                }),
        };
        this.setTemplate(AddFilterElement, [AgSelectSelector], {
            eSelect: selectParams,
        });
    }

    public refresh(options: ListOption[]): void {
        this.eSelect.clearOptions().addOptions(options);
    }
}
