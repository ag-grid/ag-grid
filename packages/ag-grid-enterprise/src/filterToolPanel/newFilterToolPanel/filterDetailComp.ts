import type {
    AgComponentSelectorType,
    AgSelectParams,
    ElementParams,
    FilterPanelDetailState,
    GridSelect,
    SelectableFilterDef,
} from 'ag-grid-community';
import { AgSelectSelector, Component, RefPlaceholder, _removeFromParent } from 'ag-grid-community';

const FilterDetailElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-card-body',
    children: [{ tag: 'ag-select', cls: 'ag-filter-type-select', ref: 'eFilterType' }],
};

export class FilterDetailComp extends Component<'filterTypeChanged'> {
    private eFilterType: GridSelect<SelectableFilterDef> = RefPlaceholder;
    private state?: FilterPanelDetailState;

    public postConstruct(): void {
        const eFilterTypeParams: AgSelectParams<AgComponentSelectorType> = {
            onValueChange: (filterDef) => this.dispatchLocalEvent({ type: 'filterTypeChanged', filterDef }),
        };
        this.setTemplate(FilterDetailElement, [AgSelectSelector], { eFilterType: eFilterTypeParams });
        this.eFilterType.setDisplayed(false);
    }

    public refresh(newState: FilterPanelDetailState): void {
        const oldState = this.state;
        this.state = newState;

        const {
            activeFilterDef: newActiveFilterDef,
            filterDefs: newFilterDefs,
            detail: newDetail,
            afterGuiAttached,
            afterGuiDetached,
        } = newState;
        const { activeFilterDef: oldActiveFilterDef, filterDefs: oldFilterDefs, detail: oldDetail } = oldState ?? {};

        const eFilterType = this.eFilterType;
        if (newFilterDefs !== oldFilterDefs) {
            eFilterType.clearOptions();
            const options = newFilterDefs?.map((filterDef) => ({ value: filterDef, text: filterDef.name }));
            if (options) {
                eFilterType.clearOptions().addOptions(options).setValue(newActiveFilterDef, true);
            }
            eFilterType.setDisplayed(!!options);
        } else if (newActiveFilterDef !== oldActiveFilterDef) {
            eFilterType.setValue(newActiveFilterDef, true);
        }
        if (newDetail !== oldDetail) {
            if (oldDetail) {
                _removeFromParent(oldDetail);
                afterGuiDetached();
            }
            this.appendChild(newDetail);
            afterGuiAttached({
                container: 'newFiltersToolPanel',
                suppressFocus: true,
            });
        }
    }
}
