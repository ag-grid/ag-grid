import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";

const DEBOUNCE_DELAY = 50;
@Bean('resizeObserverService')
export class ResizeObserverService extends BeanStub {

    private polyfillFunctions: (() => void)[] = [];
    private polyfillScheduled: boolean;

    public observeResize(element: HTMLElement, callback: () => void): () => void {
        const win = this.gos.getWindow();
        const useBrowserResizeObserver = () => {
            const resizeObserver = new win.ResizeObserver(callback);
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        };

        const usePolyfill = () => {
            // initialise to the current width and height, so first call will have no changes
            let widthLastTime = element?.clientWidth ?? 0;
            let heightLastTime = element?.clientHeight ?? 0;

            // when finished, this gets turned to false.
            let running = true;

            const periodicallyCheckWidthAndHeight = () => {
                if (running) {

                    const newWidth = element?.clientWidth ?? 0;
                    const newHeight = element?.clientHeight ?? 0;

                    const changed = newWidth !== widthLastTime || newHeight !== heightLastTime;
                    if (changed) {
                        widthLastTime = newWidth;
                        heightLastTime = newHeight;
                        callback();
                    }

                    this.doNextPolyfillTurn(periodicallyCheckWidthAndHeight);
                }
            };

            periodicallyCheckWidthAndHeight();

            // the callback function we return sets running to false
            return () => running = false;
        };

        const suppressResize = this.gos.get('suppressBrowserResizeObserver');
        const resizeObserverExists = !!win.ResizeObserver;

        if (resizeObserverExists && !suppressResize) {
            return useBrowserResizeObserver();
        }

        return this.getFrameworkOverrides().wrapIncoming(() => usePolyfill(), 'resize-observer');
    }


    private doNextPolyfillTurn(func: () => void): void {
        this.polyfillFunctions.push(func);
        this.schedulePolyfill();
    }

    private schedulePolyfill(): void {
        if (this.polyfillScheduled) { return; }

        const executeAllFuncs = () => {
            const funcs = this.polyfillFunctions;

            // make sure set scheduled to false and clear clear array
            // before executing the funcs, as the funcs could add more funcs
            this.polyfillScheduled = false;
            this.polyfillFunctions = [];

            funcs.forEach(f => f());
        };

        this.polyfillScheduled = true;
        window.setTimeout(executeAllFuncs, DEBOUNCE_DELAY);
    }

}
