// ag-grid-react v31.1.1
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
exports.ToolPanelComponentWrapper = void 0;
var customComponentWrapper_1 = require("./customComponentWrapper");
var ToolPanelComponentWrapper = /** @class */ (function (_super) {
    __extends(ToolPanelComponentWrapper, _super);
    function ToolPanelComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onStateChange = function (state) { return _this.updateState(state); };
        return _this;
    }
    ToolPanelComponentWrapper.prototype.refresh = function (params) {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    };
    ToolPanelComponentWrapper.prototype.getState = function () {
        return this.state;
    };
    ToolPanelComponentWrapper.prototype.updateState = function (state) {
        this.state = state;
        this.refreshProps();
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        this.sourceParams.onStateUpdated();
    };
    ToolPanelComponentWrapper.prototype.getProps = function () {
        var props = _super.prototype.getProps.call(this);
        props.state = this.state;
        props.onStateChange = this.onStateChange;
        return props;
    };
    return ToolPanelComponentWrapper;
}(customComponentWrapper_1.CustomComponentWrapper));
exports.ToolPanelComponentWrapper = ToolPanelComponentWrapper;
