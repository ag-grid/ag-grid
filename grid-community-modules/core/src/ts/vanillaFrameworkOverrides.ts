import { FrameworkOverridesIncomingSource, IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { includes } from "./utils/array";
import { AgPromise } from "./utils";

const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];

/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
export class VanillaFrameworkOverrides implements IFrameworkOverrides {

    public renderingEngine: 'vanilla' | 'react' = "vanilla";

    constructor(private frameworkName: 'javascript' | 'angular' | 'react' | 'vue' | 'solid' = 'javascript') {}

    public setInterval(action: any, timeout?: any): AgPromise<number> {
        return new AgPromise(resolve => {
            resolve(window.setInterval(action, timeout));
        });
    }

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

    wrapIncoming: <T>(callback: () => T, source?: FrameworkOverridesIncomingSource) => T = callback => callback();
    wrapOutgoing: <T>(callback: () => T) => T = callback => callback();
    get shouldWrapOutgoing() { return false;}

    frameworkComponent(name: string): any {
        return null;
    }

    isFrameworkComponent(comp: any): boolean {
        return false;
    }

    getDocLink(path?: string): string {
        const framework = this.frameworkName === 'solid' ? 'react' : this.frameworkName;
        return `https://www.ag-grid.com/${framework}-data-grid${path ? `/${path}` : ''}`;
    }
}
