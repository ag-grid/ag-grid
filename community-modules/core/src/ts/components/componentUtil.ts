import { GridOptions } from '../entities/gridOptions';
import { GridApi } from '../gridApi';
import { ComponentStateChangedEvent, Events } from '../events';
import { PropertyKeys } from '../propertyKeys';
import { iterateObject } from '../utils/object';
import { includes } from '../utils/array';
import { values } from '../utils/generic';
import { WithoutGridCommon } from '../interfaces/iCommon';
export class ComponentUtil {

    // all events
    public static EVENTS: string[] = values<any>(Events);

    // events that are internal to AG Grid and should not be exposed to users via documentation or generated framework components
    /** Exclude the following internal events from code generation to prevent exposing these events via framework components */
    public static EXCLUDED_INTERNAL_EVENTS: string[] = [
        Events.EVENT_SCROLLBAR_WIDTH_CHANGED,
        Events.EVENT_CHECKBOX_CHANGED,
        Events.EVENT_HEIGHT_SCALE_CHANGED,
        Events.EVENT_BODY_HEIGHT_CHANGED,
        Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
        Events.EVENT_SCROLL_VISIBILITY_CHANGED,
        Events.EVENT_COLUMN_HOVER_CHANGED,
        Events.EVENT_FLASH_CELLS,
        Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED,
        Events.EVENT_DISPLAYED_ROWS_CHANGED,
        Events.EVENT_LEFT_PINNED_WIDTH_CHANGED,
        Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED,
        Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED,
        Events.EVENT_POPUP_TO_FRONT,
        Events.EVENT_KEYBOARD_FOCUS,
        Events.EVENT_MOUSE_FOCUS,
        Events.EVENT_STORE_UPDATED,
        Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
        Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
        Events.EVENT_FILL_START,
        Events.EVENT_FILL_END,
        Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START,
        Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END,
        Events.EVENT_FULL_WIDTH_ROW_FOCUSED,
        Events.EVENT_HEADER_HEIGHT_CHANGED,
        Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED
    ];

    // events that are available for use by users of AG Grid and so should be documented
    /** EVENTS that should be exposed via code generation for the framework components.  */
    public static PUBLIC_EVENTS: string[] = ComponentUtil.EVENTS.filter(e => !includes(ComponentUtil.EXCLUDED_INTERNAL_EVENTS, e));

