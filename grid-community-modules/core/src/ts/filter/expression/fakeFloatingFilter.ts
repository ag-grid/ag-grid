import { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParent } from '../floating/floatingFilter';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { IFilter } from '../../interfaces/iFilter';
import { AgAutocomplete } from './agAutocomplete';
import { Autowired } from '../../context/context';
import { FilterExpressionService } from './filterExpressionService';

export class FakeFloatingFilter extends Component implements IFloatingFilterComp<IFilter & IFloatingFilterParent> {
    @RefSelector('eFakeFloatingFilter') private eFakeFloatingFilter: HTMLElement;
    @Autowired('filterExpressionService') private filterExpressionService: FilterExpressionService;

    constructor() {
        super(/* html */`
        <div class="ag-floating-filter-input" role="presentation" ref="eFakeFloatingFilter">
        </div>`);
    }

    public destroy(): void {
        super.destroy();
    }

    public init(params: IFloatingFilterParams): void {
        const autocomplete = this.createManagedBean(new AgAutocomplete({
            listGenerator: (value, position) => {
                this.filterExpressionService.setExpression(value ?? null);
                return this.filterExpressionService.getAutocompleteListParams(position);
            }
        }));
        this.eFakeFloatingFilter.appendChild(autocomplete.getGui());
    }

    public onParentModelChanged(parentModel: any): void {
    }
}
