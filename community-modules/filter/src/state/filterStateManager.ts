import { Autowired, Bean, Column, ColumnModel, GridOptions } from "@ag-grid-community/core";
import { FilterEvaluationModel, FilterExpression, PartialStateType, StateManager } from "../interfaces";
import { EvaluationModelFactory } from "../evaluation-model/evaluationModelFactory";
import { expressionType } from "../filterMapping";
import { FilterListenerManager } from "./filterListenerManager";
import { NullModel } from "../evaluation-model/nullModel";

type PartialFilterExpression = PartialStateType<FilterExpression>;
const DEFAULT_EXPRESSIONS: {[k in FilterExpression['type']]: PartialFilterExpression } = {
    'text-op': {
        type: 'text-op',
        operation: 'equals',
        operands: [null],
    },
    'number-op': {
        type: 'number-op',
        operation: 'equals',
        operands: [null],
    },
    'date-op': {
        type: 'date-op',
        operation: 'equals',
        operands: [null],
    },
    'set-op': {
        type: 'set-op',
        operation: 'in',
        operands: null,
    },
    'logic': {
        type: 'logic',
        operation: 'and',
        operands: [],
    },
};

function defaultExpression(column: Column, gridOptions: GridOptions): PartialStateType<FilterExpression> {
    const exprType = expressionType(column.getColDef(), gridOptions);
    if (exprType === 'unknown') {
        throw new Error('AG-Grid - no default expression for column: ' + column.getColId());
    }

    return DEFAULT_EXPRESSIONS[exprType];
}

type FilterChangeType = 'update' | 'apply' | 'revert' | 'destroy';
export interface FilterChangeListener {
    (params: { colId: string, expr: FilterExpression | null, type: FilterChangeType }): void;
}
export interface TransientFilterChangeListener {
    (params: { colId: string, expr: PartialFilterExpression | null, type: FilterChangeType }): void;
}

interface ActiveState {
    model: FilterEvaluationModel<unknown>;
    listeners: FilterListenerManager<FilterChangeListener>;
}

interface TransientState {
    expr: PartialFilterExpression | null;
    listeners: FilterListenerManager<TransientFilterChangeListener>;
}

/**
 * Manages the filter state for the grid. Tracks two forms of state:
 * - Currently applied filter state; this state can only be mutated to known valid states, which is
 *   enforced through expression validation checks requiring to pass before mutation can proceed.
 * - Transient (in-flux) user modified filter state; this state can be mutated into invalid states,
 *   but it can only be merged into the current filter state once valid.
 */
@Bean('filterStateManager')
export class FilterStateManager {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('expressionModelFactory') private readonly expressionModelFactory: EvaluationModelFactory;
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;

    private currentState: { [key: string]: ActiveState } = {};
    private transientState: { [key: string]: TransientState } = {};

    public getCurrentState(): { [key: string]: FilterExpression } | null {
        const result: { [key: string]: FilterExpression } = {};

        let count = 0;
        Object.keys(this.currentState).forEach((colId) => {
            const { model } = this.currentState[colId];

            if (model.isNull()) { return; }

            const expr = model.toFilterExpression();
            if (expr == null) { return; }

            result[colId] = expr;
            count++;
        });

        return count > 0 ? result : null;
    }

    public getCurrentModel(): {[key: string]: FilterEvaluationModel<unknown> } | null {
        const result: { [key: string]: FilterEvaluationModel<unknown> } = {};

        let count = 0;
        Object.keys(this.currentState).forEach((colId) => {
            result[colId] = this.currentState[colId].model;
            count++;
        });

        return count > 0 ? result : null;
    }

    public setCurrentState(exprs: { [key: string]: FilterExpression; } | null) {
        const newActiveExpressions: { [key: string]: ActiveState } = {};
        const newTransientExpressions: { [key: string]: TransientState } = {};
        const notifications: { column: Column, type: FilterChangeType }[] = [];
        const transientNotifications: { column: Column, type: FilterChangeType }[] = [];

        // New / existing filters case.
        Object.keys(exprs || {}).forEach((colId) => {
            const column = this.columnModel.getGridColumn(colId);
            if (column == null) { return; }

            const old = this.currentState[colId];
            const expression = exprs![colId];
            const model = this.expressionModelFactory.buildEvaluationModel(expression);
            const listeners = old ? old.listeners : new FilterListenerManager();

            if (!model.isValid()) {
                throw new Error("AG Grid - invalid filter expression: " + expression);
            }
            newActiveExpressions[colId] = { model, listeners };

            notifications.push({ column, type: 'update' });

            if (this.transientState[colId] != null) {
                newTransientExpressions[colId] = {
                    ...this.transientState[colId],
                    expr: expression,
                };
                transientNotifications.push({ column, type: 'update' });
            }
        });

        // Removed filters case.
        Object.keys(this.currentState).forEach((colId) => {
            if (newActiveExpressions[colId] != null) { return; }

            const column = this.columnModel.getGridColumn(colId);
            if (column == null) { return; }

            newActiveExpressions[colId] = {
                ...this.currentState[colId],
                model: new NullModel(),
            };

            notifications.push({ column, type: 'destroy' });

            if (this.transientState[colId] != null) {
                newTransientExpressions[colId] = {
                    ...this.transientState[colId],
                    expr: defaultExpression(column, this.gridOptions),
                };

                transientNotifications.push({ column, type: 'destroy' });
            }
        });

        this.currentState = newActiveExpressions;
        this.transientState = newTransientExpressions;

        notifications.forEach(({column, type}) => this.notifyListenersForColumn(this, column, type));
        notifications.forEach(({column, type}) => this.notifyTransientListenersForColumn(this, column, type));
    }

