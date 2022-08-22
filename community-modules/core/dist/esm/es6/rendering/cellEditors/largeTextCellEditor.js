/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PopupComponent } from "../../widgets/popupComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { exists } from "../../utils/generic";
import { KeyCode } from '../../constants/keyCode';
export class LargeTextCellEditor extends PopupComponent {
    constructor() {
        super(LargeTextCellEditor.TEMPLATE);
    }
    init(params) {
        this.params = params;
        this.focusAfterAttached = params.cellStartedEdit;
        this.eTextArea
            .setMaxLength(params.maxLength || 200)
            .setCols(params.cols || 60)
            .setRows(params.rows || 10);
        if (exists(params.value)) {
            this.eTextArea.setValue(params.value.toString(), true);
        }
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
    }
    onKeyDown(event) {
        const key = event.key;
        if (key === KeyCode.LEFT ||
            key === KeyCode.UP ||
            key === KeyCode.RIGHT ||
            key === KeyCode.DOWN ||
            (event.shiftKey && key === KeyCode.ENTER)) { // shift+enter allows for newlines
            event.stopPropagation();
        }
    }
    afterGuiAttached() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eTextArea.setInputAriaLabel(translate('ariaInputEditor', 'Input Editor'));
        if (this.focusAfterAttached) {
            this.eTextArea.getFocusableElement().focus();
        }
    }
    getValue() {
        return this.params.parseValue(this.eTextArea.getValue());
    }
}
LargeTextCellEditor.TEMPLATE = `<div class="ag-large-text" tabindex="0">
            <ag-input-text-area ref="eTextArea" class="ag-large-text-input"></ag-input-text-area>
        </div>`;
__decorate([
    RefSelector("eTextArea")
], LargeTextCellEditor.prototype, "eTextArea", void 0);
