var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PopupComponent } from "../../widgets/popupComponent.mjs";
import { RefSelector } from "../../widgets/componentAnnotations.mjs";
import { isBrowserSafari } from "../../utils/browser.mjs";
import { KeyCode } from '../../constants/keyCode.mjs';
export class SimpleCellEditor extends PopupComponent {
    constructor(cellEditorInput) {
        super(/* html */ `
            <div class="ag-cell-edit-wrapper">
                ${cellEditorInput.getTemplate()}
            </div>`);
        this.cellEditorInput = cellEditorInput;
    }
    init(params) {
        this.params = params;
        const eInput = this.eInput;
        this.cellEditorInput.init(eInput, params);
        let startValue;
        // cellStartedEdit is only false if we are doing fullRow editing
        if (params.cellStartedEdit) {
            this.focusAfterAttached = true;
            const eventKey = params.eventKey;
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
        this.addManagedListener(eInput.getGui(), 'keydown', (event) => {
            const { key } = event;
            if (key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN) {
                event.preventDefault();
            }
        });
    }
    afterGuiAttached() {
        var _a, _b;
        const translate = this.localeService.getLocaleTextFunc();
        const eInput = this.eInput;
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
        const inputEl = eInput.getInputElement();
        if (this.highlightAllOnFocus) {
            inputEl.select();
        }
        else {
            (_b = (_a = this.cellEditorInput).setCaret) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
    }
    // gets called when tabbing through cells and in full row edit mode
    focusIn() {
        const eInput = this.eInput;
        const focusEl = eInput.getFocusableElement();
        const inputEl = eInput.getInputElement();
        focusEl.focus();
        inputEl.select();
    }
    getValue() {
        return this.cellEditorInput.getValue();
    }
    isPopup() {
        return false;
    }
}
__decorate([
    RefSelector('eInput')
], SimpleCellEditor.prototype, "eInput", void 0);
