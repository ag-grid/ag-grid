/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var AgCheckbox = (function (_super) {
    __extends(AgCheckbox, _super);
    function AgCheckbox() {
        var _this = _super.call(this) || this;
        _this.selected = false;
        _this.readOnly = false;
        _this.passive = false;
        return _this;
    }
    AgCheckbox.prototype.preConstruct = function () {
        this.setTemplate(AgCheckbox.TEMPLATE);
    };
    AgCheckbox.prototype.postConstruct = function () {
        this.loadIcons();
        this.updateIcons();
        if (this.props.label) {
            this.eLabel.innerText = this.props.label;
        }
    };
    AgCheckbox.prototype.loadIcons = function () {
        utils_1.Utils.removeAllChildren(this.eChecked);
        utils_1.Utils.removeAllChildren(this.eUnchecked);
        utils_1.Utils.removeAllChildren(this.eIndeterminate);
        if (this.readOnly) {
            this.eChecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxCheckedReadOnly', this.gridOptionsWrapper, null));
            this.eUnchecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxUncheckedReadOnly', this.gridOptionsWrapper, null));
            this.eIndeterminate.appendChild(utils_1.Utils.createIconNoSpan('checkboxIndeterminateReadOnly', this.gridOptionsWrapper, null));
        }
        else {
            this.eChecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null));
            this.eUnchecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null));
            this.eIndeterminate.appendChild(utils_1.Utils.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null));
        }
    };
    AgCheckbox.prototype.onClick = function (event) {
        // if we don't set the path, then won't work in Edge, as once the <span> is removed from the dom,
        // it's not possible to calculate the path by following the parent's chain. in other browser (eg
        // chrome) there is event.path for this purpose, but missing in Edge.
        utils_1.Utils.addAgGridEventPath(event);
        if (!this.readOnly) {
            this.toggle();
        }
    };
    AgCheckbox.prototype.getNextValue = function () {
        if (this.selected === undefined) {
            return true;
        }
        else {
            return !this.selected;
        }
    };
    AgCheckbox.prototype.setPassive = function (passive) {
        this.passive = passive;
    };
    AgCheckbox.prototype.setReadOnly = function (readOnly) {
        this.readOnly = readOnly;
        this.loadIcons();
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
            this.setSelected(nextValue);
        }
    };
    AgCheckbox.prototype.setSelected = function (selected) {
        if (this.selected === selected) {
            return;
        }
        if (selected === true) {
            this.selected = true;
        }
        else if (selected === false) {
            this.selected = false;
        }
        else {
            this.selected = undefined;
        }
        this.updateIcons();
        var event = {
            type: AgCheckbox.EVENT_CHANGED,
            selected: this.selected
        };
        this.dispatchEvent(event);
    };
    AgCheckbox.prototype.updateIcons = function () {
        utils_1.Utils.setVisible(this.eChecked, this.selected === true);
        utils_1.Utils.setVisible(this.eUnchecked, this.selected === false);
        utils_1.Utils.setVisible(this.eIndeterminate, this.selected === undefined);
    };
    AgCheckbox.EVENT_CHANGED = 'change';
    AgCheckbox.TEMPLATE = '<span class="ag-checkbox" role="presentation">' +
        '  <span class="ag-checkbox-checked" role="presentation"></span>' +
        '  <span class="ag-checkbox-unchecked" role="presentation"></span>' +
        '  <span class="ag-checkbox-indeterminate" role="presentation"></span>' +
        '  <span class="ag-checkbox-label" role="presentation"></span>' +
        '</span>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AgCheckbox.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-checked'),
        __metadata("design:type", HTMLElement)
    ], AgCheckbox.prototype, "eChecked", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-unchecked'),
        __metadata("design:type", HTMLElement)
    ], AgCheckbox.prototype, "eUnchecked", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-indeterminate'),
        __metadata("design:type", HTMLElement)
    ], AgCheckbox.prototype, "eIndeterminate", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-label'),
        __metadata("design:type", HTMLElement)
    ], AgCheckbox.prototype, "eLabel", void 0);
    __decorate([
        context_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgCheckbox.prototype, "preConstruct", null);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgCheckbox.prototype, "postConstruct", null);
    __decorate([
        componentAnnotations_1.Listener('click'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], AgCheckbox.prototype, "onClick", null);
    return AgCheckbox;
}(component_1.Component));
exports.AgCheckbox = AgCheckbox;
