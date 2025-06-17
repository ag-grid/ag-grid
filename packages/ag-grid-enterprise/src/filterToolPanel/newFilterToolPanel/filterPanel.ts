import type { ElementParams, FilterAction, FilterPanelFilterState } from 'ag-grid-community';
import { FilterButtonComp } from 'ag-grid-community';
import {
    Component,
    RefPlaceholder,
    _focusInto,
    _getActiveDomElement,
    _isNothingFocused,
    _removeFromParent,
} from 'ag-grid-community';

import { AddFilterComp } from './addFilterComp';
import { FilterCardComp } from './filterCardComp';
import { compareAndUpdateListsInDom } from './filterPanelUtils';

interface SingleRefresh {
    id: string;
    state: FilterPanelFilterState;
}

function isSingleRefresh(params?: FilterPanelRefreshParams): params is SingleRefresh {
    return !!(params as SingleRefresh)?.id;
}

interface MultiRefreshActive {
    activeId: string;
}

interface ActionRefresh {
    action: true;
}

function isActionRefresh(params?: FilterPanelRefreshParams): params is ActionRefresh {
    return !!(params as ActionRefresh)?.action;
}

export type FilterPanelRefreshParams = SingleRefresh | MultiRefreshActive | ActionRefresh;

const FilterPanelElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-panel',
    children: [{ tag: 'div', cls: 'ag-filter-panel-container', ref: 'eContainer' }],
};

export class FilterPanel extends Component {
    private readonly eContainer: HTMLElement = RefPlaceholder;

    private filters: Map<string, FilterCardComp> = new Map();
    private addFilterComp?: AddFilterComp;
    private buttonComp?: FilterButtonComp;

    constructor() {
        super(FilterPanelElement);
    }

    public refresh(params?: FilterPanelRefreshParams): void {
        if (isActionRefresh(params)) {
            this.refreshActions();
            return;
        }
        if (isSingleRefresh(params)) {
            this.filters.get(params.id)?.refresh(params.state);
            return;
        }
        const { eContainer, filters: existingFilters, beans } = this;
        const filterPanelSvc = beans.filterPanelSvc!;
        const filterIds = filterPanelSvc.getIds();
        const newFilters: Map<string, FilterCardComp> = new Map();

        const somethingIsFocused = !_isNothingFocused(beans);
        const activeElement = somethingIsFocused ? _getActiveDomElement(beans) : undefined;
        const containerHasFocus = somethingIsFocused && eContainer.contains(activeElement!);

        const ePrevItems: HTMLElement[] = [];
        const eNewItems: HTMLElement[] = [];

        for (const id of filterIds) {
            const newFilter = existingFilters.get(id) ?? this.createBean(new FilterCardComp(id));
            newFilter.refresh(filterPanelSvc.getState(id)!);
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

        const addFilterOptions = filterPanelSvc.getAvailable();

        if (addFilterOptions.length) {
            if (!addFilterComp) {
                addFilterComp = this.createBean(new AddFilterComp(addFilterOptions));
                addFilterComp.addManagedListeners(addFilterComp, {
                    filterSelected: ({ id }) => filterPanelSvc.add(id),
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

        const activeId = params?.activeId;
        const activeItemToFocus = activeId && newFilters.get(activeId)?.getGui();
        if (activeItemToFocus) {
            _focusInto(activeItemToFocus);
        } else if (containerHasFocus && _isNothingFocused(beans)) {
            _focusInto(eNewItems[eNewItems.length - 1] ?? eContainer);
        }

        this.refreshActions();
    }

    private refreshActions(): void {
        const filterPanelSvc = this.beans.filterPanelSvc!;
        const { actions, canApply } = filterPanelSvc.getActions() ?? {};
        let buttonComp = this.buttonComp;
        if (actions?.length) {
            if (!buttonComp) {
                buttonComp = this.createBean(new FilterButtonComp({ className: 'ag-filter-panel-buttons' }));
                this.getGui().appendChild(buttonComp.getGui());
                const listeners: Partial<Record<FilterAction, () => void>> = {};
                (['apply', 'clear', 'reset', 'cancel'] as const).forEach((action) => {
                    listeners[action] = () => filterPanelSvc.doAction(action);
                });
                buttonComp.addManagedListeners(buttonComp, listeners);
            }
            buttonComp.updateButtons(actions);
            buttonComp.updateValidity(canApply);
        } else {
            if (buttonComp) {
                _removeFromParent(buttonComp.getGui());
                buttonComp = this.destroyBean(buttonComp);
            }
        }
        this.buttonComp = buttonComp;
    }

    public override destroy(): void {
        this.addFilterComp = this.destroyBean(this.addFilterComp);
        this.buttonComp = this.destroyBean(this.buttonComp);
        const filters = this.filters;
        filters.forEach((filter) => this.destroyBean(filter));
        filters.clear();
        super.destroy();
    }
}
