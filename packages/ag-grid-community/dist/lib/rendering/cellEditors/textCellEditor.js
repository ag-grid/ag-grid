/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var constants_1 = require("../../constants");
var popupComponent_1 = require("../../widgets/popupComponent");
var utils_1 = require("../../utils");
var TextCellEditor = /** @class */ (function (_super) {
    __extends(TextCellEditor, _super);
    function TextCellEditor() {
        var _this = _super.call(this, TextCellEditor.TEMPLATE) || this;
        _this.eInput = _this.getGui().querySelector('input');
        return _this;
    }
    TextCellEditor.prototype.init = function (params) {
        this.params = params;
        var eInput = this.eInput;
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
        if (utils_1._.exists(startValue)) {
            eInput.value = startValue;
        }
        this.addDestroyableEventListener(eInput, 'keydown', function (event) {
            var pageUp = event.keyCode === constants_1.Constants.KEY_PAGE_UP;
            var pageDown = event.keyCode === constants_1.Constants.KEY_PAGE_DOWN;
            if (pageUp || pageDown) {
                event.preventDefault();
            }
        });
    };
    TextCellEditor.prototype.afterGuiAttached = function () {
        if (!this.focusAfterAttached) {
            return;
        }
        var eInput = this.eInput;
        eInput.focus();
        if (this.highlightAllOnFocus) {
            eInput.select();
        }
        else {
            // when we started editing, we want the caret at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the caret
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            var length_1 = eInput.value ? eInput.value.length : 0;
            if (length_1 > 0) {
                eInput.setSelectionRange(length_1, length_1);
            }
        }
    };
    // gets called when tabbing trough cells and in full row edit mode
    TextCellEditor.prototype.focusIn = function () {
        var eInput = this.eInput;
        eInput.focus();
        eInput.select();
    };
    TextCellEditor.prototype.getValue = function () {
        var eInput = this.eInput;
        return this.params.parseValue(eInput.value);
    };
    TextCellEditor.prototype.getStartValue = function (params) {
        var formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : params.value;
    };
    TextCellEditor.prototype.isPopup = function () {
        return false;
    };
    TextCellEditor.TEMPLATE = '<div class="ag-input-wrapper" role="presentation"><input class="ag-cell-edit-input" type="text"/></div>';
    return TextCellEditor;
}(popupComponent_1.PopupComponent));
exports.TextCellEditor = TextCellEditor;
