import { Component, RefPlaceholder, _clearElement, _createIcon, _removeFromParent } from '@ag-grid-community/core';

import { FilterDetailComp } from './filterDetailComp';
import type { FilterState } from './filterState';
import { FilterSummaryComp } from './filterSummaryComp';
import type { IFilterStateService } from './iFilterStateService';

export class FilterCardComp extends Component {
    private readonly eHeader: HTMLElement = RefPlaceholder;
    private readonly eTitle: HTMLElement = RefPlaceholder;
    private readonly eExpandIcon: HTMLElement = RefPlaceholder;
    private readonly eDeleteIcon: HTMLElement = RefPlaceholder;

    private summaryComp?: FilterSummaryComp;
    private detailComp?: FilterDetailComp;

    private expanded?: boolean;

    constructor(
        private readonly filterStateService: IFilterStateService,
        private readonly id: string
    ) {
        super(/* html */ `<div class="ag-filter-card">
            <div data-ref="eHeader" class="ag-filter-card-header">
                <span data-ref="eExpandIcon" class="ag-filter-card-expand-icon" role="presentation"></span>
                <div data-ref="eTitle" class="ag-filter-card-title"></div>
                <span data-ref="eDeleteIcon" class="ag-filter-card-delete-icon" role="presentation"></span>
            </div>
        </div>`);
    }

    public postConstruct(): void {
        this.refresh();
        this.eDeleteIcon.appendChild(_createIcon('close', this.gos, null));
        this.addManagedElementListeners(this.eHeader, {
            click: () => this.filterStateService.updateFilterState(this.id, 'expanded', !this.expanded),
        });
        this.addManagedElementListeners(this.eDeleteIcon, {
            click: () => this.filterStateService.removeFilter(this.id),
        });
    }

    public refresh(): void {
        const state = this.filterStateService.getFilterState(this.id);
        if (!state) {
            // TODO - some kind of error handling?
            return;
        }
        const { name, expanded } = state;

        this.eTitle.textContent = name;

        this.expanded = expanded;
        this.toggleIcon(expanded);

        this.refreshFilterComp(state);
    }

    private refreshFilterComp(state: FilterState): void {
        const removeComp = (comp?: Component) => {
            if (!comp) {
                return;
            }
            _removeFromParent(comp.getGui());
            return this.destroyBean(comp);
        };
        const createOrRefreshComp = <C extends FilterDetailComp | FilterSummaryComp>(
            comp: C | undefined,
            FilterComp: { new (state: FilterState): C }
        ) => {
            if (comp) {
                comp.refresh(state);
                return comp;
            }
            const newComp = this.createBean(new FilterComp(state));
            this.appendChild(newComp.getGui());
            return newComp;
        };
        if (state.expanded) {
            this.summaryComp = removeComp(this.summaryComp);
            this.detailComp = createOrRefreshComp(this.detailComp, FilterDetailComp);
        } else {
            this.detailComp = removeComp(this.detailComp);
            this.summaryComp = createOrRefreshComp(this.summaryComp, FilterSummaryComp);
        }
    }

    private toggleIcon(expanded?: boolean): void {
        const { eExpandIcon } = this;
        _clearElement(eExpandIcon);
        eExpandIcon.appendChild(_createIcon(expanded ? 'columnSelectOpen' : 'columnSelectClosed', this.gos, null));
    }

    public override destroy(): void {
        this.destroyBeans([this.detailComp, this.summaryComp]);
        super.destroy();
    }
}
