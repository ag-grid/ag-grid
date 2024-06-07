import type { GridApi } from '../api/gridApi';
import type { GridOptions } from '../entities/gridOptions';
import { ALL_EVENTS, INTERNAL_EVENTS, PUBLIC_EVENTS } from '../eventTypes';
import type { ComponentStateChangedEvent, GridOptionsChangedEvent } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import { PropertyKeys } from '../propertyKeys';
import { _iterateObject } from '../utils/object';

export class ComponentUtil {
    public static VUE_OMITTED_PROPERTY = 'AG-VUE-OMITTED-PROPERTY';

    public static EXCLUDED_INTERNAL_EVENTS = INTERNAL_EVENTS;

    public static PUBLIC_EVENTS = PUBLIC_EVENTS;

    public static getCallbackForEvent(eventName: string): string {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }
        return 'on' + eventName[0].toUpperCase() + eventName.substring(1);
    }
    // onXXX methods, based on the above events
    public static EVENT_CALLBACKS: string[] = ALL_EVENTS.map((event) => ComponentUtil.getCallbackForEvent(event));

    public static BOOLEAN_PROPERTIES = PropertyKeys.BOOLEAN_PROPERTIES;
    public static ALL_PROPERTIES = PropertyKeys.ALL_PROPERTIES;

    public static ALL_PROPERTIES_AND_CALLBACKS = [...this.ALL_PROPERTIES, ...this.EVENT_CALLBACKS];
    public static ALL_PROPERTIES_AND_CALLBACKS_SET = new Set(ComponentUtil.ALL_PROPERTIES_AND_CALLBACKS);

    private static getGridOptionKeys() {
        // Vue does not have keys in prod so instead need to run through all the
        // gridOptions checking for presence of a gridOption key.
        return this.ALL_PROPERTIES_AND_CALLBACKS;
    }

    /** Combines component props / attributes with the provided gridOptions returning a new combined gridOptions object */
    public static combineAttributesAndGridOptions(gridOptions: GridOptions | undefined, component: any): GridOptions {
        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = {} as GridOptions;
        }
        // shallow copy (so we don't change the provided object)
        const mergedOptions = { ...gridOptions } as any;
        const keys = ComponentUtil.getGridOptionKeys();
        // Loop through component props, if they are not undefined and a valid gridOption copy to gridOptions
        keys.forEach((key) => {
            const value = component[key];
            if (typeof value !== 'undefined' && value !== ComponentUtil.VUE_OMITTED_PROPERTY) {
                mergedOptions[key] = value;
            }
        });
        return mergedOptions;
    }

    public static processOnChange(changes: any, api: GridApi): void {
        if (!changes) {
            return;
        }

        // Only process changes to properties that are part of the gridOptions
        const gridChanges: any = {};
        let hasChanges = false;
        Object.keys(changes)
            .filter((key) => ComponentUtil.ALL_PROPERTIES_AND_CALLBACKS_SET.has(key))
            .forEach((key) => {
                gridChanges[key] = changes[key];
                hasChanges = true;
            });

        if (!hasChanges) {
            return;
        }

        const internalUpdateEvent: WithoutGridCommon<GridOptionsChangedEvent> = {
            type: 'gridOptionsChanged',
            options: gridChanges,
        };
        api.dispatchEvent(internalUpdateEvent);

        // copy gridChanges into an event for dispatch
        const event: WithoutGridCommon<ComponentStateChangedEvent> = {
            type: 'componentStateChanged',
        };

        _iterateObject(gridChanges, (key: string, value: any) => {
            (event as any)[key] = value;
        });

        api.dispatchEvent(event);
    }
}
