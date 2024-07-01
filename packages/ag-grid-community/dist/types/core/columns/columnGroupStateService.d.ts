import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ColumnEventType } from '../events';
export declare class ColumnGroupStateService extends BeanStub implements NamedBean {
    beanName: "columnGroupStateService";
    private columnModel;
    private columnAnimationService;
    private eventDispatcher;
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    getColumnGroupState(): {
        groupId: string;
        open: boolean;
    }[];
    resetColumnGroupState(source: ColumnEventType): void;
    setColumnGroupState(stateItems: {
        groupId: string;
        open: boolean | undefined;
    }[], source: ColumnEventType): void;
}
