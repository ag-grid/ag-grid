import {
    Component,
    FilterChangedEvent,
    _,
    IFloatingFilterComp,
    IFloatingFilterParams,
    ProvidedFilterModel,
    UserComponentFactory,
    Autowired,
    FloatingFilterWrapper,
    IFilterDef,
} from '@ag-grid-community/core';
import { SetFloatingFilterComp } from '../setFilter/setFloatingFilter';
import { SetFilterModel } from '../setFilter/setFilterModel';
import { CombinedFilterParams } from './combinedFilter';

export class CombinedFloatingFilterComp extends Component implements IFloatingFilterComp {
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private providedFilter: IFloatingFilterComp;
    private setFilter: SetFloatingFilterComp;

    constructor() {
        super('<div class="ag-floating-filter-input"></div>');
    }

    public init(params: IFloatingFilterParams): void {
        const filterParams = params.filterParams as CombinedFilterParams;

        this.providedFilter = this.createProvidedFilter(filterParams.combineWith, params);
        this.appendChild(this.providedFilter.getGui());

        this.setFilter = this.userComponentFactory.createUserComponentFromConcreteClass(SetFloatingFilterComp, params);
        this.appendChild(this.setFilter);

        _.setDisplayed(this.setFilter.getGui(), false);
    }

    public onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (event && event.afterFloatingFilter) { return; }

        const showSetFilter = model && model.filterType === 'set';

        _.setDisplayed(this.providedFilter.getGui(), !showSetFilter);
        _.setDisplayed(this.setFilter.getGui(), showSetFilter);

        if (showSetFilter) {
            this.setFilter.onParentModelChanged(model as SetFilterModel);
            this.providedFilter.onParentModelChanged(null, event);
        } else {
            this.providedFilter.onParentModelChanged(model, event);
            this.setFilter.onParentModelChanged(null);
        }
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    private createProvidedFilter(filterDef: IFilterDef, params: IFloatingFilterParams): IFloatingFilterComp {
        const defaultComponentName = FloatingFilterWrapper.getDefaultFloatingFilterType(filterDef) || 'agTextColumnFloatingFilter';

        return this.userComponentFactory
            .newFloatingFilterComponent(filterDef, params, defaultComponentName)
            .resolveNow(null, c => c);
    }
}