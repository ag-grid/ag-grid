import { SerializedFilter } from "../interfaces/iFilter";
import { QuerySelector } from "../widgets/componentAnnotations";
import { BaseFilter, Comparator, FilterConditionType, ScalarBaseFilter } from "./baseFilter";
import { INumberFilterParams } from "./textFilter";
import { _ } from "../utils";

export interface SerializedNumberFilter extends SerializedFilter {
    filter: number;
    filterTo: number;
    type: string;
}

export class NumberFilter extends ScalarBaseFilter<number, INumberFilterParams, SerializedNumberFilter> {

    public static LESS_THAN = 'lessThan';

    @QuerySelector('#filterText')
    private eFilterTextField: HTMLInputElement;
    @QuerySelector('#filterTextCondition')
    private eFilterTextConditionField: HTMLInputElement;

    @QuerySelector('#filterToText')
    private eFilterToTextField: HTMLInputElement;
    @QuerySelector('#filterToConditionText')
    private eFilterToConditionText: HTMLInputElement;

    @QuerySelector('#filterNumberToPanel')
    private eNumberToPanel: HTMLElement;
    @QuerySelector('#filterNumberToPanelCondition')
    private eNumberToConditionPanel: HTMLElement;

    filterNumber: any;
    filterNumberTo: any;

    filterNumberCondition: any;
    filterNumberConditionTo: any;

    modelFromFloatingFilter(from: string): SerializedNumberFilter {
        return {
            type: this.selectedFilter,
            filter: Number(from),
            filterTo: this.filterNumberTo,
            filterType: 'number'
        };
    }

    public getApplicableFilterTypes(): string[] {
        return [BaseFilter.EQUALS, BaseFilter.NOT_EQUAL, BaseFilter.LESS_THAN,
            BaseFilter.LESS_THAN_OR_EQUAL, BaseFilter.GREATER_THAN, BaseFilter.GREATER_THAN_OR_EQUAL, BaseFilter.IN_RANGE];
    }

    public bodyTemplate(type:FilterConditionType): string {
        const translate = this.translate.bind(this);
        const fieldId = type == FilterConditionType.MAIN ? "filterText" : "filterConditionText";
        const filterNumberToPanelId = type == FilterConditionType.MAIN ? "filterNumberToPanel" : "filterNumberToPanelCondition";
        const fieldToId = type == FilterConditionType.MAIN ? "filterToText" : "filterToConditionText";
        return `<div class="ag-filter-body">
            <div class="ag-input-text-wrapper">
                <input class="ag-filter-filter" id="${fieldId}" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
             <div class="ag-input-text-wrapper ag-filter-number-to" id="${filterNumberToPanelId}">
                <input class="ag-filter-filter" id="${fieldToId}" type="text" placeholder="${translate('filterOoo')}"/>
            </div>
        </div>`;
    }

    public initialiseFilterBodyUi(type:FilterConditionType) {
        super.initialiseFilterBodyUi(type);
        if (type === FilterConditionType.MAIN) {
            this.eFilterTextField = this.queryForHtmlInputElement("#filterText");
            this.addFilterChangedEventListeners(type, this.eFilterTextField, this.eFilterToTextField);
        } else {
            this.eFilterTextConditionField = this.queryForHtmlInputElement("#filterConditionText");
            this.addFilterChangedEventListeners(type, this.eFilterTextConditionField, this.eFilterToConditionText);

            this.setFilter(this.filterNumberCondition, FilterConditionType.CONDITION);
            this.setFilterTo(this.filterNumberConditionTo, FilterConditionType.CONDITION);
            this.setFilterType(this.selectedFilterCondition, FilterConditionType.CONDITION);
        }
    }

    private addFilterChangedEventListeners(type:FilterConditionType, filterElement: HTMLInputElement, filterToElement: HTMLInputElement) {
        const debounceMs = this.getDebounceMs(this.filterParams);
        const toDebounce: () => void = _.debounce(() => this.onTextFieldsChanged(type, filterElement, filterToElement), debounceMs);
        this.addDestroyableEventListener(filterElement, "input", toDebounce);
        this.addDestroyableEventListener(filterToElement, "input", toDebounce);
    }

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public comparator(): Comparator<number> {
        return (left: number, right: number): number => {
            if (left === right) { return 0; }
            if (left < right) { return 1; }
            if (left > right) { return -1; }
        };
    }

