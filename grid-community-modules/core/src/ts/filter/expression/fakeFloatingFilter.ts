import { IFloatingFilterComp, IFloatingFilterParams, IFloatingFilterParent } from '../floating/floatingFilter';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { IFilter } from '../../interfaces/iFilter';
import { AgAutocomplete } from './agAutocomplete';

export class FakeFloatingFilter extends Component implements IFloatingFilterComp<IFilter & IFloatingFilterParent> {
    @RefSelector('eAutocomplete') private eAutocomplete: AgAutocomplete;

    constructor() {
        super(/* html */`
        <div class="ag-floating-filter-input" role="presentation">
            <ag-autocomplete ref="eAutocomplete"></ag-autocomplete>
        </div>`);
    }

    public destroy(): void {
        super.destroy();
    }

    public init(params: IFloatingFilterParams): void {
        
    }

    public onParentModelChanged(parentModel: any): void {
    }
}
