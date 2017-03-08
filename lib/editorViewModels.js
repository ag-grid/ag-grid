// ag-grid-aurelia v8.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A base editor component for inline editing
 */
var BaseAureliaEditor = (function () {
    function BaseAureliaEditor() {
    }
    BaseAureliaEditor.prototype.getValue = function () {
        return this.params.value;
    };
    BaseAureliaEditor.prototype.isPopup = function () {
        return false;
    };
    return BaseAureliaEditor;
}());
exports.BaseAureliaEditor = BaseAureliaEditor;
