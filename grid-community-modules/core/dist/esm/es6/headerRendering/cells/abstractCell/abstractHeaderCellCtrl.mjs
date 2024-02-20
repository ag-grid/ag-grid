var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../../context/beanStub.mjs";
import { Autowired, PostConstruct } from "../../../context/context.mjs";
import { isUserSuppressingHeaderKeyboardEvent } from "../../../utils/keyboard.mjs";
import { KeyCode } from "../.././../constants/keyCode.mjs";
import { Column } from "../../../entities/column.mjs";
import { HorizontalDirection } from "../../../constants/direction.mjs";
import { CssClassApplier } from "../cssClassApplier.mjs";
import { setAriaColIndex } from "../../../utils/aria.mjs";
import { Events } from "../../../eventKeys.mjs";
import { getInnerWidth } from "../../../utils/dom.mjs";
let instanceIdSequence = 0;
export class AbstractHeaderCellCtrl extends BeanStub {
    constructor(columnGroupChild, beans, parentRowCtrl) {
        super();
        this.resizeToggleTimeout = 0;
        this.resizeMultiplier = 1;
        this.resizeFeature = null;
        this.lastFocusEvent = null;
        this.dragSource = null;
        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;
        this.beans = beans;
        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }
    postConstruct() {
        this.addManagedPropertyListeners(['suppressHeaderFocus'], () => this.refreshTabIndex());
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
        this.addManagedListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.onDisplayedColumnsChanged();
        this.refreshTabIndex();
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
        CssClassApplier.refreshFirstAndLastStyles(comp, column, beans.columnModel);
    }
    refreshAriaColIndex() {
        const { beans, column } = this;
        const colIdx = beans.columnModel.getAriaColumnIndex(column);
        setAriaColIndex(this.eGui, colIdx); // for react, we don't use JSX, as it slowed down column moving
    }
    addResizeAndMoveKeyboardListeners() {
        if (!this.resizeFeature) {
            return;
        }
        this.addManagedListener(this.eGui, 'keydown', this.onGuiKeyDown.bind(this));
        this.addManagedListener(this.eGui, 'keyup', this.onGuiKeyUp.bind(this));
    }
    refreshTabIndex() {
        const suppressHeaderFocus = this.gridOptionsService.get('suppressHeaderFocus');
        if (suppressHeaderFocus) {
            this.eGui.removeAttribute('tabindex');
        }
        else {
            this.eGui.setAttribute('tabindex', '-1');
        }
    }
    onGuiKeyDown(e) {
        var _a;
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;
        const isLeftOrRight = e.key === KeyCode.LEFT || e.key === KeyCode.RIGHT;
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
        const isLeft = (e.key === KeyCode.LEFT) !== this.gridOptionsService.get('enableRtl');
        const direction = HorizontalDirection[isLeft ? 'Left' : 'Right'];
        if (e.altKey) {
            this.isResizing = true;
            this.resizeMultiplier += 1;
            const diff = this.getViewportAdjustedResizeDiff(e);
            this.resizeHeader(diff, e.shiftKey);
            (_a = this.resizeFeature) === null || _a === void 0 ? void 0 : _a.toggleColumnResizing(true);
        }
        else {
            this.moveHeader(direction);
        }
    }
    getViewportAdjustedResizeDiff(e) {
        let diff = this.getResizeDiff(e);
        const pinned = this.column.getPinned();
        if (pinned) {
            const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
            const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
            const bodyWidth = getInnerWidth(this.ctrlsService.getGridBodyCtrl().getBodyViewportElement()) - 50;
            if (leftWidth + rightWidth + diff > bodyWidth) {
                if (bodyWidth > leftWidth + rightWidth) {
                    // allow body width to ignore resize multiplier and fill space for last tick
                    diff = bodyWidth - leftWidth - rightWidth;
                }
                else {
                    return 0;
                }
            }
        }
        return diff;
    }
    getResizeDiff(e) {
        let isLeft = (e.key === KeyCode.LEFT) !== this.gridOptionsService.get('enableRtl');
        const pinned = this.column.getPinned();
        const isRtl = this.gridOptionsService.get('enableRtl');
        if (pinned) {
            if (isRtl !== (pinned === 'right')) {
                isLeft = !isLeft;
            }
        }
        return (isLeft ? -1 : 1) * this.resizeMultiplier;
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
    removeDragSource() {
        if (this.dragSource) {
            this.dragAndDropService.removeDragSource(this.dragSource);
            this.dragSource = null;
        }
    }
    handleContextMenuMouseEvent(mouseEvent, touchEvent, column) {
        const event = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent;
        if (this.gridOptionsService.get('preventDefaultOnContextMenu')) {
            event.preventDefault();
        }
        const columnToUse = column instanceof Column ? column : undefined;
        if (this.menuService.isHeaderContextMenuEnabled(columnToUse)) {
            this.menuService.showHeaderContextMenu(columnToUse, mouseEvent, touchEvent);
        }
        this.dispatchColumnMouseEvent(Events.EVENT_COLUMN_HEADER_CONTEXT_MENU, column);
    }
    dispatchColumnMouseEvent(eventType, column) {
        const event = {
            type: eventType,
            column,
        };
        this.eventService.dispatchEvent(event);
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
    Autowired('pinnedWidthService')
], AbstractHeaderCellCtrl.prototype, "pinnedWidthService", void 0);
__decorate([
    Autowired('focusService')
], AbstractHeaderCellCtrl.prototype, "focusService", void 0);
__decorate([
    Autowired('userComponentFactory')
], AbstractHeaderCellCtrl.prototype, "userComponentFactory", void 0);
__decorate([
    Autowired('ctrlsService')
], AbstractHeaderCellCtrl.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('dragAndDropService')
], AbstractHeaderCellCtrl.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('menuService')
], AbstractHeaderCellCtrl.prototype, "menuService", void 0);
__decorate([
    PostConstruct
], AbstractHeaderCellCtrl.prototype, "postConstruct", null);
