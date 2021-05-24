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
import { Events } from "../events";
import { AgAbstractInputField } from './agAbstractInputField';
import { addOrRemoveCssClass } from '../utils/dom';
var AgCheckbox = /** @class */ (function (_super) {
    __extends(AgCheckbox, _super);
    function AgCheckbox(config, className, inputType) {
        if (className === void 0) { className = 'ag-checkbox'; }
        if (inputType === void 0) { inputType = 'checkbox'; }
        var _this = _super.call(this, config, className, inputType) || this;
        _this.labelAlignment = 'right';
        _this.selected = false;
        _this.readOnly = false;
        _this.passive = false;
        return _this;
    }
    AgCheckbox.prototype.addInputListeners = function () {
        this.addManagedListener(this.eInput, 'click', this.onCheckboxClick.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.toggle.bind(this));
    };
    AgCheckbox.prototype.getNextValue = function () {
        return this.selected === undefined ? true : !this.selected;
    };
    AgCheckbox.prototype.setPassive = function (passive) {
        this.passive = passive;
    };
    AgCheckbox.prototype.isReadOnly = function () {
        return this.readOnly;
    };
    AgCheckbox.prototype.setReadOnly = function (readOnly) {
        addOrRemoveCssClass(this.eWrapper, 'ag-disabled', readOnly);
        this.eInput.disabled = readOnly;
        this.readOnly = readOnly;
    };
    AgCheckbox.prototype.setDisabled = function (disabled) {
        addOrRemoveCssClass(this.eWrapper, 'ag-disabled', disabled);
        return _super.prototype.setDisabled.call(this, disabled);
    };
    AgCheckbox.prototype.toggle = function () {
        var previousValue = this.isSelected();
        var nextValue = this.getNextValue();
        if (this.passive) {
            this.dispatchChange(nextValue, previousValue);
        }
        else {
            this.setValue(nextValue);
        }
    };
    AgCheckbox.prototype.getValue = function () {
        return this.isSelected();
    };
    AgCheckbox.prototype.setValue = function (value, silent) {
        this.refreshSelectedClass(value);
        this.setSelected(value, silent);
        return this;
    };
    AgCheckbox.prototype.setName = function (name) {
        var input = this.getInputElement();
        input.name = name;
        return this;
    };
    AgCheckbox.prototype.isSelected = function () {
        return this.selected;
    };
    AgCheckbox.prototype.setSelected = function (selected, silent) {
        if (this.isSelected() === selected) {
            return;
        }
        this.previousValue = this.isSelected();
        selected = this.selected = typeof selected === 'boolean' ? selected : undefined;
        this.eInput.checked = selected;
        this.eInput.indeterminate = selected === undefined;
        if (!silent) {
            this.dispatchChange(this.selected, this.previousValue);
        }
    };
    AgCheckbox.prototype.dispatchChange = function (selected, previousValue, event) {
        this.dispatchEvent({ type: AgCheckbox.EVENT_CHANGED, selected: selected, previousValue: previousValue, event: event });
        var input = this.getInputElement();
        var checkboxChangedEvent = {
            type: Events.EVENT_CHECKBOX_CHANGED,
            id: input.id,
            name: input.name,
            selected: selected,
            previousValue: previousValue
        };
        this.eventService.dispatchEvent(checkboxChangedEvent);
    };
    AgCheckbox.prototype.onCheckboxClick = function (e) {
        if (this.passive) {
            return;
        }
        var previousValue = this.isSelected();
        var selected = this.selected = e.target.checked;
        this.refreshSelectedClass(selected);
        this.dispatchChange(selected, previousValue, e);
    };
    AgCheckbox.prototype.refreshSelectedClass = function (value) {
        addOrRemoveCssClass(this.eWrapper, 'ag-checked', value === true);
        addOrRemoveCssClass(this.eWrapper, 'ag-indeterminate', value == null);
    };
    return AgCheckbox;
}(AgAbstractInputField));
export { AgCheckbox };
