import { AgSelect, Component, PostConstruct, RefSelector, InbuiltExpression, _, StateManager, PartialStateType, ExpressionComponentParams, TextOperationExpression, ScalarOperationExpression } from "@ag-grid-community/core";
import { comparisonOperationOperandCardinality, TextComparisonOperation, ScalarComparisonOperation } from "@ag-grid-community/core";
import { ExpressionComponent, OperandComponent } from "./interfaces";
import { initialiseAndAttachChildren } from "./filterComponentUtils";
import { OperandStateManagerAdapter } from "../state/operandStateManager";

export class ComparisonOperationComponent<E extends TextOperationExpression | ScalarOperationExpression, O extends E['operands'][number]> extends Component implements ExpressionComponent<InbuiltExpression> {
    private readonly childComponents: (OperandComponent<O> & Component)[];
    private readonly operationMetadata: {[key in E['operation']]: { operands: number }};

    @RefSelector('eOperationSelect')
    private readonly refOperationSelect: AgSelect;

    private readonly refChildren: HTMLElement[] = [];

    private stateManager: StateManager<E>;

    public constructor(
        opts: {
            childComponents: (OperandComponent<O> & Component)[],
            operationMetadata: {[key in E['operation']]: { operands: number }},
        },
    ) {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation">
                <ag-select class="ag-filter-select" ref="eOperationSelect"></ag-select>
                ${
                    opts.childComponents.map((_, i) => `
                        <div class="ag-filter-body" ref="eChild${i}" role="presentation">
                        </div>
                    `.trim()).join('')
                }
            </div>
        `);

        this.operationMetadata = opts.operationMetadata;
        this.childComponents = opts.childComponents;
    }

    @PostConstruct
    private postConstruct() {
        this.refChildren.push(
            ...this.childComponents.map((_, i) => this.queryForHtmlElement(`[ref="eChild${i}"]`)),
        );

        initialiseAndAttachChildren(
            { createBean: (b) => this.createBean(b), destroyBean: (b) => this.destroyBean(b), addDestroyFunc: (f) => this.addDestroyFunc(f) },
            this.refChildren,
            this.childComponents
        );

        this.refOperationSelect.onValueChange((m) => this.operationMutation(m as E['operation']));
        Object.keys(this.operationMetadata).forEach((op) => {
            this.refOperationSelect.addOption({ value: op });
        });
        this.updateElementVisibility(null);
    }

    public setParameters(params: ExpressionComponentParams<E>) {
        this.stateManager = params.stateManager;

        this.childComponents.forEach((comp, i) => {
            comp.setParameters({
                ...params,
                stateManager: new OperandStateManagerAdapter<E, O>(this.stateManager, i),
            });
        });

        this.stateManager.addUpdateListener(this, (u) => this.expressionUpdated(u));
        this.stateManager.addTransientUpdateListener(this, (u) => this.updateElementVisibility(u?.operation || null));

        this.expressionUpdated(this.stateManager.getTransientExpression());
    }

    private updateElementVisibility(op: TextComparisonOperation | ScalarComparisonOperation | null) {
        const childLimit = op ?
            comparisonOperationOperandCardinality(op) :
            0;
        this.refChildren.forEach((childElement, index) => {
            _.setDisplayed(childElement, index < (childLimit || 0));
        });
    }

    private expressionUpdated(expr: E | PartialStateType<E> | null) {
        if (expr == null) {
            this.refOperationSelect.setValue(null, true);
        } else {
            this.refOperationSelect.setValue(expr.operation, true);
        }

        this.updateElementVisibility(expr?.operation || null);
    }

    private operationMutation(mutation: E['operation'] | null): void {
        if (mutation == null) { return; }
        if (this.operationMetadata[mutation] == null) { return; }

        this.stateManager.mutateTransientExpression(this, { operation: mutation } as PartialStateType<E>);
        this.updateElementVisibility(mutation);
    }
}
