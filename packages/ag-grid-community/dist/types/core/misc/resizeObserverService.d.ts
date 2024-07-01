import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
export declare class ResizeObserverService extends BeanStub implements NamedBean {
    beanName: "resizeObserverService";
    private polyfillFunctions;
    private polyfillScheduled;
    observeResize(element: HTMLElement, callback: () => void): () => void;
    private doNextPolyfillTurn;
    private schedulePolyfill;
}
