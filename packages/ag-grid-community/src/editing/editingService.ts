import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { PopupEditorWrapper } from '../edit/cellEditors/popupEditorWrapper';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { ICellEditorParams } from '../interfaces/iCellEditor';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { EditingModelService } from './editingModelService';
import type { CellEditingModel } from './model/cellEditingModel';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import { _addStopEditingWhenGridLosesFocus, _resolveControllers } from './utils/controllers';
import { _getOldValue, _refreshEditorOnColDefChanged, _syncModelFromEditor } from './utils/editors';

export class EditingService extends BeanStub implements NamedBean {
    beanName = 'editingSvc' as const;
    private editModel?: EditingModelService;
    private editStrategy?: BaseEditStrategy;

    postConstruct(): void {
        this.editModel = this.beans.editingModelSvc;

        this.addManagedPropertyListener(
            'editType',
            (({ currentValue }: any) => {
                this.stopAllEditing(true);

                // will re-create if different
                this.createEditStrategy(currentValue);
            }).bind(this)
        );
        this.addManagedPropertyListener(
            'batchEdit',
            (() => {
                this.stopAllEditing(true);
            }).bind(this)
        );
    }

    private createEditStrategy(editType?: string): BaseEditStrategy {
        const { beans, gos, editStrategy } = this;

        const strategyName: any = editType ?? gos.get('editType') ?? 'singleCell';

        if (editStrategy) {
            if (editStrategy.beanName === strategyName) {
                return editStrategy;
            }
            this.destroyEditStrategy();
        }

        return (this.editStrategy = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<BaseEditStrategy>(strategyName, true)
        )!);
    }

    private destroyEditStrategy(): void {
        if (!this.editStrategy) {
            return;
        }
        this.destroyBean(this.editStrategy);
        this.editStrategy = undefined;
    }

    shouldStartEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        return this.editStrategy?.shouldStartEditing?.(rowCtrl, cellCtrl, key, event, cellStartedEdit, source) ?? false;
    }

    shouldStopEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl | null,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        return this.editStrategy?.shouldStopEditing?.(rowCtrl, cellCtrl, key, event, source) ?? false;
    }

    shouldCancelEditing(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl | null,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        return this.editStrategy?.shouldCancelEditing?.(rowCtrl, cellCtrl, key, event, source) ?? false;
    }

    public isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.editModel?.isEditing?.(rowCtrl, cellCtrl) ?? false;
    }

    /** @return whether to prevent default on event */
    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl: CellCtrl,
        key: string | null = null,
        cellStartedEdit: boolean | null = true,
        event: KeyboardEvent | MouseEvent | null = null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        if (!cellCtrl.isCellEditable()) {
            return false;
        }

        this.editStrategy = this.createEditStrategy();

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        if (!cellCtrl.comp) {
            cellCtrl.onCompAttachedFuncs.push(() => {
                this.startEditing(rowCtrl, cellCtrl, key, cellStartedEdit, event, source);
            });
            return true;
        }

        if (!this.shouldStartEditing?.(rowCtrl, cellCtrl, key, event, cellStartedEdit, source) && source !== 'api') {
            return false;
        }

        return this.editStrategy!.startEditing?.(rowCtrl, cellCtrl, key, event, source);
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
        cancel: boolean = false,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        if (!this.isEditing()) {
            return false;
        }

        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        this.editStrategy = this.createEditStrategy();

        if (!cancel && this.shouldStopEditing?.(rowCtrl, cellCtrl, key, event, source)) {
            return this.editStrategy?.stopEditing?.(rowCtrl, cellCtrl, source) ?? false;
        } else if (cancel && this.shouldCancelEditing?.(rowCtrl, cellCtrl, key, event, source)) {
            return this.editStrategy?.cancelEditing?.(rowCtrl, cellCtrl, source) ?? false;
        }

        return false;
    }

    public getEditingCellPositions(): CellPosition[] {
        return this.beans.editingSvc?.editModel?.getEditingCellPositions() ?? [];
    }

    public stopAllEditing(cancel: boolean = false, source: 'api' | 'ui' = 'ui'): void {
        if (this.isEditing()) {
            if (cancel) {
                this.editStrategy?.cancelEditing?.(undefined, undefined, source);
            } else {
                this.editStrategy?.stopAllEditing?.(source);
            }
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
        res = res || !!this.beans.focusSvc.focusedHeader;

        if (res === false) {
            // not a header and not the table
            this.stopAllEditing();
        }

        return res;
    }

    public getCellDataValue(rowId?: string, colId?: string): { newValue: any; oldValue: any } {
        if (!rowId || !colId) {
            return {
                newValue: undefined,
                oldValue: undefined,
            };
        }

        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, { rowId, colId });
        if (this.isEditing(rowCtrl, cellCtrl)) {
            const { oldValue, newValue } = this.editModel?.getEditModel(rowId, colId) as CellEditingModel;
            return { oldValue, newValue };
        }

        const oldValue = _getOldValue(this.beans, cellCtrl);

        return {
            oldValue,
            newValue: undefined,
        };
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        // TODO: find a better place for this
        _addStopEditingWhenGridLosesFocus(this, this.beans, viewports);
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        // TODO: find a better place for this
        return new PopupEditorWrapper(params);
    }

    setDataValue(rowNode: RowNode, column: string | AgColumn<any>, newValue: any): boolean | null {
        const { rowCtrl, cellCtrl } = _resolveControllers(this.beans, { rowNode, column });

        return _syncModelFromEditor(this.beans, rowCtrl, cellCtrl, newValue);
    }

    public handleColDefChanged(cellCtrl: CellCtrl): void {
        _refreshEditorOnColDefChanged(this.beans, cellCtrl);
    }

    public override destroy(): void {
        this.destroyEditStrategy();
        this.editModel?.destroy();
        super.destroy();
    }
}
