import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export class VanillaFrameworkOverrides implements IFrameworkOverrides {

    // for Vanilla JS, we use simple timeout
    public setTimeout(action: any, timeout?: any): void {
        window.setTimeout(action, timeout);
    }

    // for Vanilla JS, we just add the event to the element
    public addEventListenerOutsideAngular(element: HTMLElement, type: string,
                                         listener: EventListenerOrEventListenerObject,
                                          useCapture?: boolean): void {
        element.addEventListener(type, listener, useCapture);
    }
}