import type { ElementParams } from 'ag-grid-community';
import { Component, RefPlaceholder, _focusInto, _getActiveDomElement, _isNothingFocused } from 'ag-grid-community';

import { AddFilterComp } from './addFilterComp';
import { FilterCardComp } from './filterCardComp';
import { compareAndUpdateListsInDom } from './filterPanelUtils';
import type { FilterPanelFilterState } from './iFilterState';
import type { IFilterStateService } from './iFilterStateService';

interface SingleRefresh {
    id: string;
    state: FilterPanelFilterState;
}

interface MultiRefreshActive {
    activeId: string;
}

export type FilterPanelRefreshParams = SingleRefresh | MultiRefreshActive;

const FilterPanelElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-panel',
    children: [{ tag: 'div', cls: 'ag-filter-panel-container', ref: 'eContainer' }],
};

export class FilterPanel extends Component {
    private readonly eContainer: HTMLElement = RefPlaceholder;

    private filters: Map<string, FilterCardComp> = new Map();
    private addFilterComp?: AddFilterComp;

    constructor(private readonly filterStateService: IFilterStateService) {
        super(FilterPanelElement);
    }

    public refresh(params?: FilterPanelRefreshParams): void {
        if ((params as SingleRefresh)?.id) {
            this.filters.get((params as SingleRefresh).id)?.refresh((params as SingleRefresh).state);
            return;
        }
        const { filterStateService, eContainer, filters: existingFilters, beans } = this;
        const filterIds = filterStateService.getFilterIds();
        const newFilters: Map<string, FilterCardComp> = new Map();

        const somethingIsFocused = !_isNothingFocused(beans);
        const activeElement = somethingIsFocused ? _getActiveDomElement(beans) : undefined;
        const containerHasFocus = somethingIsFocused && eContainer.contains(activeElement!);

        const ePrevItems: HTMLElement[] = [];
        const eNewItems: HTMLElement[] = [];

        for (const id of filterIds) {
            const newFilter = existingFilters.get(id) ?? this.createBean(new FilterCardComp(filterStateService, id));
            newFilter.refresh(filterStateService.getFilterState(id)!);
            newFilters.set(id, newFilter);
            eNewItems.push(newFilter.getGui());
        }

        this.filters = newFilters;

        const compsToDestroy: Component[] = [];
        existingFilters.forEach((existingFilter, id) => {
            ePrevItems.push(existingFilter.getGui());
            if (!newFilters.has(id)) {
                compsToDestroy.push(existingFilter);
            }
        });

        let addFilterComp = this.addFilterComp;
        if (addFilterComp) {
            ePrevItems.push(addFilterComp.getGui());
        }

        const addFilterOptions = this.filterStateService.getAvailableFilters();

        if (addFilterOptions.length) {
            if (!addFilterComp) {
                addFilterComp = this.createBean(new AddFilterComp(addFilterOptions));
                addFilterComp.addManagedListeners(addFilterComp, {
                    filterSelected: ({ id }) => filterStateService.addFilter(id),
                });
            }
            addFilterComp.refresh(addFilterOptions);
            eNewItems.push(addFilterComp.getGui());
        } else {
            addFilterComp = this.destroyBean(addFilterComp);
        }
        this.addFilterComp = addFilterComp;

        compareAndUpdateListsInDom(eContainer, eNewItems, ePrevItems);

        compsToDestroy.forEach((comp) => this.destroyBean(comp));

        const activeId = (params as MultiRefreshActive)?.activeId;
        const activeItemToFocus = activeId && newFilters.get(activeId)?.getGui();
        if (activeItemToFocus) {
            _focusInto(activeItemToFocus);
        } else if (containerHasFocus && _isNothingFocused(beans)) {
            _focusInto(eNewItems[eNewItems.length - 1] ?? eContainer);
        }
    }

    public override destroy(): void {
        this.addFilterComp = this.destroyBean(this.addFilterComp);
        const filters = this.filters;
        filters.forEach((filter) => this.destroyBean(filter));
        filters.clear();
        super.destroy();
    }
}
