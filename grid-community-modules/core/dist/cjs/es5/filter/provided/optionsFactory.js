"use strict";
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
                    console.warn("AG Grid: ignoring FilterOptionDef as it doesn't contain one of '".concat(keys, "'"));
                    return false;
                }
                return true;
            };
            if (!requiredProperties.every(propertyCheck)) {
                _this.filterOptions = _this.filterOptions.filter(function (v) { return v === filterOption; }) || [];
                return;
            }
            _this.customFilterOptions[filterOption.displayKey] = filterOption;
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
