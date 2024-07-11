import type { AgInputTextFieldParams, BeanCollection } from '@ag-grid-community/core';
import {
    AgInputTextFieldSelector,
    Component,
    RefPlaceholder,
    _clearElement,
    _debounce,
    _makeNull,
} from '@ag-grid-community/core';

import { AddFilterComp } from './addFilterComp';
import { FilterCardComp } from './filterCardComp';
import type { FilterPanelTranslationService } from './filterPanelTranslationService';
import type { IFilterStateService } from './iFilterStateService';

export class FilterPanel extends Component {
    private readonly eHeader: HTMLElement = RefPlaceholder;
    private readonly eContainer: HTMLElement = RefPlaceholder;

    private translationService: FilterPanelTranslationService;

    private filters: Map<string, FilterCardComp> = new Map();
    private addFilterComp: AddFilterComp;
    private onSearchValueChangedDebounced = _debounce(this.onSearchValueChanged.bind(this), 300);
    private activeSearchValue: string | null = null;

    constructor(private readonly filterStateService: IFilterStateService) {
        super();
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const eSearchParams: AgInputTextFieldParams = {
            inputPlaceholder: this.translationService.translate('filterSearch'),
            autoComplete: false,
            onValueChange: (value) => this.onSearchValueChangedDebounced(value),
        };
        this.setTemplate(
            /* html */ `<div class="ag-filter-panel">
            <div data-ref="eHeader" class="ag-filter-panel-header"></div>
            <ag-input-text-field data-ref="eSearch" class="ag-filter-panel-search"></ag-input-text-field>
            <div data-ref="eContainer" class="ag-filter-panel-container"></div>
        </div>`,
            [AgInputTextFieldSelector],
            {
                eSearch: eSearchParams,
            }
        );
        this.eHeader.textContent = this.translationService.translate('filters');
        this.createFilters();
        this.addManagedListeners(this.filterStateService, {
            filterStateChanged: (event) => this.filters.get(event.id)?.refresh(),
        });
    }

    public refresh(): void {
        // TODO - save and restore focus
        const existingFilters = this.filters;
        _clearElement(this.eContainer);
        this.destroyBean(this.addFilterComp);
        this.createFilters();
        this.destroyFilters(existingFilters);
    }

    private createFilters(): void {
        const { filterStateService, eContainer, filters } = this;
        const filterIds = filterStateService.getFilterIds();
        const newFilters: Map<string, FilterCardComp> = new Map();

        filterIds.forEach((id) => {
            const existingFilter = filters.get(id);
            let filter: FilterCardComp;
            if (existingFilter) {
                filters.delete(id);
                existingFilter.refresh();
                filter = existingFilter;
            } else {
                filter = this.createBean(new FilterCardComp(filterStateService, id));
            }
            newFilters.set(id, filter);
        });

        this.filters = newFilters;

        this.applySearch();

        this.addFilterComp = this.createManagedBean(new AddFilterComp(filterStateService));
        eContainer.appendChild(this.addFilterComp.getGui());
    }

    private applySearch(): void {
        const { filters, activeSearchValue, filterStateService, eContainer } = this;
        filters.forEach((filter, id) => {
            if (
                !activeSearchValue ||
                filterStateService.getFilterState(id)?.name.toLocaleLowerCase().includes(activeSearchValue)
            ) {
                eContainer.appendChild(filter.getGui());
            }
        });
    }

    private onSearchValueChanged(value: string): void {
        this.activeSearchValue = _makeNull(value.toLocaleLowerCase());
        _clearElement(this.eContainer);
        this.applySearch();
        this.eContainer.appendChild(this.addFilterComp.getGui());
    }

    private destroyFilters(filters: Map<string, FilterCardComp>): void {
        filters.forEach((filter) => this.destroyBean(filter));
    }

    public override destroy(): void {
        this.destroyFilters(this.filters);
        this.filters.clear();
        super.destroy();
    }
}
