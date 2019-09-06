// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IFrameworkOverrides {
    /** Because Angular 2+ uses Zones, you should not use setTimeout(). So to get around this, we allow the framework
     * to specify how to execute setTimeout. The default is to just call the browser setTimeout(). */
    setTimeout(action: any, timeout?: any): void;
    /** Again because Angular uses Zones, we allow adding some events outside of Zone JS so that we do not kick off
     * the Angular change detection. We do this for some events ONLY, and not all events, just events that get fired
     * a lot (eg mouse move), but we need to make sure in ag-Grid that we do NOT call any grid callbacks while processing
     * these events, as we will be outside of ZoneJS and hence Angular2 Change Detection won't work. However it's fine
     * for our code to result in ag-Grid events (and Angular application action on these) as these go through
     * Event Emitter's.
     *
     * This was done by Niall and Sean. The problematic events are mouseover, mouseout, mouseenter and mouseleave.
     */
    addEventListenerOutsideAngular(element: HTMLElement, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}
