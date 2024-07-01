import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from '@ag-grid-community/core';
import { BeanStub, RowNode } from '@ag-grid-community/core';
export declare class FlattenStage extends BeanStub implements IRowNodeStage, NamedBean {
    beanName: "flattenStage";
    private beans;
    private columnModel;
    wireBeans(beans: BeanCollection): void;
    execute(params: StageExecuteParams): RowNode[];
    private getFlattenDetails;
    private recursivelyAddToRowsToDisplay;
    private addRowNodeToRowsToDisplay;
    private createDetailNode;
}
