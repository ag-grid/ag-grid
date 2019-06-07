/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.0.1
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
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var AgRadioButton = /** @class */ (function (_super) {
    __extends(AgRadioButton, _super);
    function AgRadioButton() {
        var _this = _super.call(this) || this;
        _this.selected = false;
        return _this;
    }
    AgRadioButton.prototype.preConstruct = function () {
        this.setTemplate(AgRadioButton.TEMPLATE);
    };
    AgRadioButton.prototype.postConstruct = function () {
        this.loadIcons();
        this.updateIcons();
    };
    AgRadioButton.prototype.setLabel = function (label) {
        this.eLabel.innerText = label;
    };
    AgRadioButton.prototype.loadIcons = function () {
        utils_1._.clearElement(this.eRadioOn);
        utils_1._.clearElement(this.eRadioOff);
        this.eRadioOn.appendChild(utils_1._.createIconNoSpan('radioButtonOn', this.gridOptionsWrapper, null));
        this.eRadioOff.appendChild(utils_1._.createIconNoSpan('radioButtonOff', this.gridOptionsWrapper, null));
    };
    AgRadioButton.prototype.onClick = function (event) {
        // if we don't set the path, then won't work in Edge, as once the <span> is removed from the dom,
        // it's not possible to calculate the path by following the parent's chain. in other browser (eg
        // chrome) there is event.path for this purpose, but missing in Edge.
        utils_1._.addAgGridEventPath(event);
        this.toggle();
    };
    AgRadioButton.prototype.getNextValue = function () {
        if (this.selected === undefined) {
            return true;
        }
        else {
            return !this.selected;
        }
    };
    AgRadioButton.prototype.isSelected = function () {
        return this.selected;
    };
    AgRadioButton.prototype.toggle = function () {
        var nextValue = this.getNextValue();
        this.setSelected(nextValue);
    };
    AgRadioButton.prototype.select = function (selected) {
        if (this.selected === selected) {
            return;
        }
        this.selected = selected;
        this.updateIcons();
    };
    AgRadioButton.prototype.setSelected = function (selected) {
        if (this.selected === selected) {
            return;
        }
        this.selected = selected;
        this.updateIcons();
        var event = {
            type: AgRadioButton.EVENT_CHANGED,
            selected: this.selected
        };
        this.dispatchEvent(event);
    };
    AgRadioButton.prototype.updateIcons = function () {
        utils_1._.setVisible(this.eRadioOn, this.selected === true);
        utils_1._.setVisible(this.eRadioOff, this.selected === false);
    };
    AgRadioButton.EVENT_CHANGED = 'change';
    AgRadioButton.TEMPLATE = '<div class="ag-radio-button" role="presentation">' +
        '  <span class="ag-radio-button-on" role="presentation"></span>' +
        '  <span class="ag-radio-button-off" role="presentation"></span>' +
        '  <span class="ag-radio-button-label" role="presentation"></span>' +
        '</div>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AgRadioButton.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-radio-button-on'),
        __metadata("design:type", HTMLElement)
    ], AgRadioButton.prototype, "eRadioOn", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-radio-button-off'),
        __metadata("design:type", HTMLElement)
    ], AgRadioButton.prototype, "eRadioOff", void 0);
    __decorate([
        componentAnnotations_1.QuerySelector('.ag-radio-button-label'),
        __metadata("design:type", HTMLElement)
    ], AgRadioButton.prototype, "eLabel", void 0);
    __decorate([
        context_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgRadioButton.prototype, "preConstruct", null);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgRadioButton.prototype, "postConstruct", null);
    __decorate([
        componentAnnotations_1.Listener('click'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], AgRadioButton.prototype, "onClick", null);
    return AgRadioButton;
}(component_1.Component));
exports.AgRadioButton = AgRadioButton;
