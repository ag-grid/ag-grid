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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFilter = void 0;
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var simpleFilter_1 = require("../simpleFilter");
var generic_1 = require("../../../utils/generic");
var utils_1 = require("../../../utils");
var TextFilter = /** @class */ (function (_super) {
    __extends(TextFilter, _super);
    function TextFilter() {
        return _super.call(this, 'textFilter') || this;
    }
    TextFilter.trimInput = function (value) {
        var trimmedInput = value && value.trim();
        // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
        return trimmedInput === '' ? value : trimmedInput;
    };
    TextFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    TextFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.textFilterParams = params;
        this.matcher = this.getTextMatcher();
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);
    };
    TextFilter.prototype.getTextMatcher = function () {
        var legacyComparator = this.textFilterParams.textCustomComparator;
        if (legacyComparator) {
            utils_1._.doOnce(function () { return console.warn('AG Grid - textCustomComparator is deprecated, use textMatcher instead.'); }, 'textCustomComparator.deprecated');
            return function (_a) {
                var filterOption = _a.filterOption, value = _a.value, filterText = _a.filterText;
                return legacyComparator(filterOption, value, filterText);
            };
        }
        return this.textFilterParams.textMatcher || TextFilter.DEFAULT_MATCHER;
    };
    TextFilter.prototype.createCondition = function (position) {
        var type = this.getConditionTypes()[position];
        var model = {
            filterType: this.getFilterType(),
            type: type,
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
    TextFilter.prototype.getFilterType = function () {
        return 'text';
    };
    TextFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.filter === bSimple.filter &&
            aSimple.filterTo === bSimple.filterTo &&
            aSimple.type === bSimple.type;
    };
    TextFilter.prototype.getInputs = function () {
        return [
            [this.eValueFrom1, this.eValueTo1],
            [this.eValueFrom2, this.eValueTo2],
        ];
    };
    TextFilter.prototype.getValues = function (position) {
        var _this = this;
        var result = [];
        this.forEachInput(function (element, index, elPosition, numberOfInputs) {
            if (position === elPosition && index < numberOfInputs) {
                var value = generic_1.makeNull(element.getValue());
                var cleanValue = (_this.textFilterParams.trimInput ? TextFilter.trimInput(value) : value) || null;
                result.push(cleanValue);
                element.setValue(cleanValue, true); // ensure clean value is visible
            }
        });
        return result;
    };
    TextFilter.prototype.getDefaultFilterOptions = function () {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    };
    TextFilter.prototype.createValueTemplate = function (position) {
        var pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        return /* html */ "\n            <div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\" role=\"presentation\">\n                <ag-input-text-field class=\".ag-filter-from ag-filter-filter\" ref=\"eValue-index0-" + pos + "\"></ag-input-text-field>\n                <ag-input-text-field class=\"ag-filter-to ag-filter-filter\" ref=\"eValue-index1-" + pos + "\"></ag-input-text-field>\n            </div>";
    };
    TextFilter.prototype.mapValuesFromModel = function (filterModel) {
        var _a = filterModel || {}, filter = _a.filter, filterTo = _a.filterTo, type = _a.type;
        return [
            filter || null,
            filterTo || null,
        ].slice(0, this.getNumberOfInputs(type));
    };
    TextFilter.prototype.evaluateNullValue = function (filterType) {
        var filterTypesAllowNulls = [
            simpleFilter_1.SimpleFilter.NOT_EQUAL, simpleFilter_1.SimpleFilter.NOT_CONTAINS, simpleFilter_1.SimpleFilter.BLANK,
        ];
        return filterType ? filterTypesAllowNulls.indexOf(filterType) >= 0 : false;
    };
    TextFilter.prototype.evaluateNonNullValue = function (values, cellValue, filterModel, params) {
        var _this = this;
        var formattedValues = values.map(function (v) { return _this.formatter(v); }) || [];
        var cellValueFormatted = this.formatter(cellValue);
        var _a = this.textFilterParams, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context, textFormatter = _a.textFormatter;
        if (filterModel.type === simpleFilter_1.SimpleFilter.BLANK) {
            return this.isBlank(cellValue);
        }
        else if (filterModel.type === simpleFilter_1.SimpleFilter.NOT_BLANK) {
            return !this.isBlank(cellValue);
        }
        var matcherParams = {
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            node: params.node,
            data: params.data,
            filterOption: filterModel.type,
            value: cellValueFormatted,
            textFormatter: textFormatter,
        };
        return formattedValues.some(function (v) { return _this.matcher(__assign(__assign({}, matcherParams), { filterText: v })); });
    };
    TextFilter.DEFAULT_FILTER_OPTIONS = [
        simpleFilter_1.SimpleFilter.CONTAINS,
        simpleFilter_1.SimpleFilter.NOT_CONTAINS,
        simpleFilter_1.SimpleFilter.EQUALS,
        simpleFilter_1.SimpleFilter.NOT_EQUAL,
        simpleFilter_1.SimpleFilter.STARTS_WITH,
        simpleFilter_1.SimpleFilter.ENDS_WITH,
        simpleFilter_1.SimpleFilter.BLANK,
        simpleFilter_1.SimpleFilter.NOT_BLANK,
    ];
    TextFilter.DEFAULT_FORMATTER = function (from) { return from; };
    TextFilter.DEFAULT_LOWERCASE_FORMATTER = function (from) { return from == null ? null : from.toString().toLowerCase(); };
    TextFilter.DEFAULT_MATCHER = function (_a) {
        var filterOption = _a.filterOption, value = _a.value, filterText = _a.filterText;
        if (filterText == null) {
            return false;
        }
        switch (filterOption) {
            case TextFilter.CONTAINS:
                return value.indexOf(filterText) >= 0;
            case TextFilter.NOT_CONTAINS:
                return value.indexOf(filterText) < 0;
            case TextFilter.EQUALS:
                return value === filterText;
            case TextFilter.NOT_EQUAL:
                return value != filterText;
            case TextFilter.STARTS_WITH:
                return value.indexOf(filterText) === 0;
            case TextFilter.ENDS_WITH:
                var index = value.lastIndexOf(filterText);
                return index >= 0 && index === (value.length - filterText.length);
            default:
                return false;
        }
    };
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index0-1')
    ], TextFilter.prototype, "eValueFrom1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index1-1')
    ], TextFilter.prototype, "eValueTo1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index0-2')
    ], TextFilter.prototype, "eValueFrom2", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue-index1-2')
    ], TextFilter.prototype, "eValueTo2", void 0);
    return TextFilter;
}(simpleFilter_1.SimpleFilter));
exports.TextFilter = TextFilter;
