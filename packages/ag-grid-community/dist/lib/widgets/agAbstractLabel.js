/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var AgAbstractLabel = /** @class */ (function (_super) {
    __extends(AgAbstractLabel, _super);
    function AgAbstractLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.labelSeparator = '';
        _this.labelAlignment = 'left';
        _this.config = {};
        _this.label = '';
        return _this;
    }
    AgAbstractLabel.prototype.postConstruct = function () {
        utils_1._.addCssClass(this.getGui(), 'ag-labeled');
        var _a = this.config, labelSeparator = _a.labelSeparator, label = _a.label, labelWidth = _a.labelWidth, labelAlignment = _a.labelAlignment;
        if (labelSeparator != null) {
            this.setLabelSeparator(labelSeparator);
        }
        if (label != null) {
            this.setLabel(label);
        }
        if (labelWidth != null) {
            this.setLabelWidth(labelWidth);
        }
        this.setLabelAlignment(labelAlignment || this.labelAlignment);
        this.refreshLabel();
    };
    AgAbstractLabel.prototype.refreshLabel = function () {
        this.eLabel.innerText = this.label + this.labelSeparator;
        utils_1._.addOrRemoveCssClass(this.eLabel, 'ag-hidden', this.label === '');
    };
    AgAbstractLabel.prototype.setLabelSeparator = function (labelSeparator) {
        if (this.labelSeparator === labelSeparator) {
            return this;
        }
        this.labelSeparator = labelSeparator;
        if (this.label != null) {
            this.refreshLabel();
        }
        return this;
    };
    AgAbstractLabel.prototype.setLabel = function (label) {
        if (this.label === label) {
            return this;
        }
        this.label = label;
        this.refreshLabel();
        return this;
    };
    AgAbstractLabel.prototype.setLabelAlignment = function (alignment) {
        var eGui = this.getGui();
        utils_1._.addOrRemoveCssClass(eGui, 'ag-label-align-left', alignment === 'left');
        utils_1._.addOrRemoveCssClass(eGui, 'ag-label-align-right', alignment === 'right');
        utils_1._.addOrRemoveCssClass(eGui, 'ag-label-align-top', alignment === 'top');
        return this;
    };
    AgAbstractLabel.prototype.setLabelWidth = function (width) {
        if (this.label == null) {
            return this;
        }
        utils_1._.setElementWidth(this.eLabel, width);
        return this;
    };
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgAbstractLabel.prototype, "postConstruct", null);
    return AgAbstractLabel;
}(component_1.Component));
exports.AgAbstractLabel = AgAbstractLabel;
