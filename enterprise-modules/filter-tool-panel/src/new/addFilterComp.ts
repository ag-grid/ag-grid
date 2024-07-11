import type { AgSelectParams, BeanCollection } from '@ag-grid-community/core';
import { AgSelectSelector, Component } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from './filterPanelTranslationService';
import type { IFilterStateService } from './iFilterStateService';

export class AddFilterComp extends Component {
    private translationService: FilterPanelTranslationService;

    constructor(private readonly filterStateService: IFilterStateService) {
        super();
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const selectParams: AgSelectParams<string> = {
            options: this.filterStateService
                .getAvailableFilters()
                .map(({ id: value, name: text }) => ({ value, text })),
            placeholder: this.translationService.translate('addFilter'),
            onValueChange: (value) => this.filterStateService.addFilter(value),
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
