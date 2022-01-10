import { AgInputTextField, Component, ExpressionComponentParams, PostConstruct, RefSelector, SetOperationExpression } from "@ag-grid-community/core";
import { FilterListenerManager } from "../state/filterListenerManager";
import { GridColumnValuesModel } from "../grid-model/gridColumnValuesModel";
import { ExpressionComponent } from "./interfaces";

export interface MiniFilterSharedState {
    miniFilter: string | null;
    miniFilterListeners: FilterListenerManager<() => void>;
};

export class MiniFilterComponent extends Component implements ExpressionComponent<SetOperationExpression> {
    private readonly valuesModel: GridColumnValuesModel;

    @RefSelector('eInput') private readonly refInput: AgInputTextField;

    public constructor(opts: {
        valuesModel: GridColumnValuesModel,
    }) {
        super(/* html */`
            <div class="ag-filter-wrapper" role="presentation">
                <ag-input-text-field class="ag-filter-text" ref="eInput"></ag-input-text-field>
            </div>
        `);

        this.valuesModel = opts.valuesModel;
    }

    setParameters(params: ExpressionComponentParams<SetOperationExpression>): void {
    }

    @PostConstruct
    private postConstruct(): void {
        this.refInput.onValueChange((m) => this.inputChanged(m));
        this.refInput.setInputPlaceholder('Search...');
    }

    private inputChanged(input: string | null | undefined): void {
        if (input == null || input.trim().length === 0) {
            this.valuesModel.setVisibleRegexp(null);
        } else {
            this.valuesModel.setVisibleRegexp(new RegExp(input.trim()));
        }
    }
}
