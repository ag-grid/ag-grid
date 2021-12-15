import { AgInputTextField, Component, ExpressionComponentParams, PartialStateType, PostConstruct, RefSelector, StateManager } from "@ag-grid-community/core";
import { OperandComponent, OperandInputElementSerialiser } from "./interfaces";

export class TextOperandComponent<O extends string | number | Date> extends Component implements OperandComponent<O> {
    private stateManager: StateManager<O>;
    private readonly serialiser: OperandInputElementSerialiser<O>;
    private readonly inputType?: string;

    @RefSelector('eInput') private readonly refInput: AgInputTextField;

    public constructor(opts: {
        serialiser: OperandInputElementSerialiser<O>,
        min?: O,
        max?: O,
        inputType?: string,
    }) {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation">
                <ag-input-text-field class="ag-filter-text" ref="eInput"></ag-input-text-field>
            </div>
        `);

        this.serialiser = opts.serialiser;
        this.inputType = opts.inputType;
    }

    @PostConstruct
    private postConstruct(): void {
        this.refInput.onValueChange((m) => this.operandMutation(m));

        if (this.inputType) {
            this.refInput.getInputElement().type = this.inputType;
        }
    }

    public setParameters(params: ExpressionComponentParams<O>) {
        this.stateManager = params.stateManager;

        this.stateManager.addUpdateListener((u) => this.operandUpdated(u));

        this.operandUpdated(this.stateManager.getTransientExpression() as O | null);
    }

    private operandUpdated(operandValue: O | null) {
        this.refInput.setValue(this.serialiser.toInputString(operandValue), true);
    }

    private operandMutation(mutation: string | null | undefined): void {
        const normalisedMutation = mutation == null ? null : mutation;
        const operand = this.serialiser.toExpression(normalisedMutation);

        this.stateManager.mutateTransientExpression(operand as PartialStateType<O> | null);
    }
}
