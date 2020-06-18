/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { ScalarFilter } from '../scalarFilter';
import { makeNull } from '../../../utils/generic';
import { setDisplayed } from '../../../utils/dom';
var NumberFilter = /** @class */ (function (_super) {
    __extends(NumberFilter, _super);
    function NumberFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFilter.prototype.mapRangeFromModel = function (filterModel) {
        return {
            from: filterModel.filter,
            to: filterModel.filterTo
        };
    };
    NumberFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    NumberFilter.prototype.resetUiToDefaults = function (silent) {
        var _this = this;
        return _super.prototype.resetUiToDefaults.call(this, silent).then(function () {
            var fields = [_this.eValueFrom1, _this.eValueFrom2, _this.eValueTo1, _this.eValueTo2];
            fields.forEach(function (field) { return field.setValue(null, silent); });
            _this.resetPlaceholder();
        });
    };
    NumberFilter.prototype.setConditionIntoUi = function (model, position) {
        var positionOne = position === ConditionPosition.One;
        var eValueFrom = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        eValueFrom.setValue(model ? ('' + model.filter) : null);
        eValueTo.setValue(model ? ('' + model.filterTo) : null);
    };
    NumberFilter.prototype.setValueFromFloatingFilter = function (value) {
        this.eValueFrom1.setValue(value);
        this.eValueFrom2.setValue(null);
        this.eValueTo1.setValue(null);
        this.eValueTo2.setValue(null);
    };
    NumberFilter.prototype.comparator = function () {
        return function (left, right) {
            if (left === right) {
                return 0;
            }
            if (left < right) {
                return 1;
            }
            return -1;
        };
    };
    NumberFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.addValueChangedListeners();
    };
    NumberFilter.prototype.addValueChangedListeners = function () {
        var _this = this;
        var listener = function () { return _this.onUiChanged(); };
        this.eValueFrom1.onValueChange(listener);
        this.eValueFrom2.onValueChange(listener);
        this.eValueTo1.onValueChange(listener);
        this.eValueTo2.onValueChange(listener);
    };
    NumberFilter.prototype.resetPlaceholder = function () {
        var isRange1 = this.getCondition1Type() === ScalarFilter.IN_RANGE;
        var isRange2 = this.getCondition2Type() === ScalarFilter.IN_RANGE;
        this.eValueFrom1.setInputPlaceholder(this.translate(isRange1 ? 'inRangeStart' : 'filterOoo'));
        this.eValueTo1.setInputPlaceholder(this.translate(isRange1 ? 'inRangeEnd' : 'filterOoo'));
        this.eValueFrom2.setInputPlaceholder(this.translate(isRange2 ? 'inRangeStart' : 'filterOoo'));
        this.eValueTo2.setInputPlaceholder(this.translate(isRange2 ? 'inRangeEnd' : 'filterOoo'));
    };
    NumberFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.resetPlaceholder();
        this.eValueFrom1.getInputElement().focus();
    };
    NumberFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFilter.prototype.createValueTemplate = function (position) {
        var positionOne = position === ConditionPosition.One;
        var pos = positionOne ? '1' : '2';
        return "<div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\" role=\"presentation\">\n                    <ag-input-number-field class=\"ag-filter-from ag-filter-filter\" ref=\"eValueFrom" + pos + "\"></ag-input-number-field>\n                    <ag-input-number-field class=\"ag-filter-to ag-filter-filter\" ref=\"eValueTo" + pos + "\"></ag-input-number-field>\n                </div>";
    };
    NumberFilter.prototype.isConditionUiComplete = function (position) {
        var positionOne = position === ConditionPosition.One;
        var option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        var value = this.stringToFloat(eValue.getValue());
        var valueTo = this.stringToFloat(eValueTo.getValue());
        if (option === SimpleFilter.EMPTY) {
            return false;
        }
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        if (option === SimpleFilter.IN_RANGE) {
            return value != null && valueTo != null;
        }
        return value != null;
    };
    NumberFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    };
    // needed for creating filter model
    NumberFilter.prototype.getFilterType = function () {
        return NumberFilter.FILTER_TYPE;
    };
    NumberFilter.prototype.stringToFloat = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        var filterText = makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilter;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        }
        else {
            newFilter = null;
        }
        return newFilter;
    };
    NumberFilter.prototype.createCondition = function (position) {
        var positionOne = position === ConditionPosition.One;
        var type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var value = this.stringToFloat(eValue.getValue());
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        var valueTo = this.stringToFloat(eValueTo.getValue());
        var model = {
            filterType: NumberFilter.FILTER_TYPE,
            type: type
        };
        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
            model.filterTo = valueTo; // FIX - should only populate this when filter choice has 'to' option
        }
        return model;
    };
    NumberFilter.prototype.updateUiVisibility = function () {
        _super.prototype.updateUiVisibility.call(this);
        this.resetPlaceholder();
        var showFrom1 = this.showValueFrom(this.getCondition1Type());
        setDisplayed(this.eValueFrom1.getGui(), showFrom1);
        var showTo1 = this.showValueTo(this.getCondition1Type());
        setDisplayed(this.eValueTo1.getGui(), showTo1);
        var showFrom2 = this.showValueFrom(this.getCondition2Type());
        setDisplayed(this.eValueFrom2.getGui(), showFrom2);
        var showTo2 = this.showValueTo(this.getCondition2Type());
        setDisplayed(this.eValueTo2.getGui(), showTo2);
    };
    NumberFilter.FILTER_TYPE = 'number';
    NumberFilter.DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.LESS_THAN,
        ScalarFilter.LESS_THAN_OR_EQUAL,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.GREATER_THAN_OR_EQUAL,
        ScalarFilter.IN_RANGE
    ];
    __decorate([
        RefSelector('eValueFrom1')
    ], NumberFilter.prototype, "eValueFrom1", void 0);
    __decorate([
        RefSelector('eValueFrom2')
    ], NumberFilter.prototype, "eValueFrom2", void 0);
    __decorate([
        RefSelector('eValueTo1')
    ], NumberFilter.prototype, "eValueTo1", void 0);
    __decorate([
        RefSelector('eValueTo2')
    ], NumberFilter.prototype, "eValueTo2", void 0);
    return NumberFilter;
}(ScalarFilter));
export { NumberFilter };
