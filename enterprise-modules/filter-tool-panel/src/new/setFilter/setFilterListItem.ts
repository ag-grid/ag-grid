import type { AgCheckboxParams } from '@ag-grid-community/core';
import { AgCheckboxSelector, Component } from '@ag-grid-community/core';

import type { SetFilterItem } from '../filterState';

export class SetFilterListItem<TValue> extends Component {
    constructor(
        private params: SetFilterItem<TValue>,
        private isTree?: boolean
    ) {
        super();
    }

    public postConstruct(): void {
        const { text: label, selected: value, disabled } = this.params;
        const eCheckboxParams: AgCheckboxParams = {
            labelEllipsis: true,
            value,
            disabled,
            tabIndex: -1,
            label,
        };
        this.setTemplate(
            /* html */ `<div class="ag-set-filter-item">
                <ag-checkbox data-ref="eCheckbox" class="ag-set-filter-item-checkbox"></ag-checkbox>
            </div>`,
            [AgCheckboxSelector],
            {
                eCheckbox: eCheckboxParams,
            }
        );
    }

    public refresh(params: SetFilterItem<TValue>): void {
        // TODO
        params;
    }
}
