import { GridOptions } from '../entities/gridOptions';
import { GridApi } from '../gridApi';
import { ComponentStateChangedEvent, Events } from '../events';
import { PropertyKeys } from '../propertyKeys';
import { ColumnApi } from '../columns/columnApi';
import { iterateObject } from '../utils/object';
import { values } from '../utils/generic';

export class ComponentUtil {
    // all the events are populated in here AFTER this class (at the bottom of the file).
    public static EVENTS: string[] = [];

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

    public static copyAttributesToGridOptions(gridOptions: GridOptions, component: any, skipEventDeprecationCheck: boolean = false): GridOptions {

        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = {} as GridOptions;
        }

        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        const pGridOptions = gridOptions as any;
        const keyExists = (key: string) => typeof component[key] !== 'undefined';

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

        const changesToApply = {...changes};

        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        const pGridOptions = gridOptions as any;
        const keyExists = (key: string) => changesToApply[key];

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

        if (changesToApply.paginationPageSize) {
            api.paginationSetPageSize(ComponentUtil.toNumber(changesToApply.paginationPageSize.currentValue));
            delete changesToApply.paginationPageSize;
        }

        if (changesToApply.pivotMode) {
            columnApi.setPivotMode(ComponentUtil.toBoolean(changesToApply.pivotMode.currentValue));
            delete changesToApply.pivotMode;
        }

        if (changesToApply.groupRemoveSingleChildren) {
            api.setGroupRemoveSingleChildren(ComponentUtil.toBoolean(changesToApply.groupRemoveSingleChildren.currentValue));
            delete changesToApply.groupRemoveSingleChildren;
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

        // any remaining properties can be set in a generic way
        // ie the setter takes the form of setXXX and the argument requires no formatting/translation first
        const dynamicApi = (api as any);
        Object.keys(changesToApply)
            .forEach(property => {
                const setterName = `set${property.charAt(0).toUpperCase()}${property.substring(1)}`

                if (dynamicApi[setterName]) {
                    dynamicApi[setterName](changes[property].currentValue);
                }
            })

        // copy changes into an event for dispatch
        const event: ComponentStateChangedEvent = {
            type: Events.EVENT_COMPONENT_STATE_CHANGED,
            api: gridOptions.api!,
            columnApi: gridOptions.columnApi!
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
