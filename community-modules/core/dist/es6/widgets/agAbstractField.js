/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { AgAbstractLabel } from './agAbstractLabel';
import { setDisabled, addOrRemoveCssClass, setFixedWidth, addCssClass } from '../utils/dom';
var AgAbstractField = /** @class */ (function (_super) {
    __extends(AgAbstractField, _super);
    function AgAbstractField(config, template, className) {
        var _this = _super.call(this, config, template) || this;
        _this.className = className;
        _this.disabled = false;
        return _this;
    }
    AgAbstractField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        if (this.className) {
            addCssClass(this.getGui(), this.className);
        }
    };
    AgAbstractField.prototype.onValueChange = function (callbackFn) {
        var _this = this;
        this.addManagedListener(this, AgAbstractField.EVENT_CHANGED, function () { return callbackFn(_this.getValue()); });
        return this;
    };
    AgAbstractField.prototype.getWidth = function () {
        return this.getGui().clientWidth;
    };
    AgAbstractField.prototype.setWidth = function (width) {
        setFixedWidth(this.getGui(), width);
        return this;
    };
    AgAbstractField.prototype.getPreviousValue = function () {
        return this.previousValue;
    };
    AgAbstractField.prototype.getValue = function () {
        return this.value;
    };
    AgAbstractField.prototype.setValue = function (value, silent) {
        if (this.value === value) {
            return this;
        }
        this.previousValue = this.value;
        this.value = value;
        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }
        return this;
    };
    AgAbstractField.prototype.setDisabled = function (disabled) {
        disabled = !!disabled;
        var element = this.getGui();
        setDisabled(element, disabled);
        addOrRemoveCssClass(element, 'ag-disabled', disabled);
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
