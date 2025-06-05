import type { AgSelect, AgSelectParams, ElementParams } from 'ag-grid-community';
import { AgSelectSelector, Component, RefPlaceholder, _removeFromParent } from 'ag-grid-community';

import type { FilterPanelDetailState } from './iFilterState';

const FilterDetailElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-card-body',
    children: [{ tag: 'ag-select', cls: 'ag-filter-type-select', ref: 'eFilterType' }],
};

export class FilterDetailComp extends Component<'filterTypeChanged'> {
    private eFilterType: AgSelect = RefPlaceholder;
    private state?: FilterPanelDetailState;

    public postConstruct(): void {
        const eFilterTypeParams: AgSelectParams = {
            onValueChange: (filterType) => this.dispatchLocalEvent({ type: 'filterTypeChanged', filterType }),
        };
        this.setTemplate(FilterDetailElement, [AgSelectSelector], { eFilterType: eFilterTypeParams });
    }

    public refresh(newState: FilterPanelDetailState): void {
        const oldState = this.state;
        this.state = newState;

        const { type: newType, options: newOptions, detail: newDetail } = newState;
        const { type: oldType, options: oldOptions, detail: oldDetail } = oldState ?? {};

        const eFilterType = this.eFilterType;
        if (newOptions !== oldOptions) {
            eFilterType.clearOptions().addOptions(newOptions).setValue(newType, true);
        } else if (newType !== oldType) {
            eFilterType.setValue(newType, true);
        }
        if (newDetail !== oldDetail) {
            if (oldDetail) {
                _removeFromParent(oldDetail);
            }
            this.appendChild(newDetail);
        }
    }
}
