import type { AgSelectParams, BeanCollection, ListOption } from '@ag-grid-community/core';
import { AgSelectSelector, Component } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from './filterPanelTranslationService';

export class AddFilterComp extends Component<'filterSelected'> {
    private translationService: FilterPanelTranslationService;

    constructor(private readonly options: ListOption[]) {
        super();
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const selectParams: AgSelectParams<string> = {
            options: this.options,
            placeholder: this.translationService.translate('addFilter'),
            onValueChange: (id) =>
                this.dispatchLocalEvent({
                    type: 'filterSelected',
                    id,
                }),
        };
        this.setTemplate(
            /* html */ `<div class="ag-filter-card ag-filter-card-add">
            <ag-select data-ref="eSelect"></ag-select>
        </div>`,
            [AgSelectSelector],
            {
                eSelect: selectParams,
            }
        );
    }
}
