/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { AgAbstractLabel } from "./agAbstractLabel";
import { _ } from "../utils";
var AgAbstractField = /** @class */ (function (_super) {
    __extends(AgAbstractField, _super);
    function AgAbstractField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.disabled = false;
        return _this;
    }
    AgAbstractField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        _.addCssClass(this.getGui(), this.className);
    };
    AgAbstractField.prototype.onValueChange = function (callbackFn) {
        var _this = this;
        this.addDestroyableEventListener(this, AgAbstractField.EVENT_CHANGED, function () {
            callbackFn(_this.getValue());
        });
        return this;
    };
    AgAbstractField.prototype.getWidth = function () {
        return this.getGui().clientWidth;
    };
    AgAbstractField.prototype.setWidth = function (width) {
        _.setFixedWidth(this.getGui(), width);
        return this;
    };
    AgAbstractField.prototype.getValue = function () {
        return this.value;
    };
    AgAbstractField.prototype.setValue = function (value, silent) {
        if (this.value === value) {
            return this;
        }
        this.value = value;
        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }
        return this;
    };
    AgAbstractField.prototype.setDisabled = function (disabled) {
        disabled = !!disabled;
        var eGui = this.getGui();
        if (disabled) {
            eGui.setAttribute('disabled', 'true');
        }
        _.addOrRemoveCssClass(eGui, 'ag-disabled', disabled);
        this.disabled = disabled;
        return this;
    };
    AgAbstractField.prototype.isDisabled = function () {
        return !!this.disabled;
    };
    AgAbstractField.EVENT_CHANGED = 'valueChange';
    return AgAbstractField;
}(AgAbstractLabel));
export { AgAbstractField };
