import { Component } from '@ag-grid-community/core';

import type { SetFilterParams } from '../filterState';

export class SetFilter extends Component<'filterChanged'> {
    constructor(private params: SetFilterParams) {
        super(/* html */ `<div>Set Filter</div>`);
    }

    public refresh(params: SetFilterParams): void {
        // TODO
        params;
    }
}
