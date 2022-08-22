/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("../../events");
var browser_1 = require("../../utils/browser");
var dom_1 = require("../../utils/dom");
var event_1 = require("../../utils/event");
var beans_1 = require("../beans");
var CellMouseListenerFeature = /** @class */ (function (_super) {
    __extends(CellMouseListenerFeature, _super);
    function CellMouseListenerFeature(ctrl, beans, column) {
        var _this = _super.call(this) || this;
        _this.cellCtrl = ctrl;
        _this.beans = beans;
        _this.column = column;
        return _this;
    }
    CellMouseListenerFeature.prototype.onMouseEvent = function (eventName, mouseEvent) {
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
    };
    CellMouseListenerFeature.prototype.onCellClicked = function (mouseEvent) {
        // iPad doesn't have double click - so we need to mimic it to enable editing for iPad.
        if (this.isDoubleClickOnIPad()) {
            this.onCellDoubleClicked(mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then iPad zooms in
            return;
        }
        var _a = this.beans, eventService = _a.eventService, rangeService = _a.rangeService, gridOptionsWrapper = _a.gridOptionsWrapper;
        var multiKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        if (rangeService && multiKeyPressed) {
            // the mousedown event has created the range already, so we only intersect if there is more than one
            // range on this cell
            if (rangeService.getCellRangeCount(this.cellCtrl.getCellPosition()) > 1) {
                rangeService.intersectLastRange(true);
            }
        }
        var cellClickedEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_CLICKED);
        eventService.dispatchEvent(cellClickedEvent);
        var colDef = this.column.getColDef();
        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            window.setTimeout(function () { return colDef.onCellClicked(cellClickedEvent); }, 0);
        }
        var editOnSingleClick = (gridOptionsWrapper.isSingleClickEdit() || colDef.singleClickEdit)
            && !gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.cellCtrl.startRowOrCellEdit();
        }
    };
    // returns true if on iPad and this is second 'click' event in 200ms
    CellMouseListenerFeature.prototype.isDoubleClickOnIPad = function () {
        if (!browser_1.isIOSUserAgent() || event_1.isEventSupported('dblclick')) {
            return false;
        }
        var nowMillis = new Date().getTime();
        var res = nowMillis - this.lastIPadMouseClickEvent < 200;
        this.lastIPadMouseClickEvent = nowMillis;
        return res;
    };
    CellMouseListenerFeature.prototype.onCellDoubleClicked = function (mouseEvent) {
        var colDef = this.column.getColDef();
        // always dispatch event to eventService
        var cellDoubleClickedEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_DOUBLE_CLICKED);
        this.beans.eventService.dispatchEvent(cellDoubleClickedEvent);
        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            window.setTimeout(function () { return colDef.onCellDoubleClicked(cellDoubleClickedEvent); }, 0);
        }
        var editOnDoubleClick = !this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.cellCtrl.startRowOrCellEdit(null, null, mouseEvent);
        }
    };
    CellMouseListenerFeature.prototype.onMouseDown = function (mouseEvent) {
        var ctrlKey = mouseEvent.ctrlKey, metaKey = mouseEvent.metaKey, shiftKey = mouseEvent.shiftKey;
        var target = mouseEvent.target;
        var _a = this.beans, eventService = _a.eventService, rangeService = _a.rangeService;
        // do not change the range for right-clicks inside an existing range
        if (this.isRightClickInExistingRange(mouseEvent)) {
            return;
        }
        var ranges = rangeService && rangeService.getCellRanges().length != 0;
        if (!shiftKey || !ranges) {
            // We only need to pass true to focusCell when the browser is IE/Edge and we are trying
            // to focus the cell itself. This should never be true if the mousedown was triggered
            // due to a click on a cell editor for example.
            var forceBrowserFocus = (browser_1.isBrowserEdge()) && !this.cellCtrl.isEditing() && !dom_1.isFocusableFormField(target);
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
            var thisCell = this.cellCtrl.getCellPosition();
            if (shiftKey) {
                rangeService.extendLatestRangeToCell(thisCell);
            }
            else {
                var ctrlKeyPressed = ctrlKey || metaKey;
                rangeService.setRangeToCell(thisCell, ctrlKeyPressed);
            }
        }
        eventService.dispatchEvent(this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_DOWN));
    };
    CellMouseListenerFeature.prototype.isRightClickInExistingRange = function (mouseEvent) {
        var rangeService = this.beans.rangeService;
        if (rangeService) {
            var cellInRange = rangeService.isCellInAnyRange(this.cellCtrl.getCellPosition());
            if (cellInRange && mouseEvent.button === 2) {
                return true;
            }
        }
        return false;
    };
    CellMouseListenerFeature.prototype.containsWidget = function (target) {
        return dom_1.isElementChildOfClass(target, 'ag-selection-checkbox', 3);
    };
    CellMouseListenerFeature.prototype.onMouseOut = function (mouseEvent) {
        if (this.mouseStayingInsideCell(mouseEvent)) {
            return;
        }
        var cellMouseOutEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OUT);
        this.beans.eventService.dispatchEvent(cellMouseOutEvent);
        this.beans.columnHoverService.clearMouseOver();
    };
    CellMouseListenerFeature.prototype.onMouseOver = function (mouseEvent) {
        if (this.mouseStayingInsideCell(mouseEvent)) {
            return;
        }
        var cellMouseOverEvent = this.cellCtrl.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OVER);
        this.beans.eventService.dispatchEvent(cellMouseOverEvent);
        this.beans.columnHoverService.setMouseOver([this.column]);
    };
    CellMouseListenerFeature.prototype.mouseStayingInsideCell = function (e) {
        if (!e.target || !e.relatedTarget) {
            return false;
        }
        var eGui = this.cellCtrl.getGui();
        var cellContainsTarget = eGui.contains(e.target);
        var cellContainsRelatedTarget = eGui.contains(e.relatedTarget);
        return cellContainsTarget && cellContainsRelatedTarget;
    };
    CellMouseListenerFeature.prototype.destroy = function () {
    };
    return CellMouseListenerFeature;
}(beans_1.Beans));
exports.CellMouseListenerFeature = CellMouseListenerFeature;
