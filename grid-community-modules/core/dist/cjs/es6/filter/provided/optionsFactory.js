"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsFactory = void 0;
/* Common logic for options, used by both filters and floating filters. */
class OptionsFactory {
    constructor() {
        this.customFilterOptions = {};
    }
    init(params, defaultOptions) {
        this.filterOptions = params.filterOptions || defaultOptions;
        this.mapCustomOptions();
        this.selectDefaultItem(params);
    }
    getFilterOptions() {
        return this.filterOptions;
    }
    mapCustomOptions() {
        if (!this.filterOptions) {
            return;
        }
        this.filterOptions.forEach(filterOption => {
            if (typeof filterOption === 'string') {
                return;
            }
            const requiredProperties = [['displayKey'], ['displayName'], ['predicate', 'test']];
            const propertyCheck = (keys) => {
                if (!keys.some(key => filterOption[key] != null)) {
                    console.warn(`AG Grid: ignoring FilterOptionDef as it doesn't contain one of '${keys}'`);
                    return false;
                }
                return true;
            };
            if (!requiredProperties.every(propertyCheck)) {
                this.filterOptions = this.filterOptions.filter(v => v === filterOption) || [];
                return;
            }
            this.customFilterOptions[filterOption.displayKey] = filterOption;
        });
    }
    selectDefaultItem(params) {
        if (params.defaultOption) {
            this.defaultOption = params.defaultOption;
        }
        else if (this.filterOptions.length >= 1) {
            const firstFilterOption = this.filterOptions[0];
            if (typeof firstFilterOption === 'string') {
                this.defaultOption = firstFilterOption;
            }
            else if (firstFilterOption.displayKey) {
                this.defaultOption = firstFilterOption.displayKey;
            }
            else {
                console.warn(`AG Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'`);
            }
        }
        else {
            console.warn('AG Grid: no filter options for filter');
        }
    }
    getDefaultOption() {
        return this.defaultOption;
    }
    getCustomOption(name) {
        return this.customFilterOptions[name];
    }
}
exports.OptionsFactory = OptionsFactory;
