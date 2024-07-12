import { Component } from '@ag-grid-community/core';

import type { FilterState } from './filterState';
import { SimpleFilter } from './filters/simpleFilter';

export class FilterDetailComp extends Component {
    private eFilter: SimpleFilter;

    constructor(private state: FilterState) {
        super(/* html */ `<div class="ag-filter"></div>`);
    }

    postConstruct(): void {
        const filter = this.createManagedBean(new SimpleFilter(this.state));
        this.eFilter = filter;
        this.appendChild(filter.getGui());
    }

    public refresh(state: FilterState): void {
        this.state = state;
        this.eFilter.refresh(state);
    }

    public override destroy(): void {
        this.eFilter = undefined!;
        super.destroy();
    }
}