    private onTextFieldsChanged(type:FilterConditionType, filterElement: HTMLInputElement, filterToElement: HTMLInputElement) {
        const newFilter = this.stringToFloat(filterElement.value);
        const newFilterTo = this.stringToFloat(filterToElement.value);

        if (type === FilterConditionType.MAIN) {
            if (this.filterNumber !== newFilter || this.filterNumberTo !== newFilterTo) {
                this.filterNumber = newFilter;
                this.filterNumberTo = newFilterTo;
                this.onFilterChanged();
            }
        } else {
            if (this.filterNumberCondition !== newFilter || this.filterNumberConditionTo !== newFilterTo) {
                this.filterNumberCondition = newFilter;
                this.filterNumberConditionTo = newFilterTo;
                this.onFilterChanged();
            }
        }
    }

    public filterValues(type:FilterConditionType): number | number[] {
        if (type === FilterConditionType.MAIN) {
            return this.selectedFilter !== BaseFilter.IN_RANGE ?
                this.asNumber(this.filterNumber) :
                [this.asNumber(this.filterNumber), this.asNumber(this.filterNumberTo)];
        }

        return this.selectedFilterCondition !== BaseFilter.IN_RANGE ?
            this.asNumber(this.filterNumberCondition) :
            [this.asNumber(this.filterNumberCondition), this.asNumber(this.filterNumberConditionTo)];
    }

    private asNumber(value: any): number {
        return _.isNumeric(value) ? value : null;
    }

    private stringToFloat(value: string): number {
        let filterText = _.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        let newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        return newFilter;
    }

    public setFilter(filter: any, type:FilterConditionType) {
        filter = _.makeNull(filter);

        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        if (type === FilterConditionType.MAIN) {
            this.filterNumber = filter;

            if (!this.eFilterTextField) { return; }
            this.eFilterTextField.value = filter;
        } else {
            this.filterNumberCondition = filter;

            if (!this.eFilterTextConditionField) { return; }
            this.eFilterTextConditionField.value = filter;
        }
    }

    public setFilterTo(filter: any, type:FilterConditionType) {
        filter = _.makeNull(filter);

        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        if (type === FilterConditionType.MAIN) {
            this.filterNumberTo = filter;

            if (!this.eFilterToTextField) { return; }
            this.eFilterToTextField.value = filter;
        } else {
            this.filterNumberConditionTo = filter;

            if (!this.eFilterToConditionText) { return; }
            this.eFilterToConditionText.value = filter;
        }
    }

    public getFilter(type:FilterConditionType) {
        return type === FilterConditionType.MAIN ? this.filterNumber : this.filterNumberCondition;
    }

    public serialize(type:FilterConditionType): SerializedNumberFilter {
        const selectedFilter = type === FilterConditionType.MAIN ? this.selectedFilter : this.selectedFilterCondition;
        const filterNumber = type === FilterConditionType.MAIN ? this.filterNumber : this.filterNumberCondition;
        const filterNumberTo = type === FilterConditionType.MAIN ? this.filterNumberTo : this.filterNumberConditionTo;
        return {
            type: selectedFilter ? selectedFilter : this.defaultFilter,
            filter: filterNumber,
            filterTo: filterNumberTo,
            filterType: 'number'
        };
    }

    public parse(model: SerializedNumberFilter, type:FilterConditionType): void {
        this.setFilterType(model.type, type);
        this.setFilter(model.filter, type);
        this.setFilterTo(model.filterTo, type);
    }

    public refreshFilterBodyUi(type:FilterConditionType): void {
        const filterType = type === FilterConditionType.MAIN ? this.selectedFilter : this.selectedFilterCondition;

        // show / hide in-range filter
        const panel = type === FilterConditionType.MAIN ? this.eNumberToPanel : this.eNumberToConditionPanel;
        if (panel) {
            const visible = filterType === NumberFilter.IN_RANGE;
            _.setVisible(panel, visible);
        }

        // show / hide filter input, i.e. if custom filter has 'hideFilterInputField = true' or an empty filter
        const filterInput = type === FilterConditionType.MAIN ? this.eFilterTextField : this.eFilterTextConditionField;
        if (filterInput) {
            const showFilterInput = !this.doesFilterHaveHiddenInput(filterType) && filterType !== BaseFilter.EMPTY;
            _.setVisible(filterInput, showFilterInput);
        }
    }

    public resetState(resetConditionFilterOnly: boolean = false): void {
        if (!resetConditionFilterOnly) {
            this.setFilterType(this.defaultFilter, FilterConditionType.MAIN);
            this.setFilter(null, FilterConditionType.MAIN);
            this.setFilterTo(null, FilterConditionType.MAIN);
        }

        this.setFilterType(this.defaultFilter, FilterConditionType.CONDITION);
        this.setFilter(null, FilterConditionType.CONDITION);
        this.setFilterTo(null, FilterConditionType.CONDITION);
    }

    public setType(filterType: string, type:FilterConditionType): void {
        this.setFilterType(filterType, type);
    }
}