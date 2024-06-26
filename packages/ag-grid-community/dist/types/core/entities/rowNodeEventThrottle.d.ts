import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowGroupOpenedEvent } from '../events';
export declare class RowNodeEventThrottle extends BeanStub implements NamedBean {
    beanName: "rowNodeEventThrottle";
    private animationFrameService;
    private rowModel;
    wireBeans(beans: BeanCollection): void;
    private clientSideRowModel;
    private events;
    private dispatchExpandedDebounced;
    postConstruct(): void;
    dispatchExpanded(event: RowGroupOpenedEvent, forceSync?: boolean): void;
}
