/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
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
import { Component } from "../../../widgets/component";
import { _ } from "../../../utils";
var DefaultDateComponent = /** @class */ (function (_super) {
    __extends(DefaultDateComponent, _super);
    function DefaultDateComponent() {
        return _super.call(this, "<div class=\"ag-input-wrapper\" role=\"presentation\"><input class=\"ag-filter-filter\" type=\"text\" placeholder=\"yyyy-mm-dd\"></div>") || this;
    }
    DefaultDateComponent.prototype.init = function (params) {
        this.eDateInput = this.getGui().querySelector('input');
        if (_.isBrowserChrome() || params.filterParams.browserDatePicker) {
            if (_.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            }
            else {
                this.eDateInput.type = 'date';
            }
        }
        this.listener = params.onDateChanged;
        this.addGuiEventListener('input', this.listener);
    };
    DefaultDateComponent.prototype.getDate = function () {
        return _.parseYyyyMmDdToDate(this.eDateInput.value, "-");
    };
    DefaultDateComponent.prototype.setDate = function (date) {
        this.eDateInput.value = _.serializeDateToYyyyMmDd(date, "-");
    };
    return DefaultDateComponent;
}(Component));
export { DefaultDateComponent };
