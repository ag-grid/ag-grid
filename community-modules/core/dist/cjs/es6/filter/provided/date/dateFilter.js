/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const context_1 = require("../../../context/context");
const dateCompWrapper_1 = require("./dateCompWrapper");
const simpleFilter_1 = require("../simpleFilter");
const scalarFilter_1 = require("../scalarFilter");
const date_1 = require("../../../utils/date");
const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;
class DateFilter extends scalarFilter_1.ScalarFilter {
    constructor() {
        super('dateFilter');
        this.minValidYear = DEFAULT_MIN_YEAR;
        this.maxValidYear = DEFAULT_MAX_YEAR;
    }
    afterGuiAttached(params) {
        super.afterGuiAttached(params);
        this.dateCondition1FromComp.afterGuiAttached(params);
    }
    mapValuesFromModel(filterModel) {
        // unlike the other filters, we do two things here:
        // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
        //    are in different locations in Date and Number filter models)
        // 2) convert the type (because Date filter uses Dates, however model is 'string')
        //
        // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
        //       a date from the UI, it will have timezone info in it. This is lost when creating
        //       the model. When we recreate the date again here, it's without a timezone.
        const { dateFrom, dateTo, type } = filterModel || {};
        return [
            dateFrom && date_1.parseDateTimeFromString(dateFrom) || null,
            dateTo && date_1.parseDateTimeFromString(dateTo) || null,
        ].slice(0, this.getNumberOfInputs(type));
    }
    comparator() {
        return this.dateFilterParams.comparator ? this.dateFilterParams.comparator : this.defaultComparator.bind(this);
    }
    defaultComparator(filterDate, cellValue) {
        // The default comparator assumes that the cellValue is a date
        const cellAsDate = cellValue;
        if (cellValue == null || cellAsDate < filterDate) {
            return -1;
        }
        if (cellAsDate > filterDate) {
            return 1;
        }
        return 0;
    }
    setParams(params) {
        super.setParams(params);
        this.dateFilterParams = params;
        const yearParser = (param, fallback) => {
            if (params[param] != null) {
                if (!isNaN(params[param])) {
                    return params[param] == null ? fallback : Number(params[param]);
                }
                else {
                    console.warn(`AG Grid: DateFilter ${param} is not a number`);
                }
            }
            return fallback;
        };
        this.minValidYear = yearParser('minValidYear', DEFAULT_MIN_YEAR);
        this.maxValidYear = yearParser('maxValidYear', DEFAULT_MAX_YEAR);
        if (this.minValidYear > this.maxValidYear) {
            console.warn(`AG Grid: DateFilter minValidYear should be <= maxValidYear`);
        }
        this.createDateComponents();
    }
    createDateComponents() {
        const createDateCompWrapper = (element) => new dateCompWrapper_1.DateCompWrapper(this.getContext(), this.userComponentFactory, {
            onDateChanged: () => this.onUiChanged(),
            filterParams: this.dateFilterParams
        }, element);
        this.dateCondition1FromComp = createDateCompWrapper(this.eCondition1PanelFrom);
        this.dateCondition1ToComp = createDateCompWrapper(this.eCondition1PanelTo);
        this.dateCondition2FromComp = createDateCompWrapper(this.eCondition2PanelFrom);
        this.dateCondition2ToComp = createDateCompWrapper(this.eCondition2PanelTo);
        this.addDestroyFunc(() => {
            this.forEachInput((element) => element.destroy());
        });
    }
    setElementValue(element, value, silent) {
        element.setDate(value);
    }
    setElementDisplayed(element, displayed) {
        element.setDisplayed(displayed);
    }
    setElementDisabled(element, disabled) {
        element.setDisabled(disabled);
    }
    getDefaultFilterOptions() {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }
    createValueTemplate(position) {
        const pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        return /* html */ `
            <div class="ag-filter-body" ref="eCondition${pos}Body">
                <div class="ag-filter-from ag-filter-date-from" ref="eCondition${pos}PanelFrom"></div>
                <div class="ag-filter-to ag-filter-date-to" ref="eCondition${pos}PanelTo"></div>
            </div>`;
    }
    isConditionUiComplete(position) {
        if (!super.isConditionUiComplete(position)) {
            return false;
        }
        const isValidDate = (value) => value != null
            && value.getUTCFullYear() >= this.minValidYear
            && value.getUTCFullYear() <= this.maxValidYear;
        let valid = true;
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (elPosition !== position || !valid || index >= numberOfInputs) {
                return;
            }
            valid = valid && isValidDate(element.getDate());
        });
        return valid;
    }
    areSimpleModelsEqual(aSimple, bSimple) {
        return aSimple.dateFrom === bSimple.dateFrom
            && aSimple.dateTo === bSimple.dateTo
            && aSimple.type === bSimple.type;
    }
    getFilterType() {
        return 'date';
    }
    createCondition(position) {
        const type = this.getConditionTypes()[position];
        const model = {};
        const values = this.getValues(position);
        if (values.length > 0) {
            model.dateFrom = date_1.serialiseDate(values[0]);
        }
        if (values.length > 1) {
            model.dateTo = date_1.serialiseDate(values[1]);
        }
        return Object.assign({ dateFrom: null, dateTo: null, filterType: this.getFilterType(), type }, model);
    }
    resetPlaceholder() {
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');
        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    }
    getInputs() {
        return [
            [this.dateCondition1FromComp, this.dateCondition1ToComp],
            [this.dateCondition2FromComp, this.dateCondition2ToComp],
        ];
    }
    getValues(position) {
        const result = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                result.push(element.getDate());
            }
        });
        return result;
    }
}
DateFilter.DEFAULT_FILTER_OPTIONS = [
    scalarFilter_1.ScalarFilter.EQUALS,
    scalarFilter_1.ScalarFilter.GREATER_THAN,
    scalarFilter_1.ScalarFilter.LESS_THAN,
    scalarFilter_1.ScalarFilter.NOT_EQUAL,
    scalarFilter_1.ScalarFilter.IN_RANGE,
    scalarFilter_1.ScalarFilter.BLANK,
    scalarFilter_1.ScalarFilter.NOT_BLANK,
];
__decorate([
    componentAnnotations_1.RefSelector('eCondition1PanelFrom')
], DateFilter.prototype, "eCondition1PanelFrom", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eCondition1PanelTo')
], DateFilter.prototype, "eCondition1PanelTo", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eCondition2PanelFrom')
], DateFilter.prototype, "eCondition2PanelFrom", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eCondition2PanelTo')
], DateFilter.prototype, "eCondition2PanelTo", void 0);
__decorate([
    context_1.Autowired('userComponentFactory')
], DateFilter.prototype, "userComponentFactory", void 0);
exports.DateFilter = DateFilter;
