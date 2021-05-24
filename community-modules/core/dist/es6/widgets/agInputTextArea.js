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
import { AgAbstractInputField } from "./agAbstractInputField";
var AgInputTextArea = /** @class */ (function (_super) {
    __extends(AgInputTextArea, _super);
    function AgInputTextArea(config) {
        return _super.call(this, config, 'ag-text-area', null, 'textarea') || this;
    }
    AgInputTextArea.prototype.setValue = function (value, silent) {
        var ret = _super.prototype.setValue.call(this, value, silent);
        this.eInput.value = value;
        return ret;
    };
    AgInputTextArea.prototype.setCols = function (cols) {
        this.eInput.cols = cols;
        return this;
    };
    AgInputTextArea.prototype.setRows = function (rows) {
        this.eInput.rows = rows;
        return this;
    };
    return AgInputTextArea;
}(AgAbstractInputField));
export { AgInputTextArea };
