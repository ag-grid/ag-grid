import { Autowired, Bean } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { IFrameworkFactory } from "../interfaces/iFrameworkFactory";
import { _ } from "../utils";

@Bean('resizeObserverService')
export class ResizeObserverService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;

    public observeResize(element: HTMLElement, callback: () => void): () => void {
        // put in variable, so available to usePolyfill() function below
        const frameworkFactory = this.frameworkFactory;

        const useBrowserResizeObserver = () => {
            const resizeObserver = new (window as any).ResizeObserver(callback);
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        };

        const usePolyfill = () => {

            // initialise to the current width and height, so first call will have no changes
            let widthLastTime = _.offsetWidth(element);
            let heightLastTime = _.offsetHeight(element);

            // when finished, this gets turned to false.
            let running = true;

            const periodicallyCheckWidthAndHeight = () => {
                if (running) {

                    const newWidth = _.offsetWidth(element);
                    const newHeight = _.offsetHeight(element);

                    const changed = newWidth !== widthLastTime || newHeight !== heightLastTime;
                    if (changed) {
                        widthLastTime = newWidth;
                        heightLastTime = newHeight;
                        callback();
                    }

                    frameworkFactory.setTimeout(periodicallyCheckWidthAndHeight, 500);
                }
            };

            periodicallyCheckWidthAndHeight();

            // the callback function we return sets running to false
            return () => running = false;
        };

        const suppressResize = this.gridOptionsWrapper.isSuppressBrowserResizeObserver();
        const resizeObserverExists = !!(window as any).ResizeObserver;

        if (resizeObserverExists && !suppressResize) {
            return useBrowserResizeObserver();
        } else {
            return usePolyfill();
        }
    }

}
