/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
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
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var agAbstractField_1 = require("./agAbstractField");
var utils_1 = require("../utils");
var AgPickerField = /** @class */ (function (_super) {
    __extends(AgPickerField, _super);
    function AgPickerField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.TEMPLATE = "<div class=\"ag-picker-field\">\n            <label ref=\"eLabel\"></label>\n            <div ref=\"eWrapper\" class=\"ag-wrapper\">\n                <%displayField% ref=\"eDisplayField\"></%displayField%>\n                <button ref=\"eButton\" class=\"ag-picker-button\"> </button>\n            </div>\n        </div>";
        _this.displayedPicker = false;
        _this.isDestroyingPicker = false;
        return _this;
    }
    AgPickerField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.addDestroyableEventListener(this.eButton, 'click', function () {
            _this.showPicker();
        });
        if (this.pickerIcon) {
            this.eButton.appendChild(utils_1._.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper, null));
        }
    };
    AgPickerField.prototype.setInputWidth = function (width) {
        utils_1._.setElementWidth(this.eWrapper, width);
        return this;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], AgPickerField.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLabel')
    ], AgPickerField.prototype, "eLabel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eWrapper')
    ], AgPickerField.prototype, "eWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eDisplayField')
    ], AgPickerField.prototype, "eDisplayField", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eButton')
    ], AgPickerField.prototype, "eButton", void 0);
    return AgPickerField;
}(agAbstractField_1.AgAbstractField));
exports.AgPickerField = AgPickerField;
