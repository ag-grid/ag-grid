import type {
    AgColumn,
    CalculatedColumnDef,
    CalculatedColumnUpdate,
    CalculatedColumnValidationReason,
    ColDef,
    ColGroupDef,
    ColKey,
    ColumnEventType,
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

type ValidationState = 'valid' | CalculatedColumnValidationReason;

type CalcColEventCommonParams = {
    column: AgColumn;
    columns: AgColumn[];
    expression: string;
    source: ColumnEventType;
};

export class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    public readonly beanName = 'calculatedColsSvc' as const;

    private validationStatesByColId = new Map<string, ValidationState>();
    private validationStatesInitialised = false;
    private suppressValidationChecks = 0;

    public postConstruct(): void {
        this.addManagedEventListeners({
            newColumnsLoaded: (event) => this.checkValidationStates(event.source),
        });
    }

    public addCalculatedColumn(colDef: CalculatedColumnDef, source: 'api' | 'calculatedColumn' = 'api'): void {
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

        const colId = colDef.colId ?? this.createUniqueColId();
        const nextColDef = this.toCalculatedColDef({ ...colDef, colId });
        const nextDefs = [...this.getColumnDefs(), nextColDef];
        this.updateColumnDefs(nextDefs);

        const column = this.beans.colModel.getColById(colId);
        if (column) {
            this.dispatchCreatedOrRemovedEvent(
                'calculatedColumnCreated',
                this.getEventCommonParams(column, colDef.calculatedExpression, source)
            );
        }
        this.checkValidationStates(source, true);
    }

    public updateCalculatedColumn(
        column: ColKey,
        colDef: CalculatedColumnUpdate,
        source: 'api' | 'calculatedColumn' = 'api'
    ): void {
        const targetColumn = this.beans.colModel.getColDefColOrCol(column);
        if (targetColumn?.colDef.calculatedExpression == null) {
            return;
        }
        const oldExpression = targetColumn.colDef.calculatedExpression;
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

        const targetColId = targetColumn.colId;
        const nextDefs = this.updateCalculatedColumnDef(this.getColumnDefs(), targetColumn, colDef);
        this.updateColumnDefs(nextDefs);
        const nextColumn = this.beans.colModel.getColById(targetColId) ?? targetColumn;
        const newExpression = nextColumn.colDef.calculatedExpression ?? oldExpression;
        if (colDef.calculatedExpression !== undefined && oldExpression !== newExpression) {
            this.dispatchExpressionChangedEvent(
                this.getEventCommonParams(nextColumn, newExpression, source),
                oldExpression
            );
        }
        this.checkValidationStates(source, true);
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

    private getInvalidColumnReference(expression: string): string | undefined {
        let invalidReference: string | undefined;
        replaceBracketReferences(expression, (ref) => {
            if (invalidReference == null && !this.beans.colModel.getColById(ref)) {
                invalidReference = ref;
            }
            return ref;
        });

        return invalidReference;
    }

    private validateColumnReferences(expression: string): boolean {
        const invalidReference = this.getInvalidColumnReference(expression);

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

    public openCalculatedColumnDialog(column: AgColumn | null, mode: 'add' | 'edit'): void {
        if (mode === 'add') {
            const colId = this.createUniqueColId();
            const headerName = this.getLocaleTextFunc()('calculatedColumnDefaultTitle', 'New title');
            const draft: CalculatedColumnDraft = { colId, headerName, ...DEFAULT_DRAFT };
            this.showDialog(draft, (nextDraft) => {
                const nextDefs = this.insertCalculatedColumn(this.getColumnDefs(), column, this.toColDef(nextDraft));
                this.updateColumnDefs(nextDefs);
                this.focusCalculatedColumn(nextDraft.colId);
                const newColumn = this.beans.colModel.getColById(nextDraft.colId);
                if (newColumn) {
                    this.dispatchCreatedOrRemovedEvent(
                        'calculatedColumnCreated',
                        this.getEventCommonParams(newColumn, nextDraft.calculatedExpression, 'calculatedColumn')
                    );
                }
                this.checkValidationStates('calculatedColumn', true);
            });
            return;
        }

        if (column?.colDef.calculatedExpression == null) {
            return;
        }
        const draft = this.toDraft(column);
        this.focusCalculatedColumn(draft.colId);
        this.showDialog(draft, (nextDraft) => {
            const { colId: _, ...update } = this.toColDef(nextDraft);
            this.updateCalculatedColumn(column.colId, update, 'calculatedColumn');
        });
    }

    public removeCalculatedColumn(column: AgColumn | null, source: 'api' | 'calculatedColumn' = 'api'): void {
        if (column?.colDef.calculatedExpression == null) {
            return;
        }

        const expression = column.colDef.calculatedExpression;
        const nextDefs = this.removeCalculatedColumnDef(this.getColumnDefs(), column);
        this.updateColumnDefs(nextDefs);
        this.dispatchCreatedOrRemovedEvent(
            'calculatedColumnRemoved',
            this.getEventCommonParams(column, expression, source)
        );
        this.checkValidationStates(source, true);
    }

    private getColumnDefs(): (ColDef | ColGroupDef)[] {
        return this.beans.colModel.getColumnDefs(true) ?? [];
    }

    private updateColumnDefs(columnDefs: (ColDef | ColGroupDef)[]): void {
        this.suppressValidationChecks++;
        try {
            this.beans.gridApi.updateGridOptions({ columnDefs });
        } finally {
            this.suppressValidationChecks--;
        }
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
        const targetColId = column?.colId;
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
        const targetColId = column.colId;
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
        const targetColId = column.colId;

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
        const colId = column.colId;
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

    private getExpressionValidationState(expression: string): ValidationState {
        if (this.getInvalidColumnReference(expression) != null) {
            return 'unknownReference';
        }
        return this.getFormulaExpressionError(expression) == null ? 'valid' : 'invalidExpression';
    }

    private checkValidationStates(source: ColumnEventType, forceDispatch = false): void {
        if (this.suppressValidationChecks > 0) {
            return;
        }

        const shouldDispatch = forceDispatch || this.validationStatesInitialised;
        const previousStates = this.validationStatesByColId;
        const nextStates = new Map<string, ValidationState>();

        for (const column of this.beans.colModel.getCols() ?? []) {
            const expression = column.colDef.calculatedExpression;
            if (expression == null) {
                continue;
            }

            const colId = column.colId;
            const state = this.getExpressionValidationState(expression);
            nextStates.set(colId, state);

            const previousState = previousStates.get(colId);
            if (shouldDispatch && previousState !== undefined && previousState !== state) {
                const valid = state === 'valid';
                this.dispatchValidationStateChangedEvent(
                    this.getEventCommonParams(column, expression, source),
                    valid,
                    valid ? undefined : state
                );
            }
        }

        this.validationStatesByColId = nextStates;
        this.validationStatesInitialised = true;
    }

    private getEventCommonParams(
        column: AgColumn,
        expression: string,
        source: ColumnEventType
    ): CalcColEventCommonParams {
        return { column, columns: [column], expression, source };
    }

    private dispatchCreatedOrRemovedEvent(
        type: 'calculatedColumnCreated' | 'calculatedColumnRemoved',
        commonParams: CalcColEventCommonParams
    ): void {
        this.eventSvc.dispatchEvent({ type, ...commonParams } as Parameters<typeof this.eventSvc.dispatchEvent>[0]);
    }

    private dispatchExpressionChangedEvent(commonParams: CalcColEventCommonParams, oldExpression: string): void {
        this.eventSvc.dispatchEvent({
            type: 'calculatedColumnExpressionChanged',
            ...commonParams,
            oldExpression,
        });
    }

    private dispatchValidationStateChangedEvent(
        commonParams: CalcColEventCommonParams,
        valid: boolean,
        reason?: CalculatedColumnValidationReason
    ): void {
        this.eventSvc.dispatchEvent({
            type: 'calculatedColumnValidationStateChanged',
            ...commonParams,
            valid,
            reason,
        });
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
