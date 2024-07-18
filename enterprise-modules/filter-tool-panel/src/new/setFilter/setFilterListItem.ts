import type { AgCheckbox, AgCheckboxParams } from '@ag-grid-community/core';
import { AgCheckboxSelector, Component, RefPlaceholder } from '@ag-grid-community/core';

import type { SetFilterItem } from '../filterState';

export class SetFilterListItem extends Component<'selectedChanged'> {
    private readonly eCheckbox: AgCheckbox = RefPlaceholder;
    constructor(
        private item: SetFilterItem,
        private selected?: boolean,
        private isTree?: boolean
    ) {
        super();
    }

    public postConstruct(): void {
        const eCheckboxParams: AgCheckboxParams = {
            labelEllipsis: true,
            tabIndex: -1,
            onValueChange: (newValue) =>
                this.dispatchLocalEvent({
                    type: 'selectedChanged',
                    selected: newValue,
                }),
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
        this.refreshComp(this.item, this.selected);
    }

    public refresh(item: SetFilterItem, selected?: boolean): void {
        this.refreshComp(item, selected);
    }

    private refreshComp(item: SetFilterItem, selected?: boolean): void {
        const { disabled = false, text } = item;
        this.eCheckbox.setValue(selected, true).setDisabled(disabled).setLabel(text);
    }
}
