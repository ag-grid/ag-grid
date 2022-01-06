import { _, Bean, RowNode, BeanStub, Column } from "@ag-grid-community/core";
import { StatelessFilterController } from "./interfaces";

@Bean('externalFilterController')
export class ExternalFilterController extends BeanStub implements StatelessFilterController {
    public readonly type = 'stateless';

    public isActive(): boolean {
        return this.gridOptionsWrapper.isExternalFilterPresent();
    }

    public evaluate(params: { rowNode: RowNode }): boolean {
        return this.gridOptionsWrapper.doesExternalFilterPass(params.rowNode);
    }

    public isFilterActive(column: Column): boolean {
        return false;
    }
}
