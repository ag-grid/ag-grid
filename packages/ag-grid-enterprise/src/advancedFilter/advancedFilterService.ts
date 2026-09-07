import type {
    AdvancedFilterModel,
    BeanCollection,
    ColumnModel,
    DataTypeService,
    FilterManager,
    FilterValueService,
    IAdvancedFilterService,
    IRowNode,
    NamedBean,
    ValueService,
} from 'ag-grid-community';
import { BeanStub, _isClientSideRowModel, _isServerSideRowModel } from 'ag-grid-community';

import { AdvancedFilterCtrl } from './advancedFilterCtrl';
import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { AutocompleteEntry } from './autocomplete/autocompleteParams';
import { FilterExpressionParser } from './filterExpressionParser';
import type {
    ExpressionProxy,
    FilterExpressionFunction,
    FilterExpressionFunctionParams,
} from './filterExpressionUtils';
import type { AdvancedFilterSetService } from './set/advancedFilterSetService';

export class AdvancedFilterService extends BeanStub implements NamedBean, IAdvancedFilterService {
    beanName = 'advancedFilter' as const;

    private valueSvc: ValueService;
    private colModel: ColumnModel;
    private dataTypeSvc?: DataTypeService;
    private advFilterExpSvc: AdvancedFilterExpressionService;
    private advFilterSetSvc: AdvancedFilterSetService;
    private filterValueSvc: FilterValueService;
    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.valueSvc = beans.valueSvc;
        this.colModel = beans.colModel;
        this.dataTypeSvc = beans.dataTypeSvc;
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
        this.advFilterSetSvc = beans.advFilterSetSvc as AdvancedFilterSetService;
        this.filterValueSvc = beans.filterValueSvc!;
        this.filterManager = beans.filterManager;
    }

    private enabled: boolean;
    private ctrl: AdvancedFilterCtrl;

    private expressionProxy: ExpressionProxy;
    private appliedExpression: string | null = null;
    /**
     * The model the applied expression resolved to, held alongside the function built from it rather than
     * re-derived on every read: a Set Filter value whose text stops resolving falls back to that text as
     * its key, so re-deriving would report a key the applied filter is not using.
     */
    private appliedModel: AdvancedFilterModel | null = null;
    private appliedBuilderModel: AdvancedFilterModel | null = null;
    /** Gates the re-render: without it, every data change would rebuild each column's values to re-read them. */
    private appliedTextUnresolved = false;
    /** The value displayed in the input, which may be invalid */
    private expression: string | null = null;
    private expressionFunction: FilterExpressionFunction | null;
    private expressionParams: FilterExpressionFunctionParams | null;
    private isValid: boolean = true;

    public postConstruct(): void {
        this.setEnabled(this.gos.get('enableAdvancedFilter'), true);

        this.ctrl = this.createManagedBean(new AdvancedFilterCtrl(this.enabled));

        this.expressionProxy = {
            getValue: (colId, node) => {
                const column = this.colModel.getNonPivotColById(colId);
                return column ? this.filterValueSvc.getValue(column, node) : undefined;
            },
        };

        this.addManagedPropertyListener('enableAdvancedFilter', (event) => this.setEnabled(!!event.currentValue));
        this.addManagedPropertyListener('includeHiddenColumnsInAdvancedFilter', () => this.revalidateAndApply());
        // Until data types are inferred, columns default to text, so a number/date expression built while
        // waiting for row data parses as invalid - re-parse it once real types are known.
        this.addManagedEventListeners({
            dataTypesInferred: () => this.revalidateAndApply(),
        });
        this.addManagedListeners(this.advFilterSetSvc, {
            valuesChanged: () => this.refreshAppliedExpressionText(),
        });
    }

    private revalidateAndApply(): void {
        if (this.updateValidity()) {
            this.filterManager?.onFilterChanged({ source: 'advancedFilter' });
        }
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public isFilterPresent(): boolean {
        return !!this.expressionFunction;
    }

    public doesFilterPass(node: IRowNode): boolean {
        return this.expressionFunction!(this.expressionProxy, node, this.expressionParams!);
    }

    public getModel(): AdvancedFilterModel | null {
        return cloneModel(this.appliedModel);
    }

    /**
     * As `getModel`, but with operands in the form the builder should edit rather than canonical model
     * form, so a value typed in a syntax the model cannot reproduce survives the round-trip. The builder
     * edits what it is given in place, so it must be its own copy.
     */
    public getBuilderModel(): AdvancedFilterModel | null {
        return cloneModel(this.appliedBuilderModel);
    }

    /** The expression text a model is written as. */
    private modelToExpression(model: AdvancedFilterModel, isFirstParent?: boolean): string | null {
        if (model.filterType === 'join') {
            const operator = this.advFilterExpSvc.parseJoinOperator(model);
            const expression = model.conditions
                .map((condition) => this.modelToExpression(condition))
                // A join with no conditions of its own writes nothing, which would join as a stray operator.
                .filter((condition) => condition != null && condition !== '')
                .join(` ${operator} `);
            return isFirstParent || model.conditions.length <= 1 ? expression : `(${expression})`;
        }
        return this.advFilterExpSvc.parseColumnFilterModel(model);
    }

    /** The expression a model is written as, recording whether any set value had to fall back to its key. */
    private writeExpression(model: AdvancedFilterModel | null): string | null {
        const advFilterExpSvc = this.advFilterExpSvc;
        advFilterExpSvc.wroteUnresolvedSetValue = false;
        const expression = model ? this.modelToExpression(model, true) : null;
        this.appliedTextUnresolved = advFilterExpSvc.wroteUnresolvedSetValue;
        return expression;
    }

    /**
     * A set value written before its column's values loaded falls back to its stored key, so the text can
     * name it in a form the list never offers. The model is what the filter matches on, so re-render it.
     */
    private refreshAppliedExpressionText(): void {
        // Only text that fell back can be stale. Every other case leaves here without touching the
        // values, which would otherwise be rebuilt eagerly on each data change just to be re-read.
        if (!this.appliedTextUnresolved) {
            return;
        }
        const appliedModel = this.appliedModel;
        // Text the author has not applied yet is theirs, so it is never overwritten.
        if (!appliedModel || this.expression !== this.appliedExpression) {
            return;
        }
        const expression = this.writeExpression(appliedModel);
        if (expression !== this.expression) {
            this.expression = expression;
            this.appliedExpression = expression;
        }
        // Refreshed even where the text is unchanged: a value that now resolves clears the fault it reported,
        // and a blank is written the same way whether or not it resolved.
        this.ctrl.refreshComp();
    }

    public setModel(model: AdvancedFilterModel | null): void {
        const expression = this.writeExpression(model);
        const unresolved = this.appliedTextUnresolved;

        this.setExpressionDisplayValue(expression);
        this.applyExpression();
        // Applying clears the flag, since text normally comes from the input; here it came from `model`.
        this.appliedTextUnresolved = unresolved;
        this.ctrl.refreshComp();
        this.ctrl.refreshBuilderComp();
    }

    public getExpressionDisplayValue(): string | null {
        return this.expression;
    }

    public setExpressionDisplayValue(expression: string | null): void {
        this.expression = expression;
    }

    public isCurrentExpressionApplied(): boolean {
        return this.appliedExpression === this.expression;
    }

    public createExpressionParser(expression: string | null): FilterExpressionParser | null {
        if (!expression) {
            return null;
        }

        return new FilterExpressionParser({
            expression,
            gos: this.gos,
            colModel: this.colModel,
            dataTypeSvc: this.dataTypeSvc,
            valueSvc: this.valueSvc,
            advFilterExpSvc: this.advFilterExpSvc,
            advFilterSetSvc: this.advFilterSetSvc,
        });
    }

    public getDefaultExpression(updateEntry: AutocompleteEntry): {
        updatedValue: string;
        updatedPosition: number;
    } {
        const updatedValue = this.advFilterExpSvc.getColumnValue(updateEntry) + ' ';
        return {
            updatedValue,
            updatedPosition: updatedValue.length,
        };
    }

    public isHeaderActive(): boolean {
        return !this.gos.get('advancedFilterParent');
    }

    public getCtrl(): AdvancedFilterCtrl {
        return this.ctrl;
    }

    private setEnabled(enabled: boolean, silent?: boolean): void {
        const previousValue = this.enabled;
        const isValidRowModel = _isClientSideRowModel(this.gos) || _isServerSideRowModel(this.gos);
        if (enabled && !isValidRowModel) {
            this.warn(123);
        }
        this.enabled = enabled && isValidRowModel;
        if (!silent && this.enabled !== previousValue) {
            this.eventSvc.dispatchEvent({
                type: 'advancedFilterEnabledChanged',
                enabled: this.enabled,
            });
        }
    }

    public applyExpression(): void {
        const expressionParser = this.createExpressionParser(this.expression);
        expressionParser?.parseExpression();
        this.applyExpressionFromParser(expressionParser);
    }

    public getAppliedExpressionDisplayValue(): string | null {
        return this.appliedExpression;
    }

    private applyExpressionFromParser(expressionParser: FilterExpressionParser | null): void {
        // The text being applied is the author's own, so nothing about it is ours to re-render.
        this.appliedTextUnresolved = false;
        this.isValid = !expressionParser || expressionParser.isValid();
        if (!expressionParser || !this.isValid) {
            this.expressionFunction = null;
            this.expressionParams = null;
            this.appliedExpression = null;
            this.appliedModel = null;
            this.appliedBuilderModel = null;
            return;
        }

        const { expressionFunction, params } = expressionParser.getFunction();

        this.expressionFunction = expressionFunction;
        this.expressionParams = params;
        this.appliedExpression = this.expression;
        // Taken from the same parse as the function, so the model always names what the filter matches on.
        this.appliedModel = expressionParser.getModel();
        this.appliedBuilderModel = expressionParser.getModel(true);
    }

    public updateValidity(): boolean {
        this.advFilterExpSvc.resetColumnCaches();
        const expressionParser = this.createExpressionParser(this.expression);
        expressionParser?.parseExpression();
        const isValid = !expressionParser || expressionParser.isValid();

        const wasValid = this.isValid;
        const wasApplied = this.appliedExpression;
        const wasPresent = !!this.expressionFunction;

        // Valid and still reporting a fault is the advisory case: an unresolved value reads back as the
        // text it was written as, so re-applying would rebuild the filter from that instead of its key.
        if (isValid && expressionParser?.getValidationMessage()) {
            this.isValid = true;
        } else {
            this.applyExpressionFromParser(expressionParser);
        }
        this.ctrl.refreshComp();
        this.ctrl.refreshBuilderComp();
        // The advisory branch leaves the applied state alone, so validity alone does not say whether
        // the rows need another pass.
        return (
            isValid !== wasValid || this.appliedExpression !== wasApplied || !!this.expressionFunction !== wasPresent
        );
    }
}

/** The applied model is held rather than re-parsed per read, so a reader must not get the live instance. */
const cloneModel = (model: AdvancedFilterModel | null): AdvancedFilterModel | null => {
    if (!model) {
        return null;
    }
    if (model.filterType === 'join') {
        const conditions = model.conditions;
        const len = conditions.length;
        const cloned: AdvancedFilterModel[] = new Array(len);
        for (let i = 0; i < len; ++i) {
            cloned[i] = cloneModel(conditions[i])!;
        }
        return { ...model, conditions: cloned };
    }
    return model.filterType === 'set' ? { ...model, values: [...model.values] } : { ...model };
};
