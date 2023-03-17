/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {
    constructor() {
        this.customFilterOptions = {};
    }
    init(params, defaultOptions) {
        this.filterOptions = params.filterOptions || defaultOptions;
        this.mapCustomOptions();
        this.selectDefaultItem(params);
        this.checkForDeprecatedParams();
    }
    checkForDeprecatedParams() {
        if (this.filterOptions.some(opt => typeof opt != 'string' && opt.test != null)) {
            console.warn(`AG Grid: [IFilterOptionDef] since v26.2.0, test() has been replaced with predicate().`);
        }
        if (this.filterOptions.some(opt => typeof opt != 'string' && opt.hideFilterInput != null)) {
            console.warn(`AG Grid: [IFilterOptionDef] since v26.2.0, useOfHideFilterInput has been replaced with numberOfInputs.`);
        }
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
            const { test } = filterOption;
            const mutatedFilterOptions = Object.assign({}, filterOption);
            if (test != null && filterOption.predicate == null) {
                mutatedFilterOptions.predicate = (v, cv) => test(v[0], cv);
                delete mutatedFilterOptions.test;
            }
            if (mutatedFilterOptions.hideFilterInput && mutatedFilterOptions.numberOfInputs == null) {
                mutatedFilterOptions.numberOfInputs = 0;
                delete mutatedFilterOptions.hideFilterInput;
            }
            this.customFilterOptions[filterOption.displayKey] = mutatedFilterOptions;
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
