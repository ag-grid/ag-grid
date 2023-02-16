/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { KeyCode } from "../.././../constants/keyCode";
let instanceIdSequence = 0;
export class AbstractHeaderCellCtrl extends BeanStub {
    constructor(columnGroupChild, parentRowCtrl) {
        super();
        this.lastFocusEvent = null;
        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }
    shouldStopEventPropagation(e) {
        const { headerRowIndex, column } = this.focusService.getFocusedHeader();
        return isUserSuppressingHeaderKeyboardEvent(this.gridOptionsService, e, headerRowIndex, column);
    }
    getWrapperHasFocus() {
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;
        return activeEl === this.eGui;
    }
    setGui(eGui) {
        this.eGui = eGui;
        this.addDomData();
    }
    handleKeyDown(e) {
        const wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                if (wrapperHasFocus) {
                    e.preventDefault();
                }
        }
    }
    addDomData() {
        const key = AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL;
        this.gridOptionsService.setDomData(this.eGui, key, this);
        this.addDestroyFunc(() => this.gridOptionsService.setDomData(this.eGui, key, null));
    }
    getGui() {
        return this.eGui;
    }
    focus(event) {
        if (!this.eGui) {
            return false;
        }
        this.lastFocusEvent = event || null;
        this.eGui.focus();
        return true;
    }
    getRowIndex() {
        return this.parentRowCtrl.getRowIndex();
    }
    getParentRowCtrl() {
        return this.parentRowCtrl;
    }
    getPinned() {
        return this.parentRowCtrl.getPinned();
    }
    getInstanceId() {
        return this.instanceId;
    }
    getColumnGroupChild() {
        return this.columnGroupChild;
    }
}
AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL = 'headerCtrl';
__decorate([
    Autowired('focusService')
], AbstractHeaderCellCtrl.prototype, "focusService", void 0);
__decorate([
    Autowired('beans')
], AbstractHeaderCellCtrl.prototype, "beans", void 0);
__decorate([
    Autowired('userComponentFactory')
], AbstractHeaderCellCtrl.prototype, "userComponentFactory", void 0);
