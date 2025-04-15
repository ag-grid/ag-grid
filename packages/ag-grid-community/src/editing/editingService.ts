import { _getCellEditorDetails } from '../components/framework/userCompUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { PopupEditorWrapper } from '../edit/cellEditors/popupEditorWrapper';
import type { AgColumn } from '../entities/agColumn';
import { CellFocusedEvent } from '../events';
import { _isElementInThisGrid } from '../gridBodyComp/mouseEventUtils';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { DefaultProvidedCellEditorParams, ICellEditorParams } from '../interfaces/iCellEditor';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import { _getTabIndex } from '../utils/browser';
import { GridEditingModel } from './model/gridEditingModel';
import type { IEditStrategy } from './strategy/iEditStrategy';
import type { IEditTrigger } from './trigger/baseEditTrigger';

export class EditingService extends BeanStub implements NamedBean {
    beanName = 'editingSvc' as const;
    private editModel?: GridEditingModel;
    private editStrategy?: IEditStrategy;
    private editTrigger?: IEditTrigger;

    postConstruct(): void {
        this.editModel = new GridEditingModel(this.beans);
    }

    private createEditStrategy(): IEditStrategy {
        const { beans, gos, editStrategy } = this;

        const strategyName: any = gos.get('experimentalEditingModeV2')?.strategy ?? 'cellEditMode';

        if (editStrategy) {
            if (editStrategy.beanName === strategyName) {
                return editStrategy;
            }
            editStrategy.destroy?.();
        }

        return (this.editStrategy = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<IEditStrategy>(strategyName, true, this.editModel)
        )!);
    }

    private createEditTrigger(): IEditTrigger {
        const { beans, gos, editTrigger } = this;
        const triggerName: any = gos.get('experimentalEditingModeV2')?.trigger ?? 'providedEditTrigger';

        if (editTrigger) {
            if (editTrigger.beanName === triggerName) {
                return editTrigger;
            }
            editTrigger.destroy?.();
        }

        return (this.editTrigger = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<IEditTrigger>(triggerName, true, this.editModel)
        )!);
    }

    private destroyEditStrategy(): void {
        if (!this.editStrategy) {
            return;
        }
        this.destroyBean(this.editStrategy);
        this.editStrategy = undefined;
    }

    public isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.editModel?.isEditing?.(rowCtrl, cellCtrl) ?? false;
    }

    /** @return whether to prevent default on event */
    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl: CellCtrl,
        key: string | null = null,
        cellStartedEdit = false,
        event: KeyboardEvent | MouseEvent | null = null
    ): boolean {
        if (!cellCtrl.isCellEditable()) {
            return false;
        }

        this.editStrategy = this.createEditStrategy();
        this.editTrigger = this.createEditTrigger();

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!cellCtrl.comp) {
            cellCtrl.onCompAttachedFuncs.push(() => {
                this.startEditing(rowCtrl, cellCtrl, key, cellStartedEdit, event);
            });
            return true;
        }

        if (!this.editTrigger?.shouldStartEditing?.(rowCtrl, cellCtrl, key, event)) {
            return false;
        }

        console.warn('EditingService: startEditing');

        this.editStrategy!.startEditing?.(rowCtrl, cellCtrl, key, event) ?? true;

        const editorParams = this.createCellEditorParams(cellCtrl, key, cellStartedEdit);
        const colDef = cellCtrl.column.getColDef();
        const compDetails = _getCellEditorDetails(this.beans.userCompFactory, colDef, editorParams);

        // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
        const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
        const position: 'over' | 'under' | undefined =
            compDetails?.popupPositionFromSelector != null
                ? compDetails.popupPositionFromSelector
                : colDef.cellEditorPopupPosition;

        cellCtrl.editCompDetails = compDetails;
        cellCtrl.comp.setEditDetails(compDetails, popup, position, this.gos.get('reactiveCustomComponents'));

        this.eventSvc.dispatchEvent(cellCtrl.createEvent(event, 'cellEditingStarted'));

        return !(compDetails?.params as DefaultProvidedCellEditorParams)?.suppressPreventDefault;
    }

    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    public stopEditing(
        rowCtrl: RowCtrl | null,
        cellCtrl?: CellCtrl | null,
        key?: string,
        event?: KeyboardEvent | MouseEvent | null,
        cancel: boolean = false
    ): boolean {
        if (!this.isEditing(rowCtrl, cellCtrl) || !cellCtrl) {
            return false;
        }

        cellCtrl.onEditorAttachedFuncs = [];

        this.editTrigger = this.createEditTrigger();

        if (this.editTrigger.shouldStopEditing?.(rowCtrl, cellCtrl, key, event)) {
            console.warn('EditingService: stopEditing');
            return this.editStrategy?.stopEditing?.(rowCtrl, cellCtrl) ?? false;
        }

        if (this.editTrigger.shouldCancelEditing?.(rowCtrl, cellCtrl, key, event)) {
            console.warn('EditingService: cancelEditing');
            return this.editStrategy?.cancelEditing?.(rowCtrl, cellCtrl) ?? false;
        }

        return false;
    }

    public getEditingCellPositions(): CellPosition[] {
        return this.beans.editingSvc?.editModel?.getEditingCellPositions() ?? [];
    }

    public stopAllEditing(cancel: boolean = false): void {
        console.warn('EditingService: stopAllEditing');
        if (this.isEditing()) {
            this.editStrategy?.stopAllEditing?.();
        }
    }

    public isCellEditable(column: AgColumn, rowNode: IRowNode): boolean {
        if (rowNode.group) {
            // This is a group - it could be a tree group or a grouping group...
            if (this.gos.get('treeData')) {
                // tree - allow editing of groups with data by default.
                // Allow editing filler nodes (node without data) only if enableGroupEdit is true.
                if (!rowNode.data && !this.gos.get('enableGroupEdit')) {
                    return false;
                }
            } else {
                // grouping - allow editing of groups if the user has enableGroupEdit option enabled
                if (!this.gos.get('enableGroupEdit')) {
                    return false;
                }
            }
        }

        return column.isColumnFunc(rowNode, column.colDef.editable);
    }

    private createCellEditorParams(
        cellCtrl: CellCtrl,
        key: string | null,
        cellStartedEdit: boolean
    ): ICellEditorParams {
        const {
            column,
            rowNode,
            cellPosition: { rowIndex },
        } = cellCtrl;
        const { valueSvc, gos } = this.beans;
        return _addGridCommonParams(gos, {
            value: valueSvc.getValueForDisplay(column, rowNode),
            eventKey: key,
            column,
            colDef: column.getColDef(),
            rowIndex,
            node: rowNode,
            data: rowNode.data,
            cellStartedEdit: cellStartedEdit,
            onKeyDown: cellCtrl.onKeyDown.bind(cellCtrl),
            stopEditing: (suppressNavigateAfterEdit) => this.stopEditing.bind(this, cellCtrl.rowCtrl, cellCtrl),
            eGridCell: cellCtrl.eGui,
            parseValue: (newValue: any) => valueSvc.parseValue(column, rowNode, newValue, cellCtrl.value),
            formatValue: cellCtrl.formatValue.bind(cellCtrl),
        });
    }

    moveToNextCell(previous: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null {
        let editing =
            previous instanceof CellCtrl ? this.isEditing(previous.rowCtrl, previous) : this.isEditing(previous);

        // if cell is not editing, there is still chance row is editing if it's Full Row Editing
        if (!editing && previous instanceof CellCtrl) {
            const cell = previous as CellCtrl;
            const row = cell.rowCtrl;
            if (row) {
                editing = this.isEditing(row);
            }
        }

        let res: boolean | null | undefined;

        if (editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            res = this.editStrategy?.moveToNextEditingCell(previous, backwards, event);
        }

        if (res === null) {
            return res;
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        return res || !!this.beans.focusSvc.focusedHeader;
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        if (!this.gos.get('stopEditingWhenCellsLoseFocus')) {
            return;
        }

        const focusOutListener = (event: FocusEvent): void => {
            // this is the element the focus is moving to
            const elementWithFocus = event.relatedTarget as HTMLElement;

            if (_getTabIndex(elementWithFocus) === null) {
                this.stopAllEditing();
                return;
            }

            let clickInsideGrid =
                // see if click came from inside the viewports
                viewports.some((viewport) => viewport.contains(elementWithFocus)) &&
                // and also that it's not from a detail grid
                _isElementInThisGrid(this.gos, elementWithFocus);

            if (!clickInsideGrid) {
                const popupSvc = this.beans.popupSvc;

                clickInsideGrid =
                    !!popupSvc &&
                    (popupSvc.getActivePopups().some((popup) => popup.contains(elementWithFocus)) ||
                        popupSvc.isElementWithinCustomPopup(elementWithFocus));
            }

            if (!clickInsideGrid) {
                this.stopAllEditing();
            }
        };

        viewports.forEach((viewport) => this.addManagedElementListeners(viewport, { focusout: focusOutListener }));
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        return new PopupEditorWrapper(params);
    }

    public override destroy(): void {
        this.destroyEditStrategy();
        this.editModel?.destroy();
        super.destroy();
    }
}
