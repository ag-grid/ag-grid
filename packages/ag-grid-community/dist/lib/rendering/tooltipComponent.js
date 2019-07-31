/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var popupComponent_1 = require("../widgets/popupComponent");
var TooltipComponent = /** @class */ (function (_super) {
    __extends(TooltipComponent, _super);
    function TooltipComponent() {
        return _super.call(this, "<div class=\"ag-tooltip\"></div>") || this;
    }
    // will need to type params
    TooltipComponent.prototype.init = function (params) {
        var value = params.value;
        this.getGui().innerHTML = value;
    };
    return TooltipComponent;
}(popupComponent_1.PopupComponent));
exports.TooltipComponent = TooltipComponent;
