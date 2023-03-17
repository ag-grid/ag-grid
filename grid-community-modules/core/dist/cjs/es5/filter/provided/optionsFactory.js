/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsFactory = void 0;
/* Common logic for options, used by both filters and floating filters. */
var OptionsFactory = /** @class */ (function () {
    function OptionsFactory() {
        this.customFilterOptions = {};
    }
    OptionsFactory.prototype.init = function (params, defaultOptions) {
        this.filterOptions = params.filterOptions || defaultOptions;
        this.mapCustomOptions();
        this.selectDefaultItem(params);
        this.checkForDeprecatedParams();
    };
    OptionsFactory.prototype.checkForDeprecatedParams = function () {
        if (this.filterOptions.some(function (opt) { return typeof opt != 'string' && opt.test != null; })) {
            console.warn("AG Grid: [IFilterOptionDef] since v26.2.0, test() has been replaced with predicate().");
        }
        if (this.filterOptions.some(function (opt) { return typeof opt != 'string' && opt.hideFilterInput != null; })) {
            console.warn("AG Grid: [IFilterOptionDef] since v26.2.0, useOfHideFilterInput has been replaced with numberOfInputs.");
        }
    };
    OptionsFactory.prototype.getFilterOptions = function () {
        return this.filterOptions;
    };
    OptionsFactory.prototype.mapCustomOptions = function () {
        var _this = this;
        if (!this.filterOptions) {
            return;
        }
        this.filterOptions.forEach(function (filterOption) {
            if (typeof filterOption === 'string') {
                return;
            }
            var requiredProperties = [['displayKey'], ['displayName'], ['predicate', 'test']];
            var propertyCheck = function (keys) {
                if (!keys.some(function (key) { return filterOption[key] != null; })) {
                    console.warn("AG Grid: ignoring FilterOptionDef as it doesn't contain one of '" + keys + "'");
                    return false;
                }
                return true;
            };
            if (!requiredProperties.every(propertyCheck)) {
                _this.filterOptions = _this.filterOptions.filter(function (v) { return v === filterOption; }) || [];
                return;
            }
            var test = filterOption.test;
            var mutatedFilterOptions = __assign({}, filterOption);
            if (test != null && filterOption.predicate == null) {
                mutatedFilterOptions.predicate = function (v, cv) { return test(v[0], cv); };
                delete mutatedFilterOptions.test;
            }
            if (mutatedFilterOptions.hideFilterInput && mutatedFilterOptions.numberOfInputs == null) {
                mutatedFilterOptions.numberOfInputs = 0;
                delete mutatedFilterOptions.hideFilterInput;
            }
            _this.customFilterOptions[filterOption.displayKey] = mutatedFilterOptions;
        });
    };
    OptionsFactory.prototype.selectDefaultItem = function (params) {
        if (params.defaultOption) {
            this.defaultOption = params.defaultOption;
        }
        else if (this.filterOptions.length >= 1) {
            var firstFilterOption = this.filterOptions[0];
            if (typeof firstFilterOption === 'string') {
                this.defaultOption = firstFilterOption;
            }
            else if (firstFilterOption.displayKey) {
                this.defaultOption = firstFilterOption.displayKey;
            }
            else {
                console.warn("AG Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'");
            }
        }
        else {
            console.warn('AG Grid: no filter options for filter');
        }
    };
    OptionsFactory.prototype.getDefaultOption = function () {
        return this.defaultOption;
    };
    OptionsFactory.prototype.getCustomOption = function (name) {
        return this.customFilterOptions[name];
    };
    return OptionsFactory;
}());
exports.OptionsFactory = OptionsFactory;
