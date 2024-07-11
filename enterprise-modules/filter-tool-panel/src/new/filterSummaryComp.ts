import { Component } from '@ag-grid-community/core';

import type { FilterState } from './filterState';

export class FilterSummaryComp extends Component {
    constructor(private state: FilterState) {
        super(/* html */ `<div class="ag-filter-card-summary"></div>`);
    }

    public postConstruct(): void {
        this.refresh(this.state);
    }

    public refresh(state: FilterState): void {
        this.state = state;
        this.getGui().textContent = this.state.summary ?? '';
    }
}
