import {
    Component,
    FilterChangedEvent,
    _,
    IFloatingFilterComp,
    IFloatingFilterParams,
    UserComponentFactory,
    Autowired,
    FloatingFilterWrapper,
    IFilterDef,
    Promise,
    IFilterComp,
} from '@ag-grid-community/core';
import { CombinedFilterParams, CombinedFilterModel, CombinedFilter } from './combinedFilter';

export class CombinedFloatingFilterComp extends Component implements IFloatingFilterComp {
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private floatingFilters: IFloatingFilterComp[] = [];

    constructor() {
        super('<div class="ag-floating-filter-input"></div>');
    }

    public init(params: IFloatingFilterParams): void {
        const filterParams = params.filterParams as CombinedFilterParams;
        const filters = CombinedFilter.getFilterDefs(filterParams);

        _.forEach(filters, (filterDef, index) => {
            const floatingFilterParams: IFloatingFilterParams = {
                ...params,
                parentFilterInstance: (callback: (filterInstance: IFilterComp) => void) => {
                    params.parentFilterInstance(parent => (parent as CombinedFilter).getFilter(index).then(callback));
                }
            };

            const floatingFilter = this.createFloatingFilter(filterDef, floatingFilterParams).resolveNow(null, c => c);

            this.floatingFilters.push(floatingFilter);
            this.appendChild(floatingFilter.getGui());

            if (index > 0) {
                _.setDisplayed(floatingFilter.getGui(), false);
            }
        });
    }

    public onParentModelChanged(model: CombinedFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (event && event.afterFloatingFilter) { return; }

        if (model == null) {
            _.forEach(this.floatingFilters, (filter, i) => {
                filter.onParentModelChanged(null, event);
                _.setDisplayed(filter.getGui(), i === 0);
            });
        } else {
            const activeFiltersCount = _.filter(model.filterModels, f => f != null).length;

            _.forEach(this.floatingFilters, (filter, i) => {
                const filterModel = model.filterModels.length > i ? model.filterModels[i] : null;

                filter.onParentModelChanged(filterModel, event);

                const shouldShow = activeFiltersCount === 0 ? i === 0 : activeFiltersCount === 1 && filterModel != null;

                _.setDisplayed(filter.getGui(), shouldShow);
            });
        }
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    private createFloatingFilter(filterDef: IFilterDef, params: IFloatingFilterParams): Promise<IFloatingFilterComp> {
        const defaultComponentName =
            FloatingFilterWrapper.getDefaultFloatingFilterType(filterDef) || 'agTextColumnFloatingFilter';

        return this.userComponentFactory.newFloatingFilterComponent(filterDef, params, defaultComponentName);
    }
}