import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
export declare class SortStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName: "sortStage";
    private sortService;
    private sortController;
    wireBeans(beans: BeanCollection): void;
    execute(params: StageExecuteParams): void;
}
