// ag-grid-react v31.0.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusPanelComponentWrapper = void 0;
var customComponentWrapper_1 = require("./customComponentWrapper");
var StatusPanelComponentWrapper = /** @class */ (function (_super) {
    __extends(StatusPanelComponentWrapper, _super);
    function StatusPanelComponentWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StatusPanelComponentWrapper.prototype.refresh = function (params) {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    };
    return StatusPanelComponentWrapper;
}(customComponentWrapper_1.CustomComponentWrapper));
exports.StatusPanelComponentWrapper = StatusPanelComponentWrapper;
