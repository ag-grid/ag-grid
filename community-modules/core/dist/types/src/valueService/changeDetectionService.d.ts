import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class ChangeDetectionService extends BeanStub implements NamedBean {
    beanName: "changeDetectionService";
    private rowModel;
    private rowRenderer;
    wireBeans(beans: BeanCollection): void;
    private clientSideRowModel;
    postConstruct(): void;
    private onCellValueChanged;
    private doChangeDetection;
}
