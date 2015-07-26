declare module awk.grid {
    class Utils {
        private static isSafari;
        private static isIE;
        static iterateObject(object: any, callback: (key: string, value: any) => void): void;
        static map<TItem, TResult>(array: TItem[], callback: (item: TItem) => TResult): TResult[];
        static forEach<T>(array: T[], callback: (item: T, index: number) => void): void;
        static filter<T>(array: T[], callback: (item: T) => boolean): T[];
        static assign(object: any, source: any): void;
        static getFunctionParameters(func: any): any;
        static find(collection: any, predicate: any, value: any): any;
        static toStrings<T>(array: T[]): string[];
        static iterateArray<T>(array: T[], callback: (item: T, index: number) => void): void;
        static isNode(o: any): boolean;
        static isElement(o: any): boolean;
        static isNodeOrElement(o: any): boolean;
        static addChangeListener(element: HTMLElement, listener: EventListener): void;
        static makeNull(value: any): any;
        static removeAllChildren(node: HTMLElement): void;
        static removeElement(parent: HTMLElement, cssSelector: string): void;
        static removeFromParent(node: Element): void;
        static isVisible(element: HTMLElement): boolean;
        /**
         * loads the template and returns it as an element. makes up for no simple way in
         * the dom api to load html directly, eg we cannot do this: document.createElement(template)
         */
        static loadTemplate(template: string): Node;
        static querySelectorAll_addCssClass(eParent: any, selector: string, cssClass: string): void;
        static querySelectorAll_removeCssClass(eParent: any, selector: string, cssClass: string): void;
        static querySelectorAll_replaceCssClass(eParent: any, selector: string, cssClassToRemove: string, cssClassToAdd: string): void;
        static addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean): void;
        static addCssClass(element: HTMLElement, className: string): void;
        static offsetHeight(element: HTMLElement): number;
        static offsetWidth(element: HTMLElement): number;
        static removeCssClass(element: HTMLElement, className: string): void;
        static removeFromArray<T>(array: T[], object: T): void;
        static defaultComparator(valueA: any, valueB: any): number;
        static formatWidth(width: number | string): string;
        /**
         * tries to use the provided renderer. if a renderer found, returns true.
         * if no renderer, returns false.
         */
        static useRenderer<TParams>(eParent: Element, eRenderer: (params: TParams) => Node | string, params: TParams): void;
        /**
         * if icon provided, use this (either a string, or a function callback).
         * if not, then use the second parameter, which is the svgFactory function
         */
        static createIcon(iconName: any, gridOptionsWrapper: any, colDefWrapper: any, svgFactoryFunc: () => Node): HTMLSpanElement;
        static addStylesToElement(eElement: any, styles: any): void;
        static getScrollbarWidth(): number;
        static isKeyPressed(event: KeyboardEvent, keyToCheck: number): boolean;
        static setVisible(element: HTMLElement, visible: boolean): void;
        static isBrowserIE(): boolean;
        static isBrowserSafari(): boolean;
    }
}
declare module awk.grid {
    class Constants {
        static STEP_EVERYTHING: number;
        static STEP_FILTER: number;
        static STEP_SORT: number;
        static STEP_MAP: number;
        static ASC: string;
        static DESC: string;
        static ROW_BUFFER_SIZE: number;
        static MIN_COL_WIDTH: number;
        static SUM: string;
        static MIN: string;
        static MAX: string;
        static KEY_TAB: number;
        static KEY_ENTER: number;
        static KEY_SPACE: number;
        static KEY_DOWN: number;
        static KEY_UP: number;
        static KEY_LEFT: number;
        static KEY_RIGHT: number;
    }
}
declare module awk.grid {
    interface ColumnModel {
        getAllColumns(): Column[];
        getDisplayedColumns(): Column[];
        getGroupedColumns(): Column[];
        getValueColumns(): Column[];
        getBodyContainerWidth(): number;
        getPinnedContainerWidth(): number;
        getHeaderGroups(): HeaderGroup[];
        getColumn(key: any): Column;
        getVisibleColBefore(column: Column): Column;
        getVisibleColAfter(column: Column): Column;
        getDisplayNameForCol(column: Column): string;
        isPinning(): boolean;
    }
    class ColumnController {
        gridOptionsWrapper: any;
        angularGrid: any;
        selectionRendererFactory: any;
        expressionService: any;
        listeners: any;
        model: ColumnModel;
        allColumns: Column[];
        displayedColumns: Column[];
        pivotColumns: Column[];
        valueColumns: Column[];
        visibleColumns: Column[];
        headerGroups: HeaderGroup[];
        private valueService;
        constructor();
        init(angularGrid: any, selectionRendererFactory: any, gridOptionsWrapper: any, expressionService: any, valueService: ValueService): void;
        private createModel();
        getState(): any;
        setState(columnState: any): void;
        getColumn(key: any): Column;
        getDisplayNameForCol(column: any): any;
        addListener(listener: any): void;
        fireColumnsChanged(): void;
        getModel(): ColumnModel;
        setColumns(columnDefs: any): void;
        private checkForDeprecatedItems(columnDefs);
        headerGroupOpened(group: any): void;
        onColumnStateChanged(): void;
        hideColumns(colIds: any, hide: any): void;
        private updateModel();
        private updateDisplayedColumns();
        sizeColumnsToFit(gridWidth: any): void;
        private buildGroups();
        private updateGroups();
        private updateVisibleColumns();
        private updatePinnedColumns();
        private createColumns(columnDefs);
        private createPivotColumns();
        private createValueColumns();
        private createDummyColumn(field);
        private calculateColInitialWidth(colDef);
        private getTotalColWidth(includePinned);
    }
    class HeaderGroup {
        pinned: any;
        name: any;
        allColumns: Column[];
        displayedColumns: Column[];
        expandable: boolean;
        expanded: boolean;
        actualWidth: number;
        eHeaderGroupCell: HTMLElement;
        eHeaderCellResize: HTMLElement;
        constructor(pinned: any, name: any);
        getMinimumWidth(): number;
        addColumn(column: any): void;
        calculateExpandable(): void;
        calculateDisplayedColumns(): void;
        addToVisibleColumns(colsToAdd: any): void;
    }
    interface CellRendererObj {
        renderer: string;
    }
    /** The filter parameters for set filter */
    interface SetFilterParameters {
        /** Same as cell renderer for grid (you can use the same one in both locations). Setting it separatly here allows for the value to be rendered differently in the filter. */
        cellRenderer?: Function;
        /** The height of the cell. */
        cellHeight?: number;
        /** The values to display in the filter. */
        values?: any;
        /**  What to do when new rows are loaded. The default is to reset the filter, as the set of values to select from can have changed. If you want to keep the selection, then set this value to 'keep'. */
        newRowsAction?: string;
    }
    interface TextAndNumberFilterParameters {
        /** What to do when new rows are loaded. The default is to reset the filter, to keep it in line with 'set' filters. If you want to keep the selection, then set this value to 'keep'. */
        newRowsAction?: string;
    }
    interface ColDef {
        /** The name to render in the column header */
        headerName: string;
        /** The field of the row to get the cells data from */
        field: string;
        /** Expression or function to get the cells value. */
        headerValueGetter?: string | Function;
        /** The unique ID to give the column. This is optional. If missing, the ID will default to the field. If both field and colId are missing, a unique ID will be generated.
         *  This ID is used to identify the column in the API for sorting, filtering etc. */
        colId?: string;
        /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
         *  however we want all default values to be false and we want columns to be visible by default. */
        hide?: boolean;
        /** Tooltip for the column header */
        headerTooltip?: string;
        /** Expression or function to get the cells value. */
        valueGetter?: string | Function;
        /** Initial width, in pixels, of the cell */
        width?: number;
        /** Min width, in pixels, of the cell */
        minWidth?: number;
        /** Max width, in pixels, of the cell */
        maxWidth?: number;
        /** Class to use for the cell. Can be string, array of strings, or function. */
        cellClass?: string | string[] | ((cellClassParams: any) => string | string[]);
        /** An object of css values. Or a function returning an object of css values. */
        cellStyle?: {} | ((params: any) => {});
        /** A function for rendering a cell. */
        cellRenderer?: Function | CellRendererObj;
        /** Function callback, gets called when a cell is clicked. */
        cellClicked?: Function;
        /** Function callback, gets called when a cell is double clicked. */
        cellDoubleClicked?: Function;
        /** Name of function to use for aggregation. One of [sum,min,max]. */
        aggFunc?: string;
        /** Comparator function for custom sorting. */
        comparator?: Function;
        /** Set to true to render a selection checkbox in the column. */
        checkboxSelection?: boolean;
        /** Set to true if no menu should be shown for this column header. */
        suppressMenu?: boolean;
        /** Set to true if no sorting should be done for this column. */
        suppressSorting?: boolean;
        /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column. */
        unSortIcon?: boolean;
        /** Set to true if you want this columns width to be fixed during 'size to fit' operation. */
        suppressSizeToFit?: boolean;
        /** Set to true if you do not want this column to be resizable by dragging it's edge. */
        suppressResize?: boolean;
        /** If grouping columns, the group this column belongs to. */
        headerGroup?: string;
        /** Whether to show the column when the group is open / closed. */
        headerGroupShow?: string;
        /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable. */
        editable?: boolean | (Function);
        /** Callbacks for editing.See editing section for further details. */
        newValueHandler?: Function;
        /** Callbacks for editing.See editing section for further details. */
        cellValueChanged?: Function;
        /** If true, this cell gets refreshed when api.softRefreshView() gets called. */
        volatile?: boolean;
        /** Cell template to use for cell. Useful for AngularJS cells. */
        template?: string;
        /** Cell template URL to load template from to use for cell. Useful for AngularJS cells. */
        templateUrl?: string;
        /** one of the built in filter names: [set, number, text], or a filter function*/
        filter?: string | Function;
        /** The filter params are specific to each filter! */
        filterParams?: SetFilterParameters | TextAndNumberFilterParameters;
        cellClassRules?: {
            [cssClassName: string]: (Function | string);
        };
    }
    class Column {
        static colIdSequence: number;
        colDef: ColDef;
        actualWidth: any;
        visible: any;
        colId: any;
        pinned: boolean;
        index: number;
        aggFunc: string;
        pivotIndex: number;
        eHeaderCell: HTMLElement;
        constructor(colDef: ColDef, actualWidth: any);
        isGreaterThanMax(width: number): boolean;
        getMinimumWidth(): number;
        setMinimum(): void;
    }
}
declare module awk.grid {
    class ExpressionService {
        expressionToFunctionCache: any;
        evaluate(expression: any, params: any): any;
        createExpressionFunction(expression: any): any;
        createFunctionBody(expression: any): any;
    }
}
declare module awk.grid {
    class GridOptionsWrapper {
        gridOptions: GridOptions;
        constructor(gridOptions: GridOptions);
        isRowSelection(): boolean;
        isRowDeselection(): boolean;
        isRowSelectionMulti(): boolean;
        getContext(): any;
        isVirtualPaging(): boolean;
        isShowToolPanel(): boolean;
        isToolPanelSuppressPivot(): boolean;
        isToolPanelSuppressValues(): boolean;
        isRowsAlreadyGrouped(): boolean;
        isGroupSelectsChildren(): boolean;
        isGroupHidePivotColumns(): boolean;
        isGroupIncludeFooter(): boolean;
        isSuppressRowClickSelection(): boolean;
        isSuppressCellSelection(): boolean;
        isSuppressUnSort(): boolean;
        isSuppressMultiSort(): boolean;
        isGroupSuppressAutoColumn(): boolean;
        isGroupHeaders(): boolean;
        isDontUseScrolls(): boolean;
        isSuppressDescSort(): boolean;
        isUnSortIcon(): boolean;
        getRowStyle(): any;
        getRowClass(): any;
        getHeaderCellRenderer(): any;
        getApi(): any;
        isEnableColResize(): boolean;
        getGroupDefaultExpanded(): any;
        getGroupKeys(): string[];
        getGroupAggFunction(): (nodes: any[]) => any;
        getGroupAggFields(): string[];
        getAllRows(): any[];
        isGroupUseEntireRow(): boolean;
        getGroupColumnDef(): any;
        isAngularCompileRows(): boolean;
        isAngularCompileFilters(): boolean;
        isAngularCompileHeaders(): boolean;
        getColumnDefs(): any[];
        getRowHeight(): number;
        getBeforeFilterChanged(): () => void;
        getAfterFilterChanged(): () => void;
        getBeforeSortChanged(): () => void;
        getAfterSortChanged(): () => void;
        getModelUpdated(): () => void;
        getCellClicked(): (params: any) => void;
        getCellDoubleClicked(): (params: any) => void;
        getCellValueChanged(): (params: any) => void;
        getCellFocused(): (params: any) => void;
        getRowSelected(): (rowIndex: number, selected: boolean) => void;
        getColumnResized(): () => void;
        getColumnVisibilityChanged(): () => void;
        getColumnOrderChanged(): () => void;
        getSelectionChanged(): () => void;
        getVirtualRowRemoved(): (row: any, rowIndex: number) => void;
        getDatasource(): any;
        getReady(): (api: any) => void;
        getRowBuffer(): number;
        isEnableSorting(): boolean;
        isEnableCellExpressions(): boolean;
        isEnableServerSideSorting(): boolean;
        isEnableFilter(): boolean;
        isEnableServerSideFilter(): boolean;
        isSuppressScrollLag(): boolean;
        setSelectedRows(newSelectedRows: any): any;
        setSelectedNodesById(newSelectedNodes: any): any;
        getIcons(): any;
        getIsScrollLag(): () => boolean;
        getGroupRowInnerRenderer(): (params: any) => void;
        getColWidth(): number;
        getHeaderHeight(): number;
        setupDefaults(): void;
        getPinnedColCount(): number;
        getLocaleTextFunc(): (key: any, defaultValue: any) => any;
    }
}
declare module awk.grid {
    class TextFilter implements Filter {
        private filterParams;
        private filterChangedCallback;
        private localeTextFunc;
        private valueGetter;
        private filterText;
        private filterType;
        private api;
        private eGui;
        private eFilterTextField;
        private eTypeSelect;
        private applyActive;
        private eApplyButton;
        constructor(params: any);
        onNewRowsLoaded(): void;
        afterGuiAttached(): void;
        doesFilterPass(node: any): boolean;
        getGui(): any;
        isFilterActive(): boolean;
        private createTemplate();
        private createGui();
        private setupApply();
        private onTypeChanged();
        private onFilterChanged();
        private filterChanged();
        private createApi();
        private getApi();
    }
}
declare module awk.grid {
    class NumberFilter implements Filter {
        private filterParams;
        private filterChangedCallback;
        private localeTextFunc;
        private valueGetter;
        private filterNumber;
        private filterType;
        private api;
        private eGui;
        private eFilterTextField;
        private eTypeSelect;
        private applyActive;
        private eApplyButton;
        constructor(params: any);
        onNewRowsLoaded(): void;
        afterGuiAttached(): void;
        doesFilterPass(node: any): boolean;
        getGui(): any;
        isFilterActive(): boolean;
        private createTemplate();
        private createGui();
        private setupApply();
        private onTypeChanged();
        private filterChanged();
        private onFilterChanged();
        private createApi();
        private getApi();
    }
}
declare module awk.grid {
    class SetFilterModel {
        selectedValuesMap: any;
        colDef: any;
        rowModel: any;
        valueGetter: any;
        displayedValues: any;
        uniqueValues: any;
        miniFilter: any;
        selectedValuesCount: any;
        constructor(colDef: any, rowModel: any, valueGetter: any);
        refreshUniqueValues(keepSelection: any): void;
        createUniqueValues(): void;
        iterateThroughNodesForValues(): any;
        setMiniFilter(newMiniFilter: any): boolean;
        getMiniFilter(): any;
        filterDisplayedValues(): void;
        getDisplayedValueCount(): any;
        getDisplayedValue(index: any): any;
        selectEverything(): void;
        isFilterActive(): boolean;
        selectNothing(): void;
        getUniqueValueCount(): any;
        getUniqueValue(index: any): any;
        unselectValue(value: any): void;
        selectValue(value: any): void;
        isValueSelected(value: any): boolean;
        isEverythingSelected(): boolean;
        isNothingSelected(): boolean;
        getModel(): any;
        setModel(model: any): void;
    }
}
declare module awk.grid {
    class SetFilter implements Filter {
        private eGui;
        private filterParams;
        private rowHeight;
        private model;
        private filterChangedCallback;
        private valueGetter;
        private rowsInBodyContainer;
        private colDef;
        private localeTextFunc;
        private cellRenderer;
        private eListContainer;
        private eFilterValueTemplate;
        private eSelectAll;
        private eListViewport;
        private eMiniFilter;
        private api;
        private applyActive;
        private eApplyButton;
        constructor(params: any);
        afterGuiAttached(): void;
        isFilterActive(): boolean;
        doesFilterPass(node: any): boolean;
        getGui(): any;
        onNewRowsLoaded(): void;
        private createTemplate();
        private createGui();
        private setupApply();
        private setContainerHeight();
        private drawVirtualRows();
        private ensureRowsRendered(start, finish);
        private removeVirtualRows(rowsToRemove);
        private insertRow(value, rowIndex);
        onCheckboxClicked(eCheckbox: any, value: any): void;
        private filterChanged();
        private onMiniFilterChanged();
        private refreshVirtualRows();
        private clearVirtualRows();
        private onSelectAll();
        private updateAllCheckboxes(checked);
        private addScrollListener();
        getApi(): any;
        private createApi();
    }
}
declare module awk.grid {
    class PopupService {
        private ePopupParent;
        init(ePopupParent: any): void;
        positionPopup(eventSource: any, ePopup: any, minWidth: any): void;
        addAsModalPopup(eChild: any): (event: any) => void;
    }
}
declare module awk.grid {
    class FilterManager {
        private $compile;
        private $scope;
        private gridOptionsWrapper;
        private grid;
        private allFilters;
        private columnModel;
        private rowModel;
        private popupService;
        private valueService;
        init(grid: any, gridOptionsWrapper: GridOptionsWrapper, $compile: any, $scope: any, columnModel: any, popupService: PopupService, valueService: ValueService): void;
        setFilterModel(model: any): void;
        private setModelOnFilterWrapper(filter, newModel);
        getFilterModel(): any;
        setRowModel(rowModel: any): void;
        private isFilterPresent();
        private isFilterPresentForCol(colId);
        private doesFilterPass(node);
        onNewRowsLoaded(): void;
        private createValueGetter(column);
        getFilterApi(column: Column): any;
        private getOrCreateFilterWrapper(column);
        private createFilterWrapper(column);
        private showFilter(column, eventSource);
    }
}
declare module awk.grid {
    class TemplateService {
        templateCache: any;
        waitingCallbacks: any;
        $scope: any;
        init($scope: any): void;
        getTemplate(url: any, callback: any): any;
        handleHttpResult(httpResult: any, url: any): void;
    }
}
declare module awk.grid {
    class SelectionRendererFactory {
        private angularGrid;
        private selectionController;
        init(angularGrid: any, selectionController: any): void;
        createSelectionCheckbox(node: any, rowIndex: any): HTMLInputElement;
    }
}
declare module awk.vdom {
    class VElement {
        static idSequence: number;
        private id;
        private elementAttachedListeners;
        constructor();
        getId(): number;
        addElementAttachedListener(listener: (element: Element) => void): void;
        protected fireElementAttached(element: Element): void;
        elementAttached(element: Element): void;
        toHtmlString(): string;
    }
}
declare module awk.vdom {
    class VHtmlElement extends VElement {
        private type;
        private classes;
        private eventListeners;
        private attributes;
        private children;
        private innerHtml;
        private style;
        private bound;
        private element;
        constructor(type: string);
        getElement(): HTMLElement;
        setInnerHtml(innerHtml: string): void;
        addStyles(styles: any): void;
        private attachEventListeners(node);
        addClass(newClass: string): void;
        removeClass(oldClass: string): void;
        addClasses(classes: string[]): void;
        toHtmlString(): string;
        private toHtmlStringChildren();
        private toHtmlStringAttributes();
        private toHtmlStringClasses();
        private toHtmlStringStyles();
        appendChild(child: any): void;
        setAttribute(key: string, value: string): void;
        addEventListener(event: string, listener: EventListener): void;
        elementAttached(element: Element): void;
        fireElementAttachedToChildren(element: Element): void;
    }
}
declare module awk.vdom {
    class VWrapperElement extends VElement {
        private wrappedElement;
        constructor(wrappedElement: Element);
        toHtmlString(): string;
        elementAttached(element: Element): void;
    }
}
declare module awk.grid {
    class RenderedCell {
        private vGridCell;
        private vSpanWithValue;
        private vCellWrapper;
        private vParentOfValue;
        private checkboxOnChangeListener;
        private column;
        private data;
        private node;
        private rowIndex;
        private editingCell;
        private scope;
        private isFirstColumn;
        private gridOptionsWrapper;
        private expressionService;
        private selectionRendererFactory;
        private rowRenderer;
        private selectionController;
        private $compile;
        private templateService;
        private cellRendererMap;
        private eCheckbox;
        private columnModel;
        private valueService;
        private value;
        private checkboxSelection;
        constructor(isFirstColumn: any, column: any, $compile: any, rowRenderer: RowRenderer, gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService, selectionRendererFactory: SelectionRendererFactory, selectionController: SelectionController, templateService: TemplateService, cellRendererMap: {
            [key: string]: any;
        }, node: any, rowIndex: number, scope: any, columnModel: ColumnModel, valueService: ValueService);
        private getValue();
        getVGridCell(): awk.vdom.VHtmlElement;
        private getDataForRow();
        private setupComponents();
        startEditing(): void;
        private stopEditing(eInput, blurListener);
        private addCellDoubleClickedHandler();
        isCellEditable(): any;
        private addCellClickedHandler();
        private populateCell();
        private addStylesFromCollDef();
        private addClassesFromCollDef();
        private addClassesFromRules();
        private addCellNavigationHandler();
        createSelectionCheckbox(): void;
        setSelected(state: boolean): void;
        private createParentOfValue();
        isVolatile(): boolean;
        refreshCell(): void;
        private putDataIntoCell();
        private useCellRenderer();
        private addClasses();
    }
}
declare module awk.grid {
    class RenderedRow {
        vPinnedRow: any;
        vBodyRow: any;
        private renderedCells;
        private scope;
        private node;
        private rowIndex;
        private cellRendererMap;
        private gridOptionsWrapper;
        private parentScope;
        private angularGrid;
        private columnModel;
        private expressionService;
        private rowRenderer;
        private selectionRendererFactory;
        private $compile;
        private templateService;
        private selectionController;
        private pinning;
        private eBodyContainer;
        private ePinnedContainer;
        private valueService;
        constructor(gridOptionsWrapper: GridOptionsWrapper, valueService: ValueService, parentScope: any, angularGrid: Grid, columnModel: ColumnModel, expressionService: ExpressionService, cellRendererMap: {
            [key: string]: any;
        }, selectionRendererFactory: SelectionRendererFactory, $compile: any, templateService: TemplateService, selectionController: SelectionController, rowRenderer: RowRenderer, eBodyContainer: HTMLElement, ePinnedContainer: HTMLElement, node: any, rowIndex: number);
        onRowSelected(selected: boolean): void;
        softRefresh(): void;
        getRenderedCellForColumn(column: Column): any;
        getCellForCol(column: Column): any;
        destroy(): void;
        private destroyScope();
        isDataInList(rows: any[]): boolean;
        isGroup(): boolean;
        private drawNormalRow();
        private bindVirtualElement(vElement);
        private createGroupRow();
        private createGroupSpanningEntireRowCell(padding);
        setMainRowWidth(width: number): void;
        private createChildScopeOrNull(data);
        private addDynamicStyles();
        private createRowContainer();
        getRowNode(): any;
        getRowIndex(): any;
        private addDynamicClasses();
    }
}
declare module awk.grid {
    class SvgFactory {
        static theInstance: SvgFactory;
        static getInstance(): SvgFactory;
        createFilterSvg(): Element;
        createColumnShowingSvg(): Element;
        createColumnHiddenSvg(): Element;
        createMenuSvg(): Element;
        createArrowUpSvg(): Element;
        createArrowLeftSvg(): Element;
        createArrowDownSvg(): Element;
        createArrowRightSvg(): Element;
        createSmallArrowDownSvg(): Element;
        createArrowUpDownSvg(): Element;
    }
}
declare module awk.grid {
    function groupCellRendererFactory(gridOptionsWrapper: any, selectionRendererFactory: any): (params: any) => HTMLSpanElement;
}
declare module awk.grid {
    class RowRenderer {
        private columnModel;
        private gridOptionsWrapper;
        private angularGrid;
        private selectionRendererFactory;
        private gridPanel;
        private $compile;
        private $scope;
        private selectionController;
        private expressionService;
        private templateService;
        private cellRendererMap;
        private renderedRows;
        private rowModel;
        private eBodyContainer;
        private eBodyViewport;
        private ePinnedColsContainer;
        private eParentOfRows;
        private firstVirtualRenderedRow;
        private lastVirtualRenderedRow;
        private focusedCell;
        private valueService;
        init(columnModel: any, gridOptionsWrapper: GridOptionsWrapper, gridPanel: GridPanel, angularGrid: Grid, selectionRendererFactory: SelectionRendererFactory, $compile: any, $scope: any, selectionController: SelectionController, expressionService: ExpressionService, templateService: TemplateService, valueService: ValueService): void;
        setRowModel(rowModel: any): void;
        setMainRowWidths(): void;
        private findAllElements(gridPanel);
        refreshView(refreshFromIndex?: any): void;
        softRefreshView(): void;
        rowDataChanged(rows: any): void;
        private refreshAllVirtualRows(fromIndex);
        refreshGroupRows(): void;
        private removeVirtualRow(rowsToRemove, fromIndex?);
        private unbindVirtualRow(indexToRemove);
        drawVirtualRows(): void;
        getFirstVirtualRenderedRow(): any;
        getLastVirtualRenderedRow(): any;
        private ensureRowsRendered();
        private insertRow(node, rowIndex, mainRowWidth);
        getIndexOfRenderedNode(node: any): number;
        navigateToNextCell(key: any, rowIndex: number, column: Column): void;
        private getNextCellToFocus(key, lastCellToFocus);
        onRowSelected(rowIndex: number, selected: boolean): void;
        focusCell(eCell: any, rowIndex: number, colIndex: number, colDef: ColDef, forceBrowserFocus: any): void;
        getFocusedCell(): any;
        setFocusedCell(rowIndex: any, colIndex: any): void;
        startEditingNextCell(rowIndex: any, column: any, shiftKey: any): void;
    }
}
declare module awk.grid {
    class SelectionController {
        eRowsParent: any;
        angularGrid: any;
        gridOptionsWrapper: any;
        $scope: any;
        rowRenderer: RowRenderer;
        selectedRows: any;
        selectedNodesById: any;
        rowModel: any;
        init(angularGrid: any, gridPanel: any, gridOptionsWrapper: any, $scope: any, rowRenderer: any): void;
        initSelectedNodesById(): void;
        getSelectedNodes(): any;
        getBestCostNodeSelection(): any;
        setRowModel(rowModel: any): void;
        deselectAll(): void;
        selectAll(): void;
        selectNode(node: any, tryMulti: any, suppressEvents?: any): void;
        recursivelySelectAllChildren(node: any, suppressEvents?: any): boolean;
        recursivelyDeselectAllChildren(node: any): void;
        doWorkOfSelectNode(node: any, suppressEvents: any): boolean;
        addCssClassForNode_andInformVirtualRowListener(node: any): void;
        doWorkOfDeselectAllNodes(nodeToKeepSelected?: any): any;
        deselectRealNode(node: any): void;
        removeCssClassForNode(node: any): void;
        deselectIndex(rowIndex: any): void;
        deselectNode(node: any): void;
        selectIndex(index: any, tryMulti: any, suppressEvents?: any): void;
        syncSelectedRowsAndCallListener(suppressEvents?: any): void;
        recursivelyCheckIfSelected(node: any): number;
        isNodeSelected(node: any): boolean;
        updateGroupParentsIfNeeded(): void;
    }
}
declare module awk.grid {
    class HeaderRenderer {
        gridOptionsWrapper: any;
        columnModel: any;
        columnController: any;
        angularGrid: any;
        filterManager: any;
        $scope: any;
        $compile: any;
        ePinnedHeader: any;
        eHeaderContainer: any;
        eHeader: any;
        eRoot: any;
        childScopes: any;
        dragStartX: any;
        init(gridOptionsWrapper: any, columnController: any, columnModel: any, gridPanel: any, angularGrid: any, filterManager: any, $scope: any, $compile: any): void;
        findAllElements(gridPanel: any): void;
        refreshHeader(): void;
        insertHeadersWithGrouping(): void;
        createGroupedHeaderCell(group: HeaderGroup): HTMLDivElement;
        fireColumnResized(column: any): void;
        addGroupExpandIcon(group: any, eHeaderGroup: any, expanded: any): void;
        addDragHandler(eDraggableElement: any, dragCallback: any, column: any): void;
        setWidthOfGroupHeaderCell(headerGroup: any): void;
        insertHeadersWithoutGrouping(): void;
        createHeaderCell(column: any, grouped: any, headerGroup?: any): HTMLDivElement;
        addHeaderClassesFromCollDef(colDef: any, $childScope: any, eHeaderCell: any): void;
        getNextSortDirection(direction: any): string;
        addSortHandling(headerCellLabel: any, column: any): void;
        updateSortIcons(): void;
        groupDragCallbackFactory(currentGroup: HeaderGroup): {
            onDragStart: () => void;
            onDragging: (dragChange: any) => void;
        };
        adjustColumnWidth(newWidth: any, column: any, eHeaderCell: any): void;
        headerDragCallbackFactory(headerCell: any, column: Column, headerGroup: any): {
            onDragStart: () => void;
            onDragging: (dragChange: any) => void;
        };
        stopDragging(listenersToRemove: any, column: any): void;
        updateFilterIcons(): void;
    }
}
declare module awk.grid {
    class GroupCreator {
        private valueService;
        init(valueService: ValueService): void;
        group(rowNodes: any, groupedCols: any, expandByDefault: any): any;
        isExpanded(expandByDefault: any, level: any): boolean;
    }
}
declare module awk.grid {
    class InMemoryRowController {
        private gridOptionsWrapper;
        private columnModel;
        private angularGrid;
        private filterManager;
        private $scope;
        private allRows;
        private rowsAfterGroup;
        private rowsAfterFilter;
        private rowsAfterSort;
        private rowsAfterMap;
        private model;
        private groupCreator;
        private valueService;
        constructor();
        init(gridOptionsWrapper: any, columnModel: any, angularGrid: any, filterManager: any, $scope: any, groupCreator: GroupCreator, valueService: ValueService): void;
        createModel(): void;
        getModel(): any;
        forEachInMemory(callback: any): void;
        updateModel(step: any): void;
        defaultGroupAggFunctionFactory(valueColumns: any, valueKeys: any): (rows: any) => any;
        doAggregate(): void;
        expandOrCollapseAll(expand: any, rowNodes: any): void;
        recursivelyClearAggData(nodes: any): void;
        recursivelyCreateAggData(nodes: any, groupAggFunction: any, level: number): void;
        doSort(): void;
        recursivelyResetSort(rowNodes: any): void;
        private sortList(nodes, sortOptions);
        doGrouping(): void;
        doFilter(): void;
        filterItems(rowNodes: any, quickFilterPresent: any, advancedFilterPresent: any): any;
        recursivelyResetFilter(nodes: any): void;
        setAllRows(rows: any, firstId?: any): void;
        recursivelyAddIdToNodes(nodes: any, index: any): any;
        recursivelyCheckUserProvidedNodes(nodes: any, parent: any, level: any): void;
        getTotalChildCount(rowNodes: any): number;
        doGroupMapping(): void;
        addToMap(mappedData: any, originalNodes: any): void;
        createFooterNode(groupNode: any): any;
        doesRowPassFilter(node: any, quickFilterPresent: any, advancedFilterPresent: any): boolean;
        aggregateRowForQuickFilter(node: any): void;
    }
}
declare module awk.grid {
    class VirtualPageRowController {
        rowRenderer: any;
        datasourceVersion: any;
        gridOptionsWrapper: any;
        angularGrid: any;
        datasource: any;
        virtualRowCount: any;
        foundMaxRow: any;
        pageCache: any;
        pageCacheSize: any;
        pageLoadsInProgress: any;
        pageLoadsQueued: any;
        pageAccessTimes: any;
        accessTime: any;
        maxConcurrentDatasourceRequests: any;
        maxPagesInCache: any;
        pageSize: any;
        overflowSize: any;
        init(rowRenderer: any, gridOptionsWrapper: any, angularGrid: any): void;
        setDatasource(datasource: any): void;
        reset(): void;
        createNodesFromRows(pageNumber: any, rows: any): any;
        removeFromLoading(pageNumber: any): void;
        pageLoadFailed(pageNumber: any): void;
        pageLoaded(pageNumber: any, rows: any, lastRow: any): void;
        putPageIntoCacheAndPurge(pageNumber: any, rows: any): void;
        checkMaxRowAndInformRowRenderer(pageNumber: any, lastRow: any): void;
        isPageAlreadyLoading(pageNumber: any): boolean;
        doLoadOrQueue(pageNumber: any): void;
        addToQueueAndPurgeQueue(pageNumber: any): void;
        findLeastRecentlyAccessedPage(pageIndexes: any): number;
        checkQueueForNextLoad(): void;
        loadPage(pageNumber: any): void;
        requestIsDaemon(datasourceVersionCopy: any): boolean;
        getVirtualRow(rowIndex: any): any;
        forEachInMemory(callback: any): void;
        getModel(): {
            getVirtualRow: (index: any) => any;
            getVirtualRowCount: () => any;
            forEachInMemory: (callback: any) => void;
        };
    }
}
declare module awk.grid {
    class PaginationController {
        eGui: any;
        btNext: any;
        btPrevious: any;
        btFirst: any;
        btLast: any;
        lbCurrent: any;
        lbTotal: any;
        lbRecordCount: any;
        lbFirstRowOnPage: any;
        lbLastRowOnPage: any;
        ePageRowSummaryPanel: any;
        angularGrid: any;
        callVersion: any;
        gridOptionsWrapper: any;
        datasource: any;
        pageSize: any;
        rowCount: any;
        foundMaxRow: any;
        totalPages: any;
        currentPage: any;
        init(angularGrid: any, gridOptionsWrapper: any): void;
        setDatasource(datasource: any): void;
        reset(): void;
        setTotalLabels(): void;
        calculateTotalPages(): void;
        pageLoaded(rows: any, lastRowIndex: any): void;
        updateRowLabels(): void;
        loadPage(): void;
        isCallDaemon(versionCopy: any): boolean;
        onBtNext(): void;
        onBtPrevious(): void;
        onBtFirst(): void;
        onBtLast(): void;
        isZeroPagesToDisplay(): boolean;
        enableOrDisableButtons(): void;
        createTemplate(): string;
        getGui(): any;
        setupComponents(): void;
    }
}
declare module awk.grid {
    class BorderLayout {
        eNorthWrapper: any;
        eSouthWrapper: any;
        eEastWrapper: any;
        eWestWrapper: any;
        eCenterWrapper: any;
        eOverlayWrapper: any;
        eCenterRow: any;
        eNorthChildLayout: any;
        eSouthChildLayout: any;
        eEastChildLayout: any;
        eWestChildLayout: any;
        eCenterChildLayout: any;
        isLayoutPanel: any;
        fullHeight: any;
        layoutActive: any;
        eGui: any;
        id: any;
        childPanels: any;
        centerHeightLastTime: any;
        constructor(params: any);
        setupPanels(params: any): void;
        setupPanel(content: any, ePanel: any): any;
        getGui(): any;
        doLayout(): boolean;
        layoutChild(childPanel: any): any;
        layoutHeight(): boolean;
        layoutWidth(): void;
        setEastVisible(visible: any): void;
        setOverlayVisible(visible: any): void;
        setSouthVisible(visible: any): void;
    }
}
declare module awk.grid {
    class GridPanel {
        gridOptionsWrapper: any;
        forPrint: any;
        scrollWidth: any;
        eRoot: any;
        layout: any;
        rowModel: any;
        eBodyViewport: any;
        columnModel: any;
        eBody: any;
        rowRenderer: any;
        eBodyContainer: any;
        ePinnedColsContainer: any;
        eHeaderContainer: any;
        ePinnedHeader: any;
        eHeader: any;
        eParentOfRows: any;
        eBodyViewportWrapper: any;
        ePinnedColsViewport: any;
        constructor(gridOptionsWrapper: any);
        private setupComponents();
        ensureIndexVisible(index: any): void;
        ensureColIndexVisible(index: any): void;
        showLoading(loading: any): void;
        getWidthForSizeColsToFit(): any;
        init(columnModel: any, rowRenderer: any): void;
        setRowModel(rowModel: any): void;
        getBodyContainer(): any;
        getBodyViewport(): any;
        getPinnedColsContainer(): any;
        private getHeaderContainer();
        private getRoot();
        private getPinnedHeader();
        private getHeader();
        private getRowsParent();
        private findElements();
        setBodyContainerWidth(): void;
        setPinnedColContainerWidth(): void;
        showPinnedColContainersIfNeeded(): void;
        setHeaderHeight(): void;
        setPinnedColHeight(): void;
        private scrollLagCounter;
        private addScrollListener();
        private requestDrawVirtualRows();
        private scrollHeader(bodyLeftPosition);
        private scrollPinned(bodyTopPosition);
    }
}
declare module awk.grid {
    class DragAndDropService {
        static theInstance: DragAndDropService;
        static getInstance(): DragAndDropService;
        dragItem: any;
        constructor();
        stopDragging(): void;
        setDragCssClasses(eListItem: any, dragging: any): void;
        addDragSource(eDragSource: any, dragSourceCallback: any): void;
        onMouseDownDragSource(eDragSource: any, dragSourceCallback: any): void;
        addDropTarget(eDropTarget: any, dropTargetCallback: any): void;
    }
}
declare function require(name: string): any;
declare module awk.grid {
    class AgList {
        eGui: any;
        uniqueId: any;
        modelChangedListeners: any;
        itemSelectedListeners: any;
        beforeDropListeners: any;
        dragSources: any;
        emptyMessage: any;
        eFilterValueTemplate: any;
        eListParent: any;
        model: any;
        cellRenderer: any;
        constructor();
        setEmptyMessage(emptyMessage: any): void;
        getUniqueId(): any;
        addStyles(styles: any): void;
        addCssClass(cssClass: any): void;
        addDragSource(dragSource: any): void;
        addModelChangedListener(listener: Function): void;
        addItemSelectedListener(listener: any): void;
        addBeforeDropListener(listener: any): void;
        fireModelChanged(): void;
        fireItemSelected(item: any): void;
        fireBeforeDrop(item: any): void;
        setupComponents(): void;
        setModel(model: any): void;
        getModel(): any;
        setCellRenderer(cellRenderer: any): void;
        refreshView(): void;
        insertRows(): void;
        insertBlankMessage(): void;
        setupAsDropTarget(): void;
        externalAcceptDrag(dragEvent: any): boolean;
        externalDrop(dragEvent: any): void;
        externalNoDrop(): void;
        addItemToList(newItem: any): void;
        addDragAndDropToListItem(eListItem: any, item: any): void;
        internalAcceptDrag(targetColumn: any, dragItem: any, eListItem: any): boolean;
        internalDrop(targetColumn: any, draggedColumn: any): void;
        internalNoDrop(eListItem: any): void;
        dragAfterThisItem(targetColumn: any, draggedColumn: any): boolean;
        setDropCssClasses(eListItem: any, state: any): void;
        getGui(): any;
    }
}
declare module awk.grid {
    class ColumnSelectionPanel {
        gridOptionsWrapper: any;
        columnController: any;
        cColumnList: any;
        layout: any;
        eRootPanel: any;
        constructor(columnController: any, gridOptionsWrapper: any);
        columnsChanged(newColumns: any): void;
        getDragSource(): any;
        columnCellRenderer(params: any): HTMLSpanElement;
        setupComponents(): void;
        setSelected(column: any, selected: any): void;
        getGui(): any;
    }
}
declare module awk.grid {
    class GroupSelectionPanel {
        gridOptionsWrapper: any;
        columnController: any;
        inMemoryRowController: any;
        cColumnList: any;
        layout: any;
        constructor(columnController: any, inMemoryRowController: any, gridOptionsWrapper: any);
        columnsChanged(newColumns: any, newGroupedColumns: any): void;
        addDragSource(dragSource: any): void;
        columnCellRenderer(params: any): HTMLSpanElement;
        setupComponents(): void;
        onGroupingChanged(): void;
    }
}
declare module awk.grid {
    class AgDropdownList {
        private itemSelectedListeners;
        private eValue;
        private agList;
        private eGui;
        private hidePopupCallback;
        private selectedItem;
        private cellRenderer;
        private popupService;
        constructor(popupService: PopupService);
        setWidth(width: any): void;
        addItemSelectedListener(listener: any): void;
        fireItemSelected(item: any): void;
        setupComponents(): void;
        itemSelected(item: any): void;
        onClick(): void;
        getGui(): any;
        setSelected(item: any): void;
        setCellRenderer(cellRenderer: any): void;
        refreshView(): void;
        setModel(model: any): void;
    }
}
declare module awk.grid {
    class ValuesSelectionPanel {
        private gridOptionsWrapper;
        private columnController;
        private cColumnList;
        private layout;
        private popupService;
        constructor(columnController: any, gridOptionsWrapper: any, popupService: PopupService);
        getLayout(): any;
        private columnsChanged(newColumns, newGroupedColumns, newValuesColumns);
        addDragSource(dragSource: any): void;
        private cellRenderer(params);
        private setupComponents();
        private beforeDropListener(newItem);
        private onValuesChanged();
    }
}
declare module awk.grid {
    class VerticalStack {
        isLayoutPanel: any;
        childPanels: any;
        eGui: any;
        constructor();
        addPanel(panel: any, height: any): void;
        getGui(): any;
        doLayout(): void;
    }
}
declare module awk.grid {
    class ToolPanel {
        layout: any;
        constructor();
        init(columnController: any, inMemoryRowController: any, gridOptionsWrapper: any, popupService: PopupService): void;
    }
}
declare module awk.grid {
    interface GridOptions {
        rowSelection?: string;
        rowDeselection?: boolean;
        context?: any;
        virtualPaging?: boolean;
        showToolPanel?: boolean;
        toolPanelSuppressPivot?: boolean;
        toolPanelSuppressValues?: boolean;
        rowsAlreadyGrouped?: boolean;
        groupSelectsChildren?: boolean;
        groupHidePivotColumns?: boolean;
        groupIncludeFooter?: boolean;
        suppressRowClickSelection?: boolean;
        suppressCellSelection?: boolean;
        suppressUnSort?: boolean;
        suppressMultiSort?: boolean;
        groupSuppressAutoColumn?: boolean;
        groupHeaders?: boolean;
        dontUseScrolls?: boolean;
        suppressDescSort?: boolean;
        unSortIcon?: boolean;
        rowStyle?: any;
        rowClass?: any;
        headerCellRenderer?: any;
        api?: any;
        groupDefaultExpanded?: any;
        groupKeys?: string[];
        groupAggFunction?(nodes: any[]): any;
        groupAggFields?: string[];
        rowData?: any[];
        groupUseEntireRow?: boolean;
        groupColumnDef?: any;
        angularCompileRows?: boolean;
        angularCompileFilters?: boolean;
        angularCompileHeaders?: boolean;
        columnDefs?: any[];
        rowHeight?: number;
        modelUpdated?(): void;
        cellClicked?(params: any): void;
        cellDoubleClicked?(params: any): void;
        cellValueChanged?(params: any): void;
        cellFocused?(params: any): void;
        rowSelected?(rowIndex: number, selected: boolean): void;
        selectionChanged?(): void;
        beforeFilterChanged?(): void;
        afterFilterChanged?(): void;
        beforeSortChanged?(): void;
        afterSortChanged?(): void;
        virtualRowRemoved?(row: any, rowIndex: number): void;
        rowClicked?(params: any): void;
        columnResized?(): void;
        columnVisibilityChanged?(): void;
        columnOrderChanged?(): void;
        datasource?: any;
        ready?(api: any): void;
        rowBuffer?: number;
        enableColResize?: boolean;
        enableCellExpressions?: boolean;
        enableSorting?: boolean;
        enableServerSideSorting?: boolean;
        enableFilter?: boolean;
        enableServerSideFilter?: boolean;
        selectedRows?: any[];
        selectedNodesById?: {
            [email: number]: any;
        };
        icons?: any;
        groupInnerRenderer?(params: any): void;
        groupRowInnerRenderer?(params: any): void;
        colWidth?: number;
        headerHeight?: number;
        pinnedColumnCount?: number;
        localeText?: any;
        isScrollLag?(): boolean;
        suppressScrollLag?(): boolean;
    }
}
declare module awk.grid {
    class GridApi {
        private grid;
        private rowRenderer;
        private headerRenderer;
        private filterManager;
        private columnController;
        private inMemoryRowController;
        private selectionController;
        private gridOptionsWrapper;
        private gridPanel;
        constructor(grid: Grid, rowRenderer: RowRenderer, headerRenderer: HeaderRenderer, filterManager: FilterManager, columnController: ColumnController, inMemoryRowController: InMemoryRowController, selectionController: SelectionController, gridOptionsWrapper: GridOptionsWrapper, gridPanel: GridPanel);
        setDatasource(datasource: any): void;
        onNewDatasource(): void;
        setRows(rows: any): void;
        onNewRows(): void;
        onNewCols(): void;
        unselectAll(): void;
        refreshView(): void;
        softRefreshView(): void;
        refreshGroupRows(): void;
        refreshHeader(): void;
        getModel(): any;
        onGroupExpandedOrCollapsed(refreshFromIndex: any): void;
        expandAll(): void;
        collapseAll(): void;
        addVirtualRowListener(rowIndex: any, callback: any): void;
        rowDataChanged(rows: any): void;
        setQuickFilter(newFilter: any): void;
        selectIndex(index: any, tryMulti: any, suppressEvents: any): void;
        deselectIndex(index: any): void;
        selectNode(node: any, tryMulti: any, suppressEvents: any): void;
        deselectNode(node: any): void;
        selectAll(): void;
        deselectAll(): void;
        recomputeAggregates(): void;
        sizeColumnsToFit(): void;
        showLoading(show: any): void;
        isNodeSelected(node: any): boolean;
        getSelectedNodes(): any;
        getBestCostNodeSelection(): any;
        ensureColIndexVisible(index: any): void;
        ensureIndexVisible(index: any): void;
        ensureNodeVisible(comparator: any): void;
        forEachInMemory(callback: any): void;
        getFilterApiForColDef(colDef: any): any;
        getFilterApi(key: any): any;
        getColumnDef(key: any): any;
        onFilterChanged(): void;
        setSortModel(sortModel: any): void;
        getSortModel(): any;
        setFilterModel(model: any): void;
        getFilterModel(): any;
        getFocusedCell(): any;
        setFocusedCell(rowIndex: any, colIndex: any): void;
        showToolPanel(show: any): void;
        isToolPanelShowing(): boolean;
        hideColumn(colId: any, hide: any): void;
        hideColumns(colIds: any, hide: any): void;
        getColumnState(): any;
        setColumnState(state: any): void;
        doLayout(): void;
    }
}
declare module awk.grid {
    class ValueService {
        private gridOptionsWrapper;
        private expressionService;
        private columnModel;
        init(gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService, columnModel: ColumnModel): void;
        getValue(column: Column, data: any, node: any): any;
        private executeValueGetter(valueGetter, data, colDef, node);
        private getValueCallback(data, node, field);
    }
}
declare module awk.grid {
    class Grid {
        private virtualRowCallbacks;
        private gridOptions;
        private gridOptionsWrapper;
        private quickFilter;
        private inMemoryRowController;
        private doingVirtualPaging;
        private paginationController;
        private virtualPageRowController;
        private finished;
        private selectionController;
        private columnController;
        private rowRenderer;
        private headerRenderer;
        private filterManager;
        private toolPanel;
        private gridPanel;
        private eRootPanel;
        private toolPanelShowing;
        private doingPagination;
        columnModel: any;
        rowModel: any;
        constructor(eGridDiv: any, gridOptions: any, $scope: any, $compile: any, quickFilterOnScope: any);
        periodicallyDoLayout(): void;
        setupComponents($scope: any, $compile: any, eUserProvidedDiv: any): void;
        showToolPanel(show: any): void;
        isToolPanelShowing(): boolean;
        setDatasource(datasource?: any): void;
        refreshHeaderAndBody(): void;
        setFinished(): void;
        getQuickFilter(): string;
        onQuickFilterChanged(newFilter: any): void;
        onFilterChanged(): void;
        onRowClicked(event: any, rowIndex: any, node: any): void;
        showLoadingPanel(show: any): void;
        setupColumns(): void;
        updateModelAndRefresh(step: any, refreshFromIndex?: any): void;
        setRows(rows?: any, firstId?: any): void;
        ensureNodeVisible(comparator: any): void;
        getFilterModel(): any;
        setFocusedCell(rowIndex: any, colIndex: any): void;
        getSortModel(): any;
        setSortModel(sortModel: any): void;
        onSortingChanged(): void;
        addVirtualRowListener(rowIndex: any, callback: any): void;
        onVirtualRowSelected(rowIndex: any, selected: any): void;
        onVirtualRowRemoved(rowIndex: any): void;
        onNewCols(): void;
        updateBodyContainerWidthAfterColResize(): void;
        updatePinnedColContainerWidthAfterColResize(): void;
        doLayout(): void;
    }
}
declare var angular: any;
declare var exports: any;
declare var module: any;
declare module awk {
    interface Filter {
        getGui(): any;
        isFilterActive(): boolean;
        doesFilterPass(params: any): boolean;
        afterGuiAttached?(): void;
        onNewRowsLoaded?(): void;
    }
}
