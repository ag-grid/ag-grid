import { FrameworkOverridesIncomingSource, IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { AgPromise } from "./utils";
/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
export declare class VanillaFrameworkOverrides implements IFrameworkOverrides {
    private frameworkName;
    renderingEngine: 'vanilla' | 'react';
    constructor(frameworkName?: 'javascript' | 'angular' | 'react' | 'vue' | 'solid');
    setInterval(action: any, timeout?: any): AgPromise<number>;
    addEventListener(element: HTMLElement, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    wrapIncoming: <T>(callback: () => T, source?: FrameworkOverridesIncomingSource) => T;
    wrapOutgoing: <T>(callback: () => T) => T;
    get shouldWrapOutgoing(): boolean;
    frameworkComponent(name: string): any;
    isFrameworkComponent(comp: any): boolean;
    getDocLink(path?: string): string;
}
