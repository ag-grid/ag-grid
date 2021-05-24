/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var popupComponent_1 = require("../../widgets/popupComponent");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var generic_1 = require("../../utils/generic");
var keyCode_1 = require("../../constants/keyCode");
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
        if (generic_1.exists(params.value)) {
            this.eTextArea.setValue(params.value.toString(), true);
        }
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
    };
    LargeTextCellEditor.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        if (key === keyCode_1.KeyCode.LEFT ||
            key === keyCode_1.KeyCode.UP ||
            key === keyCode_1.KeyCode.RIGHT ||
            key === keyCode_1.KeyCode.DOWN ||
            (event.shiftKey && key === keyCode_1.KeyCode.ENTER)) { // shift+enter allows for newlines
            event.stopPropagation();
        }
    };
    LargeTextCellEditor.prototype.afterGuiAttached = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eTextArea.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));
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
