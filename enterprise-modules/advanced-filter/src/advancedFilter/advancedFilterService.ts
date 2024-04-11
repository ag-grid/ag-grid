import {
    AdvancedFilterEnabledChangedEvent,
    AdvancedFilterModel,
    AutocompleteEntry,
    Autowired,
    Bean,
    BeanStub,
    ColumnModel,
    DataTypeService,
    Events,
    IAdvancedFilterService,
    IRowModel,
    IRowNode,
    NewColumnsLoadedEvent,
    PostConstruct,
    ValueService,
    WithoutGridCommon,
    _
} from "@ag-grid-community/core";
import { FilterExpressionParser } from "./filterExpressionParser";
import { AdvancedFilterCtrl } from "./advancedFilterCtrl";
import { AdvancedFilterExpressionService } from "./advancedFilterExpressionService";
import { FilterExpressionFunctionParams } from "./filterExpressionUtils";

interface ExpressionProxy {
    getValue(colId: string, node: IRowNode): any;
}

@Bean('advancedFilterService')
export class AdvancedFilterService extends BeanStub implements IAdvancedFilterService {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    private enabled: boolean;
    private ctrl: AdvancedFilterCtrl;

    private expressionProxy: ExpressionProxy;
    private appliedExpression: string | null = null;
    /** The value displayed in the input, which may be invalid */
    private expression: string | null = null;
    private expressionFunction: Function | null;
    private expressionParams: FilterExpressionFunctionParams | null;
    private isValid: boolean = true;

    @PostConstruct
    private postConstruct(): void {
        this.setEnabled(this.gos.get('enableAdvancedFilter'), true);

        this.ctrl = this.createManagedBean(new AdvancedFilterCtrl(this.enabled));

        this.expressionProxy = {
            getValue: (colId, node) => {
                const column = this.columnModel.getPrimaryColumn(colId);
                return column ? this.valueService.getValue(column, node, true) : undefined;
            },
        }

        this.addManagedPropertyListener('enableAdvancedFilter', (event) => this.setEnabled(!!event.currentValue))
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED,
            (event: NewColumnsLoadedEvent) => this.onNewColumnsLoaded(event));
        this.addManagedPropertyListener('includeHiddenColumnsInAdvancedFilter', () => this.updateValidity());
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public isFilterPresent(): boolean {
        return !!this.expressionFunction;
    }

    public doesFilterPass(node: IRowNode): boolean {
        return this.expressionFunction!(this.expressionProxy, node, this.expressionParams);
    }

    public getModel(): AdvancedFilterModel | null {
        const expressionParser = this.createExpressionParser(this.appliedExpression);
        expressionParser?.parseExpression();
        return expressionParser?.getModel() ?? null;
    }

    public setModel(model: AdvancedFilterModel | null): void {
        const parseModel = (model: AdvancedFilterModel, isFirstParent?: boolean): string | null => {
            if (model.filterType === 'join') {
                const operator = this.advancedFilterExpressionService.parseJoinOperator(model);
                const expression = model.conditions.map(condition => parseModel(condition))
                    .filter(condition => _.exists(condition))
                    .join(` ${operator} `);
                return isFirstParent || model.conditions.length <= 1 ? expression : `(${expression})`;
            } else {
                return this.advancedFilterExpressionService.parseColumnFilterModel(model);
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
        if (!expression) { return null; }

        return new FilterExpressionParser({
            expression,
            columnModel: this.columnModel,
            dataTypeService: this.dataTypeService,
            valueService: this.valueService,
            advancedFilterExpressionService: this.advancedFilterExpressionService,
        });
    }

    public getDefaultExpression(updateEntry: AutocompleteEntry): {
        updatedValue: string, updatedPosition: number
    } {
        const updatedValue = this.advancedFilterExpressionService.getColumnValue(updateEntry) + ' ';
        return {
            updatedValue,
            updatedPosition: updatedValue.length
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
        const rowModelType = this.rowModel.getType();
        const isValidRowModel = rowModelType === 'clientSide' || rowModelType === 'serverSide';
        if (enabled && !rowModelType) {
            _.warnOnce('Advanced Filter is only supported with the Client-Side Row Model or Server-Side Row Model.');
        }
        this.enabled = enabled && isValidRowModel;
        if (!silent && this.enabled !== previousValue) {
            const event: WithoutGridCommon<AdvancedFilterEnabledChangedEvent> = {
                type: Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
                enabled: this.enabled
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public applyExpression(): void {
        const expressionParser = this.createExpressionParser(this.expression);
        expressionParser?.parseExpression();
        this.applyExpressionFromParser(expressionParser)
    }

    private applyExpressionFromParser(expressionParser: FilterExpressionParser | null): void {
        this.isValid = !expressionParser || expressionParser.isValid();
        if (!expressionParser || !this.isValid) {
            this.expressionFunction = null;
            this.expressionParams = null;
            this.appliedExpression = null;
            return;
        }

        const { functionBody, params } = expressionParser.getFunction();

        this.expressionFunction = new Function('expressionProxy', 'node', 'params', functionBody);
        this.expressionParams = params;
        this.appliedExpression = this.expression;
    }

    public updateValidity(): boolean {
        this.advancedFilterExpressionService.resetColumnCaches();
        const expressionParser = this.createExpressionParser(this.expression);
        expressionParser?.parseExpression();
        const isValid = !expressionParser || expressionParser.isValid();

        const updatedValidity = isValid !== this.isValid;

        this.applyExpressionFromParser(expressionParser);
        this.ctrl.refreshComp();
        this.ctrl.refreshBuilderComp();
        return updatedValidity;
    }

    private onNewColumnsLoaded(event: NewColumnsLoadedEvent): void {
        if (event.source !== 'gridInitializing' || !this.dataTypeService.isPendingInference()) { return; }

        this.ctrl.setInputDisabled(true);
        const destroyFunc = this.addManagedListener(this.eventService, Events.EVENT_DATA_TYPES_INFERRED, () => {
            destroyFunc?.();
            this.ctrl.setInputDisabled(false);
        });
}
}
