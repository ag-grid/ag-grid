/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { TextFilter } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
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
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    };
    return TextFloatingFilter;
}(TextInputFloatingFilter));
export { TextFloatingFilter };
