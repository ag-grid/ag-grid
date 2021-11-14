import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { AgPromise } from "./utils";
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export declare class VanillaFrameworkOverrides implements IFrameworkOverrides {
    setTimeout(action: any, timeout?: any): void;
    setInterval(action: any, timeout?: any): AgPromise<number>;
    isOutsideAngular: (eventType: string) => boolean;
    addEventListener(element: HTMLElement, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    dispatchEvent(eventType: string, listener: () => {}, global?: boolean): void;
    frameworkComponent(name: string): any;
}
