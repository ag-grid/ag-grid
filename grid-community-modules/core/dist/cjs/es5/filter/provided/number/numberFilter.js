/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFilter = exports.getAllowedCharPattern = exports.NumberFilterModelFormatter = void 0;
var simpleFilter_1 = require("../simpleFilter");
var scalarFilter_1 = require("../scalarFilter");
var generic_1 = require("../../../utils/generic");
var agInputTextField_1 = require("../../../widgets/agInputTextField");
var browser_1 = require("../../../utils/browser");
var aria_1 = require("../../../utils/aria");
var agInputNumberField_1 = require("../../../widgets/agInputNumberField");
var NumberFilterModelFormatter = /** @class */ (function (_super) {
    __extends(NumberFilterModelFormatter, _super);
    function NumberFilterModelFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFilterModelFormatter.prototype.conditionToString = function (condition, options) {
        var numberOfInputs = (options || {}).numberOfInputs;
        var isRange = condition.type == simpleFilter_1.SimpleFilter.IN_RANGE || numberOfInputs === 2;
        if (isRange) {
            return condition.filter + "-" + condition.filterTo;
        }
        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return "" + condition.filter;
        }
        return "" + condition.type;
    };
    return NumberFilterModelFormatter;
}(simpleFilter_1.SimpleFilterModelFormatter));
exports.NumberFilterModelFormatter = NumberFilterModelFormatter;
function getAllowedCharPattern(filterParams) {
    var allowedCharPattern = (filterParams !== null && filterParams !== void 0 ? filterParams : {}).allowedCharPattern;
    if (allowedCharPattern) {
        return allowedCharPattern;
    }
    if (!browser_1.isBrowserChrome()) {
        // only Chrome and Edge (Chromium) have nice HTML5 number field handling, so for other browsers we provide an equivalent
        // constraint instead
        return '\\d\\-\\.';
    }
    return null;
}
exports.getAllowedCharPattern = getAllowedCharPattern;
var NumberFilter = /** @class */ (function (_super) {
    __extends(NumberFilter, _super);
    function NumberFilter() {
        var _this = _super.call(this, 'numberFilter') || this;
        _this.eValuesFrom = [];
        _this.eValuesTo = [];
        return _this;
    }
    NumberFilter.prototype.mapValuesFromModel = function (filterModel) {
        var _a = filterModel || {}, filter = _a.filter, filterTo = _a.filterTo, type = _a.type;
        return [
            this.processValue(filter),
            this.processValue(filterTo),
        ].slice(0, this.getNumberOfInputs(type));
    };
    NumberFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    NumberFilter.prototype.comparator = function () {
        return function (left, right) {
            if (left === right) {
                return 0;
            }
            return left < right ? 1 : -1;
        };
    };
    NumberFilter.prototype.setParams = function (params) {
        this.numberFilterParams = params;
        _super.prototype.setParams.call(this, params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    };
    NumberFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFilter.prototype.createValueElement = function () {
        var allowedCharPattern = getAllowedCharPattern(this.numberFilterParams);
        var eCondition = document.createElement('div');
        eCondition.classList.add('ag-filter-body');
        aria_1.setAriaRole(eCondition, 'presentation');
        this.createFromToElement(eCondition, this.eValuesFrom, 'from', allowedCharPattern);
        this.createFromToElement(eCondition, this.eValuesTo, 'to', allowedCharPattern);
        return eCondition;
    };
    NumberFilter.prototype.createFromToElement = function (eCondition, eValues, fromTo, allowedCharPattern) {
        var eValue = this.createManagedBean(allowedCharPattern ? new agInputTextField_1.AgInputTextField({ allowedCharPattern: allowedCharPattern }) : new agInputNumberField_1.AgInputNumberField());
        eValue.addCssClass("ag-filter-" + fromTo);
        eValue.addCssClass('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    };
    NumberFilter.prototype.removeValueElements = function (startPosition, deleteCount) {
        this.removeComponents(this.eValuesFrom, startPosition, deleteCount);
        this.removeComponents(this.eValuesTo, startPosition, deleteCount);
    };
    NumberFilter.prototype.getValues = function (position) {
        var _this = this;
        var result = [];
        this.forEachPositionInput(position, function (element, index, _elPosition, numberOfInputs) {
            if (index < numberOfInputs) {
                result.push(_this.processValue(_this.stringToFloat(element.getValue())));
            }
        });
        return result;
    };
    NumberFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    };
    NumberFilter.prototype.getFilterType = function () {
        return 'number';
    };
    NumberFilter.prototype.processValue = function (value) {
        if (value == null) {
            return null;
        }
        return isNaN(value) ? null : value;
    };
    NumberFilter.prototype.stringToFloat = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        var filterText = generic_1.makeNull(value);
        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }
        if (this.numberFilterParams.numberParser) {
            return this.numberFilterParams.numberParser(filterText);
        }
        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    };
    NumberFilter.prototype.createCondition = function (position) {
        var type = this.getConditionType(position);
        var model = {
            filterType: this.getFilterType(),
            type: type
        };
        var values = this.getValues(position);
        if (values.length > 0) {
            model.filter = values[0];
        }
        if (values.length > 1) {
            model.filterTo = values[1];
        }
        return model;
    };
    NumberFilter.prototype.getInputs = function (position) {
        if (position >= this.eValuesFrom.length) {
            return [null, null];
        }
        return [this.eValuesFrom[position], this.eValuesTo[position]];
    };
    NumberFilter.prototype.getModelAsString = function (model) {
        var _a;
        return (_a = this.filterModelFormatter.getModelAsString(model)) !== null && _a !== void 0 ? _a : '';
    };
    NumberFilter.DEFAULT_FILTER_OPTIONS = [
        scalarFilter_1.ScalarFilter.EQUALS,
        scalarFilter_1.ScalarFilter.NOT_EQUAL,
        scalarFilter_1.ScalarFilter.LESS_THAN,
        scalarFilter_1.ScalarFilter.LESS_THAN_OR_EQUAL,
        scalarFilter_1.ScalarFilter.GREATER_THAN,
        scalarFilter_1.ScalarFilter.GREATER_THAN_OR_EQUAL,
        scalarFilter_1.ScalarFilter.IN_RANGE,
        scalarFilter_1.ScalarFilter.BLANK,
        scalarFilter_1.ScalarFilter.NOT_BLANK,
    ];
    return NumberFilter;
}(scalarFilter_1.ScalarFilter));
exports.NumberFilter = NumberFilter;
