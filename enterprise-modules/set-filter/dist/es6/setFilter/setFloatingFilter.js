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
import { Autowired, Component, RefSelector, _ } from '@ag-grid-community/core';
import { SetValueModel } from './setValueModel';
var SetFloatingFilterComp = /** @class */ (function (_super) {
    __extends(SetFloatingFilterComp, _super);
    function SetFloatingFilterComp() {
        var _this = _super.call(this, /* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eFloatingFilterText\"></ag-input-text-field>\n            </div>") || this;
        _this.availableValuesListenerAdded = false;
        return _this;
    }
    SetFloatingFilterComp.prototype.init = function (params) {
        this.eFloatingFilterText.setDisabled(true);
        this.params = params;
    };
    // unlike other filters, what we show in the floating filter can be different, even
    // if another filter changes. this is due to how set filter restricts its values based
    // on selections in other filters, e.g. if you filter Language to English, then the set filter
    // on Country will only show English speaking countries. Thus the list of items to show
    // in the floating filter can change.
    SetFloatingFilterComp.prototype.onAvailableValuesChanged = function (filterChangedEvent) {
        this.updateSetFilterText();
    };
    SetFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.lastKnownModel = parentModel;
        this.updateSetFilterText();
    };
    SetFloatingFilterComp.prototype.addAvailableValuesListener = function () {
        var _this = this;
        this.params.parentFilterInstance(function (setFilter) {
            var setValueModel = setFilter.getValueModel();
            _this.addDestroyableEventListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, _this.onAvailableValuesChanged.bind(_this));
        });
        this.availableValuesListenerAdded = true;
    };
    SetFloatingFilterComp.prototype.updateSetFilterText = function () {
        var _this = this;
        if (!this.lastKnownModel) {
            this.eFloatingFilterText.setValue('');
            return;
        }
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }
        // also supporting old filter model for backwards compatibility
        var values = this.lastKnownModel instanceof Array ? this.lastKnownModel : this.lastKnownModel.values;
        if (!values || values.length === 0) {
            this.eFloatingFilterText.setValue('');
            return;
        }
        this.params.parentFilterInstance(function (setFilter) {
            var valueModel = setFilter.getValueModel();
            var availableValues = _.filter(values, function (v) { return valueModel.isValueAvailable(v); });
            // format all the values, if a formatter is provided
            var formattedValues = _.map(availableValues, function (value) {
                var formattedValue = _this.valueFormatterService.formatValue(_this.params.column, null, null, value);
                return formattedValue != null ? formattedValue : value;
            });
            var arrayToDisplay = formattedValues.length > 10 ? formattedValues.slice(0, 10).concat('...') : formattedValues;
            var valuesString = "(" + formattedValues.length + ") " + arrayToDisplay.join(',');
            _this.eFloatingFilterText.setValue(valuesString);
        });
    };
    __decorate([
        RefSelector('eFloatingFilterText')
    ], SetFloatingFilterComp.prototype, "eFloatingFilterText", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], SetFloatingFilterComp.prototype, "valueFormatterService", void 0);
    return SetFloatingFilterComp;
}(Component));
export { SetFloatingFilterComp };
