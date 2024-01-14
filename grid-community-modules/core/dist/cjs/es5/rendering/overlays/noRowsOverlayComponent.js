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
exports.NoRowsOverlayComponent = void 0;
var component_1 = require("../../widgets/component");
var NoRowsOverlayComponent = /** @class */ (function (_super) {
    __extends(NoRowsOverlayComponent, _super);
    function NoRowsOverlayComponent() {
        return _super.call(this) || this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    NoRowsOverlayComponent.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    NoRowsOverlayComponent.prototype.init = function (params) {
        var _this = this;
        var customTemplate = this.gridOptionsService.get('overlayNoRowsTemplate');
        this.setTemplate(customTemplate !== null && customTemplate !== void 0 ? customTemplate : NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE);
        if (!customTemplate) {
            var localeTextFunc_1 = this.localeService.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(function () {
                _this.getGui().innerText = localeTextFunc_1('noRowsToShow', 'No Rows To Show');
            });
        }
    };
    NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE = "<span class=\"ag-overlay-no-rows-center\"></span>";
    return NoRowsOverlayComponent;
}(component_1.Component));
exports.NoRowsOverlayComponent = NoRowsOverlayComponent;
