module ag.grid {

    export class ComponentUtil {

        public static SIMPLE_PROPERTIES = [
            'sortingOrder',
            'icons','localeText','localeTextFunc',
            'groupColumnDef','context','rowStyle','rowClass','headerCellRenderer',
            'groupDefaultExpanded','slaveGrids','rowSelection',
            'overlayLoadingTemplate','overlayNoRowsTemplate',
            'headerCellTemplate'
        ];

        public static SIMPLE_NUMBER_PROPERTIES = [
            'rowHeight','rowBuffer','colWidth'
        ];

        public static SIMPLE_BOOLEAN_PROPERTIES = [
            'virtualPaging','toolPanelSuppressGroups','toolPanelSuppressValues','rowsAlreadyGrouped',
            'suppressRowClickSelection','suppressCellSelection','suppressHorizontalScroll','debug',
            'enableColResize','enableCellExpressions','enableSorting','enableServerSideSorting',
            'enableFilter','enableServerSideFilter','angularCompileRows','angularCompileFilters',
            'angularCompileHeaders','groupSuppressAutoColumn','groupSelectsChildren','groupHideGroupColumns',
            'groupIncludeFooter','groupUseEntireRow','groupSuppressRow','groupSuppressBlankHeader','forPrint',
            'suppressMenuHide','rowDeselection','unSortIcon','suppressMultiSort','suppressScrollLag',
            'singleClickEdit','suppressLoadingOverlay','suppressNoRowsOverlay','suppressAutoSize',
            'suppressParentsInRowNodes'
        ];

        public static WITH_IMPACT_STRING_PROPERTIES = ['quickFilterText'];
        public static WITH_IMPACT_NUMBER_PROPERTIES = ['headerHeight'];
        public static WITH_IMPACT_BOOLEAN_PROPERTIES = ['showToolPanel'];
        public static WITH_IMPACT_OTHER_PROPERTIES = [
            'rowData','floatingTopRowData','floatingBottomRowData',
            'columnDefs','datasource'];

        public static CALLBACKS = ['groupRowInnerRenderer', 'groupRowRenderer', 'groupAggFunction',
            'isScrollLag','isExternalFilterPresent','doesExternalFilterPass','getRowClass','getRowStyle',
            'headerCellRenderer','getHeaderCellTemplate'];

        public static ALL_PROPERTIES = ComponentUtil.SIMPLE_PROPERTIES
            .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
            .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_STRING_PROPERTIES)
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
            ComponentUtil.SIMPLE_PROPERTIES
                .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
                .concat(ComponentUtil.WITH_IMPACT_STRING_PROPERTIES)
                .forEach( (key)=> {
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

        // change this method, the caller should know if it's initialised or not, plus 'initialised'
        // is not relevant for all component types.
        // maybe pass in the api and columnApi instead???
        public static processOnChange(changes: any, gridOptions: GridOptions, api: GridApi): void {
            //if (!component._initialised || !changes) { return; }
            if (!changes) { return; }

            // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
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
                api.showToolPanel(changes.showToolPanel.currentValue);
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
                api.setHeaderHeight(changes.headerHeight.currentValue);
            }

            // need to review this, it is not impacting anything, they should
            // call something on the API to update the grid
            if (changes.groupAggFunction) {
                gridOptions.groupAggFunction = changes.groupAggFunction.currentValue;
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