/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Common logic for options, used by both filters and floating filters. */
var OptionsFactory = /** @class */ (function () {
    function OptionsFactory() {
        this.customFilterOptions = {};
    }
    OptionsFactory.prototype.init = function (params, defaultOptions) {
        this.filterOptions = params.filterOptions ? params.filterOptions : defaultOptions;
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
            if (!filterOption.displayKey) {
                console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayKey'");
                return;
            }
            if (!filterOption.displayName) {
                console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayName'");
                return;
            }
            if (!filterOption.test) {
                console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'test'");
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
                console.warn("ag-Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'");
            }
        }
        else {
            console.warn('ag-Grid: no filter options for filter');
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
