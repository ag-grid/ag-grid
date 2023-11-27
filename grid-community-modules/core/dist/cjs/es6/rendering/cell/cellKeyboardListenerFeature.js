"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellKeyboardListenerFeature = void 0;
const beanStub_1 = require("../../context/beanStub");
const keyCode_1 = require("../../constants/keyCode");
const keyboard_1 = require("../../utils/keyboard");
const eventKeys_1 = require("../../eventKeys");
class CellKeyboardListenerFeature extends beanStub_1.BeanStub {
    constructor(ctrl, beans, column, rowNode, rowCtrl) {
        super();
        this.cellCtrl = ctrl;
        this.beans = beans;
        this.rowNode = rowNode;
        this.rowCtrl = rowCtrl;
    }
    setComp(eGui) {
        this.eGui = eGui;
    }
    onKeyDown(event) {
        const key = event.key;
        switch (key) {
            case keyCode_1.KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case keyCode_1.KeyCode.F2:
                this.onF2KeyDown(event);
                break;
            case keyCode_1.KeyCode.ESCAPE:
                this.onEscapeKeyDown(event);
                break;
            case keyCode_1.KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case keyCode_1.KeyCode.BACKSPACE:
            case keyCode_1.KeyCode.DELETE:
                this.onBackspaceOrDeleteKeyDown(key, event);
                break;
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.RIGHT:
            case keyCode_1.KeyCode.LEFT:
                this.onNavigationKeyDown(event, key);
                break;
        }
    }
    onNavigationKeyDown(event, key) {
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
    }
    onShiftRangeSelect(event) {
        if (!this.beans.rangeService) {
            return;
        }
        const endCell = this.beans.rangeService.extendLatestRangeInDirection(event);
        if (endCell) {
            this.beans.navigationService.ensureCellVisible(endCell);
        }
    }
    onTabKeyDown(event) {
        this.beans.navigationService.onTabKeyDown(this.cellCtrl, event);
    }
    onBackspaceOrDeleteKeyDown(key, event) {
        const { cellCtrl, beans, rowNode } = this;
        const { gridOptionsService, rangeService, eventService } = beans;
        if (cellCtrl.isEditing()) {
            return;
        }
        eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });
        if ((0, keyboard_1.isDeleteKey)(key, gridOptionsService.get('enableCellEditingOnBackspace'))) {
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
        eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
    }
    onEnterKeyDown(e) {
        if (this.cellCtrl.isEditing() || this.rowCtrl.isEditing()) {
            this.cellCtrl.stopEditingAndFocus(false, e.shiftKey);
        }
        else {
            if (this.beans.gridOptionsService.get('enterNavigatesVertically')) {
                const key = e.shiftKey ? keyCode_1.KeyCode.UP : keyCode_1.KeyCode.DOWN;
                this.beans.navigationService.navigateToNextCell(null, key, this.cellCtrl.getCellPosition(), false);
            }
            else {
                this.cellCtrl.startRowOrCellEdit(keyCode_1.KeyCode.ENTER, e);
                if (this.cellCtrl.isEditing()) {
                    // if we started editing, then we need to prevent default, otherwise the Enter action can get
                    // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
                    // preventing default results in a 'new line' character getting inserted in the text area
                    // when the editing was started
                    e.preventDefault();
                }
            }
        }
    }
    onF2KeyDown(event) {
        if (!this.cellCtrl.isEditing()) {
            this.cellCtrl.startRowOrCellEdit(keyCode_1.KeyCode.F2, event);
        }
    }
    onEscapeKeyDown(event) {
        if (this.cellCtrl.isEditing()) {
            this.cellCtrl.stopRowOrCellEdit(true);
            this.cellCtrl.focusCell(true);
        }
    }
    processCharacter(event) {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        const eventTarget = event.target;
        const eventOnChildComponent = eventTarget !== this.eGui;
        if (eventOnChildComponent || this.cellCtrl.isEditing()) {
            return;
        }
        const key = event.key;
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
    }
    onSpaceKeyDown(event) {
        const { gridOptionsService } = this.beans;
        if (!this.cellCtrl.isEditing() && gridOptionsService.isRowSelection()) {
            const currentSelection = this.rowNode.isSelected();
            const newSelection = !currentSelection;
            if (newSelection || !gridOptionsService.get('suppressRowDeselection')) {
                const groupSelectsFiltered = this.beans.gridOptionsService.get('groupSelectsFiltered');
                const updatedCount = this.rowNode.setSelectedParams({
                    newValue: newSelection,
                    rangeSelect: event.shiftKey,
                    groupSelectsFiltered: groupSelectsFiltered,
                    event,
                    source: 'spaceKey',
                });
                if (currentSelection === undefined && updatedCount === 0) {
                    this.rowNode.setSelectedParams({
                        newValue: false,
                        rangeSelect: event.shiftKey,
                        groupSelectsFiltered: groupSelectsFiltered,
                        event,
                        source: 'spaceKey',
                    });
                }
            }
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }
    destroy() {
        super.destroy();
    }
}
exports.CellKeyboardListenerFeature = CellKeyboardListenerFeature;
