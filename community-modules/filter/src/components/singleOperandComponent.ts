import { Component, PostConstruct, RefSelector, _ } from "@ag-grid-community/core";
import { ExpressionComponentParams, InbuiltExpression, ScalarOperationExpression, StateManager, TextOperationExpression } from "../interfaces";
import { ExpressionComponent, OperandComponent } from "./interfaces";
import { initialiseAndAttachChildren } from "./filterComponentUtils";
import { OperandStateManagerAdapter } from "../state/operandStateManager";

export class SingleOperandComponent<E extends TextOperationExpression | ScalarOperationExpression, O extends E['operands'][number]> extends Component implements ExpressionComponent<InbuiltExpression> {
    private readonly childComponent: (OperandComponent<O> & Component);
    private readonly operandIndex: number;

    @RefSelector('eChild')
    private readonly refChild: HTMLElement;

    private stateManager: StateManager<E>;

    public constructor(
        opts: {
            childComponent: (OperandComponent<O> & Component),
            operandIndex: number,
        },
    ) {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation">
                <div class="ag-filter-body" ref="eChild" role="presentation">
                </div>
            </div>
        `);

        this.childComponent = opts.childComponent;
        this.operandIndex = opts.operandIndex;
    }

    @PostConstruct
    private postConstruct() {
        initialiseAndAttachChildren(
            { createBean: (b) => this.createBean(b), destroyBean: (b) => this.destroyBean(b), addDestroyFunc: (f) => this.addDestroyFunc(f) },
            this.refChild,
            [ this.childComponent ],
        );
    }

    public setParameters(params: ExpressionComponentParams<E>) {
        this.stateManager = params.stateManager;

        this.childComponent.setParameters({
            ...params,
            stateManager: new OperandStateManagerAdapter<E, O>(this.stateManager, this.operandIndex),
        });
    }
}
