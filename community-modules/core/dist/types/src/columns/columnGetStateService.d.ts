import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ColumnState } from './columnApplyStateService';
export declare class ColumnGetStateService extends BeanStub implements NamedBean {
    beanName: "columnGetStateService";
    private columnModel;
    private funcColsService;
    wireBeans(beans: BeanCollection): void;
    getColumnState(): ColumnState[];
    private createStateItemFromColumn;
    private orderColumnStateList;
}
