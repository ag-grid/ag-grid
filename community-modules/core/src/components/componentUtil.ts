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

    public static VUE_OMITTED_PROPERTY = 'AG-VUE-OMITTED-PROPERTY';

    // events that are internal to AG Grid and should not be exposed to users via documentation or generated framework components
    /** Exclude the following internal events from code generation to prevent exposing these events via framework components */
    public static EXCLUDED_INTERNAL_EVENTS: string[] = [
        Events.EVENT_SCROLLBAR_WIDTH_CHANGED,
        Events.EVENT_CHECKBOX_CHANGED,
        Events.EVENT_HEIGHT_SCALE_CHANGED,
        Events.EVENT_BODY_HEIGHT_CHANGED,
        Events.EVENT_COLUMN_CONTAINER_WIDTH_CHANGED,
        Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
        Events.EVENT_SCROLL_VISIBILITY_CHANGED,
        Events.EVENT_COLUMN_HOVER_CHANGED,
        Events.EVENT_FLASH_CELLS,
        Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED,
        Events.EVENT_DISPLAYED_ROWS_CHANGED,
        Events.EVENT_LEFT_PINNED_WIDTH_CHANGED,
        Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED,
        Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED,
        Events.EVENT_STORE_UPDATED,
        Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
        Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END,
        Events.EVENT_FILL_START,
        Events.EVENT_FILL_END,
        Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START,
        Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END,
        Events.EVENT_FULL_WIDTH_ROW_FOCUSED,
        Events.EVENT_HEADER_HEIGHT_CHANGED,
        Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED,
        Events.EVENT_CELL_FOCUS_CLEARED,
        Events.EVENT_GRID_STYLES_CHANGED,
        Events.EVENT_FILTER_DESTROYED,
        Events.EVENT_ROW_DATA_UPDATE_STARTED,
        Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
        Events.EVENT_DATA_TYPES_INFERRED,
        Events.EVENT_FIELD_VALUE_CHANGED,
        Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
        Events.EVENT_SUPPRESS_COLUMN_MOVE_CHANGED,
        Events.EVENT_SUPPRESS_MENU_HIDE_CHANGED,
        Events.EVENT_SUPPRESS_FIELD_DOT_NOTATION,
        Events.EVENT_ROW_COUNT_READY,
        Events.EVENT_SIDE_BAR_UPDATED,
    ];

    // events that are available for use by users of AG Grid and so should be documented
    /** EVENTS that should be exposed via code generation for the framework components.  */
    public static PUBLIC_EVENTS: string[] = ComponentUtil.EVENTS.filter(e => !includes(ComponentUtil.EXCLUDED_INTERNAL_EVENTS, e));

    public static getCallbackForEvent(eventName: string): string {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }
        return 'on' + eventName[0].toUpperCase() + eventName.substring(1);
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
        const mergedOptions = {...gridOptions} as any;
        const keys = ComponentUtil.getGridOptionKeys();
        // Loop through component props, if they are not undefined and a valid gridOption copy to gridOptions
        keys.forEach(key => {
            const value = component[key];
            if (typeof value !== 'undefined' && value !== ComponentUtil.VUE_OMITTED_PROPERTY) {
                mergedOptions[key] = value;
            }
        })
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
                gridChanges[key] = changes[key]
                hasChanges = true;
            });

        if (!hasChanges) {
            return;
        }

        api.__internalUpdateGridOptions(gridChanges);

        // copy gridChanges into an event for dispatch
        const event: WithoutGridCommon<ComponentStateChangedEvent> = {
            type: Events.EVENT_COMPONENT_STATE_CHANGED
        };

        iterateObject(gridChanges, (key: string, value: any) => {
            (event as any)[key] = value;
        });

        api.dispatchEvent(event);
    }
}
