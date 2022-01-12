import { AgInputTextField, Component, PostConstruct, RefSelector, _ } from "@ag-grid-community/core";
import { ExpressionComponentParams, InbuiltExpression, ScalarOperationExpression, StateManager, TextOperationExpression } from "../interfaces";
import { ExpressionComponent, OperandComponent } from "./interfaces";

interface OperandParser<O> {
    toOperands(input: string): O[],
    toInputString(input: O[]): string,
}

const DEFAULT_OPERAND_PARSER: OperandParser<any> = {
    toOperands: (input) => (input ? String(input) : '').split(',').map(v => v.trim()),
    toInputString: (input) => (input || []).join(','),
};

export class MultiOperandComponent<E extends TextOperationExpression | ScalarOperationExpression, O extends E['operands'][number]> extends Component implements ExpressionComponent<InbuiltExpression> {
    @RefSelector('eInput') private readonly refInput: AgInputTextField;
    private readonly parser: OperandParser<O>;
    private readonly readOnly: boolean;

    private stateManager: StateManager<E>;

    public constructor(
        opts: {
            readOnly: boolean,
            parser?: OperandParser<O>,
        },
    ) {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation">
                <ag-input-text-field class="ag-filter-text" ref="eInput"></ag-input-text-field>
            </div>
        `);

        this.parser = opts.parser || DEFAULT_OPERAND_PARSER;
        this.readOnly = opts.readOnly;
    }

    @PostConstruct
    private postConstruct() {
        if (this.readOnly) {
            this.refInput.setDisabled(true);
        } else {
            this.refInput.addEventListener('input', () => {
                // TODO(AG-6000): Implement handling for editable multi-input.
            });
        }
    }

    public setParameters(params: ExpressionComponentParams<E>) {
        this.stateManager = params.stateManager;

        this.addDestroyFunc(
            this.stateManager.addUpdateListener(this, (state) => this.expressionUpdated(state)),
        );
    }

    private expressionUpdated(state: E | null): void {
        if (state == null) {
            this.refInput.setValue(null, true);
            return;
        }

        this.refInput.setValue(this.parser.toInputString(state.operands as any), true);
    }
}
