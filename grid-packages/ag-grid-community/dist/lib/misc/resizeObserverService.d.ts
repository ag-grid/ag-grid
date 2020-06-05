import { BeanStub } from "../context/beanStub";
export declare class ResizeObserverService extends BeanStub {
    private gridOptionsWrapper;
    observeResize(element: HTMLElement, callback: () => void, debounceDelay?: number): () => void;
}