    public addListenerForColumn(source: any, column: Column, listener: FilterChangeListener): () => void {
        return this.getStateFor(column).listeners.addListener(source, listener);
    }

    public addTransientListenerForColumn(source: any, column: Column, listener: FilterChangeListener): () => void {
        return this.getTransientStateFor(column).listeners.addListener(source, listener);
    }

    public getStateManager(column: Column): StateManager<FilterExpression> {
        const transientState = this.getTransientStateFor(column);
        const that = {};

        return {
            addTransientUpdateListener: (s, cb) => this.addTransientListenerForColumn(s, column, ({ expr }) => cb(expr)),
            addUpdateListener: (s, cb) => this.addListenerForColumn(s, column, ({ expr }) => cb(expr)),
            applyExpression: (s) => this.applyTransientExpression(s, column),
            mutateTransientExpression: (s, m) => this.mutateTransientExpression(s, column, m),
            revertToAppliedExpression: (s) => this.revertTransientExpression(s, column),
            isTransientExpressionValid: () => this.isTransientExpressionValid(column),
            isTransientExpressionNull: () => this.isTransientExpressionNull(column),
            getTransientExpression: () => transientState.expr,
        };
    }

    private getStateFor(column: Column): ActiveState {
        const colId = column.getColId();
        if (!this.currentState[colId]) {
            const expr = defaultExpression(column, this.gridOptions);
            this.currentState[colId] = {
                listeners: new FilterListenerManager(),
                model: this.expressionModelFactory.buildEvaluationModel(expr),
            };
        }

        return this.currentState[colId];
    }

    private getTransientStateFor(column: Column): TransientState {
        const colId = column.getColId();
        if (!this.transientState[colId]) {
            const expr = this.currentState[colId] ?
                this.currentState[colId].model.toFilterExpression() :
                defaultExpression(column, this.gridOptions);

            this.transientState[colId] = {
                listeners: new FilterListenerManager(),
                expr,
            };
        }

        return this.transientState[colId];
    }

    private notifyListenersForColumn(source: any, column: Column, type: FilterChangeType): void {
        const colId = column.getColId();
        const { listeners, model } = this.getStateFor(column) || {};

        if (listeners == null) { return; }

        const expression = model.toFilterExpression();

        listeners.notify(source, { colId, type, expr: expression });
    }

    private notifyTransientListenersForColumn(source: any, column: Column, type: FilterChangeType): void {
        const colId = column.getColId();
        const { listeners, expr } = this.getTransientStateFor(column) || {};

        if (listeners == null) { return; }

        listeners.notify(source, { colId, type, expr: expr || defaultExpression(column, this.gridOptions) });
    }

    private mutateTransientExpression(source: any, column: Column, change: PartialFilterExpression | null): void {
        const colId = column.getColId();

        if (change == null) {
            this.transientState[colId].expr = null;
        }

        this.transientState[colId].expr = {
            ...(this.transientState[colId].expr || defaultExpression(column, this.gridOptions)),
            ...change,
        } as FilterExpression;

        this.notifyTransientListenersForColumn(source, column, 'update');
    }

    private isTransientExpressionValid(column: Column): boolean {
        const colId = column.getColId();
        const { expr } = this.transientState[colId];
        if (expr == null) { return true; }

        const model = this.expressionModelFactory.buildEvaluationModel(expr);

        return model.isValid();
    }

    private isTransientExpressionNull(column: Column): boolean {
        const colId = column.getColId();
        const { expr } = this.transientState[colId];
        if (expr == null) { return true; }

        const model = this.expressionModelFactory.buildEvaluationModel(expr);

        return model.isNull();
    }

    private applyTransientExpression(source: any, column: Column): void {
        const colId = column.getColId();
        const { listeners } = this.currentState[colId] || {};
        const { expr } = this.transientState[colId] || {};
        const model = this.expressionModelFactory.buildEvaluationModel(expr);

        if (!model.isNull() && !model.isValid()) { return; }
        
        this.currentState[colId].model = model;
        listeners.notify(source, { type: 'apply', colId, expr: model.toFilterExpression() });
    }

    private revertTransientExpression(source: any, column: Column): void {
        const colId = column.getColId();
        const { model, listeners } = this.currentState[colId] || {};
        const expr = model ? model.toFilterExpression() : null;
        this.transientState[colId].expr = expr || defaultExpression(column, this.gridOptions);

        listeners.notify(source, { type: 'revert', colId, expr });
    }
}
