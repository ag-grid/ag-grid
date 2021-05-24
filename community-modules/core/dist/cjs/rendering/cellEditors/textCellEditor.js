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
var browser_1 = require("../../utils/browser");
var keyCode_1 = require("../../constants/keyCode");
var TextCellEditor = /** @class */ (function (_super) {
    __extends(TextCellEditor, _super);
    function TextCellEditor() {
        return _super.call(this, TextCellEditor.TEMPLATE) || this;
    }
    TextCellEditor.prototype.init = function (params) {
        this.params = params;
        var eInput = this.eInput;
        var startValue;
        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {
            this.focusAfterAttached = true;
            if (params.keyPress === keyCode_1.KeyCode.BACKSPACE || params.keyPress === keyCode_1.KeyCode.DELETE) {
                startValue = '';
            }
            else if (params.charPress) {
                startValue = params.charPress;
            }
            else {
                startValue = this.getStartValue(params);
                if (params.keyPress !== keyCode_1.KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        }
        else {
            this.focusAfterAttached = false;
            startValue = this.getStartValue(params);
        }
        if (startValue != null) {
            eInput.setValue(startValue, true);
        }
        this.addManagedListener(eInput.getGui(), 'keydown', function (event) {
            var keyCode = event.keyCode;
            if (keyCode === keyCode_1.KeyCode.PAGE_UP || keyCode === keyCode_1.KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    };
    TextCellEditor.prototype.afterGuiAttached = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var eInput = this.eInput;
        eInput.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));
        if (!this.focusAfterAttached) {
            return;
        }
        // Added for AG-3238. We can't remove this explicit focus() because Chrome requires an input
        // to be focused before setSelectionRange will work. But it triggers a bug in Safari where
        // explicitly focusing then blurring an empty field will cause the parent container to scroll.
        if (!browser_1.isBrowserSafari()) {
            eInput.getFocusableElement().focus();
        }
        var inputEl = eInput.getInputElement();
        if (this.highlightAllOnFocus) {
            inputEl.select();
        }
        else {
            // when we started editing, we want the caret at the end, not the start.
            // this comes into play in two scenarios: a) when user hits F2 and b)
            // when user hits a printable character, then on IE (and only IE) the caret
            // was placed after the first character, thus 'apply' would end up as 'pplea'
            var value = eInput.getValue();
            var len = (generic_1.exists(value) && value.length) || 0;
            if (len) {
                inputEl.setSelectionRange(len, len);
            }
        }
    };
    // gets called when tabbing trough cells and in full row edit mode
    TextCellEditor.prototype.focusIn = function () {
        var eInput = this.eInput;
        var focusEl = eInput.getFocusableElement();
        var inputEl = eInput.getInputElement();
        focusEl.focus();
        inputEl.select();
    };
    TextCellEditor.prototype.focusOut = function () {
        var inputEl = this.eInput.getInputElement();
        if (browser_1.isBrowserIE()) {
            inputEl.setSelectionRange(0, 0);
        }
    };
    TextCellEditor.prototype.getValue = function () {
        var eInput = this.eInput;
        return this.params.parseValue(eInput.getValue());
    };
    TextCellEditor.prototype.getStartValue = function (params) {
        var formatValue = params.useFormatter || params.column.getColDef().refData;
        return formatValue ? params.formatValue(params.value) : params.value;
    };
    TextCellEditor.prototype.isPopup = function () {
        return false;
    };
    TextCellEditor.TEMPLATE = '<div class="ag-cell-edit-wrapper"><ag-input-text-field class="ag-cell-editor" ref="eInput"></ag-input-text-field></div>';
    __decorate([
        componentAnnotations_1.RefSelector('eInput')
    ], TextCellEditor.prototype, "eInput", void 0);
    return TextCellEditor;
}(popupComponent_1.PopupComponent));
exports.TextCellEditor = TextCellEditor;

//# sourceMappingURL=textCellEditor.js.map
