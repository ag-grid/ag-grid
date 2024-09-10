import type { AgPromise } from '../utils/promise';

export type FrameworkOverridesIncomingSource = 'resize-observer' | 'ensureVisible' | 'popupPositioning';

export interface IFrameworkOverrides {
    setInterval(action: any, interval?: any): AgPromise<number>;

    addEventListener(
        element: HTMLElement,
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void;

    /**
     * This method is to cater for Angular's change detection.
     * Angular uses Zones, we want to run internal AG Grid outside of Zone JS so that we do not kick off
     * Angular change detection. Any event listener or setTimeout() or setInterval() run by our code
     * would trigger change detection in Angular.
     *
     * Before events are returned to the user, those functions are wrapped in Angular's zone
     * again so that the user's code triggers change detection as normal. See wrapOutgoing() below.
     */
    wrapIncoming: <T>(callback: () => T, source?: FrameworkOverridesIncomingSource) => T;

    /**
     * This method is to cater for Angular's change detection.
     * This is currently used for events that the user provides either via the component or via registration with the grid api.
     * This method should not be implemented for the other frameworks to avoid unnecessary overhead.
     */
    wrapOutgoing: <T>(callback: () => T) => T;

    /**
     * The shouldWrapOutgoing property is used to determine if events should be run outside of Angular or not.
     * If an event handler is registered outside of Angular then we should not wrap the event handler
     * with runInsideAngular() as the user may not have wanted this.
     * This is also used to not wrap internal event listeners that are registered with RowNodes and Columns.
     */
    shouldWrapOutgoing?: boolean;

    /*
     * vue components are specified in the "components" part of the vue component - as such we need a way to deteremine if a given component is
     * within that context - this method provides this
     * Note: This is only really used/necessary with cellRendererSelectors
     */
    frameworkComponent(name: string, components?: any): any;

    /*
     * Allows framework to identify if a class is a component from that framework.
     */
    isFrameworkComponent(comp: any): boolean;

    /**
     * Which rendering engine is used for the grid components. Can be either 'vanilla' or 'react'.
     */
    renderingEngine: 'vanilla' | 'react';

    /**
     * Returns the framework specific url for linking to a documentation page.
     * @param path Optional path to append to the base url. i.e 'aligned-grids' Does not need the leading `/`
     */
    getDocLink(path?: string): string;

    /** Used by `RowRenderer` when getting lock. Allows React async refreshes to work. */
    getLockOnRefresh?(): void;

    /** Used by `RowRenderer` when releasing lock. Allows React async refreshes to work. */
    releaseLockOnRefresh?(): void;

    /** Used by the CtrlsService to decide whether to trigger the whenReady callbacks asynchronously.
     * Required for React to work with StrictMode from v19 with the current implementation of the CtrlsService.
     */
    runWhenReadyAsync?(): boolean;
}
