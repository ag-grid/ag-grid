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
} from '@ag-grid-community/core';
import { SetFloatingFilterComp } from '../setFilter/setFloatingFilter';
import { CombinedFilterParams, CombinedFilterModel } from './combinedFilter';

export class CombinedFloatingFilterComp extends Component implements IFloatingFilterComp {
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private wrappedFloatingFilter: IFloatingFilterComp;
    private setFloatingFilter: SetFloatingFilterComp;

    constructor() {
        super('<div class="ag-floating-filter-input"></div>');
    }

    public init(params: IFloatingFilterParams): void {
        const filterParams = params.filterParams as CombinedFilterParams;

        this.wrappedFloatingFilter = this.createProvidedFilter(filterParams.wrappedFilter, params);
        this.appendChild(this.wrappedFloatingFilter.getGui());

        this.setFloatingFilter = this.userComponentFactory.createUserComponentFromConcreteClass(SetFloatingFilterComp, params);
        this.appendChild(this.setFloatingFilter);

        _.setDisplayed(this.setFloatingFilter.getGui(), false);
    }

    public onParentModelChanged(model: CombinedFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (event && event.afterFloatingFilter) { return; }

        const showSetFilter = model && !!model.setFilterModel;

        _.setDisplayed(this.wrappedFloatingFilter.getGui(), !showSetFilter);
        _.setDisplayed(this.setFloatingFilter.getGui(), showSetFilter);

        this.setFloatingFilter.onParentModelChanged(model == null ? null : model.setFilterModel);
        this.wrappedFloatingFilter.onParentModelChanged(model == null ? null : model.wrappedFilterModel, event);
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    private createProvidedFilter(filterDef: IFilterDef, params: IFloatingFilterParams): IFloatingFilterComp {
        const defaultComponentName =
            FloatingFilterWrapper.getDefaultFloatingFilterType(filterDef) || 'agTextColumnFloatingFilter';

        return this.userComponentFactory
            .newFloatingFilterComponent(filterDef, params, defaultComponentName)
            .resolveNow(null, c => c);
    }
}