import {
    Component,
    FilterChangedEvent,
    _,
    IFloatingFilterComp,
    TextFloatingFilter,
    IFloatingFilterParams,
    ProvidedFilterModel,
} from '@ag-grid-community/core';
import { SetFloatingFilterComp } from '../setFilter/setFloatingFilter';
import { SetFilterModel } from '../setFilter/setFilterModel';

export class CombinedFloatingFilterComp extends Component implements IFloatingFilterComp {
    private providedFilter: TextFloatingFilter;
    private setFilter: SetFloatingFilterComp;

    constructor() {
        super('<div class="ag-floating-filter-input"></div>');
    }

    public init(params: IFloatingFilterParams): void {
        this.providedFilter = this.createManagedBean(new TextFloatingFilter());
        this.providedFilter.init(params);

        this.setFilter = this.createManagedBean(new SetFloatingFilterComp());
        this.setFilter.init(params);

        this.appendChild(this.providedFilter);
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
}