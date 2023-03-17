/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFloatingFilter = void 0;
const textFilter_1 = require("./textFilter");
const textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
class TextFloatingFilter extends textInputFloatingFilter_1.TextInputFloatingFilter {
    init(params) {
        super.init(params);
        this.filterModelFormatter = new textFilter_1.TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    getDefaultFilterOptions() {
        return textFilter_1.TextFilter.DEFAULT_FILTER_OPTIONS;
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
    createFloatingFilterInputService(ariaLabel) {
        return this.createManagedBean(new textInputFloatingFilter_1.FloatingFilterTextInputService({
            ariaLabel
        }));
    }
}
exports.TextFloatingFilter = TextFloatingFilter;
