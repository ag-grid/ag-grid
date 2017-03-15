import {Utils as _} from "../utils";
import {IFilterParams, SerializedFilter} from "../interfaces/iFilter";
import {QuerySelector} from "../widgets/componentAnnotations";
import {BaseFilter, Comparator, ScalarBaseFilter} from "./baseFilter";

export interface SerializedNumberFilter extends SerializedFilter {
    filter:number
    filterTo:number
    type:string
}

export class NumberFilter extends ScalarBaseFilter<number, IFilterParams, SerializedNumberFilter> {
    public static EQUALS = 'equals';// 1;

    public static NOT_EQUAL = 'notEqual';//2;
    public static LESS_THAN_OR_EQUAL = 'lessThanOrEqual';//4;
    public static GREATER_THAN = 'greaterThan';//5;
    public static GREATER_THAN_OR_EQUAL = 'greaterThan';//6;
    public static IN_RANGE = 'inRange';
    @QuerySelector('#filterNumberToPanel')
    private eNumberToPanel: HTMLElement;

    filterNumber: any;
    filterNumberTo: any;

    @QuerySelector('#filterToText')
    private eFilterToTextField: HTMLInputElement;

    private eFilterTextField: HTMLInputElement;
    public static LESS_THAN = 'lessThan';//3;

    modelFromFloatingFilter(from: string): SerializedNumberFilter {
        return {
            type: this.filter,
            filter: Number(from),
            filterTo: this.filterNumberTo,
            filterType: 'number'
        };
    }

    public getApplicableFilterTypes ():string[]{
        return [BaseFilter.EQUALS, BaseFilter.NOT_EQUAL, BaseFilter.LESS_THAN, BaseFilter.LESS_THAN_OR_EQUAL,
            BaseFilter.GREATER_THAN, BaseFilter.GREATER_THAN_OR_EQUAL, BaseFilter.IN_RANGE];
    }

    public bodyTemplate(): string {
        let translate = this.translate.bind(this);
        return `<div class="ag-filter-body">
            <div>
                <input class="ag-filter-filter" id="filterText" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
             <div class="ag-filter-number-to" id="filterNumberToPanel">
                <input class="ag-filter-filter" id="filterToText" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
        </div>`;
    }

    public initialiseFilterBodyUi() {
        this.filterNumber = null;
        this.setFilterType(NumberFilter.EQUALS);
        this.eFilterTextField = <HTMLInputElement> this.getGui().querySelector("#filterText");

        this.addDestroyableEventListener(this.eFilterTextField, "input", this.onTextFieldsChanged.bind(this));
        this.addDestroyableEventListener(this.eFilterToTextField, "input", this.onTextFieldsChanged.bind(this));
    }

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public comparator(): Comparator<number> {
        return (left:number, right:number):number=>{
            if (left === right) return 0;
            if (left < right) return 1;
            if (left > right) return -1;
        };
    }

    private onTextFieldsChanged() {
        let newFilter = this.stringToFloat(this.eFilterTextField.value);
        let newFilterTo = this.stringToFloat(this.eFilterToTextField.value);
        if (this.filterNumber !== newFilter || this.filterNumberTo !== newFilterTo) {
            this.filterNumber = newFilter;
            this.filterNumberTo = newFilterTo;
            this.onFilterChanged();
        }
    }

    public filterValues ():number|number[] {
        return this.filter !== BaseFilter.IN_RANGE ?
            this.asNumber(this.filterNumber):
            [this.asNumber(this.filterNumber), this.asNumber(this.filterNumberTo)];
    }

    private asNumber(value: any): number {
        return _.isNumeric(value) ? value : null;
    }


    private stringToFloat(value:string) :number{
        var filterText = _.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        return newFilter;
    }


    public setFilter(filter: any) {
        filter = _.makeNull(filter);

        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumber = filter;
        this.eFilterTextField.value = filter;
    }

    public setFilterTo(filter: any) {
        filter = _.makeNull(filter);

        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumberTo = filter;
        this.eFilterToTextField.value = filter;
    }

    public getFilter() {
        return this.filterNumber;
    }

    public serialize(): SerializedNumberFilter {
        return {
            type: this.filter,
            filter: this.filterNumber,
            filterTo: this.filterNumberTo,
            filterType: 'number'
        };
    }

    public parse(model: SerializedNumberFilter): void {
        this.setFilterType(model.type);
        this.setFilter(model.filter);
        this.setFilterTo(model.filterTo);
    }

    public refreshFilterBodyUi(): void {
        let visible = this.filter === NumberFilter.IN_RANGE;
        _.setVisible(this.eNumberToPanel, visible);
    }

    public resetState():void{
        this.setFilterType(BaseFilter.EQUALS);
        this.setFilter(null);
        this.setFilterTo(null);
    }

    public setType (filterType:string):void{
        this.setFilterType(filterType);
    }
}
