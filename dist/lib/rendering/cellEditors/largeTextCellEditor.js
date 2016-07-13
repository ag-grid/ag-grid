/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("../../widgets/component");
var constants_1 = require("../../constants");
var LargeTextCellEditor = (function (_super) {
    __extends(LargeTextCellEditor, _super);
    function LargeTextCellEditor() {
        _super.call(this, LargeTextCellEditor.TEMPLATE);
    }
    LargeTextCellEditor.prototype.init = function (params) {
        this.params = params;
        this.textarea = document.createElement("textarea");
        this.textarea.maxLength = params.maxLength ? params.maxLength : "200";
        this.textarea.cols = params.cols ? params.cols : "60";
        this.textarea.rows = params.rows ? params.rows : "10";
        this.textarea.value = params.value;
        this.getGui().querySelector('.ag-large-textarea').appendChild(this.textarea);
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
    };
    LargeTextCellEditor.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        if (key == constants_1.Constants.KEY_LEFT ||
            key == constants_1.Constants.KEY_UP ||
            key == constants_1.Constants.KEY_RIGHT ||
            key == constants_1.Constants.KEY_DOWN ||
            (event.shiftKey && key == constants_1.Constants.KEY_ENTER)) {
            event.stopPropagation();
        }
    };
    LargeTextCellEditor.prototype.afterGuiAttached = function () {
        this.textarea.focus();
    };
    LargeTextCellEditor.prototype.getValue = function () {
        return this.textarea.value;
    };
    LargeTextCellEditor.prototype.isPopup = function () {
        return true;
    };
    LargeTextCellEditor.TEMPLATE = 
    // tab index is needed so we can focus, which is needed for keyboard events
    '<div class="ag-large-text" tabindex="0">' +
        '<div class="ag-large-textarea"></div>' +
        '</div>';
    return LargeTextCellEditor;
})(component_1.Component);
exports.LargeTextCellEditor = LargeTextCellEditor;
