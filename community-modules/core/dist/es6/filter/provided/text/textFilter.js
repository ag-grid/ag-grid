/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { setDisplayed } from '../../../utils/dom';
import { forEach } from '../../../utils/array';
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
    TextFilter.prototype.getCleanValue = function (inputField) {
        var value = makeNull(inputField.getValue());
        return this.textFilterParams.trimInput ? TextFilter.trimInput(value) : value;
    };
    TextFilter.prototype.addValueChangedListeners = function () {
        var _this = this;
        var listener = function () { return _this.onUiChanged(); };
        this.eValue1.onValueChange(listener);
        this.eValue2.onValueChange(listener);
    };
    TextFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.textFilterParams = params;
        this.comparator = this.textFilterParams.textCustomComparator || TextFilter.DEFAULT_COMPARATOR;
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);
        this.addValueChangedListeners();
    };
    TextFilter.prototype.setConditionIntoUi = function (model, position) {
        var positionOne = position === ConditionPosition.One;
        var eValue = positionOne ? this.eValue1 : this.eValue2;
        eValue.setValue(model ? model.filter : null);
    };
    TextFilter.prototype.createCondition = function (position) {
        var positionOne = position === ConditionPosition.One;
        var type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var eValue = positionOne ? this.eValue1 : this.eValue2;
        var value = this.getCleanValue(eValue);
        eValue.setValue(value, true); // ensure clean value is visible
        var model = {
            filterType: this.getFilterType(),
            type: type
        };
        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
        }
        return model;
    };
    TextFilter.prototype.getFilterType = function () {
        return 'text';
    };
    TextFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.filter === bSimple.filter && aSimple.type === bSimple.type;
    };
    TextFilter.prototype.resetUiToDefaults = function (silent) {
        var _this = this;
        return _super.prototype.resetUiToDefaults.call(this, silent).then(function () {
            _this.forEachInput(function (field) { return field.setValue(null, silent); });
            _this.resetPlaceholder();
        });
    };
    TextFilter.prototype.resetPlaceholder = function () {
        var globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        var placeholder = this.translate('filterOoo');
        this.forEachInput(function (field) {
            field.setInputPlaceholder(placeholder);
            field.setInputAriaLabel(globalTranslate('ariaFilterValue', 'Filter Value'));
        });
    };
    TextFilter.prototype.forEachInput = function (action) {
        forEach([this.eValue1, this.eValue2], action);
    };
    TextFilter.prototype.setValueFromFloatingFilter = function (value) {
        this.eValue1.setValue(value);
        this.eValue2.setValue(null);
    };
    TextFilter.prototype.getDefaultFilterOptions = function () {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    };
    TextFilter.prototype.createValueTemplate = function (position) {
        var pos = position === ConditionPosition.One ? '1' : '2';
        return /* html */ "\n            <div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\" role=\"presentation\">\n                <ag-input-text-field class=\"ag-filter-filter\" ref=\"eValue" + pos + "\"></ag-input-text-field>\n            </div>";
    };
    TextFilter.prototype.updateUiVisibility = function () {
        _super.prototype.updateUiVisibility.call(this);
        setDisplayed(this.eCondition1Body, this.showValueFrom(this.getCondition1Type()));
        setDisplayed(this.eCondition2Body, this.isCondition2Enabled() && this.showValueFrom(this.getCondition2Type()));
    };
    TextFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.resetPlaceholder();
        if (!params || !params.suppressFocus) {
            this.eValue1.getInputElement().focus();
        }
    };
    TextFilter.prototype.isConditionUiComplete = function (position) {
        var positionOne = position === ConditionPosition.One;
        var option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        if (option === SimpleFilter.EMPTY) {
            return false;
        }
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        return this.getCleanValue(positionOne ? this.eValue1 : this.eValue2) != null;
    };
    TextFilter.prototype.individualConditionPasses = function (params, filterModel) {
        var filterText = filterModel.filter;
        var filterOption = filterModel.type;
        var cellValue = this.textFilterParams.valueGetter(params.node);
        var cellValueFormatted = this.formatter(cellValue);
        var customFilterOption = this.optionsFactory.getCustomOption(filterOption);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterText != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterText, cellValueFormatted);
            }
        }
        if (cellValue == null) {
            return filterOption === SimpleFilter.NOT_EQUAL || filterOption === SimpleFilter.NOT_CONTAINS;
        }
        var filterTextFormatted = this.formatter(filterText);
        return this.comparator(filterOption, cellValueFormatted, filterTextFormatted);
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
                // should never happen
                console.warn('AG Grid: Unexpected type of filter "' + filter + '", it looks like the filter was configured with incorrect Filter Options');
                return false;
        }
    };
    __decorate([
        RefSelector('eValue1')
    ], TextFilter.prototype, "eValue1", void 0);
    __decorate([
        RefSelector('eValue2')
    ], TextFilter.prototype, "eValue2", void 0);
    return TextFilter;
}(SimpleFilter));
export { TextFilter };
