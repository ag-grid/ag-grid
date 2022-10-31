/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../../events");
const browser_1 = require("../../utils/browser");
const dom_1 = require("../../utils/dom");
const event_1 = require("../../utils/event");
const beans_1 = require("../beans");
class CellMouseListenerFeature extends beans_1.Beans {
    constructor(ctrl, beans, column) {
        super();
        this.cellCtrl = ctrl;
        this.beans = beans;
        this.column = column;
    }
    onMouseEvent(eventName, mouseEvent) {
        if (event_1.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        switch (eventName) {
            case 'click':
                this.onCellClicked(mouseEvent);
                break;
            case 'mousedown':
            case 'touchstart':
                this.onMouseDown(mouseEvent);
                break;
            case 'dblclick':
                this.onCellDoubleClicked(mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(mouseEvent);
                break;
        }
    }
    onCellClicked(mouseEvent) {
        // iPad doesn't have double click - so we need to mimic it to enable editing for iPad.
        if (this.isDoubleClickOnIPad()) {
            this.onCellDoubleClicked(mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then iPad zooms in
            return;
        }
        const { eventService, rangeService, gridOptionsWrapper } = this.beans;
        const multiKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        if (rangeService && multiKeyPressed) {
            // the mousedown event has created the range already, so we only intersect if there is more than one
            // range on this cell
            if (rangeService.getCellRangeCount(this.cellCtrl.getCellPosition()) > 1) {
                rangeService.intersectLastRange(true);
            }
        }
        const cellClickedEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_CLICKED);
        eventService.dispatchEvent(cellClickedEvent);
        const colDef = this.column.getColDef();
        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            window.setTimeout(() => colDef.onCellClicked(cellClickedEvent), 0);
        }
        const editOnSingleClick = (gridOptionsWrapper.isSingleClickEdit() || colDef.singleClickEdit)
            && !gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.cellCtrl.startRowOrCellEdit();
        }
    }
    // returns true if on iPad and this is second 'click' event in 200ms
    isDoubleClickOnIPad() {
        if (!browser_1.isIOSUserAgent() || event_1.isEventSupported('dblclick')) {
            return false;
        }
        const nowMillis = new Date().getTime();
        const res = nowMillis - this.lastIPadMouseClickEvent < 200;
        this.lastIPadMouseClickEvent = nowMillis;
        return res;
    }
    onCellDoubleClicked(mouseEvent) {
        const colDef = this.column.getColDef();
        // always dispatch event to eventService
        const cellDoubleClickedEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_DOUBLE_CLICKED);
        this.beans.eventService.dispatchEvent(cellDoubleClickedEvent);
        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(() => colDef.onCellDoubleClicked(cellDoubleClickedEvent), 0);
        }
        const editOnDoubleClick = !this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.cellCtrl.startRowOrCellEdit(null, null, mouseEvent);
        }
    }
    onMouseDown(mouseEvent) {
        const { ctrlKey, metaKey, shiftKey } = mouseEvent;
        const target = mouseEvent.target;
        const { eventService, rangeService } = this.beans;
        // do not change the range for right-clicks inside an existing range
        if (this.isRightClickInExistingRange(mouseEvent)) {
            return;
        }
        const ranges = rangeService && rangeService.getCellRanges().length != 0;
        if (!shiftKey || !ranges) {
            // We only need to pass true to focusCell when the browser is IE/Edge/Safari and we are trying
            // to focus the cell itself. This should never be true if the mousedown was triggered
            // due to a click on a cell editor for example.
            const forceBrowserFocus = (browser_1.isBrowserEdge() || browser_1.isBrowserSafari()) && !this.cellCtrl.isEditing() && !dom_1.isFocusableFormField(target);
            this.cellCtrl.focusCell(forceBrowserFocus);
        }
        // if shift clicking, and a range exists, we keep the focus on the cell that started the
        // range as the user then changes the range selection.
        if (shiftKey && ranges) {
            // this stops the cell from getting focused
            mouseEvent.preventDefault();
        }
        // if we are clicking on a checkbox, we need to make sure the cell wrapping that checkbox
        // is focused but we don't want to change the range selection, so return here.
        if (this.containsWidget(target)) {
            return;
        }
        if (rangeService) {
            const thisCell = this.cellCtrl.getCellPosition();
            if (shiftKey) {
                rangeService.extendLatestRangeToCell(thisCell);
            }
            else {
                const ctrlKeyPressed = ctrlKey || metaKey;
                rangeService.setRangeToCell(thisCell, ctrlKeyPressed);
            }
        }
        eventService.dispatchEvent(this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_DOWN));
    }
    isRightClickInExistingRange(mouseEvent) {
        const { rangeService } = this.beans;
        if (rangeService) {
            const cellInRange = rangeService.isCellInAnyRange(this.cellCtrl.getCellPosition());
            if (cellInRange && mouseEvent.button === 2) {
                return true;
            }
        }
        return false;
    }
    containsWidget(target) {
        return dom_1.isElementChildOfClass(target, 'ag-selection-checkbox', 3);
    }
    onMouseOut(mouseEvent) {
        if (this.mouseStayingInsideCell(mouseEvent)) {
            return;
        }
        const cellMouseOutEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OUT);
        this.beans.eventService.dispatchEvent(cellMouseOutEvent);
        this.beans.columnHoverService.clearMouseOver();
    }
    onMouseOver(mouseEvent) {
        if (this.mouseStayingInsideCell(mouseEvent)) {
            return;
        }
        const cellMouseOverEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OVER);
        this.beans.eventService.dispatchEvent(cellMouseOverEvent);
        this.beans.columnHoverService.setMouseOver([this.column]);
    }
    mouseStayingInsideCell(e) {
        if (!e.target || !e.relatedTarget) {
            return false;
        }
        const eGui = this.cellCtrl.getGui();
        const cellContainsTarget = eGui.contains(e.target);
        const cellContainsRelatedTarget = eGui.contains(e.relatedTarget);
        return cellContainsTarget && cellContainsRelatedTarget;
    }
    destroy() {
    }
}
exports.CellMouseListenerFeature = CellMouseListenerFeature;
