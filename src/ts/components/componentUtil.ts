module awk.grid {

    export class ComponentUtil {

        public static SIMPLE_PROPERTIES = [
            'sortingOrder',
            'icons','localeText','localeTextFunc',
            'groupColumnDef','context','rowStyle','rowClass','headerCellRenderer',
            'groupDefaultExpanded','slaveGrids','rowSelection'
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
            'suppressMenuHide','rowDeselection','unSortIcon','suppressMultiSort'
        ];

        public static WITH_IMPACT_NUMBER_PROPERTIES = ['pinnedColumnCount','headerHeight'];
        public static WITH_IMPACT_BOOLEAN_PROPERTIES = ['groupHeaders','showToolPanel'];
        public static WITH_IMPACT_OTHER_PROPERTIES = [
            'rowData','floatingTopRowData','floatingBottomRowData','groupKeys','groupAggFunction',
            'groupAggFields','columnDefs','datasource','quickFilterText'];

        public static CALLBACKS = ['groupInnerRenderer','groupRowInnerRenderer', 'groupRowRenderer',
            'isScrollLag','suppressScrollLag','isExternalFilterPresent','doesExternalFilterPass'];

        public static ALL_PROPERTIES = ComponentUtil.SIMPLE_PROPERTIES
            .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
            .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
            .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES);

    }

}