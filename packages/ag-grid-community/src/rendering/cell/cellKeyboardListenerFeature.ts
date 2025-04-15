import { KeyCode } from '../../constants/keyCode';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import { isEditing } from '../../editing/editingApi';
import type { RowNode } from '../../entities/rowNode';
import { _isCellSelectionEnabled, _isRowSelection } from '../../gridOptionsUtils';
import { _isMacOsUserAgent } from '../../utils/browser';
import type { RowCtrl } from '../row/rowCtrl';
import type { SpannedCellCtrl } from '../spanning/spannedCellCtrl';
import type { CellCtrl } from './cellCtrl';

function _isDeleteKey(key: string, alwaysReturnFalseOnBackspace = false) {
    if (key === KeyCode.DELETE) {
        return true;
    }
    if (!alwaysReturnFalseOnBackspace && key === KeyCode.BACKSPACE) {
        return _isMacOsUserAgent();
    }
    return false;
}

export class CellKeyboardListenerFeature extends BeanStub {
    private eGui: HTMLElement;

    constructor(
        private readonly cellCtrl: CellCtrl | SpannedCellCtrl,
        beans: BeanCollection,
        private readonly rowNode: RowNode,
        private readonly rowCtrl: RowCtrl
    ) {
        super();
        this.beans = beans;
    }

    public init(): void {
        this.eGui = this.cellCtrl.eGui;
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
                this.onBackspaceOrDeleteKeyDown(key, event);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.LEFT:
                this.onNavigationKeyDown(event, key);
                break;
        }
    }

    private onNavigationKeyDown(event: KeyboardEvent, key: string): void {
        if (this.beans.editingFcd?.isEditing(this.rowCtrl, this.cellCtrl)) {
            return;
        }

        if (event.shiftKey && this.cellCtrl.isRangeSelectionEnabled()) {
            this.onShiftRangeSelect(event);
        } else {
            const currentCellPosition = this.cellCtrl.getFocusedCellPosition();
            this.beans.navigation?.navigateToNextCell(event, key, currentCellPosition, true);
        }

        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    }

    private onShiftRangeSelect(event: KeyboardEvent): void {
        const { rangeSvc, navigation } = this.beans;
        if (!rangeSvc) {
            return;
        }

        const endCell = rangeSvc.extendLatestRangeInDirection(event);

        if (endCell) {
            navigation?.ensureCellVisible(endCell);
        }
    }

    private onTabKeyDown(event: KeyboardEvent): void {
        this.beans.navigation?.onTabKeyDown(this.cellCtrl, event);
    }

    private onBackspaceOrDeleteKeyDown(key: string, event: KeyboardEvent): void {
        const { rowCtrl, cellCtrl, beans, rowNode } = this;
        const { gos, rangeSvc, eventSvc, editingFcd } = beans;

        if (editingFcd?.isEditing(this.rowCtrl, this.cellCtrl)) {
            return;
        }

        eventSvc.dispatchEvent({ type: 'keyShortcutChangedCellStart' });

        if (_isDeleteKey(key, gos.get('enableCellEditingOnBackspace'))) {
            if (rangeSvc && _isCellSelectionEnabled(gos)) {
                rangeSvc.clearCellRangeCellValues({ dispatchWrapperEvents: true, wrapperEventSource: 'deleteKey' });
            } else if (cellCtrl.isCellEditable()) {
                const { column } = cellCtrl;
                const emptyValue = this.beans.valueSvc.getDeleteValue(column, rowNode);
                rowNode.setDataValue(column, emptyValue, 'cellClear');
            }
        } else {
            beans.editingFcd?.startEditing(rowCtrl, cellCtrl, key, true, event);
        }

        eventSvc.dispatchEvent({ type: 'keyShortcutChangedCellEnd' });
    }

    private onEnterKeyDown(e: KeyboardEvent): void {
        const { rowCtrl, cellCtrl, beans } = this;
        const { editingFcd } = beans;
        const editing = editingFcd?.isEditing(rowCtrl, cellCtrl);

        if (!editing && beans.gos.get('enterNavigatesVertically')) {
            const key = e.shiftKey ? KeyCode.UP : KeyCode.DOWN;
            beans.navigation?.navigateToNextCell(null, key, cellCtrl.cellPosition, false);
        }

        if (editingFcd?.shouldStopEditing(rowCtrl, cellCtrl, null, e)) {
            editingFcd?.stopEditing(rowCtrl, cellCtrl, false);
        }

        if (
            !beans.gos.get('enterNavigatesVertically') &&
            editingFcd?.shouldStartEditing(rowCtrl, cellCtrl, KeyCode.ENTER, e)
        ) {
            const started = editingFcd?.startEditing(rowCtrl, cellCtrl, KeyCode.ENTER, true, e);
            if (started) {
                // if we started editing, then we need to prevent default, otherwise the Enter action can get
                // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
                // preventing default results in a 'new line' character getting inserted in the text area
                // when the editing was started
                e.preventDefault();
            }
        }
    }

    private onF2KeyDown(event: KeyboardEvent): void {
        const { cellCtrl, rowCtrl, beans } = this;
        const { editingFcd } = beans;

        if (editingFcd?.shouldStartEditing(rowCtrl, cellCtrl, KeyCode.F2, event)) {
            editingFcd?.startEditing(rowCtrl, cellCtrl, KeyCode.F2, true, event);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onEscapeKeyDown(event: KeyboardEvent): void {
        const { cellCtrl, rowCtrl, beans } = this;
        const { editingFcd } = beans;

        if (editingFcd?.shouldStopEditing(rowCtrl, cellCtrl, KeyCode.ESCAPE, event)) {
            editingFcd?.stopEditing(rowCtrl, cellCtrl, true);
        }
    }

    public processCharacter(event: KeyboardEvent): void {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        const eventTarget = event.target;
        const eventOnChildComponent = eventTarget !== this.eGui;
        const { cellCtrl, rowCtrl, beans } = this;

        if (eventOnChildComponent || beans.editingFcd?.isEditing(rowCtrl, cellCtrl)) {
            return;
        }

        const key = event.key;
        if (key === KeyCode.SPACE) {
            this.onSpaceKeyDown(event);
        } else {
            if (beans.editingFcd?.startEditing(rowCtrl, cellCtrl, key, true, event)) {
                // if we don't prevent default, then the event also gets applied to the text field
                // (at least when doing the default editor), but we need to allow the editor to decide
                // what it wants to do. we only do this IF editing was started - otherwise it messes
                // up when the use is not doing editing, but using rendering with text fields in cellRenderer
                // (as it would block the the user from typing into text fields).
                event.preventDefault();
            }
        }
    }

    private onSpaceKeyDown(event: KeyboardEvent): void {
        const { gos, editingFcd } = this.beans;
        const { rowCtrl, cellCtrl } = this;

        if (!editingFcd?.isEditing(rowCtrl, cellCtrl) && _isRowSelection(gos)) {
            this.beans.selectionSvc?.handleSelectionEvent(event, this.rowNode, 'spaceKey');
        }

        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }
}
