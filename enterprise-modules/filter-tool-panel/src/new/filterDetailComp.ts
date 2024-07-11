import { Component } from '@ag-grid-community/core';

import type { FilterState } from './filterState';

export class FilterDetailComp extends Component {
    constructor(private state: FilterState) {
        super(/* html */ `<div></div>`);
    }

    postConstruct(): void {
        const { detail } = this.state;
        if (detail) {
            this.appendChild(detail);
        }
    }

    public refresh(state: FilterState): void {
        this.state = state;
    }
}
