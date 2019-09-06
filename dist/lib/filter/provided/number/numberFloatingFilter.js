/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var numberFilter_1 = require("./numberFilter");
var simpleFilter_1 = require("../simpleFilter");
var textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
var NumberFloatingFilter = /** @class */ (function (_super) {
    __extends(NumberFloatingFilter, _super);
    function NumberFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return numberFilter_1.NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFloatingFilter.prototype.conditionToString = function (condition) {
        var isRange = condition.type == simpleFilter_1.SimpleFilter.IN_RANGE;
        if (isRange) {
            return condition.filter + "-" + condition.filterTo;
        }
        else {
            // cater for when the type doesn't need a value
            if (condition.filter != null) {
                return "" + condition.filter;
            }
            else {
                return "" + condition.type;
            }
        }
    };
    return NumberFloatingFilter;
}(textInputFloatingFilter_1.TextInputFloatingFilter));
exports.NumberFloatingFilter = NumberFloatingFilter;
