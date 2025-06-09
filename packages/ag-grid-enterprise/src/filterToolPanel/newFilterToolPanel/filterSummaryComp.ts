import type { ElementParams, FilterPanelSummaryState } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

const FilterSummaryElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-card-summary',
    attrs: {
        'aria-hidden': 'true',
    },
};

export class FilterSummaryComp extends Component {
    constructor() {
        super(FilterSummaryElement);
    }

    public refresh(state: FilterPanelSummaryState): void {
        this.getGui().textContent = state.summary;
    }
}
