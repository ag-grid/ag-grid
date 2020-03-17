import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export declare class VanillaFrameworkOverrides implements IFrameworkOverrides {
    setTimeout(action: any, timeout?: any): void;
    addEventListenerOutsideAngular(element: HTMLElement, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}
