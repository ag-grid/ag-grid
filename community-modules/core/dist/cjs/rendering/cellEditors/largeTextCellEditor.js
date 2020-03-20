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
var constants_1 = require("../../constants");
var popupComponent_1 = require("../../widgets/popupComponent");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var utils_1 = require("../../utils");
var LargeTextCellEditor = /** @class */ (function (_super) {
    __extends(LargeTextCellEditor, _super);
    function LargeTextCellEditor() {
        return _super.call(this, LargeTextCellEditor.TEMPLATE) || this;
    }
    LargeTextCellEditor.prototype.init = function (params) {
        this.params = params;
        this.focusAfterAttached = params.cellStartedEdit;
        this.eTextArea
            .setMaxLength(params.maxLength || 200)
            .setCols(params.cols || 60)
            .setRows(params.rows || 10);
        if (utils_1._.exists(params.value)) {
            this.eTextArea.setValue(params.value.toString(), true);
        }
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
    };
    LargeTextCellEditor.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        if (key == constants_1.Constants.KEY_LEFT ||
            key == constants_1.Constants.KEY_UP ||
            key == constants_1.Constants.KEY_RIGHT ||
            key == constants_1.Constants.KEY_DOWN ||
            (event.shiftKey && key == constants_1.Constants.KEY_ENTER)) { // shift+enter allows for newlines
            event.stopPropagation();
        }
    };
    LargeTextCellEditor.prototype.afterGuiAttached = function () {
        if (this.focusAfterAttached) {
            this.eTextArea.getFocusableElement().focus();
        }
    };
    LargeTextCellEditor.prototype.getValue = function () {
        return this.params.parseValue(this.eTextArea.getValue());
    };
    LargeTextCellEditor.TEMPLATE = "<div class=\"ag-large-text\" tabindex=\"0\">\n            <ag-input-text-area ref=\"eTextArea\" class=\"ag-large-text-input\"></ag-input-text-area>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector("eTextArea")
    ], LargeTextCellEditor.prototype, "eTextArea", void 0);
    return LargeTextCellEditor;
}(popupComponent_1.PopupComponent));
exports.LargeTextCellEditor = LargeTextCellEditor;

//# sourceMappingURL=largeTextCellEditor.js.map
