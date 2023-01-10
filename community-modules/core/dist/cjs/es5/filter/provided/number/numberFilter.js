/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFilter = void 0;
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var simpleFilter_1 = require("../simpleFilter");
var scalarFilter_1 = require("../scalarFilter");
var generic_1 = require("../../../utils/generic");
var browser_1 = require("../../../utils/browser");
var NumberFilter = /** @class */ (function (_super) {
    __extends(NumberFilter, _super);
    function NumberFilter() {
        return _super.call(this, 'numberFilter') || this;
    }
    NumberFilter.prototype.mapValuesFromModel = function (filterModel) {
        var _a = filterModel || {}, filter = _a.filter, filterTo = _a.filterTo, type = _a.type;
        return [
            filter == null ? null : filter,
            filterTo == null ? null : filterTo,
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
        var allowedCharPattern = this.getAllowedCharPattern();
        if (allowedCharPattern) {
            var config = { allowedCharPattern: allowedCharPattern };
            this.resetTemplate({
                'eValue-index0-1': config,
                'eValue-index1-1': config,
                'eValue-index0-2': config,
                'eValue-index1-2': config,
            });
        }
        _super.prototype.setParams.call(this, params);
    };
    NumberFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFilter.prototype.createValueTemplate = function (position) {
        var pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        var allowedCharPattern = this.getAllowedCharPattern();
        var agElementTag = allowedCharPattern ? 'ag-input-text-field' : 'ag-input-number-field';
        return /* html */ "\n            <div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\" role=\"presentation\">\n                <" + agElementTag + " class=\"ag-filter-from ag-filter-filter\" ref=\"eValue-index0-" + pos + "\"></" + agElementTag + ">\n                <" + agElementTag + " class=\"ag-filter-to ag-filter-filter\" ref=\"eValue-index1-" + pos + "\"></" + agElementTag + ">\n            </div>";
    };
    NumberFilter.prototype.getValues = function (position) {
        var _this = this;
        var result = [];
        this.forEachInput(function (element, index, elPosition, numberOfInputs) {
            if (position === elPosition && index < numberOfInputs) {
                result.push(_this.stringToFloat(element.getValue()));
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
        var type = this.getConditionTypes()[position];
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
    NumberFilter.prototype.getInputs = function () {
        return [
            [this.eValueFrom1, this.eValueTo1],
            [this.eValueFrom2, this.eValueTo2],
        ];
    };
    NumberFilter.prototype.getAllowedCharPattern = function () {
        var allowedCharPattern = (this.numberFilterParams || {}).allowedCharPattern;
        if (allowedCharPattern) {
            return allowedCharPattern;
        }
        if (!browser_1.isBrowserChrome() && !browser_1.isBrowserEdge()) {
            // only Chrome and Edge support the HTML5 number field, so for other browsers we provide an equivalent
            // constraint instead
            return '\\d\\-\\.';
        }
        return null;
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
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index0-1')
    ], NumberFilter.prototype, "eValueFrom1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index1-1')
    ], NumberFilter.prototype, "eValueTo1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index0-2')
    ], NumberFilter.prototype, "eValueFrom2", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index1-2')
    ], NumberFilter.prototype, "eValueTo2", void 0);
    return NumberFilter;
}(scalarFilter_1.ScalarFilter));
exports.NumberFilter = NumberFilter;
