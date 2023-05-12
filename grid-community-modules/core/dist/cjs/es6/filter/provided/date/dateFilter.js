/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
exports.DateFilter = exports.DateFilterModelFormatter = void 0;
const context_1 = require("../../../context/context");
const dateCompWrapper_1 = require("./dateCompWrapper");
const simpleFilter_1 = require("../simpleFilter");
const scalarFilter_1 = require("../scalarFilter");
const date_1 = require("../../../utils/date");
const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;
class DateFilterModelFormatter extends simpleFilter_1.SimpleFilterModelFormatter {
    constructor(dateFilterParams, localeService, optionsFactory) {
        super(localeService, optionsFactory);
        this.dateFilterParams = dateFilterParams;
    }
    conditionToString(condition, options) {
        const { type } = condition;
        const { numberOfInputs } = options || {};
        const isRange = type == simpleFilter_1.SimpleFilter.IN_RANGE || numberOfInputs === 2;
        const dateFrom = date_1.parseDateTimeFromString(condition.dateFrom);
        const dateTo = date_1.parseDateTimeFromString(condition.dateTo);
        const format = this.dateFilterParams.inRangeFloatingFilterDateFormat;
        if (isRange) {
            const formattedFrom = dateFrom !== null ? date_1.dateToFormattedString(dateFrom, format) : 'null';
            const formattedTo = dateTo !== null ? date_1.dateToFormattedString(dateTo, format) : 'null';
            return `${formattedFrom}-${formattedTo}`;
        }
        if (dateFrom != null) {
            return date_1.dateToFormattedString(dateFrom, format);
        }
        // cater for when the type doesn't need a value
        return `${type}`;
    }
}
exports.DateFilterModelFormatter = DateFilterModelFormatter;
class DateFilter extends scalarFilter_1.ScalarFilter {
    constructor() {
        super('dateFilter');
        this.eConditionPanelsFrom = [];
        this.eConditionPanelsTo = [];
        this.dateConditionFromComps = [];
        this.dateConditionToComps = [];
        this.minValidYear = DEFAULT_MIN_YEAR;
        this.maxValidYear = DEFAULT_MAX_YEAR;
    }
    afterGuiAttached(params) {
        super.afterGuiAttached(params);
        this.dateConditionFromComps[0].afterGuiAttached(params);
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
        this.dateFilterParams = params;
        super.setParams(params);
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
        this.filterModelFormatter = new DateFilterModelFormatter(this.dateFilterParams, this.localeService, this.optionsFactory);
    }
    createDateCompWrapper(element) {
        const dateCompWrapper = new dateCompWrapper_1.DateCompWrapper(this.getContext(), this.userComponentFactory, {
            onDateChanged: () => this.onUiChanged(),
            filterParams: this.dateFilterParams
        }, element);
        this.addDestroyFunc(() => dateCompWrapper.destroy());
        return dateCompWrapper;
    }
    setElementValue(element, value) {
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
    createValueElement() {
        const eCondition = document.createElement('div');
        eCondition.classList.add('ag-filter-body');
        this.createFromToElement(eCondition, this.eConditionPanelsFrom, this.dateConditionFromComps, 'from');
        this.createFromToElement(eCondition, this.eConditionPanelsTo, this.dateConditionToComps, 'to');
        return eCondition;
    }
    createFromToElement(eCondition, eConditionPanels, dateConditionComps, fromTo) {
        const eConditionPanel = document.createElement('div');
        eConditionPanel.classList.add(`ag-filter-${fromTo}`);
        eConditionPanel.classList.add(`ag-filter-date-${fromTo}`);
        eConditionPanels.push(eConditionPanel);
        eCondition.appendChild(eConditionPanel);
        dateConditionComps.push(this.createDateCompWrapper(eConditionPanel));
    }
    removeValueElements(startPosition, deleteCount) {
        this.removeDateComps(this.dateConditionFromComps, startPosition, deleteCount);
        this.removeDateComps(this.dateConditionToComps, startPosition, deleteCount);
        this.removeItems(this.eConditionPanelsFrom, startPosition, deleteCount);
        this.removeItems(this.eConditionPanelsTo, startPosition, deleteCount);
    }
    removeDateComps(components, startPosition, deleteCount) {
        const removedComponents = this.removeItems(components, startPosition, deleteCount);
        removedComponents.forEach(comp => comp.destroy());
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
        const type = this.getConditionType(position);
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
        const globalTranslate = this.localeService.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');
        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    }
    getInputs(position) {
        if (position >= this.dateConditionFromComps.length) {
            return [null, null];
        }
        return [this.dateConditionFromComps[position], this.dateConditionToComps[position]];
    }
    getValues(position) {
        const result = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(element.getDate());
            }
        });
        return result;
    }
    getModelAsString(model) {
        var _a;
        return (_a = this.filterModelFormatter.getModelAsString(model)) !== null && _a !== void 0 ? _a : '';
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
    context_1.Autowired('userComponentFactory')
], DateFilter.prototype, "userComponentFactory", void 0);
exports.DateFilter = DateFilter;
