/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
import { isUserSuppressingKeyboardEvent } from "../../utils/keyboard";
import { PostConstruct } from "../../context/context";
export class PopupEditorWrapper extends PopupComponent {
    constructor(params) {
        super(/* html */ `<div class="ag-popup-editor" tabindex="-1"/>`);
        this.params = params;
    }
    postConstruct() {
        this.gridOptionsWrapper.setDomData(this.getGui(), PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER, true);
        this.addKeyDownListener();
    }
    addKeyDownListener() {
        const eGui = this.getGui();
        const params = this.params;
        const listener = (event) => {
            if (!isUserSuppressingKeyboardEvent(this.gridOptionsWrapper, event, params.node, params.column, true)) {
                params.onKeyDown(event);
            }
        };
        this.addManagedListener(eGui, 'keydown', listener);
    }
}
PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER = 'popupEditorWrapper';
__decorate([
    PostConstruct
], PopupEditorWrapper.prototype, "postConstruct", null);
