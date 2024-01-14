"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHeaderCellCtrl = void 0;
const beanStub_1 = require("../../../context/beanStub");
const context_1 = require("../../../context/context");
const keyboard_1 = require("../../../utils/keyboard");
const keyCode_1 = require("../.././../constants/keyCode");
const direction_1 = require("../../../constants/direction");
const cssClassApplier_1 = require("../cssClassApplier");
const aria_1 = require("../../../utils/aria");
const eventKeys_1 = require("../../../eventKeys");
let instanceIdSequence = 0;
class AbstractHeaderCellCtrl extends beanStub_1.BeanStub {
    constructor(columnGroupChild, parentRowCtrl) {
        super();
        this.resizeToggleTimeout = 0;
        this.resizeMultiplier = 1;
        this.resizeFeature = null;
        this.lastFocusEvent = null;
        this.dragSource = null;
        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }
    shouldStopEventPropagation(e) {
        const { headerRowIndex, column } = this.focusService.getFocusedHeader();
        return (0, keyboard_1.isUserSuppressingHeaderKeyboardEvent)(this.gridOptionsService, e, headerRowIndex, column);
    }
    getWrapperHasFocus() {
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;
        return activeEl === this.eGui;
    }
    setGui(eGui) {
        this.eGui = eGui;
        this.addDomData();
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.onDisplayedColumnsChanged();
    }
    onDisplayedColumnsChanged() {
        if (!this.comp || !this.column) {
            return;
        }
        this.refreshFirstAndLastStyles();
        this.refreshAriaColIndex();
    }
    refreshFirstAndLastStyles() {
        const { comp, column, beans } = this;
        cssClassApplier_1.CssClassApplier.refreshFirstAndLastStyles(comp, column, beans.columnModel);
    }
    refreshAriaColIndex() {
        const { beans, column } = this;
        const colIdx = beans.columnModel.getAriaColumnIndex(column);
        (0, aria_1.setAriaColIndex)(this.eGui, colIdx); // for react, we don't use JSX, as it slowed down column moving
    }
    addResizeAndMoveKeyboardListeners() {
        if (!this.resizeFeature) {
            return;
        }
        this.addManagedListener(this.eGui, 'keydown', this.onGuiKeyDown.bind(this));
        this.addManagedListener(this.eGui, 'keyup', this.onGuiKeyUp.bind(this));
    }
    onGuiKeyDown(e) {
        var _a;
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;
        const isLeftOrRight = e.key === keyCode_1.KeyCode.LEFT || e.key === keyCode_1.KeyCode.RIGHT;
        if (this.isResizing) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
        if (
        // if elements within the header are focused, we don't process the event
        activeEl !== this.eGui ||
            // if shiftKey and altKey are not pressed, it's cell navigation so we don't process the event
            (!e.shiftKey && !e.altKey)) {
            return;
        }
        if (this.isResizing || isLeftOrRight) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
        if (!isLeftOrRight) {
            return;
        }
        const isLeft = (e.key === keyCode_1.KeyCode.LEFT) !== this.gridOptionsService.get('enableRtl');
        const direction = direction_1.HorizontalDirection[isLeft ? 'Left' : 'Right'];
        if (e.altKey) {
            this.isResizing = true;
            this.resizeMultiplier += 1;
            this.resizeHeader(direction, e.shiftKey);
            (_a = this.resizeFeature) === null || _a === void 0 ? void 0 : _a.toggleColumnResizing(true);
        }
        else {
            this.moveHeader(direction);
        }
    }
    onGuiKeyUp() {
        if (!this.isResizing) {
            return;
        }
        if (this.resizeToggleTimeout) {
            window.clearTimeout(this.resizeToggleTimeout);
            this.resizeToggleTimeout = 0;
        }
        this.isResizing = false;
        this.resizeMultiplier = 1;
        this.resizeToggleTimeout = setTimeout(() => {
            var _a;
            (_a = this.resizeFeature) === null || _a === void 0 ? void 0 : _a.toggleColumnResizing(false);
        }, 150);
    }
    handleKeyDown(e) {
        const wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case keyCode_1.KeyCode.PAGE_DOWN:
            case keyCode_1.KeyCode.PAGE_UP:
            case keyCode_1.KeyCode.PAGE_HOME:
            case keyCode_1.KeyCode.PAGE_END:
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
    removeDragSource() {
        if (this.dragSource) {
            this.dragAndDropService.removeDragSource(this.dragSource);
            this.dragSource = null;
        }
    }
    destroy() {
        super.destroy();
        this.removeDragSource();
        this.comp = null;
        this.column = null;
        this.resizeFeature = null;
        this.lastFocusEvent = null;
        this.columnGroupChild = null;
        this.parentRowCtrl = null;
        this.eGui = null;
    }
}
AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL = 'headerCtrl';
__decorate([
    (0, context_1.Autowired)('focusService')
], AbstractHeaderCellCtrl.prototype, "focusService", void 0);
__decorate([
    (0, context_1.Autowired)('beans')
], AbstractHeaderCellCtrl.prototype, "beans", void 0);
__decorate([
    (0, context_1.Autowired)('userComponentFactory')
], AbstractHeaderCellCtrl.prototype, "userComponentFactory", void 0);
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], AbstractHeaderCellCtrl.prototype, "ctrlsService", void 0);
__decorate([
    (0, context_1.Autowired)('dragAndDropService')
], AbstractHeaderCellCtrl.prototype, "dragAndDropService", void 0);
exports.AbstractHeaderCellCtrl = AbstractHeaderCellCtrl;
