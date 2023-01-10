/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFloatingFilter = void 0;
const textFilter_1 = require("./textFilter");
const textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
class TextFloatingFilter extends textInputFloatingFilter_1.TextInputFloatingFilter {
    getDefaultFilterOptions() {
        return textFilter_1.TextFilter.DEFAULT_FILTER_OPTIONS;
    }
}
exports.TextFloatingFilter = TextFloatingFilter;
