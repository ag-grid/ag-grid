/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { RefSelector } from '../../../widgets/componentAnnotations';
import { SimpleFilter, ConditionPosition } from '../simpleFilter';
import { makeNull } from '../../../utils/generic';
import { _ } from '../../../utils';
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
        this.comparator = this.textFilterParams.textCustomComparator || TextFilter.DEFAULT_COMPARATOR;
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);
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
    TextFilter.prototype.createValueTemplate = function (position) {
        var pos = position === ConditionPosition.One ? '1' : '2';
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
        return filterType === SimpleFilter.NOT_EQUAL || filterType === SimpleFilter.NOT_CONTAINS;
    };
    TextFilter.prototype.evaluateNonNullValue = function (values, cellValue, filterModel) {
        var _this = this;
        var formattedValues = _.map(values, function (v) { return _this.formatter(v); }) || [];
        var cellValueFormatted = this.formatter(cellValue);
        return _.some(formattedValues, function (v) { return _this.comparator(filterModel.type, cellValueFormatted, v); });
    };
    TextFilter.DEFAULT_FILTER_OPTIONS = [
        SimpleFilter.CONTAINS,
        SimpleFilter.NOT_CONTAINS,
        SimpleFilter.EQUALS,
        SimpleFilter.NOT_EQUAL,
        SimpleFilter.STARTS_WITH,
        SimpleFilter.ENDS_WITH
    ];
    TextFilter.DEFAULT_FORMATTER = function (from) { return from; };
    TextFilter.DEFAULT_LOWERCASE_FORMATTER = function (from) { return from == null ? null : from.toString().toLowerCase(); };
    TextFilter.DEFAULT_COMPARATOR = function (filter, value, filterText) {
        switch (filter) {
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
        RefSelector('eValue-index0-1')
    ], TextFilter.prototype, "eValueFrom1", void 0);
    __decorate([
        RefSelector('eValue-index1-1')
    ], TextFilter.prototype, "eValueTo1", void 0);
    __decorate([
        RefSelector('eValue-index0-2')
    ], TextFilter.prototype, "eValueFrom2", void 0);
    __decorate([
        RefSelector('eValue-index1-2')
    ], TextFilter.prototype, "eValueTo2", void 0);
    return TextFilter;
}(SimpleFilter));
export { TextFilter };
