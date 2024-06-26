import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class FilterStage extends BeanStub implements IRowNodeStage, NamedBean {
    beanName: "filterStage";
    private filterManager?;
    wireBeans(beans: BeanCollection): void;
    execute(params: StageExecuteParams): void;
    private filter;
    private filterNodes;
    private doingTreeDataFiltering;
}
