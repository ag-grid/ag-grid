import {Utils as _} from "../utils";
import {IFilterParams, IDoesFilterPassParams, SerializedFilter} from "../interfaces/iFilter";
import {ComparableBaseFilter, BaseFilter} from "./baseFilter";
import {QuerySelector} from "../widgets/componentAnnotations";

export interface SerializedTextFilter extends SerializedFilter {
    filter:string
    type:string
}

export class TextFilter extends ComparableBaseFilter <string, IFilterParams, SerializedTextFilter> {
    @QuerySelector('#filterText')
    private eFilterTextField: HTMLInputElement;
    private filterText: string;

    modelFromFloatingFilter(from: string): SerializedTextFilter {
        return {
            type: this.filter,
            filter: from,
            filterType: 'text'
        };
    }

    public getApplicableFilterTypes ():string[]{
        return [BaseFilter.EQUALS, BaseFilter.NOT_EQUAL, BaseFilter.STARTS_WITH, BaseFilter.ENDS_WITH,
            BaseFilter.CONTAINS, BaseFilter.NOT_CONTAINS];
    }

    public bodyTemplate(): string {
        let translate = this.translate.bind(this);
        return `<div class="ag-filter-body">
            <input class="ag-filter-filter" id="filterText" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
        </div>`;
    }

    public initialiseFilterBodyUi() {
        this.addDestroyableEventListener(this.eFilterTextField, 'input', this.onFilterTextFieldChanged.bind(this));
        this.setType(BaseFilter.CONTAINS);
    }

    public refreshFilterBodyUi() {}

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public filterValues ():string {
        return this.filterText;
    }

    public doesFilterPass(params: IDoesFilterPassParams) {
        if (!this.filterText) {
            return true;
        }
        var value = this.filterParams.valueGetter(params.node);
        if (!value) {
            if (this.filter === BaseFilter.NOT_EQUAL) {
                // if there is no value, but the filter type was 'not equals',
                // then it should pass, as a missing value is not equal whatever
                // the user is filtering on
                return true;
            } else {
                // otherwise it's some type of comparison, to which empty value
                // will always fail
                return false;
            }
        }
        var filterTextLoweCase = this.filterText.toLowerCase();
        var valueLowerCase = value.toString().toLowerCase();
        switch (this.filter) {
            case TextFilter.CONTAINS:
                return valueLowerCase.indexOf(filterTextLoweCase) >= 0;
            case TextFilter.NOT_CONTAINS:
                return valueLowerCase.indexOf(filterTextLoweCase) === -1;
            case TextFilter.EQUALS:
                return valueLowerCase === filterTextLoweCase;
            case TextFilter.NOT_EQUAL:
                return valueLowerCase != filterTextLoweCase;
            case TextFilter.STARTS_WITH:
                return valueLowerCase.indexOf(filterTextLoweCase) === 0;
            case TextFilter.ENDS_WITH:
                var index = valueLowerCase.lastIndexOf(filterTextLoweCase);
                return index >= 0 && index === (valueLowerCase.length - filterTextLoweCase.length);
            default:
                // should never happen
                console.warn('invalid filter type ' + this.filter);
                return false;
        }
    }

    private onFilterTextFieldChanged() {
        var filterText = _.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }

        if (this.filterText !== filterText) {
            let newLowerCase = filterText ? filterText.toLowerCase() : null;
            let previousLowerCase = this.filterText ? this.filterText.toLowerCase() : null;
            this.filterText = filterText;
            if (previousLowerCase !== newLowerCase) {
                this.onFilterChanged();
            }
        }
    }

    public setFilter(filter: string): void {
        filter = _.makeNull(filter);

        if (filter) {
            this.filterText = filter;
            this.eFilterTextField.value = filter;
        } else {
            this.filterText = null;
            this.eFilterTextField.value = null;
        }
    }

    public getFilter(): string {
        return this.filterText;
    }

    public resetState(): void{
        this.setFilter(null);
        this.setFilterType(BaseFilter.CONTAINS);
    }

    public serialize(): SerializedTextFilter{
        return {
            type: this.filter,
            filter: this.filterText,
            filterType: 'text'
        }
    }

    public parse(model:SerializedTextFilter): void{
        this.setFilterType(model.type);
        this.setFilter(model.filter);
    }

    public setType (filterType:string):void{
        this.setFilterType(filterType);
    }

}
