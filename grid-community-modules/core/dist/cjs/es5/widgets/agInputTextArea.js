/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgInputTextArea = void 0;
var agAbstractInputField_1 = require("./agAbstractInputField");
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
}(agAbstractInputField_1.AgAbstractInputField));
exports.AgInputTextArea = AgInputTextArea;
