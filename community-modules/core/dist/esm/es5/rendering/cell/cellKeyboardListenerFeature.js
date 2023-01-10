/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
import { BeanStub } from "../../context/beanStub";
import { KeyCode } from "../../constants/keyCode";
import { isDeleteKey, isEventFromPrintableCharacter } from "../../utils/keyboard";
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
                this.onBackspaceOrDeleteKeyPressed(key, event);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.LEFT:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    };
    CellKeyboardListenerFeature.prototype.onNavigationKeyPressed = function (event, key) {
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
    CellKeyboardListenerFeature.prototype.onBackspaceOrDeleteKeyPressed = function (key, event) {
        var _a = this, cellCtrl = _a.cellCtrl, beans = _a.beans, rowNode = _a.rowNode;
        var gridOptionsService = beans.gridOptionsService, rangeService = beans.rangeService, eventService = beans.eventService;
        if (cellCtrl.isEditing()) {
            return;
        }
        eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });
        if (isDeleteKey(key, gridOptionsService.is('enableCellEditingOnBackspace'))) {
            if (rangeService && gridOptionsService.isEnableRangeSelection()) {
                rangeService.clearCellRangeCellValues();
            }
            else if (cellCtrl.isCellEditable()) {
                rowNode.setDataValue(cellCtrl.getColumn(), null, 'cellKeyboardListenerFeature');
            }
        }
        else {
            cellCtrl.startRowOrCellEdit(key, undefined, event);
        }
        eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
    };
    CellKeyboardListenerFeature.prototype.onEnterKeyDown = function (e) {
        if (this.cellCtrl.isEditing() || this.rowCtrl.isEditing()) {
            this.cellCtrl.stopEditingAndFocus();
        }
        else {
            if (this.beans.gridOptionsService.is('enterMovesDown')) {
                this.beans.navigationService.navigateToNextCell(null, KeyCode.DOWN, this.cellCtrl.getCellPosition(), false);
            }
            else {
                this.cellCtrl.startRowOrCellEdit(KeyCode.ENTER, undefined, e);
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
            this.cellCtrl.startRowOrCellEdit(KeyCode.F2, undefined, event);
        }
    };
    CellKeyboardListenerFeature.prototype.onEscapeKeyDown = function (event) {
        if (this.cellCtrl.isEditing()) {
            this.cellCtrl.stopRowOrCellEdit(true);
            this.cellCtrl.focusCell(true);
        }
    };
    CellKeyboardListenerFeature.prototype.onKeyPress = function (event) {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        var eventTarget = event.target;
        var eventOnChildComponent = eventTarget !== this.eGui;
        if (eventOnChildComponent || this.cellCtrl.isEditing()) {
            return;
        }
        var pressedChar = String.fromCharCode(event.charCode);
        if (pressedChar === ' ') {
            this.onSpaceKeyPressed(event);
        }
        else if (isEventFromPrintableCharacter(event)) {
            this.cellCtrl.startRowOrCellEdit(null, pressedChar, event);
            // if we don't prevent default, then the keypress also gets applied to the text field
            // (at least when doing the default editor), but we need to allow the editor to decide
            // what it wants to do. we only do this IF editing was started - otherwise it messes
            // up when the use is not doing editing, but using rendering with text fields in cellRenderer
            // (as it would block the the user from typing into text fields).
            event.preventDefault();
        }
    };
    CellKeyboardListenerFeature.prototype.onSpaceKeyPressed = function (event) {
        var gridOptionsService = this.beans.gridOptionsService;
        if (!this.cellCtrl.isEditing() && gridOptionsService.isRowSelection()) {
            var currentSelection = this.rowNode.isSelected();
            var newSelection = !currentSelection;
            if (newSelection || !gridOptionsService.is('suppressRowDeselection')) {
                var groupSelectsFiltered = this.beans.gridOptionsService.is('groupSelectsFiltered');
                var updatedCount = this.rowNode.setSelectedParams({
                    newValue: newSelection,
                    rangeSelect: event.shiftKey,
                    groupSelectsFiltered: groupSelectsFiltered,
                    event: event,
                    source: 'spacePressed'
                });
                if (currentSelection === undefined && updatedCount === 0) {
                    this.rowNode.setSelectedParams({
                        newValue: false,
                        rangeSelect: event.shiftKey,
                        groupSelectsFiltered: groupSelectsFiltered,
                        event: event,
                        source: 'spacePressed'
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
