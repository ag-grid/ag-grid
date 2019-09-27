/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var utils_1 = require("../../../utils");
var simpleFilter_1 = require("../simpleFilter");
var scalerFilter_1 = require("../scalerFilter");
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
    NumberFilter.prototype.resetUiToDefaults = function () {
        _super.prototype.resetUiToDefaults.call(this);
        this.eValueFrom1.value = null;
        this.eValueFrom2.value = null;
        this.eValueTo1.value = null;
        this.eValueTo2.value = null;
    };
    NumberFilter.prototype.setConditionIntoUi = function (model, position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var eValueFrom = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        eValueFrom.value = model ? ('' + model.filter) : null;
        eValueTo.value = model ? ('' + model.filterTo) : null;
    };
    NumberFilter.prototype.setValueFromFloatingFilter = function (value) {
        this.eValueFrom1.value = value;
        this.eValueFrom2.value = null;
        this.eValueTo1.value = null;
        this.eValueTo2.value = null;
    };
    NumberFilter.prototype.comparator = function () {
        return function (left, right) {
            if (left === right) {
                return 0;
            }
            if (left < right) {
                return 1;
            }
            if (left > right) {
                return -1;
            }
        };
    };
    NumberFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.addValueChangedListeners();
    };
    NumberFilter.prototype.addValueChangedListeners = function () {
        var _this = this;
        var listener = function () { return _this.onUiChanged(); };
        this.addDestroyableEventListener(this.eValueFrom1, 'input', listener);
        this.addDestroyableEventListener(this.eValueFrom2, 'input', listener);
        this.addDestroyableEventListener(this.eValueTo1, 'input', listener);
        this.addDestroyableEventListener(this.eValueTo2, 'input', listener);
    };
    NumberFilter.prototype.afterGuiAttached = function () {
        this.eValueFrom1.focus();
    };
    NumberFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFilter.prototype.createValueTemplate = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var pos = positionOne ? '1' : '2';
        var translate = this.translate.bind(this);
        return "<div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\" role=\"presentation\">\n            <div class=\"ag-input-wrapper\" role=\"presentation\">\n                <input class=\"ag-filter-filter\" ref=\"eValueFrom" + pos + "\" type=\"text\" placeholder=\"" + translate('filterOoo') + "\"/>\n            </div>\n             <div class=\"ag-input-wrapper ag-filter-number-to\" ref=\"ePanel" + pos + "\" role=\"presentation\">\n                <input class=\"ag-filter-filter\" ref=\"eValueTo" + pos + "\" type=\"text\" placeholder=\"" + translate('filterOoo') + "\"/>\n            </div>\n        </div>";
    };
    NumberFilter.prototype.isConditionUiComplete = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        var value = this.stringToFloat(eValue.value);
        var valueTo = this.stringToFloat(eValueTo.value);
        if (option === simpleFilter_1.SimpleFilter.EMPTY) {
            return false;
        }
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        if (option === simpleFilter_1.SimpleFilter.IN_RANGE) {
            return value != null && valueTo != null;
        }
        else {
            return value != null;
        }
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
        var filterText = utils_1._.makeNull(value);
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
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var value = this.stringToFloat(eValue.value);
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        var valueTo = this.stringToFloat(eValueTo.value);
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
        var showFrom1 = this.showValueFrom(this.getCondition1Type());
        utils_1._.setDisplayed(this.eValueFrom1, showFrom1);
        var showTo1 = this.showValueTo(this.getCondition1Type());
        utils_1._.setDisplayed(this.eValueTo1, showTo1);
        var showFrom2 = this.showValueFrom(this.getCondition2Type());
        utils_1._.setDisplayed(this.eValueFrom2, showFrom2);
        var showTo2 = this.showValueTo(this.getCondition2Type());
        utils_1._.setDisplayed(this.eValueTo2, showTo2);
    };
    NumberFilter.FILTER_TYPE = 'number';
    NumberFilter.DEFAULT_FILTER_OPTIONS = [scalerFilter_1.ScalerFilter.EQUALS, scalerFilter_1.ScalerFilter.NOT_EQUAL,
        scalerFilter_1.ScalerFilter.LESS_THAN, scalerFilter_1.ScalerFilter.LESS_THAN_OR_EQUAL,
        scalerFilter_1.ScalerFilter.GREATER_THAN, scalerFilter_1.ScalerFilter.GREATER_THAN_OR_EQUAL,
        scalerFilter_1.ScalerFilter.IN_RANGE];
    __decorate([
        componentAnnotations_1.RefSelector('eValueFrom1'),
        __metadata("design:type", HTMLInputElement)
    ], NumberFilter.prototype, "eValueFrom1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValueFrom2'),
        __metadata("design:type", HTMLInputElement)
    ], NumberFilter.prototype, "eValueFrom2", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValueTo1'),
        __metadata("design:type", HTMLInputElement)
    ], NumberFilter.prototype, "eValueTo1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValueTo2'),
        __metadata("design:type", HTMLInputElement)
    ], NumberFilter.prototype, "eValueTo2", void 0);
    return NumberFilter;
}(scalerFilter_1.ScalerFilter));
exports.NumberFilter = NumberFilter;
