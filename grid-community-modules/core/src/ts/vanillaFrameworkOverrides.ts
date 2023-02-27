import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { includes } from "./utils/array";
import { AgPromise } from "./utils";

const OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];

/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
export class VanillaFrameworkOverrides implements IFrameworkOverrides {

    // for Vanilla JS, we use simple timeout
    public setTimeout(action: any, timeout?: any): void {
        window.setTimeout(action, timeout);
    }
    public setInterval(action: any, timeout?: any): AgPromise<number> {
        return new AgPromise(resolve => {
            resolve(window.setInterval(action, timeout));
        });
    }

    public isOutsideAngular = (eventType:string) => includes(OUTSIDE_ANGULAR_EVENTS, eventType);

    // for Vanilla JS, we just add the event to the element
    public addEventListener(
        element: HTMLElement,
        type: string,
        listener: EventListenerOrEventListenerObject,
        useCapture?: boolean
    ): void {
        const isPassive = includes(PASSIVE_EVENTS, type);
        element.addEventListener(type, listener, { capture: !!useCapture, passive: isPassive });
    }

    // for Vanilla JS, we just execute the listener
    dispatchEvent(eventType: string, listener: () => {}, global = false): void {
        listener();
    }

    frameworkComponent(name: string): any {
        return null;
    }

    isFrameworkComponent(comp: any): boolean {
        return false;
    }
}
