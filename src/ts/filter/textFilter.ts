import {Utils as _} from "../utils";
import {IFilterParams, IDoesFilterPassParams, SerializedFilter} from "../interfaces/iFilter";
import {ComparableBaseFilter, BaseFilter, IScalarFilterParams} from "./baseFilter";
import {QuerySelector} from "../widgets/componentAnnotations";

export interface SerializedTextFilter extends SerializedFilter {
    filter:string
    type:string
}

export interface TextComparator {
    (filter:string, gridValue:any, filterText:string):boolean;
}

export interface TextFormatter {
    (from:string):string;
}

export interface INumberFilterParams extends IScalarFilterParams{
    debounceMs?: number;
}

export interface ITextFilterParams extends IFilterParams{
    textCustomComparator?:TextComparator;
    debounceMs?: number;
    caseSensitive?: boolean;
}

export class TextFilter extends ComparableBaseFilter <string, ITextFilterParams, SerializedTextFilter> {
    @QuerySelector('#filterText')
    private eFilterTextField: HTMLInputElement;

    private filterText: string;
    private comparator:TextComparator;
    private formatter:TextFormatter;
    static DEFAULT_FORMATTER:TextFormatter = (from:string)=>{
        return from;
    };
    static DEFAULT_LOWERCASE_FORMATTER:TextFormatter = (from:string)=>{
        if (from == null) return null;
        return from.toString().toLowerCase();
    };
    static DEFAULT_COMPARATOR:TextComparator = (filter:string, value:any, filterText:string)=>{
        switch (filter) {
        case TextFilter.CONTAINS:
            return value.indexOf(filterText) >= 0;
        case TextFilter.NOT_CONTAINS:
            return value.indexOf(filterText) === -1;
        case TextFilter.EQUALS:
            return value === filterText;
        case TextFilter.NOT_EQUAL:
            return value != filterText;
        case TextFilter.STARTS_WITH:
            return value.indexOf(filterText) === 0;
        case TextFilter.ENDS_WITH:
            let index = value.lastIndexOf(filterText);
            return index >= 0 && index === (value.length - filterText.length);
        default:
            // should never happen
            console.warn('invalid filter type ' + filter);
            return false;
        }
    };

    public getDefaultType(): string {
        return BaseFilter.CONTAINS;
    }


    public customInit(): void {
        this.comparator = this.filterParams.textCustomComparator ? this.filterParams.textCustomComparator : TextFilter.DEFAULT_COMPARATOR;
        this.formatter =
            this.filterParams.textFormatter ? this.filterParams.textFormatter :
            this.filterParams.caseSensitive == true ? TextFilter.DEFAULT_FORMATTER :
                TextFilter.DEFAULT_LOWERCASE_FORMATTER;
        super.customInit();
    }

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
        super.initialiseFilterBodyUi();
        let debounceMs = this.getDebounceMs(this.filterParams);
        let toDebounce:()=>void = _.debounce(this.onFilterTextFieldChanged.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eFilterTextField, 'input', toDebounce);
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
        let value = this.filterParams.valueGetter(params.node);
        if (!value) {
            if (this.filter === BaseFilter.NOT_EQUAL || this.filter === BaseFilter.NOT_CONTAINS) {
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
        let valueFormatted:string = this.formatter(value);
        return this.comparator (this.filter, valueFormatted, this.filterText);
    }

    private onFilterTextFieldChanged() {
        let filterText = _.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }

        if (this.filterText !== filterText) {
            let newLowerCase =
                filterText && this.filterParams.caseSensitive != true ? filterText.toLowerCase() :
                filterText;
            let previousLowerCase = this.filterText && this.filterParams.caseSensitive != true  ? this.filterText.toLowerCase() :
                this.filterText;

            this.filterText = this.formatter(filterText);
            if (previousLowerCase !== newLowerCase) {
                this.onFilterChanged();
            }
        }
    }

    public setFilter(filter: string): void {
        filter = _.makeNull(filter);

        if (filter) {
            this.filterText = this.formatter(filter);
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
        this.setFilterType(this.defaultFilter);
    }

    public serialize(): SerializedTextFilter{
        return {
            type: this.filter ? this.filter : this.defaultFilter,
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
