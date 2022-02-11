/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const beanStub_1 = require("../../../context/beanStub");
const context_1 = require("../../../context/context");
const keyboard_1 = require("../../../utils/keyboard");
let instanceIdSequence = 0;
class AbstractHeaderCellCtrl extends beanStub_1.BeanStub {
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
        return keyboard_1.isUserSuppressingHeaderKeyboardEvent(this.gridOptionsWrapper, e, headerRowIndex, column);
    }
    setGui(eGui) {
        this.eGui = eGui;
        this.addDomData();
    }
    addDomData() {
        const key = AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL;
        this.gridOptionsWrapper.setDomData(this.eGui, key, this);
        this.addDestroyFunc(() => this.gridOptionsWrapper.setDomData(this.eGui, key, null));
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
    context_1.Autowired('focusService')
], AbstractHeaderCellCtrl.prototype, "focusService", void 0);
exports.AbstractHeaderCellCtrl = AbstractHeaderCellCtrl;

//# sourceMappingURL=abstractHeaderCellCtrl.js.map
