import { PostConstruct } from "@ag-grid-community/core";
import { SetOperationExpression } from "../../interfaces";
import { MiniFilterComponent } from "../miniFilterComponent";
import { RootComponent } from "../rootComponent";
import { SetOperandsComponent } from "../setOperandsComponent";
import { GridColumnValuesModel } from "../../grid-model/gridColumnValuesModel";

export class SetFilter extends RootComponent<SetOperationExpression> {
    private readonly colId: string;
    private readonly valuesModel: GridColumnValuesModel;

    public constructor(opts: { colId: string }) {
        const valuesModel = new GridColumnValuesModel({ colId: opts.colId });

        super(
            [
                new MiniFilterComponent({ valuesModel }),
                new SetOperandsComponent({ gridValuesModel: valuesModel }),
            ],
            'set-op',
        );

        this.colId = opts.colId;
        this.valuesModel = valuesModel;
    }

    @PostConstruct
    private postConstruct() {
        this.createBean(this.createBean(this.valuesModel));
        this.addDestroyFunc(() => this.destroyBean(this.valuesModel));
    }
}
