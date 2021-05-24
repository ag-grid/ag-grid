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
import { Component } from '../../../widgets/component';
import { SimpleFilter } from '../../provided/simpleFilter';
import { OptionsFactory } from '../../provided/optionsFactory';
var SimpleFloatingFilter = /** @class */ (function (_super) {
    __extends(SimpleFloatingFilter, _super);
    function SimpleFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleFloatingFilter.prototype.getDefaultDebounceMs = function () {
        return 0;
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    SimpleFloatingFilter.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    SimpleFloatingFilter.prototype.getTextFromModel = function (model) {
        if (!model) {
            return null;
        }
        var isCombined = model.operator;
        if (isCombined) {
            var combinedModel = model;
            var con1Str = this.conditionToString(combinedModel.condition1);
            var con2Str = this.conditionToString(combinedModel.condition2);
            return con1Str + " " + combinedModel.operator + " " + con2Str;
        }
        else {
            var condition = model;
            var customOption = this.optionsFactory.getCustomOption(condition.type);
            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            if (customOption && customOption.hideFilterInput) {
                this.gridOptionsWrapper.getLocaleTextFunc()(customOption.displayKey, customOption.displayName);
                return customOption.displayName;
            }
            return this.conditionToString(condition);
        }
    };
    SimpleFloatingFilter.prototype.isEventFromFloatingFilter = function (event) {
        return event && event.afterFloatingFilter;
    };
    SimpleFloatingFilter.prototype.getLastType = function () {
        return this.lastType;
    };
    SimpleFloatingFilter.prototype.setLastTypeFromModel = function (model) {
        // if no model provided by the parent filter use default
        if (!model) {
            this.lastType = this.optionsFactory.getDefaultOption();
            return;
        }
        var isCombined = model.operator;
        var condition;
        if (isCombined) {
            var combinedModel = model;
            condition = combinedModel.condition1;
        }
        else {
            condition = model;
        }
        this.lastType = condition.type;
    };
    SimpleFloatingFilter.prototype.canWeEditAfterModelFromParentFilter = function (model) {
        if (!model) {
            // if no model, then we can edit as long as the lastType is something we can edit, as this
            // is the type we will provide to the parent filter if the user decides to use the floating filter.
            return this.isTypeEditable(this.lastType);
        }
        // never allow editing if the filter is combined (ie has two parts)
        var isCombined = model.operator;
        if (isCombined) {
            return false;
        }
        var simpleModel = model;
        return this.isTypeEditable(simpleModel.type);
    };
    SimpleFloatingFilter.prototype.init = function (params) {
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params.filterParams, this.getDefaultFilterOptions());
        this.lastType = this.optionsFactory.getDefaultOption();
        // we are editable if:
        // 1) there is a type (user has configured filter wrong if not type)
        //  AND
        // 2) the default type is not 'in range'
        var editable = this.isTypeEditable(this.lastType);
        this.setEditable(editable);
    };
    SimpleFloatingFilter.prototype.doesFilterHaveHiddenInput = function (filterType) {
        var customFilterOption = this.optionsFactory.getCustomOption(filterType);
        return customFilterOption && customFilterOption.hideFilterInput;
    };
    SimpleFloatingFilter.prototype.isTypeEditable = function (type) {
        return !!type && !this.doesFilterHaveHiddenInput(type) &&
            type !== SimpleFilter.IN_RANGE
            && type !== SimpleFilter.EMPTY;
    };
    return SimpleFloatingFilter;
}(Component));
export { SimpleFloatingFilter };
