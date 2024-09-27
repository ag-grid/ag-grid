import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { _getWindow } from '../gridOptionsUtils';

export class ResizeObserverService extends BeanStub implements NamedBean {
    beanName = 'resizeObserverService' as const;

    public observeResize(element: HTMLElement, callback: () => void): () => void {
        const win = _getWindow(this.gos);
        const ResizeObserverImpl = win.ResizeObserver;
        const resizeObserver = ResizeObserverImpl ? new ResizeObserverImpl(callback) : null;
        resizeObserver?.observe(element);
        return () => resizeObserver?.disconnect();
    }
}
