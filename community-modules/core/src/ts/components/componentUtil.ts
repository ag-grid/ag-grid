import { GridOptions } from '../entities/gridOptions';
import { GridApi } from '../gridApi';
import { ComponentStateChangedEvent, Events } from '../events';
import { PropertyKeys } from '../propertyKeys';
import { ColumnApi } from '../columns/columnApi';
import { iterateObject } from '../utils/object';
import { includes } from '../utils/array';
import { values } from '../utils/generic';
import { WithoutGridCommon } from '../interfaces/iCommon';

export class ComponentUtil {

    // all the events are populated in here AFTER this class (at the bottom of the file).
    public static EVENTS: string[] = [];

    // events that are available for use by users of AG Grid and so should be documented
    public static PUBLIC_EVENTS: string[] = [];

    // events that are internal to AG Grid and should not be exposed to users via documentation or generated framework components
    public static EXCLUDED_INTERNAL_EVENTS: string[] = [];

    // function below fills this with onXXX methods, based on the above events
    private static EVENT_CALLBACKS: string[];

    public static STRING_PROPERTIES = PropertyKeys.STRING_PROPERTIES;
    public static OBJECT_PROPERTIES = PropertyKeys.OBJECT_PROPERTIES;
    public static ARRAY_PROPERTIES = PropertyKeys.ARRAY_PROPERTIES;
    public static NUMBER_PROPERTIES = PropertyKeys.NUMBER_PROPERTIES;
    public static BOOLEAN_PROPERTIES = PropertyKeys.BOOLEAN_PROPERTIES;
    public static FUNCTION_PROPERTIES = PropertyKeys.FUNCTION_PROPERTIES;
    public static ALL_PROPERTIES = PropertyKeys.ALL_PROPERTIES;

    public static getEventCallbacks(): string[] {
        if (!ComponentUtil.EVENT_CALLBACKS) {
            ComponentUtil.EVENT_CALLBACKS = ComponentUtil.EVENTS.map(event => ComponentUtil.getCallbackForEvent(event));
        }

        return ComponentUtil.EVENT_CALLBACKS;
    }

    public static copyAttributesToGridOptions(gridOptions: GridOptions | undefined, component: any, skipEventDeprecationCheck: boolean = false): GridOptions {

        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = {} as GridOptions;
        }

        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        const pGridOptions = gridOptions as any;
        const keyExists = (key: string) => typeof component[key] !== 'undefined';

        // if groupAggFiltering exists and isn't a function, handle as a boolean.
        if (keyExists('groupAggFiltering') && typeof component.groupAggFiltering !== 'function') {
            pGridOptions.groupAggFiltering = ComponentUtil.toBoolean(component.groupAggFiltering);
            delete component.groupAggFiltering;
        }

