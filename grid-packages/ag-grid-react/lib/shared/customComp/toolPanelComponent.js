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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPanelComponent = void 0;
var customComponent_1 = require("./customComponent");
var ToolPanelComponent = /** @class */ (function (_super) {
    __extends(ToolPanelComponent, _super);
    function ToolPanelComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToolPanelComponent.prototype.refresh = function (params) {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    };
    ToolPanelComponent.prototype.getState = function () {
        return this.state;
    };
    ToolPanelComponent.prototype.updateState = function (state) {
        this.state = state;
        this.refreshProps();
        this.sourceParams.onStateUpdated();
    };
    ToolPanelComponent.prototype.getProps = function () {
        var _this = this;
        return __assign(__assign({}, this.sourceParams), { key: this.key, state: this.state, onStateChange: function (state) { return _this.updateState(state); } });
    };
    return ToolPanelComponent;
}(customComponent_1.CustomComponent));
exports.ToolPanelComponent = ToolPanelComponent;
