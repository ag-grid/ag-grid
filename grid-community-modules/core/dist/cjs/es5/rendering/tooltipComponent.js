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
exports.TooltipComponent = void 0;
var popupComponent_1 = require("../widgets/popupComponent");
var string_1 = require("../utils/string");
var TooltipComponent = /** @class */ (function (_super) {
    __extends(TooltipComponent, _super);
    function TooltipComponent() {
        return _super.call(this, /* html */ "<div class=\"ag-tooltip\"></div>") || this;
    }
    // will need to type params
    TooltipComponent.prototype.init = function (params) {
        var value = params.value;
        this.getGui().innerHTML = (0, string_1.escapeString)(value);
    };
    return TooltipComponent;
}(popupComponent_1.PopupComponent));
exports.TooltipComponent = TooltipComponent;
