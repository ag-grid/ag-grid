import {GridOptions} from "../entities/gridOptions";
import {GridApi} from "../gridApi";
import {Events} from "../events";
import {Utils as _} from "../utils";
import {ColumnApi} from "../columnController/columnController";

export class ComponentUtil {

    // all the events are populated in here AFTER this class (at the bottom of the file).
    public static EVENTS: string[] = [];

    // function below fills this with onXXX methods, based on the above events
    private static EVENT_CALLBACKS: string[];

    public static STRING_PROPERTIES = [
        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate',
        'overlayNoRowsTemplate', 'headerCellTemplate', 'quickFilterText', 'rowModelType',
        'editType'];

    public static OBJECT_PROPERTIES = [
        'rowStyle','context','groupColumnDef','localeText','icons','datasource','viewportDatasource',
        'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams','defaultColGroupDef','defaultColDef'
    //,'cellRenderers','cellEditors'
    ];

    public static ARRAY_PROPERTIES = [
        'slaveGrids','rowData','floatingTopRowData','floatingBottomRowData','columnDefs'
    ];

    public static NUMBER_PROPERTIES = [
        'rowHeight','rowBuffer','colWidth','headerHeight','groupDefaultExpanded',
        'minColWidth','maxColWidth','viewportRowModelPageSize','viewportRowModelBufferSize',
        'layoutInterval','autoSizePadding','maxPagesInCache','maxConcurrentDatasourceRequests',
        'paginationOverflowSize','paginationPageSize','paginationInitialRowCount'
    ];

    public static BOOLEAN_PROPERTIES = [
        'toolPanelSuppressRowGroups','toolPanelSuppressValues','toolPanelSuppressPivots', 'toolPanelSuppressPivotMode',
        'suppressRowClickSelection','suppressCellSelection','suppressHorizontalScroll','debug',
        'enableColResize','enableCellExpressions','enableSorting','enableServerSideSorting',
        'enableFilter','enableServerSideFilter','angularCompileRows','angularCompileFilters',
        'angularCompileHeaders','groupSuppressAutoColumn','groupSelectsChildren',
        'groupIncludeFooter','groupUseEntireRow','groupSuppressRow','groupSuppressBlankHeader','forPrint',
        'suppressMenuHide','rowDeselection','unSortIcon','suppressMultiSort','suppressScrollLag',
        'singleClickEdit','suppressLoadingOverlay','suppressNoRowsOverlay','suppressAutoSize',
        'suppressParentsInRowNodes','showToolPanel','suppressColumnMoveAnimation','suppressMovableColumns',
        'suppressFieldDotNotation','enableRangeSelection','suppressEnterprise','rowGroupPanelShow',
        'pivotPanelShow',
        'suppressContextMenu','suppressMenuFilterPanel','suppressMenuMainPanel','suppressMenuColumnPanel',
        'enableStatusBar','rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns',
        'suppressMiddleClickScrolls','suppressPreventDefaultOnMouseWheel', 'suppressUseColIdForGroups',
        'suppressCopyRowsToClipboard','pivotMode', 'suppressAggFuncInHeader', 'suppressColumnVirtualisation',
        'suppressFocusAfterRefresh', 'functionsPassive', 'functionsReadOnly'
    ];

    public static FUNCTION_PROPERTIES = ['headerCellRenderer', 'localeTextFunc', 'groupRowInnerRenderer',
        'groupRowRenderer', 'isScrollLag', 'isExternalFilterPresent', 'getRowHeight',
        'doesExternalFilterPass', 'getRowClass','getRowStyle', 'getHeaderCellTemplate', 'traverseNode',
        'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard',
        'getNodeChildDetails', 'groupRowAggNodes', 'getRowNodeId', 'isFullWidthCell', 'fullWidthCellRenderer',
        'doesDataFlower', 'processSecondaryColDef','processSecondaryColGroupDef'];

    public static ALL_PROPERTIES = ComponentUtil.ARRAY_PROPERTIES
        .concat(ComponentUtil.OBJECT_PROPERTIES)
        .concat(ComponentUtil.STRING_PROPERTIES)
        .concat(ComponentUtil.NUMBER_PROPERTIES)
        .concat(ComponentUtil.FUNCTION_PROPERTIES)
        .concat(ComponentUtil.BOOLEAN_PROPERTIES);

    public static getEventCallbacks(): string[] {
        if (!ComponentUtil.EVENT_CALLBACKS) {
            ComponentUtil.EVENT_CALLBACKS = [];
            ComponentUtil.EVENTS.forEach( (eventName: string)=> {
                ComponentUtil.EVENT_CALLBACKS.push(ComponentUtil.getCallbackForEvent(eventName));
            });
        }
        return ComponentUtil.EVENT_CALLBACKS;
    }