    public static getCallbackForEvent(eventName: string): string {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }
        return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
    }
    // onXXX methods, based on the above events
    public static EVENT_CALLBACKS: string[] = ComponentUtil.EVENTS.map(event => ComponentUtil.getCallbackForEvent(event));

    public static STRING_PROPERTIES = PropertyKeys.STRING_PROPERTIES;
    public static OBJECT_PROPERTIES = PropertyKeys.OBJECT_PROPERTIES;
    public static ARRAY_PROPERTIES = PropertyKeys.ARRAY_PROPERTIES;
    public static NUMBER_PROPERTIES = PropertyKeys.NUMBER_PROPERTIES;
    public static BOOLEAN_PROPERTIES = PropertyKeys.BOOLEAN_PROPERTIES;
    public static FUNCTION_PROPERTIES = PropertyKeys.FUNCTION_PROPERTIES;
    public static ALL_PROPERTIES = PropertyKeys.ALL_PROPERTIES;

    private static getCoercionLookup() {
        let coercionLookup = {} as any;

        [
            ...ComponentUtil.ARRAY_PROPERTIES,
            ...ComponentUtil.OBJECT_PROPERTIES,
            ...ComponentUtil.STRING_PROPERTIES,
            ...ComponentUtil.FUNCTION_PROPERTIES,
            ...ComponentUtil.EVENT_CALLBACKS,
        ]
            .forEach((key: keyof GridOptions) => coercionLookup[key] = 'none');
        ComponentUtil.BOOLEAN_PROPERTIES
            .forEach(key => coercionLookup[key] = 'boolean');
        ComponentUtil.NUMBER_PROPERTIES
            .forEach(key => coercionLookup[key] = 'number');
        return coercionLookup;
    }
    private static coercionLookup: Record<keyof GridOptions, 'number' | 'boolean' | 'none'> = ComponentUtil.getCoercionLookup();

    private static getValue(key: string, rawValue: any) {
        const coercionStep = ComponentUtil.coercionLookup[key as keyof GridOptions];

        if (coercionStep) {
            let newValue = rawValue;
            switch (coercionStep) {
                case 'number': {
                    newValue = ComponentUtil.toNumber(rawValue);
                    break;
                }
                case 'boolean': {
                    newValue = ComponentUtil.toBoolean(rawValue);
                    break;
                }                    
                case 'none': {
                    // if groupAggFiltering exists and isn't a function, handle as a boolean.
                    if (key === 'groupAggFiltering' && typeof rawValue !== 'function') {
                        newValue = ComponentUtil.toBoolean(rawValue);
                    }
                    break;
                }
            }
            return newValue;
        }
        return undefined;
    }

    private static getGridOptionKeys(component: any, isVue: boolean) {
        // Vue does not have keys in prod so instead need to run through all the 
        // gridOptions checking for presence of a gridOption key.
        return isVue
            ? Object.keys(ComponentUtil.coercionLookup)
            : Object.keys(component);
    }

    public static copyAttributesToGridOptions(gridOptions: GridOptions | undefined, component: any, isVue: boolean = false): GridOptions {

        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = {} as GridOptions;
        }
        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        const pGridOptions = gridOptions as any;
        const keys = ComponentUtil.getGridOptionKeys(component, isVue);
        // Loop through component props, if they are not undefined and a valid gridOption copy to gridOptions
        keys.forEach(key => {
            const value = component[key];
            if (typeof value !== 'undefined') {
                const coercedValue = ComponentUtil.getValue(key, value);
                if (coercedValue !== undefined) {
                    pGridOptions[key] = coercedValue;
                }
            }
        })
        return gridOptions;
    }



    public static processOnChange(changes: any, api: GridApi): void {
        if (!changes) {
            return;
        }

        const changesToApply = { ...changes };

        // We manually call these updates so that we can provide a different source of gridOptionsChanged
        // We do not call __setProperty as this will be called by the grid api methods
        if (changesToApply.autoGroupColumnDef) {
            api.setAutoGroupColumnDef(changesToApply.autoGroupColumnDef.currentValue, "gridOptionsChanged");
            delete changesToApply.autoGroupColumnDef;
        }
        if (changesToApply.defaultColDef) {
            api.setDefaultColDef(changesToApply.defaultColDef.currentValue, "gridOptionsChanged");
            delete changesToApply.defaultColDef;
        }
        if (changesToApply.columnDefs) {
            api.setColumnDefs(changesToApply.columnDefs.currentValue, "gridOptionsChanged");
            delete changesToApply.columnDefs;
        }

        const dynamicApi = (api as any);
        Object.keys(changesToApply).forEach(key => {
            const gridKey = key as keyof GridOptions;

            const coercedValue = ComponentUtil.getValue(gridKey, changesToApply[gridKey].currentValue);
            // Ensure the GridOptions property gets updated and fires the change event as we
            // cannot assume that the dynamic Api call updated GridOptions or fired the event.
            // If the dynamic api did already update GridOptions then the change detection in the 
            // setter should prevent the event being fired twice.
            api.__setProperty(gridKey, coercedValue);

            const setterName = `set${key.charAt(0).toUpperCase()}${key.substring(1)}`;
            if (dynamicApi[setterName]) {
                dynamicApi[setterName](coercedValue);
            }
        });

        if (changesToApply.quickFilterText) {
            // Name of api method does not follow convention so we have to manually call it.
            // GridOptions property will be set above and fire event which could be used by the 
            // filter manager to trigger update instead of via this api call.
            api.setQuickFilter(changesToApply.quickFilterText.currentValue);
        }

        // copy changes into an event for dispatch
        const event: WithoutGridCommon<ComponentStateChangedEvent> = {
            type: Events.EVENT_COMPONENT_STATE_CHANGED
        };

        iterateObject(changes, (key: string, value: any) => {
            (event as any)[key] = value;
        });

        api.dispatchEvent(event);
    }

    public static toBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // no value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value == '';
        }

        return false;
    }

    public static toNumber(value: any): number | undefined {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            return Number(value);
        }
    }
}
