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
import { PopupComponent } from '../widgets/popupComponent';
import { escapeString } from '../utils/string';
var TooltipComponent = /** @class */ (function (_super) {
    __extends(TooltipComponent, _super);
    function TooltipComponent() {
        return _super.call(this, /* html */ "<div class=\"ag-tooltip\"></div>") || this;
    }
    // will need to type params
    TooltipComponent.prototype.init = function (params) {
        var value = params.value;
        this.getGui().innerHTML = escapeString(value);
    };
    return TooltipComponent;
}(PopupComponent));
export { TooltipComponent };
