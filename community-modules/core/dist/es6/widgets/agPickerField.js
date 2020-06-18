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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgAbstractField } from "./agAbstractField";
import { Autowired } from "../context/context";
import { Constants } from "../constants";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";
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
        this.addManagedListener(eGui, 'mousedown', function (e) {
            if (!_this.skipClick &&
                _this.pickerComponent &&
                _this.pickerComponent.isAlive() &&
                _.isVisible(_this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                _this.skipClick = true;
            }
        });
        this.addManagedListener(eGui, 'keydown', function (e) {
            switch (e.keyCode) {
                case Constants.KEY_UP:
                case Constants.KEY_DOWN:
                case Constants.KEY_ENTER:
                case Constants.KEY_SPACE:
                    clickHandler();
                case Constants.KEY_ESCAPE:
                    e.preventDefault();
                    break;
            }
        });
        this.addManagedListener(this.eWrapper, 'click', clickHandler);
        this.addManagedListener(this.eLabel, 'click', clickHandler);
        if (this.pickerIcon) {
            this.eIcon.appendChild(_.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper, null));
        }
    };
    AgPickerField.prototype.setInputWidth = function (width) {
        _.setElementWidth(this.eWrapper, width);
        return this;
    };
    AgPickerField.prototype.getFocusableElement = function () {
        return this.eWrapper;
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], AgPickerField.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        RefSelector('eLabel')
    ], AgPickerField.prototype, "eLabel", void 0);
    __decorate([
        RefSelector('eWrapper')
    ], AgPickerField.prototype, "eWrapper", void 0);
    __decorate([
        RefSelector('eDisplayField')
    ], AgPickerField.prototype, "eDisplayField", void 0);
    __decorate([
        RefSelector('eIcon')
    ], AgPickerField.prototype, "eIcon", void 0);
    return AgPickerField;
}(AgAbstractField));
export { AgPickerField };
