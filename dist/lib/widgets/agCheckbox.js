/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var agAbstractInputField_1 = require("./agAbstractInputField");
var agAbstractField_1 = require("./agAbstractField");
var utils_1 = require("../utils");
var AgCheckbox = /** @class */ (function (_super) {
    __extends(AgCheckbox, _super);
    function AgCheckbox() {
        var _this = _super.call(this) || this;
        _this.className = 'ag-checkbox';
        _this.displayTag = 'input';
        _this.inputType = 'checkbox';
        _this.labelAlignment = 'right';
        _this.iconMap = {
            selected: 'checkboxChecked',
            unselected: 'checkboxUnchecked',
            indeterminate: 'checkboxIndeterminate'
        };
        _this.selected = false;
        _this.readOnly = false;
        _this.passive = false;
        _this.setTemplate(_this.TEMPLATE.replace(/%displayField%/g, _this.displayTag));
        return _this;
    }
    AgCheckbox.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        utils_1._.addCssClass(this.eInput, 'ag-hidden');
        this.addIconsPlaceholder();
        this.updateIcons();
    };
    AgCheckbox.prototype.addInputListeners = function () {
        var _this = this;
        this.addDestroyableEventListener(this.getGui(), 'click', function (e) { return _this.onClick(e); });
        this.addDestroyableEventListener(this.eInput, 'change', function (e) { return _this.setValue(e.target.checked, true); });
    };
    AgCheckbox.prototype.addIconsPlaceholder = function () {
        var iconDiv = document.createElement('div');
        this.eWrapper.appendChild(iconDiv);
        this.eIconEl = iconDiv;
    };
    AgCheckbox.prototype.onClick = function (event) {
        // if we don't set the path, then won't work in Edge, as once the <span> is removed from the dom,
        // it's not possible to calculate the path by following the parent's chain. in other browser (eg
        // chrome) there is event.path for this purpose, but missing in Edge.
        utils_1._.addAgGridEventPath(event);
        if (!this.readOnly) {
            this.toggle();
        }
    };
    AgCheckbox.prototype.getNextValue = function () {
        return this.selected === undefined ? true : !this.selected;
    };
    AgCheckbox.prototype.setPassive = function (passive) {
        this.passive = passive;
    };
    AgCheckbox.prototype.setReadOnly = function (readOnly) {
        this.readOnly = readOnly;
        this.updateIcons();
    };
    AgCheckbox.prototype.isReadOnly = function () {
        return this.readOnly;
    };
    AgCheckbox.prototype.isSelected = function () {
        return this.selected;
    };
    AgCheckbox.prototype.toggle = function () {
        var nextValue = this.getNextValue();
        if (this.passive) {
            var event_1 = {
                type: AgCheckbox.EVENT_CHANGED,
                selected: nextValue
            };
            this.dispatchEvent(event_1);
        }
        else {
            this.setValue(nextValue);
        }
    };
    AgCheckbox.prototype.setSelected = function (selected, silent) {
        if (this.selected === selected) {
            return;
        }
        this.selected = typeof selected === 'boolean' ? selected : undefined;
        this.eInput.checked = this.selected;
        this.updateIcons();
        if (!silent) {
            var event_2 = {
                type: agAbstractField_1.AgAbstractField.EVENT_CHANGED,
                selected: this.selected
            };
            this.dispatchEvent(event_2);
        }
    };
    AgCheckbox.prototype.getIconName = function () {
        var value = this.getValue();
        var prop = value === undefined ? 'indeterminate' : (value ? 'selected' : 'unselected');
        var readOnlyStr = this.isReadOnly() ? 'ReadOnly' : '';
        return "" + this.iconMap[prop] + readOnlyStr;
    };
    AgCheckbox.prototype.updateIcons = function () {
        utils_1._.clearElement(this.eIconEl);
        this.eIconEl.appendChild(utils_1._.createIconNoSpan(this.getIconName(), this.gridOptionsWrapper, null));
    };
    AgCheckbox.prototype.getValue = function () {
        return this.isSelected();
    };
    AgCheckbox.prototype.setValue = function (value, silent) {
        this.setSelected(value, silent);
        return this;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AgCheckbox.prototype, "gridOptionsWrapper", void 0);
    return AgCheckbox;
}(agAbstractInputField_1.AgAbstractInputField));
exports.AgCheckbox = AgCheckbox;
