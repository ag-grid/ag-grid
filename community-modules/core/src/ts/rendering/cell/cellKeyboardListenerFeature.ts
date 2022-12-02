import { BeanStub } from "../../context/beanStub";
import { CellCtrl } from "./cellCtrl";
import { Beans } from "../beans";
import { Column } from "../../entities/column";
import { RowNode } from "../../entities/rowNode";
import { KeyCode } from "../../constants/keyCode";
import { RowCtrl } from "../row/rowCtrl";
import { isDeleteKey, isEventFromPrintableCharacter } from "../../utils/keyboard";
import { Events } from "../../eventKeys";

export class CellKeyboardListenerFeature extends BeanStub {

    private readonly cellCtrl: CellCtrl;
    private readonly beans: Beans;
    private readonly rowNode: RowNode;
    private readonly rowCtrl: RowCtrl;

    private eGui: HTMLElement;

    constructor(ctrl: CellCtrl, beans: Beans, column: Column, rowNode: RowNode, rowCtrl: RowCtrl) {
        super();
        this.cellCtrl = ctrl;
        this.beans = beans;
        this.rowNode = rowNode;
        this.rowCtrl = rowCtrl;
    }

    public setComp(eGui: HTMLElement): void {
        this.eGui = eGui;
    }

    public onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

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
    }

    private onNavigationKeyPressed(event: KeyboardEvent, key: string): void {
        if (this.cellCtrl.isEditing()) { return; }

        if (event.shiftKey && this.cellCtrl.isRangeSelectionEnabled()) {
            this.onShiftRangeSelect(event);
        } else {
            this.beans.navigationService.navigateToNextCell(event, key, this.cellCtrl.getCellPosition(), true);
        }

        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    private onShiftRangeSelect(event: KeyboardEvent): void {
        if (!this.beans.rangeService) { return; }

        const endCell = this.beans.rangeService.extendLatestRangeInDirection(event);

        if (endCell) {
            this.beans.navigationService.ensureCellVisible(endCell);
        }
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        this.beans.navigationService.onTabKeyDown(this.cellCtrl, event);
    }

    private onBackspaceOrDeleteKeyPressed(key: string, event: KeyboardEvent): void {
        const { cellCtrl, beans, rowNode } = this;
        const { gridOptionsService, rangeService, eventService } = beans;

        if (cellCtrl.isEditing()) { return; }

        eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });

        if (isDeleteKey(key, gridOptionsService.is('enableCellEditingOnBackspace'))) {
            if (rangeService && gridOptionsService.isEnableRangeSelection()) {
                rangeService.clearCellRangeCellValues();
            } else if (cellCtrl.isCellEditable()) {
                rowNode.setDataValue(cellCtrl.getColumn(), null, 'cellKeyboardListenerFeature');
            }
        } else {
            cellCtrl.startRowOrCellEdit(key, undefined, event);
        }

        eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
    }

    private onEnterKeyDown(e: KeyboardEvent): void {
        if (this.cellCtrl.isEditing() || this.rowCtrl.isEditing()) {
            this.cellCtrl.stopEditingAndFocus();
        } else {
            if (this.beans.gridOptionsService.is('enterMovesDown')) {
                this.beans.navigationService.navigateToNextCell(null, KeyCode.DOWN, this.cellCtrl.getCellPosition(), false);
            } else {
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
    }

    private onF2KeyDown(event: KeyboardEvent): void {
        if (!this.cellCtrl.isEditing()) {
            this.cellCtrl.startRowOrCellEdit(KeyCode.F2, undefined, event);
        }
    }

    private onEscapeKeyDown(event: KeyboardEvent): void {
        if (this.cellCtrl.isEditing()) {
            this.cellCtrl.stopRowOrCellEdit(true);
            this.cellCtrl.focusCell(true);
        }
    }

    public onKeyPress(event: KeyboardEvent): void {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        const eventTarget = event.target;
        const eventOnChildComponent = eventTarget !== this.eGui;

        if (eventOnChildComponent || this.cellCtrl.isEditing()) { return; }

        const pressedChar = String.fromCharCode(event.charCode);
        if (pressedChar === ' ') {
            this.onSpaceKeyPressed(event);
        } else if (isEventFromPrintableCharacter(event)) {
            this.cellCtrl.startRowOrCellEdit(null, pressedChar, event);
            // if we don't prevent default, then the keypress also gets applied to the text field
            // (at least when doing the default editor), but we need to allow the editor to decide
            // what it wants to do. we only do this IF editing was started - otherwise it messes
            // up when the use is not doing editing, but using rendering with text fields in cellRenderer
            // (as it would block the the user from typing into text fields).
            event.preventDefault();
        }
    }

    private onSpaceKeyPressed(event: KeyboardEvent): void {
        const { gridOptionsService } = this.beans;

        if (!this.cellCtrl.isEditing() && gridOptionsService.isRowSelection()) {
            const currentSelection = this.rowNode.isSelected();
            const newSelection = !currentSelection;
            if (newSelection || !gridOptionsService.is('suppressRowDeselection')) {
                const groupSelectsFiltered = this.beans.gridOptionsService.is('groupSelectsFiltered');
                const updatedCount = this.rowNode.setSelectedParams({
                    newValue: newSelection,
                    rangeSelect: event.shiftKey,
                    groupSelectsFiltered: groupSelectsFiltered,
                    event
                });
                if (currentSelection === undefined && updatedCount === 0) {
                    this.rowNode.setSelectedParams({
                        newValue: false,
                        rangeSelect: event.shiftKey,
                        groupSelectsFiltered: groupSelectsFiltered,
                        event
                    });
                }
            }
        }

        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }

    public destroy(): void {
        super.destroy();
    }

}
