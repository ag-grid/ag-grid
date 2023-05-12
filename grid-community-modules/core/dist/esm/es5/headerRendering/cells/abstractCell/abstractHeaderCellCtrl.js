/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard";
import { KeyCode } from "../.././../constants/keyCode";
var instanceIdSequence = 0;
var AbstractHeaderCellCtrl = /** @class */ (function (_super) {
    __extends(AbstractHeaderCellCtrl, _super);
    function AbstractHeaderCellCtrl(columnGroupChild, parentRowCtrl) {
        var _this = _super.call(this) || this;
        _this.lastFocusEvent = null;
        _this.columnGroupChild = columnGroupChild;
        _this.parentRowCtrl = parentRowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        _this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
        return _this;
    }
    AbstractHeaderCellCtrl.prototype.shouldStopEventPropagation = function (e) {
        var _a = this.focusService.getFocusedHeader(), headerRowIndex = _a.headerRowIndex, column = _a.column;
        return isUserSuppressingHeaderKeyboardEvent(this.gridOptionsService, e, headerRowIndex, column);
    };
    AbstractHeaderCellCtrl.prototype.getWrapperHasFocus = function () {
        var eDocument = this.gridOptionsService.getDocument();
        var activeEl = eDocument.activeElement;
        return activeEl === this.eGui;
    };
    AbstractHeaderCellCtrl.prototype.setGui = function (eGui) {
        this.eGui = eGui;
        this.addDomData();
    };
    AbstractHeaderCellCtrl.prototype.handleKeyDown = function (e) {
        var wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case KeyCode.PAGE_DOWN:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                if (wrapperHasFocus) {
                    e.preventDefault();
                }
        }
    };
    AbstractHeaderCellCtrl.prototype.addDomData = function () {
        var _this = this;
        var key = AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL;
        this.gridOptionsService.setDomData(this.eGui, key, this);
        this.addDestroyFunc(function () { return _this.gridOptionsService.setDomData(_this.eGui, key, null); });
    };
    AbstractHeaderCellCtrl.prototype.getGui = function () {
        return this.eGui;
    };
    AbstractHeaderCellCtrl.prototype.focus = function (event) {
        if (!this.eGui) {
            return false;
        }
        this.lastFocusEvent = event || null;
        this.eGui.focus();
        return true;
    };
    AbstractHeaderCellCtrl.prototype.getRowIndex = function () {
        return this.parentRowCtrl.getRowIndex();
    };
    AbstractHeaderCellCtrl.prototype.getParentRowCtrl = function () {
        return this.parentRowCtrl;
    };
    AbstractHeaderCellCtrl.prototype.getPinned = function () {
        return this.parentRowCtrl.getPinned();
    };
    AbstractHeaderCellCtrl.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    AbstractHeaderCellCtrl.prototype.getColumnGroupChild = function () {
        return this.columnGroupChild;
    };
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
    return AbstractHeaderCellCtrl;
}(BeanStub));
export { AbstractHeaderCellCtrl };
