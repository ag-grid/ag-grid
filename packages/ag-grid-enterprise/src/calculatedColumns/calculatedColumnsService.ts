import type {
    AgColumn,
    CalculatedColumnDef,
    CalculatedColumnUpdate,
    CalculatedColumnValidationReason,
    ColDef,
    ColGroupDef,
    ColKey,
    Column,
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
    indexOfColDef,
    indexOfColId,
    replaceBracketReferences,
} from './calculatedColumnUtils';

type ValidationState = 'valid' | CalculatedColumnValidationReason;

type CalcColEventCommonParams = {
    column: AgColumn;
    columns: AgColumn[];
    expression: string;
    source: ColumnEventType;
};

type DynamicCalculatedColumn = {
    colId: string;
    colDef: ColDef;
    anchorColId?: string;
    anchorColDef?: ColDef | null;
    visibleAnchorColId?: string;
};

type DynamicCalculatedColumnOverride = {
    colId: string;
    colDef: ColDef;
    targetColDef: ColDef | null;
};

type DynamicCalculatedColumnSuppression = {
    colId: string;
    targetColDef: ColDef | null;
};

export class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    public readonly beanName = 'calculatedColsSvc' as const;

    // calculated columns added via API/dialog, projected into the column tree (not in user `columnDefs`).
    private dynamicColumns: DynamicCalculatedColumn[] = [];
    // dynamic columns parked by `resetColumnState` so a later `applyColumnState` can restore them.
    private inactiveDynamicColumns: DynamicCalculatedColumn[] = [];
    // edits to user-declared calculated columns, applied over the original colDef during projection.
    private readonly dynamicOverrides = new Map<string, DynamicCalculatedColumnOverride>();
    // user-declared calculated columns removed by the user, suppressed from the projected tree.
    private readonly dynamicSuppressions = new Map<string, DynamicCalculatedColumnSuppression>();
    // last known validation state per calculated column, to detect changes and fire validation events.
    private validationStatesByColId = new Map<string, ValidationState>();
    // guards the first validation pass so we don't emit spurious change events before the baseline exists.
    private validationStatesInitialised = false;
    // re-entry counter: when > 0, projection-triggered refreshes skip validation checks.
    private suppressValidationChecks = 0;

    public postConstruct(): void {
        this.addManagedEventListeners({
            newColumnsLoaded: (event) => this.checkValidationStates(event.source),
            columnMoved: (event) => this.releaseVisibleAnchors(event.columns),
        });
    }

    private releaseVisibleAnchors(columns: Column[] | null | undefined): void {
        if (!columns) {
            return;
        }
        for (let i = 0, len = columns.length; i < len; ++i) {
            const dynamicColumn = this.getDynamicColumn(columns[i].getColId());
            if (dynamicColumn) {
                dynamicColumn.visibleAnchorColId = undefined;
            }
        }
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
        this.removeInactiveDynamicColumn(colId);
        this.dynamicColumns.push({ colId, colDef: nextColDef });
        this.refreshDynamicColumns(source);

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
        const nextColDef = this.getUpdatedCalculatedColDef(targetColumn, colDef);
        const dynamicColumn = this.getDynamicColumn(targetColId);
        if (dynamicColumn) {
            dynamicColumn.colDef = nextColDef;
        } else {
            this.dynamicOverrides.set(targetColId, {
                colId: targetColId,
                colDef: nextColDef,
                targetColDef: targetColumn.getUserProvidedColDef(),
            });
            this.dynamicSuppressions.delete(targetColId);
        }
        this.refreshDynamicColumns(source);
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
                this.removeInactiveDynamicColumn(nextDraft.colId);
                this.dynamicColumns.push({
                    colId: nextDraft.colId,
                    colDef: this.toColDef(nextDraft),
                    anchorColId: column?.colId,
                    anchorColDef: column?.getUserProvidedColDef(),
                    visibleAnchorColId: column?.colId,
                });
                this.refreshDynamicColumns('calculatedColumn');
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
        const dynamicIndex = indexOfColId(this.dynamicColumns, column.colId);
        if (dynamicIndex >= 0) {
            this.dynamicColumns.splice(dynamicIndex, 1);
            this.removeDynamicAnchors(column.colId);
        } else {
            this.dynamicOverrides.delete(column.colId);
            this.dynamicSuppressions.set(column.colId, {
                colId: column.colId,
                targetColDef: column.getUserProvidedColDef(),
            });
        }
        this.refreshDynamicColumns(source);
        this.dispatchCreatedOrRemovedEvent(
            'calculatedColumnRemoved',
            this.getEventCommonParams(column, expression, source)
        );
        this.checkValidationStates(source, true);
    }

    public createProjectedColumnDefs(
        columnDefs: (ColDef | ColGroupDef)[] | undefined
    ): (ColDef | ColGroupDef)[] | undefined {
        if (!this.hasDynamicColumnState()) {
            return columnDefs;
        }

        const insertedDynamicColIds = new Set<string>();
        const sourceColumnDefs = columnDefs ?? [];
        const result = this.projectColumnDefs(sourceColumnDefs, insertedDynamicColIds);
        let projectedColumnDefs = result.columnDefs;
        let visibleAnchorInsertIndex = 0;

        for (const dynamicColumn of this.dynamicColumns) {
            if (insertedDynamicColIds.has(dynamicColumn.colId)) {
                continue;
            }

            if (projectedColumnDefs === sourceColumnDefs) {
                projectedColumnDefs = sourceColumnDefs.slice();
            }
            const insertIndex =
                dynamicColumn.visibleAnchorColId != null ? visibleAnchorInsertIndex : projectedColumnDefs.length;
            projectedColumnDefs.splice(insertIndex, 0, dynamicColumn.colDef);
            insertedDynamicColIds.add(dynamicColumn.colId);
            this.insertDynamicColumnsAfterDynamicColumn(
                dynamicColumn.colId,
                projectedColumnDefs,
                insertedDynamicColIds
            );
            if (dynamicColumn.visibleAnchorColId != null) {
                visibleAnchorInsertIndex = indexOfColDef(projectedColumnDefs, dynamicColumn.colId) + 1;
            }
        }

        return projectedColumnDefs;
    }

    public orderDynamicColumns(columns: AgColumn[]): void {
        for (let i = this.dynamicColumns.length - 1; i >= 0; --i) {
            const dynamicColumn = this.dynamicColumns[i];
            const visibleAnchorColId = dynamicColumn.visibleAnchorColId;
            if (visibleAnchorColId != null) {
                this.moveColumnAfter(columns, dynamicColumn.colId, visibleAnchorColId);
            }
        }
    }

    public resetDynamicColumnDefs(preserveCreatedColumns = false): boolean {
        if (!preserveCreatedColumns) {
            this.inactiveDynamicColumns = [];
        }

        if (!this.hasDynamicColumnState()) {
            return false;
        }

        if (preserveCreatedColumns) {
            for (let i = 0, len = this.dynamicColumns.length; i < len; ++i) {
                this.addInactiveDynamicColumn(this.dynamicColumns[i]);
            }
        }

        this.dynamicColumns = [];
        this.dynamicOverrides.clear();
        this.dynamicSuppressions.clear();
        return true;
    }

    public restoreDynamicColumnDefs(colIds: string[]): boolean {
        if (!this.inactiveDynamicColumns.length) {
            return false;
        }

        let restored = false;
        for (let i = 0, len = colIds.length; i < len; ++i) {
            const colId = colIds[i];
            const inactiveIndex = indexOfColId(this.inactiveDynamicColumns, colId);
            if (inactiveIndex < 0) {
                continue;
            }

            const inactiveDynamicColumn = this.inactiveDynamicColumns[inactiveIndex];
            this.inactiveDynamicColumns.splice(inactiveIndex, 1);
            if (this.getDynamicColumn(colId)) {
                continue;
            }

            this.dynamicColumns.push(inactiveDynamicColumn);
            restored = true;
        }
        return restored;
    }

    private hasDynamicColumnState(): boolean {
        return this.dynamicColumns.length > 0 || this.dynamicOverrides.size > 0 || this.dynamicSuppressions.size > 0;
    }

    private refreshDynamicColumns(source: ColumnEventType): void {
        this.suppressValidationChecks++;
        try {
            this.beans.colModel.refreshDynamicColumns(source);
        } finally {
            this.suppressValidationChecks--;
        }
    }

    private createUniqueColId(): string {
        const usedIds = collectColIdsAndFields(this.beans.colModel.getProvidedColumnDefs() ?? []);
        const currentColumns = this.beans.colModel.getCols() ?? [];
        for (let i = 0, len = currentColumns.length; i < len; ++i) {
            usedIds.add(currentColumns[i].colId);
        }
        for (let i = 0, len = this.dynamicColumns.length; i < len; ++i) {
            usedIds.add(this.dynamicColumns[i].colId);
        }
        for (let i = 0, len = this.inactiveDynamicColumns.length; i < len; ++i) {
            usedIds.add(this.inactiveDynamicColumns[i].colId);
        }

        let index = 1;
        while (usedIds.has(`calculated_${index}`)) {
            index++;
        }
        return `calculated_${index}`;
    }

    private getUpdatedCalculatedColDef(column: AgColumn, colDefUpdate: CalculatedColumnUpdate): ColDef {
        const dynamicColumn = this.getDynamicColumn(column.colId);
        const dynamicOverride = this.dynamicOverrides.get(column.colId);
        const baseColDef =
            dynamicColumn?.colDef ?? dynamicOverride?.colDef ?? column.getUserProvidedColDef() ?? column.colDef;
        const safeUpdate: ColDef = { ...colDefUpdate };
        delete safeUpdate.colId;

        const nextColDef = {
            ...clearStaleDataTypeProperties(baseColDef, column.getUserProvidedColDef(), safeUpdate),
            ...safeUpdate,
        };
        nextColDef.calculatedExpression ??= baseColDef.calculatedExpression;
        nextColDef.colId ??= column.colId;

        return this.toCalculatedColDef(nextColDef);
    }

    private projectColumnDefs(
        columnDefs: (ColDef | ColGroupDef)[],
        insertedDynamicColIds: Set<string>
    ): { columnDefs: (ColDef | ColGroupDef)[]; changed: boolean } {
        let changed = false;
        const projectedColumnDefs: (ColDef | ColGroupDef)[] = [];

        for (const colDef of columnDefs) {
            if ('children' in colDef && colDef.children) {
                const childResult = this.projectColumnDefs(colDef.children, insertedDynamicColIds);
                if (childResult.changed) {
                    projectedColumnDefs.push({ ...colDef, children: childResult.columnDefs });
                    changed = true;
                } else {
                    projectedColumnDefs.push(colDef);
                }
                continue;
            }

            if (this.isColDefSuppressed(colDef)) {
                changed = true;
                continue;
            }

            const override = this.getColDefOverride(colDef);
            const projectedColDef = override?.colDef ?? colDef;
            projectedColumnDefs.push(projectedColDef);
            changed ||= override != null;

            if (this.insertDynamicColumnsAfterUserColumn(colDef, projectedColumnDefs, insertedDynamicColIds)) {
                changed = true;
            }
        }

        return { columnDefs: changed ? projectedColumnDefs : columnDefs, changed };
    }

    private insertDynamicColumnsAfterUserColumn(
        colDef: ColDef,
        targetColumnDefs: (ColDef | ColGroupDef)[],
        insertedDynamicColIds: Set<string>
    ): boolean {
        let changed = false;
        const colId = colDef.colId ?? colDef.field;

        for (const dynamicColumn of this.dynamicColumns) {
            if (
                insertedDynamicColIds.has(dynamicColumn.colId) ||
                !this.matchesColumnDef(colDef, dynamicColumn.anchorColId, dynamicColumn.anchorColDef)
            ) {
                continue;
            }

            targetColumnDefs.push(dynamicColumn.colDef);
            insertedDynamicColIds.add(dynamicColumn.colId);
            this.insertDynamicColumnsAfterDynamicColumn(dynamicColumn.colId, targetColumnDefs, insertedDynamicColIds);
            changed = true;
        }

        if (colId != null) {
            this.insertDynamicColumnsAfterDynamicColumn(colId, targetColumnDefs, insertedDynamicColIds);
        }

        return changed;
    }

    private getDynamicColumn(colId: string): DynamicCalculatedColumn | undefined {
        const index = indexOfColId(this.dynamicColumns, colId);
        return index < 0 ? undefined : this.dynamicColumns[index];
    }

    private addInactiveDynamicColumn(dynamicColumn: DynamicCalculatedColumn): void {
        this.removeInactiveDynamicColumn(dynamicColumn.colId);
        this.inactiveDynamicColumns.push(dynamicColumn);
    }

    private removeInactiveDynamicColumn(colId: string): void {
        const inactiveIndex = indexOfColId(this.inactiveDynamicColumns, colId);
        if (inactiveIndex >= 0) {
            this.inactiveDynamicColumns.splice(inactiveIndex, 1);
        }
    }

    private moveColumnAfter(columns: AgColumn[], colId: string, anchorColId: string): void {
        const columnIndex = indexOfColId(columns, colId);
        if (columnIndex < 0 || indexOfColId(columns, anchorColId) < 0) {
            return;
        }

        const [column] = columns.splice(columnIndex, 1);
        columns.splice(indexOfColId(columns, anchorColId) + 1, 0, column);
    }

    private insertDynamicColumnsAfterDynamicColumn(
        anchorColId: string,
        targetColumnDefs: (ColDef | ColGroupDef)[],
        insertedDynamicColIds: Set<string>
    ): void {
        for (const dynamicColumn of this.dynamicColumns) {
            if (insertedDynamicColIds.has(dynamicColumn.colId) || dynamicColumn.anchorColId !== anchorColId) {
                continue;
            }

            targetColumnDefs.push(dynamicColumn.colDef);
            insertedDynamicColIds.add(dynamicColumn.colId);
            this.insertDynamicColumnsAfterDynamicColumn(dynamicColumn.colId, targetColumnDefs, insertedDynamicColIds);
        }
    }

    private getColDefOverride(colDef: ColDef): DynamicCalculatedColumnOverride | undefined {
        for (const override of this.dynamicOverrides.values()) {
            if (this.matchesColumnDef(colDef, override.colId, override.targetColDef)) {
                return override;
            }
        }
        return undefined;
    }

    private isColDefSuppressed(colDef: ColDef): boolean {
        for (const suppression of this.dynamicSuppressions.values()) {
            if (this.matchesColumnDef(colDef, suppression.colId, suppression.targetColDef)) {
                return true;
            }
        }
        return false;
    }

    private matchesColumnDef(colDef: ColDef, colId: string | undefined, targetColDef?: ColDef | null): boolean {
        return colDef === targetColDef || (colId != null && (colDef.colId === colId || colDef.field === colId));
    }

    private removeDynamicAnchors(colId: string): void {
        for (let i = 0, len = this.dynamicColumns.length; i < len; ++i) {
            const dynamicColumn = this.dynamicColumns[i];
            if (dynamicColumn.anchorColId === colId) {
                dynamicColumn.anchorColId = undefined;
                dynamicColumn.anchorColDef = undefined;
            }
        }
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
