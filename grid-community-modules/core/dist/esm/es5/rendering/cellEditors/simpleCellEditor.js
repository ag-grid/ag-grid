var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { isBrowserSafari } from "../../utils/browser";
import { KeyCode } from '../../constants/keyCode';
var SimpleCellEditor = /** @class */ (function (_super) {
    __extends(SimpleCellEditor, _super);
    function SimpleCellEditor(cellEditorInput) {
        var _this = _super.call(this, /* html */ "\n            <div class=\"ag-cell-edit-wrapper\">\n                ".concat(cellEditorInput.getTemplate(), "\n            </div>")) || this;
        _this.cellEditorInput = cellEditorInput;
        return _this;
    }
    SimpleCellEditor.prototype.init = function (params) {
        this.params = params;
        var eInput = this.eInput;
        this.cellEditorInput.init(eInput, params);
        var startValue;
        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {
            this.focusAfterAttached = true;
            var eventKey = params.eventKey;
            if (eventKey === KeyCode.BACKSPACE || params.eventKey === KeyCode.DELETE) {
                startValue = '';
            }
            else if (eventKey && eventKey.length === 1) {
                startValue = eventKey;
            }
            else {
                startValue = this.cellEditorInput.getStartValue();
                if (eventKey !== KeyCode.F2) {
                    this.highlightAllOnFocus = true;
                }
            }
        }
        else {
            this.focusAfterAttached = false;
            startValue = this.cellEditorInput.getStartValue();
        }
        if (startValue != null) {
            eInput.setStartValue(startValue);
        }
        this.addManagedListener(eInput.getGui(), 'keydown', function (event) {
            var key = event.key;
            if (key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    };
    SimpleCellEditor.prototype.afterGuiAttached = function () {
        var _a, _b;
        var translate = this.localeService.getLocaleTextFunc();
        var eInput = this.eInput;
        eInput.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));
        if (!this.focusAfterAttached) {
            return;
        }
        // Added for AG-3238. We can't remove this explicit focus() because Chrome requires an input
        // to be focused before setSelectionRange will work. But it triggers a bug in Safari where
        // explicitly focusing then blurring an empty field will cause the parent container to scroll.
        if (!isBrowserSafari()) {
            eInput.getFocusableElement().focus();
        }
        var inputEl = eInput.getInputElement();
        if (this.highlightAllOnFocus) {
            inputEl.select();
        }
        else {
            (_b = (_a = this.cellEditorInput).setCaret) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
    };
    // gets called when tabbing through cells and in full row edit mode
    SimpleCellEditor.prototype.focusIn = function () {
        var eInput = this.eInput;
        var focusEl = eInput.getFocusableElement();
        var inputEl = eInput.getInputElement();
        focusEl.focus();
        inputEl.select();
    };
    SimpleCellEditor.prototype.getValue = function () {
        return this.cellEditorInput.getValue();
    };
    SimpleCellEditor.prototype.isPopup = function () {
        return false;
    };
    __decorate([
        RefSelector('eInput')
    ], SimpleCellEditor.prototype, "eInput", void 0);
    return SimpleCellEditor;
}(PopupComponent));
export { SimpleCellEditor };
