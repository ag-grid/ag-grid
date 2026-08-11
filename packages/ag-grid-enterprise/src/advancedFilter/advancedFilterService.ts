import { _exists } from 'ag-stack';

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

export class AdvancedFilterService extends BeanStub implements NamedBean, IAdvancedFilterService {
    beanName = 'advancedFilter' as const;

    private valueSvc: ValueService;
    private colModel: ColumnModel;
    private dataTypeSvc?: DataTypeService;
    private advFilterExpSvc: AdvancedFilterExpressionService;
    private filterValueSvc: FilterValueService;
    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.valueSvc = beans.valueSvc;
        this.colModel = beans.colModel;
        this.dataTypeSvc = beans.dataTypeSvc;
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
        this.filterValueSvc = beans.filterValueSvc!;
        this.filterManager = beans.filterManager;
    }

    private enabled: boolean;
    private ctrl: AdvancedFilterCtrl;

    private expressionProxy: ExpressionProxy;
    private appliedExpression: string | null = null;
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
        return this.parseAppliedExpressionModel(false);
    }

    /**
     * As `getModel`, but with operands in the form the builder should edit rather than canonical model
     * form, so a value typed in a syntax the model cannot reproduce survives the round-trip.
     */
    public getBuilderModel(): AdvancedFilterModel | null {
        return this.parseAppliedExpressionModel(true);
    }

    private parseAppliedExpressionModel(forBuilder: boolean): AdvancedFilterModel | null {
        const expressionParser = this.createExpressionParser(this.appliedExpression);
        expressionParser?.parseExpression();
        return expressionParser?.getModel(forBuilder) ?? null;
    }

    public setModel(model: AdvancedFilterModel | null): void {
        const parseModel = (model: AdvancedFilterModel, isFirstParent?: boolean): string | null => {
            if (model.filterType === 'join') {
                const operator = this.advFilterExpSvc.parseJoinOperator(model);
                const expression = model.conditions
                    .map((condition) => parseModel(condition))
                    .filter((condition) => _exists(condition))
                    .join(` ${operator} `);
                return isFirstParent || model.conditions.length <= 1 ? expression : `(${expression})`;
            } else {
                return this.advFilterExpSvc.parseColumnFilterModel(model);
            }
        };

        const expression = model ? parseModel(model, true) : null;

        this.setExpressionDisplayValue(expression);
        this.applyExpression();
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
            rewrites: [],
            colModel: this.colModel,
            dataTypeSvc: this.dataTypeSvc,
            valueSvc: this.valueSvc,
            advFilterExpSvc: this.advFilterExpSvc,
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
        this.isValid = !expressionParser || expressionParser.isValid();
        if (!expressionParser || !this.isValid) {
            this.expressionFunction = null;
            this.expressionParams = null;
            this.appliedExpression = null;
            return;
        }

        const { expressionFunction, params } = expressionParser.getFunction();

        this.expressionFunction = expressionFunction;
        this.expressionParams = params;
        this.appliedExpression = this.expression;
    }

    public updateValidity(): boolean {
        this.advFilterExpSvc.resetColumnCaches();
        const expressionParser = this.createExpressionParser(this.expression);
        expressionParser?.parseExpression();
        const isValid = !expressionParser || expressionParser.isValid();

        const updatedValidity = isValid !== this.isValid;

        this.applyExpressionFromParser(expressionParser);
        this.ctrl.refreshComp();
        this.ctrl.refreshBuilderComp();
        return updatedValidity;
    }
}
