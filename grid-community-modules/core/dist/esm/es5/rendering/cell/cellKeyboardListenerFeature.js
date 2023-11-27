var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BeanStub } from "../../context/beanStub";
import { KeyCode } from "../../constants/keyCode";
import { isDeleteKey } from "../../utils/keyboard";
import { Events } from "../../eventKeys";
var CellKeyboardListenerFeature = /** @class */ (function (_super) {
    __extends(CellKeyboardListenerFeature, _super);
    function CellKeyboardListenerFeature(ctrl, beans, column, rowNode, rowCtrl) {
        var _this = _super.call(this) || this;
        _this.cellCtrl = ctrl;
        _this.beans = beans;
        _this.rowNode = rowNode;
        _this.rowCtrl = rowCtrl;
        return _this;
    }
    CellKeyboardListenerFeature.prototype.setComp = function (eGui) {
        this.eGui = eGui;
    };
    CellKeyboardListenerFeature.prototype.onKeyDown = function (event) {
        var key = event.key;
        switch (key) {
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case KeyCode.F2:
                this.onF2KeyDown(event);
                break;
            case KeyCode.ESCAPE:
                this.onEscapeKeyDown(event);
                break;
            case KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case KeyCode.BACKSPACE:
            case KeyCode.DELETE:
                this.onBackspaceOrDeleteKeyDown(key, event);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.LEFT:
                this.onNavigationKeyDown(event, key);
                break;
        }
    };
    CellKeyboardListenerFeature.prototype.onNavigationKeyDown = function (event, key) {
        if (this.cellCtrl.isEditing()) {
            return;
        }
        if (event.shiftKey && this.cellCtrl.isRangeSelectionEnabled()) {
            this.onShiftRangeSelect(event);
        }
        else {
            this.beans.navigationService.navigateToNextCell(event, key, this.cellCtrl.getCellPosition(), true);
        }
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    };
    CellKeyboardListenerFeature.prototype.onShiftRangeSelect = function (event) {
        if (!this.beans.rangeService) {
            return;
        }
        var endCell = this.beans.rangeService.extendLatestRangeInDirection(event);
        if (endCell) {
            this.beans.navigationService.ensureCellVisible(endCell);
        }
    };
    CellKeyboardListenerFeature.prototype.onTabKeyDown = function (event) {
        this.beans.navigationService.onTabKeyDown(this.cellCtrl, event);
    };
    CellKeyboardListenerFeature.prototype.onBackspaceOrDeleteKeyDown = function (key, event) {
        var _a = this, cellCtrl = _a.cellCtrl, beans = _a.beans, rowNode = _a.rowNode;
        var gridOptionsService = beans.gridOptionsService, rangeService = beans.rangeService, eventService = beans.eventService;
        if (cellCtrl.isEditing()) {
            return;
        }
        eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });
        if (isDeleteKey(key, gridOptionsService.get('enableCellEditingOnBackspace'))) {
            if (rangeService && gridOptionsService.get('enableRangeSelection')) {
                rangeService.clearCellRangeCellValues({ dispatchWrapperEvents: true, wrapperEventSource: 'deleteKey' });
            }
            else if (cellCtrl.isCellEditable()) {
                rowNode.setDataValue(cellCtrl.getColumn(), null, 'cellClear');
            }
        }
        else {
            cellCtrl.startRowOrCellEdit(key, event);
        }
        eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
    };
    CellKeyboardListenerFeature.prototype.onEnterKeyDown = function (e) {
        if (this.cellCtrl.isEditing() || this.rowCtrl.isEditing()) {
            this.cellCtrl.stopEditingAndFocus(false, e.shiftKey);
        }
        else {
            if (this.beans.gridOptionsService.get('enterNavigatesVertically')) {
                var key = e.shiftKey ? KeyCode.UP : KeyCode.DOWN;
                this.beans.navigationService.navigateToNextCell(null, key, this.cellCtrl.getCellPosition(), false);
            }
            else {
                this.cellCtrl.startRowOrCellEdit(KeyCode.ENTER, e);
                if (this.cellCtrl.isEditing()) {
                    // if we started editing, then we need to prevent default, otherwise the Enter action can get
                    // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
                    // preventing default results in a 'new line' character getting inserted in the text area
                    // when the editing was started
                    e.preventDefault();
                }
            }
        }
    };
    CellKeyboardListenerFeature.prototype.onF2KeyDown = function (event) {
        if (!this.cellCtrl.isEditing()) {
            this.cellCtrl.startRowOrCellEdit(KeyCode.F2, event);
        }
    };
    CellKeyboardListenerFeature.prototype.onEscapeKeyDown = function (event) {
        if (this.cellCtrl.isEditing()) {
            this.cellCtrl.stopRowOrCellEdit(true);
            this.cellCtrl.focusCell(true);
        }
    };
    CellKeyboardListenerFeature.prototype.processCharacter = function (event) {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        var eventTarget = event.target;
        var eventOnChildComponent = eventTarget !== this.eGui;
        if (eventOnChildComponent || this.cellCtrl.isEditing()) {
            return;
        }
        var key = event.key;
        if (key === ' ') {
            this.onSpaceKeyDown(event);
        }
        else {
            this.cellCtrl.startRowOrCellEdit(key, event);
            // if we don't prevent default, then the event also gets applied to the text field
            // (at least when doing the default editor), but we need to allow the editor to decide
            // what it wants to do. we only do this IF editing was started - otherwise it messes
            // up when the use is not doing editing, but using rendering with text fields in cellRenderer
            // (as it would block the the user from typing into text fields).
            event.preventDefault();
        }
    };
    CellKeyboardListenerFeature.prototype.onSpaceKeyDown = function (event) {
        var gridOptionsService = this.beans.gridOptionsService;
        if (!this.cellCtrl.isEditing() && gridOptionsService.isRowSelection()) {
            var currentSelection = this.rowNode.isSelected();
            var newSelection = !currentSelection;
            if (newSelection || !gridOptionsService.get('suppressRowDeselection')) {
                var groupSelectsFiltered = this.beans.gridOptionsService.get('groupSelectsFiltered');
                var updatedCount = this.rowNode.setSelectedParams({
                    newValue: newSelection,
                    rangeSelect: event.shiftKey,
                    groupSelectsFiltered: groupSelectsFiltered,
                    event: event,
                    source: 'spaceKey',
                });
                if (currentSelection === undefined && updatedCount === 0) {
                    this.rowNode.setSelectedParams({
                        newValue: false,
                        rangeSelect: event.shiftKey,
                        groupSelectsFiltered: groupSelectsFiltered,
                        event: event,
                        source: 'spaceKey',
                    });
                }
            }
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    };
    CellKeyboardListenerFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return CellKeyboardListenerFeature;
}(BeanStub));
export { CellKeyboardListenerFeature };
