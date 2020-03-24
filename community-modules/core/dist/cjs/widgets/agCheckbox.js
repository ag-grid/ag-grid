/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var agAbstractInputField_1 = require("./agAbstractInputField");
var utils_1 = require("../utils");
var events_1 = require("../events");
var AgCheckbox = /** @class */ (function (_super) {
    __extends(AgCheckbox, _super);
    function AgCheckbox() {
        var _this = _super.call(this) || this;
        _this.className = 'ag-checkbox';
        _this.displayTag = 'input';
        _this.inputType = 'checkbox';
        _this.labelAlignment = 'right';
        _this.selected = false;
        _this.readOnly = false;
        _this.passive = false;
        _this.setTemplate(_this.TEMPLATE.replace(/%displayField%/g, _this.displayTag));
        return _this;
    }
    AgCheckbox.prototype.addInputListeners = function () {
        this.addDestroyableEventListener(this.eInput, 'click', this.onCheckboxClick.bind(this));
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
        utils_1._.addOrRemoveCssClass(this.eWrapper, 'ag-disabled', readOnly);
        this.eInput.disabled = readOnly;
        this.readOnly = readOnly;
    };
    AgCheckbox.prototype.setDisabled = function (disabled) {
        utils_1._.addOrRemoveCssClass(this.eWrapper, 'ag-disabled', disabled);
        return _super.prototype.setDisabled.call(this, disabled);
    };
    AgCheckbox.prototype.toggle = function () {
        var nextValue = this.getNextValue();
        if (this.passive) {
            this.dispatchChange(nextValue);
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
        this.selected = typeof selected === 'boolean' ? selected : undefined;
        this.eInput.checked = this.selected;
        this.eInput.indeterminate = this.selected === undefined;
        if (!silent) {
            this.dispatchChange(this.selected);
        }
    };
    AgCheckbox.prototype.dispatchChange = function (selected, event) {
        this.dispatchEvent({ type: AgCheckbox.EVENT_CHANGED, selected: selected, event: event });
        var input = this.getInputElement();
        var checkboxChangedEvent = {
            type: events_1.Events.EVENT_CHECKBOX_CHANGED,
            id: input.id,
            name: input.name,
            selected: selected
        };
        this.eventService.dispatchEvent(checkboxChangedEvent);
    };
    AgCheckbox.prototype.onCheckboxClick = function (e) {
        this.selected = e.target.checked;
        this.refreshSelectedClass(this.selected);
        this.dispatchChange(this.selected, e);
    };
    AgCheckbox.prototype.refreshSelectedClass = function (value) {
        utils_1._.addOrRemoveCssClass(this.eWrapper, 'ag-checked', value === true);
        utils_1._.addOrRemoveCssClass(this.eWrapper, 'ag-indeterminate', value == null);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], AgCheckbox.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], AgCheckbox.prototype, "eventService", void 0);
    return AgCheckbox;
}(agAbstractInputField_1.AgAbstractInputField));
exports.AgCheckbox = AgCheckbox;

//# sourceMappingURL=agCheckbox.js.map
