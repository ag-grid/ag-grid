import { BeanStub } from "../context/beanStub";
export declare class ResizeObserverService extends BeanStub {
    observeResize(element: HTMLElement, callback: () => void, debounceDelay?: number): () => void;
}
