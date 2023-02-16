/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
    SimpleFloatingFilter.prototype.isEventFromFloatingFilter = function (event) {
        return event && event.afterFloatingFilter;
    };
    SimpleFloatingFilter.prototype.isEventFromDataChange = function (event) {
        return event === null || event === void 0 ? void 0 : event.afterDataChange;
    };
    SimpleFloatingFilter.prototype.getLastType = function () {
        return this.lastType;
    };
    SimpleFloatingFilter.prototype.isReadOnly = function () {
        return this.readOnly;
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
        // readOnly is a property of ProvidedFilterParams - we need to find a better (type-safe)
        // way to support reading this in the future.
        this.readOnly = !!params.filterParams.readOnly;
        // we are editable if:
        // 1) there is a type (user has configured filter wrong if not type)
        //  AND
        // 2) the default type is not 'in range'
        var editable = this.isTypeEditable(this.lastType);
        this.setEditable(editable);
    };
    SimpleFloatingFilter.prototype.doesFilterHaveSingleInput = function (filterType) {
        var customFilterOption = this.optionsFactory.getCustomOption(filterType);
        var numberOfInputs = (customFilterOption || {}).numberOfInputs;
        return numberOfInputs == null || numberOfInputs == 1;
    };
    SimpleFloatingFilter.prototype.isTypeEditable = function (type) {
        var uneditableTypes = [
            SimpleFilter.IN_RANGE, SimpleFilter.EMPTY, SimpleFilter.BLANK, SimpleFilter.NOT_BLANK,
        ];
        return !!type &&
            !this.isReadOnly() &&
            this.doesFilterHaveSingleInput(type) &&
            uneditableTypes.indexOf(type) < 0;
    };
    return SimpleFloatingFilter;
}(Component));
export { SimpleFloatingFilter };
