/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numberFilter_1 = require("./numberFilter");
const textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
class NumberFloatingFilter extends textInputFloatingFilter_1.TextInputFloatingFilter {
    getDefaultFilterOptions() {
        return numberFilter_1.NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
}
exports.NumberFloatingFilter = NumberFloatingFilter;

//# sourceMappingURL=numberFloatingFilter.js.map
