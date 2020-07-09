import { GridOptions } from '../entities/gridOptions';
import { GridApi } from '../gridApi';
import { ComponentStateChangedEvent, Events } from '../events';
import { PropertyKeys } from '../propertyKeys';
import { ColumnApi } from '../columnController/columnApi';
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { _ } from '../utils';

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

        // purely for event deprecation checks (for frameworks - wouldn't apply for non-fw versions)
        if (!skipEventDeprecationCheck) {
            ComponentUtil.EVENTS
                // React uses onXXX, not sure why this is different to the other frameworks
                .filter(event => keyExists(event) || keyExists(ComponentUtil.getCallbackForEvent(event)))
                .forEach(event => GridOptionsWrapper.checkEventDeprecation(event));
        }

        return gridOptions;
    }

    public static getCallbackForEvent(eventName: string): string {
        if (!eventName || eventName.length < 2) {
            return eventName;
        } else {
            return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
        }
    }

    public static processOnChange(changes: any, gridOptions: GridOptions, api: GridApi, columnApi: ColumnApi): void {
        if (!changes) {
            return;
        }

        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        const pGridOptions = gridOptions as any;
        const keyExists = (key: string) => changes[key];

        // check if any change for the simple types, and if so, then just copy in the new value
        [
            ...ComponentUtil.ARRAY_PROPERTIES,
            ...ComponentUtil.OBJECT_PROPERTIES,
            ...ComponentUtil.STRING_PROPERTIES,
            ...ComponentUtil.getEventCallbacks(),
        ]
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = changes[key].currentValue);

        ComponentUtil.BOOLEAN_PROPERTIES
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue));

        ComponentUtil.NUMBER_PROPERTIES
            .filter(keyExists)
            .forEach(key => pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue));

        if (changes.enableCellTextSelection) {
            api.setEnableCellTextSelection(ComponentUtil.toBoolean(changes.enableCellTextSelection.currentValue));
        }

        if (changes.quickFilterText) {
            api.setQuickFilter(changes.quickFilterText.currentValue);
        }

        if (changes.rowData) {
            api.setRowData(changes.rowData.currentValue);
        }

        if (changes.pinnedTopRowData) {
            api.setPinnedTopRowData(changes.pinnedTopRowData.currentValue);
        }

        if (changes.pinnedBottomRowData) {
            api.setPinnedBottomRowData(changes.pinnedBottomRowData.currentValue);
        }

        if (changes.autoGroupColumnDef) {
            api.setAutoGroupColumnDef(changes.autoGroupColumnDef.currentValue, "gridOptionsChanged");
        }

        if (changes.columnDefs) {
            api.setColumnDefs(changes.columnDefs.currentValue, "gridOptionsChanged");
        }

        if (changes.datasource) {
            api.setDatasource(changes.datasource.currentValue);
        }

        if (changes.headerHeight) {
            api.setHeaderHeight(ComponentUtil.toNumber(changes.headerHeight.currentValue));
        }

        if (changes.paginationPageSize) {
            api.paginationSetPageSize(ComponentUtil.toNumber(changes.paginationPageSize.currentValue));
        }

        if (changes.pivotMode) {
            columnApi.setPivotMode(ComponentUtil.toBoolean(changes.pivotMode.currentValue));
        }

        if (changes.groupRemoveSingleChildren) {
            api.setGroupRemoveSingleChildren(ComponentUtil.toBoolean(changes.groupRemoveSingleChildren.currentValue));
        }

        if (changes.suppressRowDrag) {
            api.setSuppressRowDrag(ComponentUtil.toBoolean(changes.suppressRowDrag.currentValue));
        }

        if (changes.suppressMoveWhenRowDragging) {
            api.setSuppressMoveWhenRowDragging(ComponentUtil.toBoolean(changes.suppressMoveWhenRowDragging.currentValue));
        }

        if (changes.suppressRowClickSelection) {
            api.setSuppressRowClickSelection(ComponentUtil.toBoolean(changes.suppressRowClickSelection.currentValue));
        }

        if (changes.suppressClipboardPaste) {
            api.setSuppressClipboardPaste(ComponentUtil.toBoolean(changes.suppressClipboardPaste.currentValue));
        }

        if (changes.sideBar) {
            api.setSideBar(changes.sideBar.currentValue);
        }

        // copy changes into an event for dispatch
        const event: ComponentStateChangedEvent = {
            type: Events.EVENT_COMPONENT_STATE_CHANGED,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };

        _.iterateObject(changes, (key: string, value: any) => {
            (event as any)[key] = value;
        });

        api.dispatchEvent(event);
    }

    public static toBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        } else if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // no value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value == '';
        } else {
            return false;
        }
    }

    public static toNumber(value: any): number {
        if (typeof value === 'number') {
            return value;
        } else if (typeof value === 'string') {
            return Number(value);
        } else {
            return undefined;
        }
    }
}

ComponentUtil.EVENTS = _.values<any>(Events);
