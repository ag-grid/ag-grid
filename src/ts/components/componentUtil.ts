module ag.grid {

    export class ComponentUtil {

        public static SIMPLE_PROPERTIES = [
            'sortingOrder',
            'icons','localeText','localeTextFunc',
            'groupColumnDef','context','rowStyle','rowClass','headerCellRenderer',
            'groupDefaultExpanded','slaveGrids','rowSelection',
            'overlayLoadingTemplate','overlayNoRowsTemplate'
        ];

        public static SIMPLE_NUMBER_PROPERTIES = [
            'rowHeight','rowBuffer','colWidth'
        ];

        public static SIMPLE_BOOLEAN_PROPERTIES = [
            'virtualPaging','toolPanelSuppressPivot','toolPanelSuppressValues','rowsAlreadyGrouped',
            'suppressRowClickSelection','suppressCellSelection','suppressHorizontalScroll','debug',
            'enableColResize','enableCellExpressions','enableSorting','enableServerSideSorting',
            'enableFilter','enableServerSideFilter','angularCompileRows','angularCompileFilters',
            'angularCompileHeaders','groupSuppressAutoColumn','groupSelectsChildren','groupHidePivotColumns',
            'groupIncludeFooter','groupUseEntireRow','groupSuppressRow','groupSuppressBlankHeader','forPrint',
            'suppressMenuHide','rowDeselection','unSortIcon','suppressMultiSort','suppressScrollLag',
            'singleClickEdit','suppressLoadingOverlay','suppressNoRowsOverlay'
        ];

        public static WITH_IMPACT_NUMBER_PROPERTIES = ['pinnedColumnCount','headerHeight'];
        public static WITH_IMPACT_BOOLEAN_PROPERTIES = ['groupHeaders','showToolPanel'];
        public static WITH_IMPACT_OTHER_PROPERTIES = [
            'rowData','floatingTopRowData','floatingBottomRowData','groupKeys',
            'groupAggFields','columnDefs','datasource','quickFilterText'];

        public static CALLBACKS = ['groupRowInnerRenderer', 'groupRowRenderer', 'groupAggFunction',
            'isScrollLag','isExternalFilterPresent','doesExternalFilterPass','getRowClass','getRowStyle',
            'headerCellRenderer'];

        public static ALL_PROPERTIES = ComponentUtil.SIMPLE_PROPERTIES
            .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
            .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES);

        public static copyAttributesToGridOptions(gridOptions: GridOptions, component: any): GridOptions {
            // create empty grid options if none were passed
            if (typeof gridOptions !== 'object') {
                gridOptions = <GridOptions> {};
            }
            // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
            var pGridOptions = <any>gridOptions;
            // add in all the simple properties
            ComponentUtil.SIMPLE_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES).forEach( (key)=> {
                if (typeof (component)[key] !== 'undefined') {
                    pGridOptions[key] = component[key];
                }
            });
            ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES).forEach( (key)=> {
                if (typeof (component)[key] !== 'undefined') {
                    pGridOptions[key] = ComponentUtil.toBoolean(component[key]);
                }
            });
            ComponentUtil.SIMPLE_NUMBER_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES).forEach( (key)=> {
                if (typeof (component)[key] !== 'undefined') {
                    pGridOptions[key] = ComponentUtil.toNumber(component[key]);
                }
            });

            return gridOptions;
        }

        public static processOnChange(changes: any, gridOptions: GridOptions, component: any): void {
            if (!component._initialised || !changes) { return; }

            // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
            //var pThis = <any>this;
            var pGridOptions = <any> gridOptions;

            // check if any change for the simple types, and if so, then just copy in the new value
            ComponentUtil.SIMPLE_PROPERTIES.forEach( (key)=> {
                if (changes[key]) {
                    pGridOptions[key] = changes[key].currentValue;
                }
            });
            ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.forEach( (key)=> {
                if (changes[key]) {
                    pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue);
                }
            });
            ComponentUtil.SIMPLE_NUMBER_PROPERTIES.forEach( (key)=> {
                if (changes[key]) {
                    pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue);
                }
            });

            if (changes.showToolPanel) {
                component.api.showToolPanel(component.showToolPanel);
            }

            if (changes.quickFilterText) {
                component.api.setQuickFilter(component.quickFilterText);
            }

            if (changes.rowData) {
                component.api.setRowData(component.rowData);
            }

            if (changes.floatingTopRowData) {
                component.api.setFloatingTopRowData(component.floatingTopRowData);
            }

            if (changes.floatingBottomRowData) {
                component.api.setFloatingBottomRowData(component.floatingBottomRowData);
            }

            if (changes.columnDefs) {
                component.api.setColumnDefs(component.columnDefs);
            }

            if (changes.datasource) {
                component.api.setDatasource(component.datasource);
            }

            if (changes.pinnedColumnCount) {
                component.columnApi.setPinnedColumnCount(component.pinnedColumnCount);
            }

            if (changes.pinnedColumnCount) {
                component.columnApi.setPinnedColumnCount(component.pinnedColumnCount);
            }

            if (changes.groupHeaders) {
                component.api.setGroupHeaders(component.groupHeaders);
            }

            if (changes.headerHeight) {
                component.api.setHeaderHeight(component.headerHeight);
            }

            // need to review these, they are not impacting anything, they should
            // call something on the API to update the grid
            if (changes.groupKeys) {
                component.gridOptions.groupKeys = component.groupKeys;
            }
            if (changes.groupAggFunction) {
                component.gridOptions.groupAggFunction = component.groupAggFunction;
            }
            if (changes.groupAggFields) {
                component.gridOptions.groupAggFields = component.groupAggFields;
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

}