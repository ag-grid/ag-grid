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
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    SetFloatingFilterComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    SetFloatingFilterComp.prototype.init = function (params) {
        var displayName = this.columnController.getDisplayNameForColumn(params.column, 'header', true);
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(displayName + " Filter Input");
        this.params = params;
    };
    SetFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.lastKnownModel = parentModel;
        this.updateSetFilterText();
    };
    SetFloatingFilterComp.prototype.addAvailableValuesListener = function () {
        var _this = this;
        this.params.parentFilterInstance(function (setFilter) {
            var setValueModel = setFilter.getValueModel();
            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            _this.addManagedListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, function () { return _this.updateSetFilterText(); });
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
        if (!values) {
            this.eFloatingFilterText.setValue('');
            return;
        }
        this.params.parentFilterInstance(function (setFilter) {
            var valueModel = setFilter.getValueModel();
            var availableValues = _.filter(values, function (v) { return valueModel.isValueAvailable(v); });
            var localeTextFunc = _this.gridOptionsWrapper.getLocaleTextFunc();
            // format all the values, if a formatter is provided
            var formattedValues = _.map(availableValues, function (value) {
                var formattedValue = _this.valueFormatterService.formatValue(_this.params.column, null, null, value);
                var valueToRender = formattedValue != null ? formattedValue : value;
                return valueToRender == null ? "(" + localeTextFunc('blanks', 'Blanks') + ")" : valueToRender;
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
    __decorate([
        Autowired('gridOptionsWrapper')
    ], SetFloatingFilterComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], SetFloatingFilterComp.prototype, "columnController", void 0);
    return SetFloatingFilterComp;
}(Component));
export { SetFloatingFilterComp };
