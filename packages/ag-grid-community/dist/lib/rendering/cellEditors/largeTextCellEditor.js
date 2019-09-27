/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var popupComponent_1 = require("../../widgets/popupComponent");
var constants_1 = require("../../constants");
var utils_1 = require("../../utils");
var LargeTextCellEditor = /** @class */ (function (_super) {
    __extends(LargeTextCellEditor, _super);
    function LargeTextCellEditor() {
        return _super.call(this, LargeTextCellEditor.TEMPLATE) || this;
    }
    LargeTextCellEditor.prototype.init = function (params) {
        this.params = params;
        this.focusAfterAttached = params.cellStartedEdit;
        this.textarea = document.createElement("textarea");
        this.textarea.maxLength = params.maxLength ? params.maxLength : "200";
        this.textarea.cols = params.cols ? params.cols : "60";
        this.textarea.rows = params.rows ? params.rows : "10";
        if (utils_1._.exists(params.value)) {
            this.textarea.value = params.value.toString();
        }
        this.getGui().querySelector('.ag-large-textarea').appendChild(this.textarea);
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
            this.textarea.focus();
        }
    };
    LargeTextCellEditor.prototype.getValue = function () {
        return this.params.parseValue(this.textarea.value);
    };
    LargeTextCellEditor.TEMPLATE = 
    // tab index is needed so we can focus, which is needed for keyboard events
    '<div class="ag-large-text" tabindex="0">' +
        '<div class="ag-large-textarea"></div>' +
        '</div>';
    return LargeTextCellEditor;
}(popupComponent_1.PopupComponent));
exports.LargeTextCellEditor = LargeTextCellEditor;
