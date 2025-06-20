import { KeyCode } from '../../constants/keyCode';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { RowNode } from '../../entities/rowNode';
import { _isCellSelectionEnabled, _isRowSelection } from '../../gridOptionsUtils';
import type { DefaultProvidedCellEditorParams } from '../../interfaces/iCellEditor';
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
        const { cellCtrl, beans } = this;
        if (beans.editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            return;
        }

        if (event.shiftKey && cellCtrl.isRangeSelectionEnabled()) {
            this.onShiftRangeSelect(event);
        } else {
            const currentCellPosition = cellCtrl.getFocusedCellPosition();
            beans.navigation?.navigateToNextCell(event, key, currentCellPosition, true);
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
        const { cellCtrl, beans, rowNode } = this;
        const { gos, rangeSvc, eventSvc, editSvc } = beans;

        eventSvc.dispatchEvent({ type: 'keyShortcutChangedCellStart' });

        if (
            _isDeleteKey(key, gos.get('enableCellEditingOnBackspace')) &&
            !editSvc?.isEditing(cellCtrl, { withOpenEditor: true })
        ) {
            if (rangeSvc && _isCellSelectionEnabled(gos)) {
                rangeSvc.clearCellRangeCellValues({ dispatchWrapperEvents: true, wrapperEventSource: 'deleteKey' });
                this.beans.editSvc?.stopEditing(undefined, { source: 'cellClear' });
            } else if (cellCtrl.isCellEditable()) {
                const { column } = cellCtrl;
                const emptyValue = this.beans.valueSvc.getDeleteValue(column, rowNode);
                rowNode.setDataValue(column, emptyValue, 'cellClear');
                this.beans.editSvc?.stopEditing(undefined, { source: 'cellClear' });
            }
        } else if (!editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
            beans.editSvc?.startEditing(cellCtrl, { startedEdit: true, event });
        }

        eventSvc.dispatchEvent({ type: 'keyShortcutChangedCellEnd' });
    }

    private onEnterKeyDown(event: KeyboardEvent): void {
        const { cellCtrl, beans } = this;
        const { editSvc, navigation } = beans;
        const editing = editSvc?.isEditing(cellCtrl);
        if (editing) {
            if (this.isCtrlEnter(event)) {
                // bulk edit, apply currently editing value to all selected cells
                editSvc?.applyBulkEdit(cellCtrl, this.beans?.rangeSvc?.getCellRanges() || []);
                return;
            }

            if (editSvc?.checkNavWithValidation(cellCtrl, event) === 'block-stop') {
                return;
            }

            editSvc?.stopEditing(cellCtrl, {
                event,
            });
        } else {
            if (beans.gos.get('enterNavigatesVertically')) {
                const key = event.shiftKey ? KeyCode.UP : KeyCode.DOWN;
                navigation?.navigateToNextCell(null, key, cellCtrl.cellPosition, false);
            } else {
                if (editSvc?.hasValidationErrors(cellCtrl)) {
                    editSvc.revertSingleCellEdit(cellCtrl, true);
                }

                const started = editSvc?.startEditing(cellCtrl, {
                    startedEdit: true,
                    event,
                });
                if (started) {
                    // if we started editing, then we need to prevent default, otherwise the Enter action can get
                    // applied to the cell editor. this happened, for example, with largeTextCellEditor where not
                    // preventing default results in a 'new line' character getting inserted in the text area
                    // when the editing was started
                    event.preventDefault();
                }
            }
        }
    }
    isCtrlEnter(e: KeyboardEvent) {
        return (e.ctrlKey || e.metaKey) && e.key === KeyCode.ENTER;
    }

    private onF2KeyDown(event: KeyboardEvent): void {
        const {
            cellCtrl,
            beans: { editSvc },
        } = this;

        editSvc?.startEditing(cellCtrl, { startedEdit: true, event });
    }

    private onEscapeKeyDown(event: KeyboardEvent): void {
        const {
            cellCtrl,
            beans: { editSvc },
        } = this;

        if (editSvc?.checkNavWithValidation(cellCtrl, event) === 'block-stop') {
            // for escape we always revert, even if blocking
            editSvc.revertSingleCellEdit(cellCtrl);
        }

        editSvc?.stopEditing(cellCtrl, {
            event,
            cancel: true,
        });
    }

    public processCharacter(event: KeyboardEvent): void {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        const eventTarget = event.target;
        const eventOnChildComponent = eventTarget !== this.eGui;
        const {
            beans: { editSvc },
            cellCtrl,
        } = this;

        if (eventOnChildComponent) {
            return;
        }

        const key = event.key;
        if (key === KeyCode.SPACE) {
            this.onSpaceKeyDown(event);
        } else if (editSvc?.isCellEditable(cellCtrl, 'ui')) {
            editSvc?.startEditing(cellCtrl, { startedEdit: true, event, source: 'api' });
            // if we don't prevent default, then the event also gets applied to the text field
            // (at least when doing the default editor), but we need to allow the editor to decide
            // what it wants to do. we only do this IF editing was started - otherwise it messes
            // up when the user is not doing editing, but using rendering with text fields in cellRenderer
            // (as it would block the the user from typing into text fields).

            const compDetails = cellCtrl.editCompDetails;
            const shouldPreventDefault = !(compDetails?.params as DefaultProvidedCellEditorParams)
                ?.suppressPreventDefault;

            if (shouldPreventDefault) {
                event.preventDefault();
            }
        }
    }

    private onSpaceKeyDown(event: KeyboardEvent): void {
        const { gos, editSvc } = this.beans;
        const { rowNode } = this.cellCtrl;

        if (!editSvc?.isEditing(this.cellCtrl) && _isRowSelection(gos)) {
            this.beans.selectionSvc?.handleSelectionEvent(event, rowNode, 'spaceKey');
        }

        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    }
}