    public static copyAttributesToGridOptions(gridOptions: GridOptions, component: any): GridOptions {
        checkForDeprecated(component);
        // create empty grid options if none were passed
        if (typeof gridOptions !== 'object') {
            gridOptions = <GridOptions> {};
        }
        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        var pGridOptions = <any>gridOptions;
        // add in all the simple properties
        ComponentUtil.ARRAY_PROPERTIES
            .concat(ComponentUtil.STRING_PROPERTIES)
            .concat(ComponentUtil.OBJECT_PROPERTIES)
            .concat(ComponentUtil.FUNCTION_PROPERTIES)
            .forEach( (key)=> {
            if (typeof (component)[key] !== 'undefined') {
                pGridOptions[key] = component[key];
            }
        });
        ComponentUtil.BOOLEAN_PROPERTIES.forEach( (key)=> {
            if (typeof (component)[key] !== 'undefined') {
                pGridOptions[key] = ComponentUtil.toBoolean(component[key]);
            }
        });
        ComponentUtil.NUMBER_PROPERTIES.forEach( (key)=> {
            if (typeof (component)[key] !== 'undefined') {
                pGridOptions[key] = ComponentUtil.toNumber(component[key]);
            }
        });
        ComponentUtil.getEventCallbacks().forEach( (funcName) => {
            if (typeof (component)[funcName] !== 'undefined') {
                pGridOptions[funcName] = component[funcName];
            }
        });

        return gridOptions;
    }

    public static getCallbackForEvent(eventName: string): string {
        if (!eventName || eventName.length < 2) {
            return eventName;
        } else {
            return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
        }
    }

    // change this method, the caller should know if it's initialised or not, plus 'initialised'
    // is not relevant for all component types. maybe pass in the api and columnApi instead???
    public static processOnChange(changes: any, gridOptions: GridOptions, api: GridApi, columnApi: ColumnApi): void {
        //if (!component._initialised || !changes) { return; }
        if (!changes) { return; }

        checkForDeprecated(changes);

        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
        var pGridOptions = <any> gridOptions;

        // check if any change for the simple types, and if so, then just copy in the new value
        ComponentUtil.ARRAY_PROPERTIES
            .concat(ComponentUtil.OBJECT_PROPERTIES)
            .concat(ComponentUtil.STRING_PROPERTIES)
            .forEach( (key)=> {
            if (changes[key]) {
                pGridOptions[key] = changes[key].currentValue;
            }
        });
        ComponentUtil.BOOLEAN_PROPERTIES.forEach( (key)=> {
            if (changes[key]) {
                pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue);
            }
        });
        ComponentUtil.NUMBER_PROPERTIES.forEach( (key)=> {
            if (changes[key]) {
                pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue);
            }
        });
        ComponentUtil.getEventCallbacks().forEach( (funcName)=> {
            if (changes[funcName]) {
                pGridOptions[funcName] = changes[funcName].currentValue;
            }
        });

        if (changes.showToolPanel) {
            api.showToolPanel(ComponentUtil.toBoolean(changes.showToolPanel.currentValue));
        }

        if (changes.quickFilterText) {
            api.setQuickFilter(changes.quickFilterText.currentValue);
        }

        if (changes.rowData) {
            api.setRowData(changes.rowData.currentValue);
        }

        if (changes.floatingTopRowData) {
            api.setFloatingTopRowData(changes.floatingTopRowData.currentValue);
        }

        if (changes.floatingBottomRowData) {
            api.setFloatingBottomRowData(changes.floatingBottomRowData.currentValue);
        }

        if (changes.columnDefs) {
            api.setColumnDefs(changes.columnDefs.currentValue);
        }

        if (changes.datasource) {
            api.setDatasource(changes.datasource.currentValue);
        }

        if (changes.headerHeight) {
            api.setHeaderHeight(ComponentUtil.toNumber(changes.headerHeight.currentValue));
        }
        
        if (changes.pivotMode) {
            columnApi.setPivotMode(ComponentUtil.toBoolean(changes.pivotMode.currentValue));
        }
    }

    public static toBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        } else if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // not value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value=='';
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

_.iterateObject(Events, function(key, value) {
    ComponentUtil.EVENTS.push(value);
});

function checkForDeprecated(changes: any): void {
    if (changes.ready || changes.onReady) {
        console.warn('ag-grid: as of v3.3 ready event is now called gridReady, so the callback should be onGridReady');
    }
    if (changes.rowDeselected || changes.onRowDeselected) {
        console.warn('ag-grid: as of v3.4 rowDeselected no longer exists. Please check the docs.');
    }
}