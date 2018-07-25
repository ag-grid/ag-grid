/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
        this.params = params;
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
                startValue = this.getStartValue(params);
                if (params.keyPress !== constants_1.Constants.KEY_F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        }
        else {
            this.focusAfterAttached = false;
            startValue = this.getStartValue(params);
        }
        if (utils_1.Utils.exists(startValue)) {
            eInput.value = startValue;
        }
        this.addDestroyableEventListener(eInput, 'keydown', function (event) {
            var isNavigationKey = event.keyCode === constants_1.Constants.KEY_LEFT
                || event.keyCode === constants_1.Constants.KEY_RIGHT
                || event.keyCode === constants_1.Constants.KEY_UP
                || event.keyCode === constants_1.Constants.KEY_DOWN
                || event.keyCode === constants_1.Constants.KEY_PAGE_DOWN
                || event.keyCode === constants_1.Constants.KEY_PAGE_UP
                || event.keyCode === constants_1.Constants.KEY_PAGE_HOME
                || event.keyCode === constants_1.Constants.KEY_PAGE_END;
            if (isNavigationKey) {
                // this stops the grid from executing keyboard navigation
                event.stopPropagation();
                // this stops the browser from scrolling up / down
                var pageUp = event.keyCode === constants_1.Constants.KEY_PAGE_UP;
                var pageDown = event.keyCode === constants_1.Constants.KEY_PAGE_DOWN;
                if (pageUp || pageDown) {
                    event.preventDefault();
                }
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
            var length_1 = eInput.value ? eInput.value.length : 0;
            if (length_1 > 0) {
                eInput.setSelectionRange(length_1, length_1);
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
        return this.params.parseValue(eInput.value);
    };
    TextCellEditor.prototype.getStartValue = function (params) {
        var formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : params.value;
    };
    TextCellEditor.TEMPLATE = '<input class="ag-cell-edit-input" type="text"/>';
    return TextCellEditor;
}(component_1.Component));
exports.TextCellEditor = TextCellEditor;
