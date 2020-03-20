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
var agAbstractField_1 = require("./agAbstractField");
var context_1 = require("../context/context");
var constants_1 = require("../constants");
var componentAnnotations_1 = require("./componentAnnotations");
var utils_1 = require("../utils");
var AgPickerField = /** @class */ (function (_super) {
    __extends(AgPickerField, _super);
    function AgPickerField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.TEMPLATE = "<div class=\"ag-picker-field\" role=\"presentation\">\n            <label ref=\"eLabel\"></label>\n            <div ref=\"eWrapper\" class=\"ag-wrapper ag-picker-field-wrapper\" tabIndex=\"-1\">\n                <%displayField% ref=\"eDisplayField\" class=\"ag-picker-field-display\"></%displayField%>\n                <div ref=\"eIcon\" class=\"ag-picker-field-icon\"></div>\n            </div>\n        </div>";
        _this.isDestroyingPicker = false;
        _this.skipClick = false;
        return _this;
    }
    AgPickerField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        var clickHandler = function () {
            if (_this.skipClick) {
                _this.skipClick = false;
                return;
            }
            if (_this.isDisabled()) {
                return;
            }
            _this.pickerComponent = _this.showPicker();
        };
        var eGui = this.getGui();
        this.addDestroyableEventListener(eGui, 'mousedown', function (e) {
            if (!_this.skipClick &&
                _this.pickerComponent &&
                _this.pickerComponent.isAlive() &&
                utils_1._.isVisible(_this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                _this.skipClick = true;
            }
        });
        this.addDestroyableEventListener(eGui, 'keydown', function (e) {
            switch (e.keyCode) {
                case constants_1.Constants.KEY_UP:
                case constants_1.Constants.KEY_DOWN:
                case constants_1.Constants.KEY_ENTER:
                case constants_1.Constants.KEY_SPACE:
                    clickHandler();
                case constants_1.Constants.KEY_ESCAPE:
                    e.preventDefault();
                    break;
            }
        });
        this.addDestroyableEventListener(this.eWrapper, 'click', clickHandler);
        this.addDestroyableEventListener(this.eLabel, 'click', clickHandler);
        if (this.pickerIcon) {
            this.eIcon.appendChild(utils_1._.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper, null));
        }
    };
    AgPickerField.prototype.setInputWidth = function (width) {
        utils_1._.setElementWidth(this.eWrapper, width);
        return this;
    };
    AgPickerField.prototype.getFocusableElement = function () {
        return this.eWrapper;
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
        componentAnnotations_1.RefSelector('eIcon')
    ], AgPickerField.prototype, "eIcon", void 0);
    return AgPickerField;
}(agAbstractField_1.AgAbstractField));
exports.AgPickerField = AgPickerField;

//# sourceMappingURL=agPickerField.js.map
