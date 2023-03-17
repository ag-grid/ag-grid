/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { SimpleFilter, SimpleFilterModelFormatter } from '../simpleFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { makeNull } from '../../../utils/generic';
import { _ } from '../../../utils';
import { setAriaRole } from '../../../utils/aria';
var TextFilterModelFormatter = /** @class */ (function (_super) {
    __extends(TextFilterModelFormatter, _super);
    function TextFilterModelFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextFilterModelFormatter.prototype.conditionToString = function (condition, options) {
        var numberOfInputs = (options || {}).numberOfInputs;
        var isRange = condition.type == SimpleFilter.IN_RANGE || numberOfInputs === 2;
        if (isRange) {
            return condition.filter + "-" + condition.filterTo;
        }
        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return "" + condition.filter;
        }
        return "" + condition.type;
    };
    return TextFilterModelFormatter;
}(SimpleFilterModelFormatter));
export { TextFilterModelFormatter };
var TextFilter = /** @class */ (function (_super) {
    __extends(TextFilter, _super);
    function TextFilter() {
        var _this = _super.call(this, 'textFilter') || this;
        _this.eValuesFrom = [];
        _this.eValuesTo = [];
        return _this;
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
        this.textFilterParams = params;
        _super.prototype.setParams.call(this, params);
        this.matcher = this.getTextMatcher();
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);
        this.filterModelFormatter = new TextFilterModelFormatter(this.localeService, this.optionsFactory);
    };
    TextFilter.prototype.getTextMatcher = function () {
        var legacyComparator = this.textFilterParams.textCustomComparator;
        if (legacyComparator) {
            _.doOnce(function () { return console.warn('AG Grid - textCustomComparator is deprecated, use textMatcher instead.'); }, 'textCustomComparator.deprecated');
            return function (_a) {
                var filterOption = _a.filterOption, value = _a.value, filterText = _a.filterText;
                return legacyComparator(filterOption, value, filterText);
            };
        }
        return this.textFilterParams.textMatcher || TextFilter.DEFAULT_MATCHER;
    };
    TextFilter.prototype.createCondition = function (position) {
        var type = this.getConditionType(position);
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
    TextFilter.prototype.getInputs = function (position) {
        if (position >= this.eValuesFrom.length) {
            return [null, null];
        }
        return [this.eValuesFrom[position], this.eValuesTo[position]];
    };
    TextFilter.prototype.getValues = function (position) {
        var _this = this;
        var result = [];
        this.forEachPositionInput(position, function (element, index, _elPosition, numberOfInputs) {
            if (index < numberOfInputs) {
                var value = makeNull(element.getValue());
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
    TextFilter.prototype.createValueElement = function () {
        var eCondition = document.createElement('div');
        eCondition.classList.add('ag-filter-body');
        setAriaRole(eCondition, 'presentation');
        this.createFromToElement(eCondition, this.eValuesFrom, 'from');
        this.createFromToElement(eCondition, this.eValuesTo, 'to');
        return eCondition;
    };
    TextFilter.prototype.createFromToElement = function (eCondition, eValues, fromTo) {
        var eValue = this.createManagedBean(new AgInputTextField());
        eValue.addCssClass("ag-filter-" + fromTo);
        eValue.addCssClass('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    };
    TextFilter.prototype.removeValueElements = function (startPosition, deleteCount) {
        this.removeComponents(this.eValuesFrom, startPosition, deleteCount);
        this.removeComponents(this.eValuesTo, startPosition, deleteCount);
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
            SimpleFilter.NOT_EQUAL, SimpleFilter.NOT_CONTAINS, SimpleFilter.BLANK,
        ];
        return filterType ? filterTypesAllowNulls.indexOf(filterType) >= 0 : false;
    };
    TextFilter.prototype.evaluateNonNullValue = function (values, cellValue, filterModel, params) {
        var _this = this;
        var formattedValues = values.map(function (v) { return _this.formatter(v); }) || [];
        var cellValueFormatted = this.formatter(cellValue);
        var _a = this.textFilterParams, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context, textFormatter = _a.textFormatter;
        if (filterModel.type === SimpleFilter.BLANK) {
            return this.isBlank(cellValue);
        }
        else if (filterModel.type === SimpleFilter.NOT_BLANK) {
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
    TextFilter.prototype.getModelAsString = function (model) {
        var _a;
        return (_a = this.filterModelFormatter.getModelAsString(model)) !== null && _a !== void 0 ? _a : '';
    };
    TextFilter.DEFAULT_FILTER_OPTIONS = [
        SimpleFilter.CONTAINS,
        SimpleFilter.NOT_CONTAINS,
        SimpleFilter.EQUALS,
        SimpleFilter.NOT_EQUAL,
        SimpleFilter.STARTS_WITH,
        SimpleFilter.ENDS_WITH,
        SimpleFilter.BLANK,
        SimpleFilter.NOT_BLANK,
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
    return TextFilter;
}(SimpleFilter));
export { TextFilter };
