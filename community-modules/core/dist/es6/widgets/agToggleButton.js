/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
import { AgRadioButton } from './agRadioButton';
import { _ } from '../utils';
var AgToggleButton = /** @class */ (function (_super) {
    __extends(AgToggleButton, _super);
    function AgToggleButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = 'ag-toggle-button';
        _this.inputType = 'checkbox';
        return _this;
    }
    AgToggleButton.prototype.setValue = function (value, silent) {
        _super.prototype.setValue.call(this, value, silent);
        _.addOrRemoveCssClass(this.getGui(), 'ag-selected', this.getValue());
        return this;
    };
    return AgToggleButton;
}(AgRadioButton));
export { AgToggleButton };
