/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type FrameworkOverridesIncomingSource = 'resize-observer' | 'ensureVisible' | 'popupPositioning';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgListenerWrapper {
    /** The listener to register for `userListener`, the same one until `unwrap`. */
    wrap<T extends (e: any) => void>(eventType: string, userListener: T, async?: boolean): T;
    /** The listener `wrap` returned for `userListener`, to remove; `userListener` itself when it was not wrapped. */
    unwrap<T extends (e: any) => void>(eventType: string, userListener: T, async?: boolean): T;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgFrameworkOverrides {
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
}
