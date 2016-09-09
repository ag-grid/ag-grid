/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.4.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var svgFactory_1 = require("../svgFactory");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var AgCheckbox = (function (_super) {
    __extends(AgCheckbox, _super);
    function AgCheckbox() {
        _super.call(this, AgCheckbox.TEMPLATE);
        this.selected = false;
        this.readOnly = false;
        this.passive = false;
    }
    AgCheckbox.prototype.init = function () {
        this.loadIcons();
        this.updateIcons();
        var label = this.getAttribute('label');
        if (label) {
            this.eLabel.innerText = label;
        }
    };
    AgCheckbox.prototype.loadIcons = function () {
        utils_1.Utils.removeAllChildren(this.eChecked);
        utils_1.Utils.removeAllChildren(this.eUnchecked);
        utils_1.Utils.removeAllChildren(this.eIndeterminate);
        if (this.readOnly) {
            this.eChecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxCheckedReadOnly', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedReadOnlyIcon));
            this.eUnchecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxUncheckedReadOnly', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedReadOnlyIcon));
            this.eIndeterminate.appendChild(utils_1.Utils.createIconNoSpan('checkboxIndeterminateReadOnly', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateReadOnlyIcon));
        }
        else {
            this.eChecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedIcon));
            this.eUnchecked.appendChild(utils_1.Utils.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedIcon));
            this.eIndeterminate.appendChild(utils_1.Utils.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null, svgFactory.createCheckboxIndeterminateIcon));
        }
    };
    AgCheckbox.prototype.onClick = function () {
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
            this.dispatchEvent(AgCheckbox.EVENT_CHANGED, { selected: nextValue });
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
        this.dispatchEvent(AgCheckbox.EVENT_CHANGED, { selected: this.selected });
    };
    AgCheckbox.prototype.updateIcons = function () {
        utils_1.Utils.setVisible(this.eChecked, this.selected === true);
        utils_1.Utils.setVisible(this.eUnchecked, this.selected === false);
        utils_1.Utils.setVisible(this.eIndeterminate, this.selected === undefined);
    };
    AgCheckbox.EVENT_CHANGED = 'change';
    AgCheckbox.TEMPLATE = '<span class="ag-checkbox">' +
        '  <span class="ag-checkbox-checked"></span>' +
        '  <span class="ag-checkbox-unchecked"></span>' +
        '  <span class="ag-checkbox-indeterminate"></span>' +
        '  <span class="ag-checkbox-label"></span>' +
        '</span>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], AgCheckbox.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-checked'), 
        __metadata('design:type', HTMLElement)
    ], AgCheckbox.prototype, "eChecked", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-unchecked'), 
        __metadata('design:type', HTMLElement)
    ], AgCheckbox.prototype, "eUnchecked", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-indeterminate'), 
        __metadata('design:type', HTMLElement)
    ], AgCheckbox.prototype, "eIndeterminate", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-checkbox-label'), 
        __metadata('design:type', HTMLElement)
    ], AgCheckbox.prototype, "eLabel", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], AgCheckbox.prototype, "init", null);
    __decorate([
        componentAnnotations_1.Listener('click'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], AgCheckbox.prototype, "onClick", null);
    return AgCheckbox;
})(component_1.Component);
exports.AgCheckbox = AgCheckbox;
