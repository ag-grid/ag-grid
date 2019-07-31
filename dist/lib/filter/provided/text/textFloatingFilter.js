/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var textFilter_1 = require("./textFilter");
var textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
var TextFloatingFilter = /** @class */ (function (_super) {
    __extends(TextFloatingFilter, _super);
    function TextFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextFloatingFilter.prototype.conditionToString = function (condition) {
        // it's not possible to have 'in range' for string, so no need to check for it.
        // also cater for when the type doesn't need a value
        if (condition.filter != null) {
            return "" + condition.filter;
        }
        else {
            return "" + condition.type;
        }
    };
    TextFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return textFilter_1.TextFilter.DEFAULT_FILTER_OPTIONS;
    };
    return TextFloatingFilter;
}(textInputFloatingFilter_1.TextInputFloatingFilter));
exports.TextFloatingFilter = TextFloatingFilter;
