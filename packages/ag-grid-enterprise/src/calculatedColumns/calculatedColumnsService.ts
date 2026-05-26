import type {
    AgColumn,
    CalculatedColumnDef,
    CalculatedColumnUpdate,
    ColDef,
    ColGroupDef,
    ColKey,
    ICalculatedColumnsService,
    NamedBean,
} from 'ag-grid-community';
import { BeanStub, _isStringLargerThan, _warnOnce } from 'ag-grid-community';

import type { FormulaError } from '../formula/ast/utils';
import { Dialog } from '../widgets/dialog';
import type { CalculatedColumnDraft, CalculatedColumnType, ColumnSuggestion } from './calculatedColumnForm';
import { CALCULATED_COLUMN_TYPES, CalculatedColumnForm, DEFAULT_DRAFT } from './calculatedColumnForm';
import {
    createCalculatedColumnReferenceMapper,
    translateCalculatedColumnReferenceError,
} from './calculatedColumnReferenceMapper';
import {
    clearStaleDataTypeProperties,
    collectColIdsAndFields,
    replaceBracketReferences,
} from './calculatedColumnUtils';

export class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    public readonly beanName = 'calculatedColsSvc' as const;

    public addCalculatedColumn(colDef: CalculatedColumnDef): void {
        if (!_isStringLargerThan(colDef.calculatedExpression, 0, true)) {
            _warnOnce('addCalculatedColumn: calculatedExpression is required and cannot be empty.');
            return;
        }
        if (
            !this.validateColumnReferences(colDef.calculatedExpression) ||
            !this.validateFormulaExpression(colDef.calculatedExpression)
        ) {
            return;
        }
        const nextDefs = [...this.getColumnDefs(), this.toCalculatedColDef(colDef)];
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
    }

    public updateCalculatedColumn(column: ColKey, colDef: CalculatedColumnUpdate): void {
        const targetColumn = this.beans.colModel.getColDefColOrCol(column);
        if (targetColumn?.colDef.calculatedExpression == null) {
            return;
        }
        if (colDef.calculatedExpression !== undefined) {
            if (!_isStringLargerThan(colDef.calculatedExpression, 0, true)) {
                _warnOnce('updateCalculatedColumn: calculatedExpression cannot be empty.');
                return;
            }
            if (
                !this.validateColumnReferences(colDef.calculatedExpression) ||
                !this.validateFormulaExpression(colDef.calculatedExpression)
            ) {
                return;
            }
        }

        const targetColId = targetColumn.getColId();
        const nextDefs = this.updateCalculatedColumnDef(this.getColumnDefs(), targetColumn, colDef);
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
        this.refreshCalculatedColumn(targetColId);
    }

    private getFormulaExpressionError(expression: string): string | null {
        const error = this.beans.formula?.validateExpression(`=${expression}`);
        return error ? (error as FormulaError).getTranslatedMessage(this.getLocaleTextFunc()) : null;
    }

    private validateFormulaExpression(expression: string): boolean {
        const error = this.getFormulaExpressionError(expression);
        if (error) {
            _warnOnce(error);
            return false;
        }
        return true;
    }

    private validateColumnReferences(expression: string): boolean {
        let invalidReference: string | undefined;
        replaceBracketReferences(expression, (ref) => {
            if (invalidReference == null && !this.beans.colModel.getColById(ref)) {
                invalidReference = ref;
            }
            return ref;
        });

        if (invalidReference != null) {
            _warnOnce(
                translateCalculatedColumnReferenceError(
                    { type: 'unknown', reference: invalidReference },
                    this.getLocaleTextFunc()
                )
            );
            return false;
        }

        return true;
    }

    public showAddCalculatedColumnDialog(column: AgColumn | null): void {
        const colId = this.createUniqueColId();
        const headerName = this.getLocaleTextFunc()('calculatedColumnDefaultTitle', 'New title');
        const draft: CalculatedColumnDraft = { colId, headerName, ...DEFAULT_DRAFT };
        this.showDialog(draft, (nextDraft) => {
            const nextDefs = this.insertCalculatedColumn(this.getColumnDefs(), column, this.toColDef(nextDraft));
            this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
            this.focusCalculatedColumn(nextDraft.colId);
        });
    }

    public showUpdateCalculatedColumnDialog(column: AgColumn | null): void {
        if (column?.colDef.calculatedExpression == null) {
            return;
        }

        const draft = this.toDraft(column);
        this.focusCalculatedColumn(draft.colId);
        this.showDialog(draft, (nextDraft) => {
            const { colId: _, ...update } = this.toColDef(nextDraft);
            this.updateCalculatedColumn(column, update);
        });
    }

    public removeCalculatedColumn(column: AgColumn | null): void {
        if (column?.colDef.calculatedExpression == null) {
            return;
        }

        const nextDefs = this.removeCalculatedColumnDef(this.getColumnDefs(), column);
        this.beans.gridApi.updateGridOptions({ columnDefs: nextDefs });
    }

    private getColumnDefs(): (ColDef | ColGroupDef)[] {
        return this.beans.colModel.getColumnDefs(true) ?? [];
    }

    private createUniqueColId(): string {
        const usedIds = collectColIdsAndFields(this.getColumnDefs());
        let index = 1;
        while (usedIds.has(`calculated_${index}`)) {
            index++;
        }
        return `calculated_${index}`;
    }

    private insertCalculatedColumn(
        columnDefs: (ColDef | ColGroupDef)[],
        column: AgColumn | null,
        calculatedColDef: ColDef
    ): (ColDef | ColGroupDef)[] {
        const targetColId = column?.getColId();
        if (!targetColId) {
            return [...columnDefs, calculatedColDef];
        }

        let didInsert = false;
        const insertInto = (defs: (ColDef | ColGroupDef)[]): (ColDef | ColGroupDef)[] => {
            const nextDefs: (ColDef | ColGroupDef)[] = [];
            for (const colDef of defs) {
                nextDefs.push(
                    'children' in colDef && colDef.children
                        ? { ...colDef, children: insertInto(colDef.children) }
                        : colDef
                );

                if (!('children' in colDef) && (colDef.colId ?? colDef.field) === targetColId) {
                    nextDefs.push(calculatedColDef);
                    didInsert = true;
                }
            }
            return nextDefs;
        };

        const nextDefs = insertInto(columnDefs);
        return didInsert ? nextDefs : [...columnDefs, calculatedColDef];
    }

    private updateCalculatedColumnDef(
        columnDefs: (ColDef | ColGroupDef)[],
        column: AgColumn,
        colDefUpdate: CalculatedColumnUpdate
    ): (ColDef | ColGroupDef)[] {
        const targetColDef = column.getUserProvidedColDef();
        const targetColId = column.getColId();
        const safeUpdate: ColDef = { ...colDefUpdate };
        delete safeUpdate.colId;

        return columnDefs.map((colDef) => {
            if ('children' in colDef && colDef.children) {
                return { ...colDef, children: this.updateCalculatedColumnDef(colDef.children, column, colDefUpdate) };
            }

            const isTarget =
                this.isCalculatedColumnDef(colDef) &&
                (colDef === targetColDef || colDef.colId === targetColId || colDef.field === targetColId);

            if (!isTarget) {
                return colDef;
            }

            const nextColDef = {
                ...clearStaleDataTypeProperties(colDef, targetColDef, safeUpdate),
                ...safeUpdate,
            };
            nextColDef.calculatedExpression ??= colDef.calculatedExpression;

            return this.toCalculatedColDef(nextColDef);
        });
    }

    private showDialog(draft: CalculatedColumnDraft, onApply: (draft: CalculatedColumnDraft) => void): void {
        const state: { close?: () => void; resolved: boolean } = { resolved: false };
        const mapper = createCalculatedColumnReferenceMapper(
            this.beans,
            this.beans.colModel.getCols() ?? [],
            draft.colId
        );

        const getValidatedExpression = (
            nextDraft: CalculatedColumnDraft
        ): { valid: true; expression: string } | { valid: false; error: string } => {
            const result = mapper.toInternalExpression(nextDraft.calculatedExpression);
            if ('error' in result) {
                return {
                    valid: false,
                    error: translateCalculatedColumnReferenceError(result.error, this.getLocaleTextFunc()),
                };
            }
            const error = this.getFormulaExpressionError(result.expression);
            return error ? { valid: false, error } : { valid: true, expression: result.expression };
        };
        const handleValidate = (nextDraft: CalculatedColumnDraft): string | null => {
            const result = getValidatedExpression(nextDraft);
            return result.valid ? null : result.error;
        };
        const handleApply = (nextDraft: CalculatedColumnDraft): string | null => {
            if (state.resolved) {
                return null;
            }
            const result = getValidatedExpression(nextDraft);
            if (!result.valid) {
                return result.error;
            }
            state.resolved = true;
            onApply({ ...nextDraft, calculatedExpression: result.expression });
            state.close?.();
            return null;
        };
        const handleCancel = () => {
            if (state.resolved) {
                return;
            }
            state.resolved = true;
            state.close?.();
        };

        const form = this.createManagedBean(
            new CalculatedColumnForm(
                draft,
                () => mapper.suggestions,
                () => this.getFunctionSuggestions(),
                handleValidate,
                handleApply,
                handleCancel
            )
        );
        const dialog = this.createManagedBean(
            new Dialog({
                title: this.getLocaleTextFunc()('calculatedColumn', 'Calculated Column'),
                component: form,
                width: 300,
                height: 320,
                minWidth: 260,
                minHeight: 280,
                centered: true,
                movable: true,
                resizable: true,
                modal: false,
                cssIdentifier: 'calculated-column',
            })
        );
        state.close = () => dialog.close();
        const destroyDialogMouseListeners = this.addManagedElementListeners(dialog.getGui(), {
            mousedown: () => form.hideSuggestions(),
        });
        dialog.addDestroyFunc(() => destroyDialogMouseListeners.forEach((destroyFunc) => destroyFunc()));
        dialog.addEventListener('destroyed', () => this.destroyBean(form));
    }

    private removeCalculatedColumnDef(
        columnDefs: (ColDef | ColGroupDef)[],
        column: AgColumn
    ): (ColDef | ColGroupDef)[] {
        const targetColDef = column.getUserProvidedColDef();
        const targetColId = column.getColId();

        return columnDefs.reduce<(ColDef | ColGroupDef)[]>((nextDefs, colDef) => {
            if ('children' in colDef && colDef.children) {
                nextDefs.push({ ...colDef, children: this.removeCalculatedColumnDef(colDef.children, column) });
                return nextDefs;
            }

            const isTarget =
                this.isCalculatedColumnDef(colDef) &&
                (colDef === targetColDef || colDef.colId === targetColId || colDef.field === targetColId);

            if (!isTarget) {
                nextDefs.push(colDef);
            }

            return nextDefs;
        }, []);
    }

    private isCalculatedColumnDef(colDef: ColDef | ColGroupDef): colDef is ColDef {
        return !('children' in colDef) && colDef.calculatedExpression != null;
    }

    private toDraft(column: AgColumn): CalculatedColumnDraft {
        const colDef = column.colDef;
        const colId = column.getColId();
        const cellDataType = colDef.cellDataType;
        const displayName = this.beans.colNames.getDisplayNameForColumn(column, 'header');

        return {
            colId,
            headerName: colDef.headerName ?? displayName ?? colId,
            cellDataType:
                typeof cellDataType === 'string' && cellDataType in CALCULATED_COLUMN_TYPES
                    ? (cellDataType as CalculatedColumnType)
                    : DEFAULT_DRAFT.cellDataType,
            calculatedExpression: createCalculatedColumnReferenceMapper(
                this.beans,
                this.beans.colModel.getCols() ?? [],
                colId
            ).toDisplayExpression(colDef.calculatedExpression ?? ''),
        };
    }

    private focusCalculatedColumn(colId: string): void {
        window.setTimeout(() => {
            const headerPosition = this.beans.headerNavigation?.getHeaderPositionForColumn(colId, false);
            if (headerPosition) {
                this.beans.focusSvc.focusHeaderPosition({ headerPosition });
            }
        }, 0);
    }

    private toColDef(draft: CalculatedColumnDraft): ColDef {
        return {
            colId: draft.colId,
            headerName: draft.headerName,
            calculatedExpression: draft.calculatedExpression,
            cellDataType: draft.cellDataType,
            editable: false,
            suppressPaste: true,
        };
    }

    private toCalculatedColDef(colDef: CalculatedColumnDef | ColDef): ColDef {
        // strip fields that conflict with calculatedExpression invariants (see colDefValidations.ts).
        const sanitised: ColDef = { ...colDef };
        const invariantProperties: (keyof ColDef)[] = [
            'field',
            'valueGetter',
            'valueSetter',
            'cellEditor',
            'cellEditorSelector',
        ];
        invariantProperties.forEach((prop) => delete sanitised[prop]);

        return {
            ...sanitised,
            editable: false,
            suppressPaste: true,
        };
    }

    private getFunctionSuggestions(): ColumnSuggestion[] {
        return (this.beans.formula?.getFunctionNames() ?? []).map((name) => ({
            type: 'function',
            value: name,
            label: name,
        }));
    }

    private refreshCalculatedColumn(colId: string): void {
        window.setTimeout(() => {
            const column = this.beans.colModel.getColById(colId);
            if (!column) {
                return;
            }

            this.beans.rowRenderer.refreshCells({ columns: [column], force: true });
        }, 0);
    }
}
