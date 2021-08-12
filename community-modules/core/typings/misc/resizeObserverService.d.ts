import { BeanStub } from "../context/beanStub";
export declare class ResizeObserverService extends BeanStub {
    private polyfillFunctions;
    private polyfillScheduled;
    observeResize(element: HTMLElement, callback: () => void): () => void;
    private doNextPolyfillTurn;
    private schedulePolyfill;
}
