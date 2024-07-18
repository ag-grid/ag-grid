import type { AgSelectParams, BeanCollection } from '@ag-grid-community/core';
import { AgSelectSelector, Component, _removeFromParent } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from './filterPanelTranslationService';
import type { FilterState } from './filterState';
import { SetFilter } from './setFilter/setFilter';
import { SimpleFilter } from './simpleFilter/simpleFilter';

export class FilterDetailComp extends Component<'simpleFilterChanged' | 'setFilterChanged' | 'filterTypeChanged'> {
    private translationService: FilterPanelTranslationService;

    private eSimpleFilter?: SimpleFilter;
    private eSetFilter?: SetFilter;

    constructor(private state: FilterState) {
        super();
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const eFilterTypeParams: AgSelectParams<'set' | 'simple'> = {
            options: (['set', 'simple'] as const).map((value) => ({
                value,
                text: this.translationService.translate(`${value}FilterType`),
            })),
            value: this.state.type,
            onValueChange: (filterType) => this.dispatchLocalEvent({ type: 'filterTypeChanged', filterType }),
        };
        this.setTemplate(
            /* html */ `<div class="ag-filter">
                <ag-select class="ag-filter-type-select" data-ref="eFilterType"></ag-select>
            </div>`,
            [AgSelectSelector],
            { eFilterType: eFilterTypeParams }
        );
        this.refreshComp(undefined, this.state);
    }

    public refresh(state: FilterState): void {
        const oldState = this.state;
        this.state = state;
        this.refreshComp(oldState, state);
    }

    private refreshComp(oldState: FilterState | undefined, newState: FilterState): void {
        const { type, filterParams } = newState;
        if (type === oldState?.type) {
            if (type === 'simple') {
                this.eSimpleFilter?.refresh(filterParams);
            } else {
                this.eSetFilter?.refresh(filterParams);
            }
            return;
        }
        let filter: SimpleFilter | SetFilter;
        if (type === 'simple') {
            this.destroySetFilter();
            filter = this.createBean(new SimpleFilter(filterParams));
            filter.addManagedListeners(filter, {
                filterChanged: ({ simpleFilterParams }) =>
                    this.dispatchLocalEvent({
                        type: 'simpleFilterChanged',
                        simpleFilterParams,
                    }),
            });
            this.eSimpleFilter = filter;
        } else {
            this.destroySimpleFilter();
            filter = this.createBean(new SetFilter(filterParams));
            filter.addManagedListeners(filter, {
                filterChanged: ({ setFilterParams }) =>
                    this.dispatchLocalEvent({
                        type: 'setFilterChanged',
                        setFilterParams,
                    }),
            });
            this.eSetFilter = filter;
        }
        this.appendChild(filter.getGui());
    }

    private destroySimpleFilter(): void {
        this.eSimpleFilter = this.destroyFilter(this.eSimpleFilter);
    }

    private destroySetFilter(): void {
        this.eSimpleFilter = this.destroyFilter(this.eSetFilter);
    }

    private destroyFilter(comp?: Component<any>): undefined {
        if (!comp) {
            return;
        }
        _removeFromParent(comp.getGui());
        return this.destroyBean(comp);
    }

    public override destroy(): void {
        this.destroySimpleFilter();
        this.destroySetFilter();
        super.destroy();
    }
}
