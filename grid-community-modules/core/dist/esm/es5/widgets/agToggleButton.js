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
import { AgCheckbox } from './agCheckbox';
var AgToggleButton = /** @class */ (function (_super) {
    __extends(AgToggleButton, _super);
    function AgToggleButton(config) {
        return _super.call(this, config, 'ag-toggle-button') || this;
    }
    AgToggleButton.prototype.setValue = function (value, silent) {
        _super.prototype.setValue.call(this, value, silent);
        this.addOrRemoveCssClass('ag-selected', this.getValue());
        return this;
    };
    return AgToggleButton;
}(AgCheckbox));
export { AgToggleButton };
