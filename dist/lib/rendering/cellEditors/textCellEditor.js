/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../constants");
var component_1 = require("../../widgets/component");
var utils_1 = require("../../utils");
var TextCellEditor = (function (_super) {
    __extends(TextCellEditor, _super);
    function TextCellEditor() {
        return _super.call(this, TextCellEditor.TEMPLATE) || this;
    }
    TextCellEditor.prototype.init = function (params) {
        var eInput = this.getGui();
        var startValue;
        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {
            this.focusAfterAttached = true;
            var keyPressBackspaceOrDelete = params.keyPress === constants_1.Constants.KEY_BACKSPACE
                || params.keyPress === constants_1.Constants.KEY_DELETE;
            if (keyPressBackspaceOrDelete) {
                startValue = '';
            }
            else if (params.charPress) {
                startValue = params.charPress;
            }
            else {
                startValue = params.value;
                if (params.keyPress !== constants_1.Constants.KEY_F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        }
        else {
            this.focusAfterAttached = false;
            startValue = params.value;
        }
        if (utils_1.Utils.exists(startValue)) {
            eInput.value = startValue;
        }
        this.addDestroyableEventListener(eInput, 'keydown', function (event) {
            var isNavigationKey = event.keyCode === constants_1.Constants.KEY_LEFT || event.keyCode === constants_1.Constants.KEY_RIGHT;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });
    };
    TextCellEditor.prototype.afterGuiAttached = function () {
        if (!this.focusAfterAttached) {
            return;
        }
        var eInput = this.getGui();
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        }
        else {
            // when we started editing, we want the carot at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the carot
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            var length = eInput.value ? eInput.value.length : 0;
            if (length > 0) {
                eInput.setSelectionRange(length, length);
            }
        }
    };
    // gets called when tabbing trough cells and in full row edit mode
    TextCellEditor.prototype.focusIn = function () {
        var eInput = this.getGui();
        eInput.focus();
        eInput.select();
    };
    TextCellEditor.prototype.getValue = function () {
        var eInput = this.getGui();
        return eInput.value;
    };
    return TextCellEditor;
}(component_1.Component));
TextCellEditor.TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';
exports.TextCellEditor = TextCellEditor;
