/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { AgCheckbox } from './agCheckbox';
import { Events } from '../eventKeys';
var AgRadioButton = /** @class */ (function (_super) {
    __extends(AgRadioButton, _super);
    function AgRadioButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = 'ag-radio-button';
        _this.inputType = 'radio';
        return _this;
    }
    AgRadioButton.prototype.isSelected = function () {
        return this.eInput.checked;
    };
    AgRadioButton.prototype.toggle = function () {
        var nextValue = this.getNextValue();
        this.setValue(nextValue);
    };
    AgRadioButton.prototype.addInputListeners = function () {
        _super.prototype.addInputListeners.call(this);
        this.addManagedListener(this.eventService, Events.EVENT_CHECKBOX_CHANGED, this.onChange.bind(this));
    };
    /**
     * This ensures that if another radio button in the same named group is selected, we deselect this radio button.
     * By default the browser does this for you, but we are managing classes ourselves in order to ensure input
     * elements are styled correctly in IE11, and the DOM 'changed' event is only fired when a button is selected,
     * not deselected, so we need to use our own event.
     */
    AgRadioButton.prototype.onChange = function (event) {
        if (event.selected &&
            event.name &&
            this.eInput.name &&
            this.eInput.name === event.name &&
            event.id &&
            this.eInput.id !== event.id) {
            this.setValue(false, true);
        }
    };
    return AgRadioButton;
}(AgCheckbox));
export { AgRadioButton };