        // add in all the simple properties
        [
            ...ComponentUtil.ARRAY_PROPERTIES,
            ...ComponentUtil.STRING_PROPERTIES,
            ...ComponentUtil.OBJECT_PROPERTIES,
            ...ComponentUtil.FUNCTION_PROPERTIES,
            ...ComponentUtil.getEventCallbacks(),
        ]
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = component[key]);

        ComponentUtil.BOOLEAN_PROPERTIES
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = ComponentUtil.toBoolean(component[key]));

        ComponentUtil.NUMBER_PROPERTIES
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = ComponentUtil.toNumber(component[key]));

        return gridOptions;
    }

    public static getCallbackForEvent(eventName: string): string {
        if (!eventName || eventName.length < 2) {
            return eventName;
        }

        return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
    }

    public static processOnChange(changes: any, gridOptions: GridOptions, api: GridApi, columnApi: ColumnApi): void {
        if (!changes) {
            return;
        }

        const changesToApply = { ...changes };

        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        const pGridOptions = gridOptions as any;
        const keyExists = (key: string) => changesToApply[key];

        // if groupAggFiltering exists and isn't a function, handle as a boolean.
        if (keyExists('groupAggFiltering')) {
            if (typeof changesToApply.groupAggFiltering === 'function') {
                pGridOptions.groupAggFiltering = changesToApply.groupAggFiltering;
            } else {
                pGridOptions.groupAggFiltering = ComponentUtil.toBoolean(changesToApply.groupAggFiltering);
            }
            delete changesToApply.groupAggFiltering;
        }

        if (keyExists('groupDisplayType')) {
            if (typeof changesToApply.groupDisplayType.currentValue === 'string') {
                api.setGroupDisplayType(changesToApply.groupDisplayType.currentValue);
                delete changesToApply.groupDisplayType;
            }
        }
        // *********  CODE ORDER TO AVOID BUGS *************** //
        // If you want to call an update method that just calls through to gridOptionsWrapper.setProperty then it needs to be
        // called before the values get copied across otherwise the change will not fire an event because the method
        // gridOptionsWrapper.setProperty does a diff check first.

        // All these manual calls are required in the current setup as changes to these properties are being listened to in the 
        // rest of the code base which can be found by searching for: "addManagedListener(this.gridOptionsWrapper"

        if (changesToApply.domLayout) {
            api.setDomLayout(changesToApply.domLayout.currentValue);
            delete changesToApply.domLayout;
        }
        if (changesToApply.rowClass) {
            api.setRowClass(changesToApply.rowClass.currentValue);
            delete changesToApply.rowClass;
        }
        if (changesToApply.paginationPageSize) {
            api.paginationSetPageSize(ComponentUtil.toNumber(changesToApply.paginationPageSize.currentValue));
            delete changesToApply.paginationPageSize;
        }
        if (changesToApply.rowGroupPanelShow) {
            api.setRowGroupPanelShow(changesToApply.rowGroupPanelShow.currentValue);
            delete changesToApply.rowGroupPanelShow;
        }
        if (changesToApply.groupRemoveSingleChildren) {
            api.setGroupRemoveSingleChildren(ComponentUtil.toBoolean(changesToApply.groupRemoveSingleChildren.currentValue));
            delete changesToApply.groupRemoveSingleChildren;
        }
        if (changesToApply.groupRemoveLowestSingleChildren) {
            api.setGroupRemoveLowestSingleChildren(ComponentUtil.toBoolean(changesToApply.groupRemoveLowestSingleChildren.currentValue));
            delete changesToApply.groupRemoveLowestSingleChildren;
        }
        if (changesToApply.suppressRowDrag) {
            api.setSuppressRowDrag(ComponentUtil.toBoolean(changesToApply.suppressRowDrag.currentValue));
            delete changesToApply.suppressRowDrag;
        }
        if (changesToApply.suppressMoveWhenRowDragging) {
            api.setSuppressMoveWhenRowDragging(ComponentUtil.toBoolean(changesToApply.suppressMoveWhenRowDragging.currentValue));
            delete changesToApply.suppressMoveWhenRowDragging;
        }
        if (changesToApply.suppressRowClickSelection) {
            api.setSuppressRowClickSelection(ComponentUtil.toBoolean(changesToApply.suppressRowClickSelection.currentValue));
            delete changesToApply.suppressRowClickSelection;
        }
        if (changesToApply.suppressClipboardPaste) {
            api.setSuppressClipboardPaste(ComponentUtil.toBoolean(changesToApply.suppressClipboardPaste.currentValue));
            delete changesToApply.suppressClipboardPaste;
        }
        if (changesToApply.headerHeight) {
            api.setHeaderHeight(ComponentUtil.toNumber(changesToApply.headerHeight.currentValue));
            delete changesToApply.headerHeight;
        }
        if (changesToApply.pivotHeaderHeight) {
            api.setPivotHeaderHeight(ComponentUtil.toNumber(changesToApply.pivotHeaderHeight.currentValue));
            delete changesToApply.pivotHeaderHeight;
        }
        if (changesToApply.groupHeaderHeight) {
            api.setGroupHeaderHeight(ComponentUtil.toNumber(changesToApply.groupHeaderHeight.currentValue));
            delete changesToApply.groupHeaderHeight;
        }
        if (changesToApply.pivotGroupHeaderHeight) {
            api.setPivotGroupHeaderHeight(ComponentUtil.toNumber(changesToApply.pivotGroupHeaderHeight.currentValue));
            delete changesToApply.pivotGroupHeaderHeight;
        }
        if (changesToApply.floatingFiltersHeight) {
            api.setFloatingFiltersHeight(ComponentUtil.toNumber(changesToApply.floatingFiltersHeight.currentValue));
            delete changesToApply.floatingFiltersHeight;
        }
        if (changesToApply.functionsReadOnly) {
            api.setFunctionsReadOnly(ComponentUtil.toBoolean(changesToApply.functionsReadOnly.currentValue));
            delete changesToApply.functionsReadOnly;
        }
        // *********  CODE ORDER TO AVOID BUGS *************** //

        // check if any change for the simple types, and if so, then just copy in the new value
        [
            ...ComponentUtil.ARRAY_PROPERTIES,
            ...ComponentUtil.OBJECT_PROPERTIES,
            ...ComponentUtil.STRING_PROPERTIES,
            ...ComponentUtil.getEventCallbacks(),
        ]
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = changesToApply[key].currentValue);

        ComponentUtil.BOOLEAN_PROPERTIES
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = ComponentUtil.toBoolean(changesToApply[key].currentValue));

        ComponentUtil.NUMBER_PROPERTIES
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = ComponentUtil.toNumber(changesToApply[key].currentValue));


        // All of the above could be replaced with the following once using the GridOptionsService which has a set method
        // that takes care of the coercion as part of the set method.
        /* const changeKeys = Object.keys(changesToApply);
        changeKeys.forEach(key => {
            const gridKey = key as keyof GridOptions;
            api.setProperty(gridKey, changesToApply[gridKey].currentValue);
        }); */

        // *********  CODE ORDER TO AVOID BUGS *************** //
        // The following manual updates call directly into code models and rely on the simple copy being made by the
        // code above to keep gridOptions in sync with the change.
        if (changesToApply.enableCellTextSelection) {
            api.setEnableCellTextSelection(ComponentUtil.toBoolean(changesToApply.enableCellTextSelection.currentValue));
            delete changesToApply.enableCellTextSelection;
        }
        if (changesToApply.quickFilterText) {
            api.setQuickFilter(changesToApply.quickFilterText.currentValue);
            delete changesToApply.quickFilterText;
        }
        if (changesToApply.autoGroupColumnDef) {
            api.setAutoGroupColumnDef(changesToApply.autoGroupColumnDef.currentValue, "gridOptionsChanged");
            delete changesToApply.autoGroupColumnDef;
        }
        if (changesToApply.columnDefs) {
            api.setColumnDefs(changesToApply.columnDefs.currentValue, "gridOptionsChanged");
            delete changesToApply.columnDefs;
        }
        if (changesToApply.defaultColDef) {
            api.setDefaultColDef(changesToApply.defaultColDef.currentValue, "gridOptionsChanged");
            delete changesToApply.defaultColDef;
        }
        if (changesToApply.pivotMode) {
            columnApi.setPivotMode(ComponentUtil.toBoolean(changesToApply.pivotMode.currentValue));
            delete changesToApply.pivotMode;
        }

        // any remaining properties can be set in a generic way
        // ie the setter takes the form of setXXX and the argument requires no formatting/translation first
        const dynamicApi = (api as any);
        Object.keys(changesToApply)
            .forEach(property => {
                const setterName = `set${property.charAt(0).toUpperCase()}${property.substring(1)}`;

                if (dynamicApi[setterName]) {
                    dynamicApi[setterName](changes[property].currentValue);
                }
            });

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

ComponentUtil.EVENTS = values<any>(Events);

/** Exclude the following internal events from code generation to prevent exposing these events via framework components */
ComponentUtil.EXCLUDED_INTERNAL_EVENTS = [
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

/** EVENTS that should be exposed via code generation for the framework components.  */
ComponentUtil.PUBLIC_EVENTS = ComponentUtil.EVENTS.filter(e => !includes(ComponentUtil.EXCLUDED_INTERNAL_EVENTS, e));
