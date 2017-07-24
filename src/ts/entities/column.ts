import {ColumnGroupChild} from "./columnGroupChild";
import {OriginalColumnGroupChild} from "./originalColumnGroupChild";
import {
    ColDef,
    AbstractColDef,
    IAggFunc,
    IsColumnFunc,
    IsColumnFuncParams, ColSpanParams
} from "./colDef";
import {EventService} from "../eventService";
import {Utils as _} from "../utils";
import {Autowired, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnUtils} from "../columnController/columnUtils";
import {RowNode} from "./rowNode";
import {ICellRendererFunc, ICellRendererComp} from "../rendering/cellRenderers/iCellRenderer";
import {ICellEditorComp} from "../rendering/cellEditors/iCellEditor";
import {IFilter} from "../interfaces/iFilter";
import {IFrameworkFactory} from "../interfaces/iFrameworkFactory";
import {IEventEmitter} from "../interfaces/iEventEmitter";


// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
// can only appear in OriginalColumn tree).
export class Column implements ColumnGroupChild, OriginalColumnGroupChild, IEventEmitter {

    // + renderedHeaderCell - for making header cell transparent when moving
    public static EVENT_MOVING_CHANGED = 'movingChanged';
    // + renderedCell - changing left position
    public static EVENT_LEFT_CHANGED = 'leftChanged';
    // + renderedCell - changing width
    public static EVENT_WIDTH_CHANGED = 'widthChanged';
    // + renderedCell - for changing pinned classes
    public static EVENT_LAST_LEFT_PINNED_CHANGED = 'lastLeftPinnedChanged';
    public static EVENT_FIRST_RIGHT_PINNED_CHANGED = 'firstRightPinnedChanged';
    // + renderedColumn - for changing visibility icon
    public static EVENT_VISIBLE_CHANGED = 'visibleChanged';
    // + every time the filter changes, used in the floating filters
    public static EVENT_FILTER_CHANGED = 'filterChanged';
    // + renderedHeaderCell - marks the header with filter icon
    public static EVENT_FILTER_ACTIVE_CHANGED = 'filterActiveChanged';
    // + renderedHeaderCell - marks the header with sort icon
    public static EVENT_SORT_CHANGED = 'sortChanged';

    public static EVENT_MENU_VISIBLE_CHANGED = 'menuVisibleChanged';

    // + toolpanel, for gui updates
    public static EVENT_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
    // + toolpanel, for gui updates
    public static EVENT_PIVOT_CHANGED = 'columnPivotChanged';
    // + toolpanel, for gui updates
    public static EVENT_VALUE_CHANGED = 'columnValueChanged';
    
    public static PINNED_RIGHT = 'right';
    public static PINNED_LEFT = 'left';

    public static SORT_ASC = 'asc';
    public static SORT_DESC = 'desc';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;

    private colDef: ColDef;
    private colId: any;

    private actualWidth: any;

    private visible: any;
    private pinned: string;
    private left: number;
    private oldLeft: number;
    private aggFunc: string | IAggFunc;
    private sort: string;
    private sortedAt: number;
    private moving = false;
    private menuVisible = false;

    private lastLeftPinned: boolean;
    private firstRightPinned: boolean;

    private minWidth: number;
    private maxWidth: number;

    private filterActive = false;

    private eventService: EventService = new EventService();

    private fieldContainsDots: boolean;
    private tooltipFieldContainsDots: boolean;

    private rowGroupActive = false;
    private pivotActive = false;
    private aggregationActive = false;

    private primary: boolean;

    private cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    private floatingCellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    private cellEditor: {new(): ICellEditorComp} | string;
    private filter: {new(): IFilter} | string;

    private parent: ColumnGroupChild;

    constructor(colDef: ColDef, colId: String, primary: boolean) {
        this.colDef = colDef;
        this.visible = !colDef.hide;
        this.sort = colDef.sort;
        this.sortedAt = colDef.sortedAt;
        this.colId = colId;
        this.primary = primary;
    }

    public setParent(parent: ColumnGroupChild): void {
        this.parent = parent;
    }

    public getParent(): ColumnGroupChild {
        return this.parent;
    }

    // this is done after constructor as it uses gridOptionsWrapper
    @PostConstruct
    public initialise(): void {
        this.floatingCellRenderer = this.frameworkFactory.colDefFloatingCellRenderer(this.colDef);
        this.cellRenderer = this.frameworkFactory.colDefCellRenderer(this.colDef);
        this.cellEditor = this.frameworkFactory.colDefCellEditor(this.colDef);
        this.filter = this.frameworkFactory.colDefFilter(this.colDef);

        this.setPinned(this.colDef.pinned);

        let minColWidth = this.gridOptionsWrapper.getMinColWidth();
        let maxColWidth = this.gridOptionsWrapper.getMaxColWidth();

        if (this.colDef.minWidth) {
            this.minWidth = this.colDef.minWidth;
        } else {
            this.minWidth = minColWidth;
        }

        if (this.colDef.maxWidth) {
            this.maxWidth = this.colDef.maxWidth;
        } else {
            this.maxWidth = maxColWidth;
        }

        this.actualWidth = this.columnUtils.calculateColInitialWidth(this.colDef);

        let suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = _.exists(this.colDef.field) && this.colDef.field.indexOf('.')>=0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = _.exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.')>=0 && !suppressDotNotation;

        this.validate();
    }

    public isEmptyGroup(): boolean {
        return false;
    }

    public isRowGroupDisplayed(colId: string): boolean {
        if (_.missing(this.colDef) || _.missing(this.colDef.showRowGroup)) { return false; }

        let showingAllGroups = this.colDef.showRowGroup === true;
        let showingThisGroup = this.colDef.showRowGroup === colId;

        return showingAllGroups || showingThisGroup;
    }

    public getCellRenderer(): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return this.cellRenderer;
    }

    public getCellEditor(): {new(): ICellEditorComp} | string {
        return this.cellEditor;
    }

    public getFloatingCellRenderer(): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return this.floatingCellRenderer;
    }

    public getFilter(): {new(): IFilter} | string {
        return this.filter;
    }

    public getUniqueId(): string {
        return this.getId();
    }

    public isPrimary(): boolean {
        return this.primary;
    }

    public isFilterAllowed(): boolean {
        return this.primary && !this.colDef.suppressFilter;
    }
    
    public isFieldContainsDots(): boolean {
        return this.fieldContainsDots;
    }

    public isTooltipFieldContainsDots(): boolean {
        return this.tooltipFieldContainsDots;
    }

    private validate(): void {
        if (!this.gridOptionsWrapper.isEnterprise()) {
            if (_.exists(this.colDef.aggFunc)) {
                console.warn('ag-Grid: aggFunc is only valid in ag-Grid-Enterprise');
            }
            if (_.exists(this.colDef.rowGroupIndex)) {
                console.warn('ag-Grid: rowGroupIndex is only valid in ag-Grid-Enterprise');
            }
            if (_.exists(this.colDef.rowGroup)) {
                console.warn('ag-Grid: rowGroup is only valid in ag-Grid-Enterprise');
            }
            if (_.exists(this.colDef.pivotIndex)) {
                console.warn('ag-Grid: pivotIndex is only valid in ag-Grid-Enterprise');
            }
            if (_.exists(this.colDef.pivot)) {
                console.warn('ag-Grid: pivot is only valid in ag-Grid-Enterprise');
            }
        }

        if (_.exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            console.warn('ag-Grid: colDef.width should be a number, not ' + typeof this.colDef.width);
        }

        if (_.get(this, 'colDef.cellRendererParams.restrictToOneGroup', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.restrictToOneGroup is deprecated. You should use showRowGroup');
        }

        if (_.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator');
        }

        if (_.get(this, 'colDef.cellRendererParams.keyMap', null)) {
            console.warn('ag-Grid: Since ag-grid 11.0.0 cellRendererParams.keyMap is deprecated. You should use colDef.keyCreator');
        }

        let colDefAny: any = this.colDef;
        if (colDefAny.floatingCellRenderer) {
            console.warn('ag-Grid: since v11, floatingCellRenderer is now pinnedRowCellRenderer');
            this.colDef.pinnedRowCellRenderer = colDefAny.floatingCellRenderer;
        }
        if (colDefAny.floatingRendererFramework) {
            console.warn('ag-Grid: since v11, floatingRendererFramework is now pinnedRowCellRendererFramework');
            this.colDef.pinnedRowCellRendererFramework = colDefAny.floatingRendererFramework;
        }
        if (colDefAny.floatingRendererParams) {
            console.warn('ag-Grid: since v11, floatingRendererParams is now pinnedRowCellRendererParams');
            this.colDef.pinnedRowCellRendererParams = colDefAny.floatingRendererParams;
        }
        if (colDefAny.floatingValueFormatter) {
            console.warn('ag-Grid: since v11, floatingValueFormatter is now ');
            this.colDef.pinnedRowValueFormatter = colDefAny.floatingValueFormatter;
        }
    }
    
    public addEventListener(eventType: string, listener: Function): void {
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    private createIsColumnFuncParams(rowNode: RowNode): IsColumnFuncParams {
        return {
            node: rowNode,
            column: this,
            colDef: this.colDef,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
    }

    public isSuppressNavigable(rowNode: RowNode): boolean {
        // if boolean set, then just use it
        if (typeof this.colDef.suppressNavigable === 'boolean') {
            return <boolean> this.colDef.suppressNavigable;
        }

        // if function, then call the function to find out
        if (typeof this.colDef.suppressNavigable === 'function') {
            let params = this.createIsColumnFuncParams(rowNode);
            let suppressNaviableFunc = <IsColumnFunc> this.colDef.suppressNavigable;
            return suppressNaviableFunc(params);
        }

        return false;
    }

    public isCellEditable(rowNode: RowNode): boolean {

        // only allow editing of groups if the user has this option enabled
        if (rowNode.group && !this.gridOptionsWrapper.isEnableGroupEdit()) {
            return false;
        }

        return this.isColumnFunc(rowNode, this.colDef.editable);
    }

    public isSuppressPaste(rowNode: RowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef ? this.colDef.suppressPaste : null);
    }

    public isResizable(): boolean {
        let enableColResize = this.gridOptionsWrapper.isEnableColResize();
        let suppressResize = this.colDef && this.colDef.suppressResize;
        return enableColResize && !suppressResize;
    }

    private isColumnFunc(rowNode: RowNode, value: boolean | IsColumnFunc): boolean {
        // if boolean set, then just use it
        if (typeof value === 'boolean') {
            return <boolean> value;
        }

        // if function, then call the function to find out
        if (typeof value === 'function') {
            let params = this.createIsColumnFuncParams(rowNode);
            let editableFunc = <IsColumnFunc> value;
            return editableFunc(params);
        }

        return false;
    }

    public setMoving(moving: boolean) {
        this.moving = moving;
        this.eventService.dispatchEvent(Column.EVENT_MOVING_CHANGED);
    }

    public isMoving(): boolean {
        return this.moving;
    }

    public getSort(): string {
        return this.sort;
    }

    public setSort(sort: string): void {
        if (this.sort !== sort) {
            this.sort = sort;
            this.eventService.dispatchEvent(Column.EVENT_SORT_CHANGED);
        }
    }

    public setMenuVisible(visible: boolean): void {
        if (this.menuVisible !== visible) {
            this.menuVisible = visible;
            this.eventService.dispatchEvent(Column.EVENT_MENU_VISIBLE_CHANGED);
        }
    }

    public isMenuVisible(): boolean {
        return this.menuVisible;
    }

    public isSortAscending(): boolean {
        return this.sort === Column.SORT_ASC;
    }

    public isSortDescending(): boolean {
        return this.sort === Column.SORT_DESC;
    }

    public isSortNone(): boolean {
        return _.missing(this.sort);
    }

    public isSorting(): boolean {
        return _.exists(this.sort);
    }

    public getSortedAt(): number {
        return this.sortedAt;
    }

    public setSortedAt(sortedAt: number): void {
        this.sortedAt = sortedAt;
    }

    public setAggFunc(aggFunc: string | IAggFunc): void {
        this.aggFunc = aggFunc;
    }

    public getAggFunc(): string | IAggFunc {
        return this.aggFunc;
    }

    public getLeft(): number {
        return this.left;
    }

    public getOldLeft(): number {
        return this.oldLeft;
    }

    public getRight(): number {
        return this.left + this.actualWidth;
    }

    public setLeft(left: number) {
        this.oldLeft = this.left;
        if (this.left !== left) {
            this.left = left;
            this.eventService.dispatchEvent(Column.EVENT_LEFT_CHANGED);
        }
    }

    public isFilterActive(): boolean {
        return this.filterActive;
    }

    public setFilterActive(active: boolean): void {
        if (this.filterActive !== active) {
            this.filterActive = active;
            this.eventService.dispatchEvent(Column.EVENT_FILTER_ACTIVE_CHANGED);
        }
        this.eventService.dispatchEvent(Column.EVENT_FILTER_CHANGED);
    }

    public setPinned(pinned: string|boolean): void {
        // pinning is not allowed when doing 'forPrint'
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }

        if (pinned===true || pinned===Column.PINNED_LEFT) {
            this.pinned = Column.PINNED_LEFT;
        } else if (pinned===Column.PINNED_RIGHT) {
            this.pinned = Column.PINNED_RIGHT;
        } else {
            this.pinned = null;
        }

        // console.log(`setColumnsPinned ${this.getColId()} ${this.pinned}`);

    }

    public setFirstRightPinned(firstRightPinned: boolean): void {
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.eventService.dispatchEvent(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED);
        }
    }

    public setLastLeftPinned(lastLeftPinned: boolean): void {
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.eventService.dispatchEvent(Column.EVENT_LAST_LEFT_PINNED_CHANGED);
        }
    }

    public isFirstRightPinned(): boolean {
        return this.firstRightPinned;
    }

    public isLastLeftPinned(): boolean {
        return this.lastLeftPinned;
    }

    public isPinned(): boolean {
        return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
    }

    public isPinnedLeft(): boolean {
        return this.pinned === Column.PINNED_LEFT;
    }

    public isPinnedRight(): boolean {
        return this.pinned === Column.PINNED_RIGHT;
    }

    public getPinned(): string {
        return this.pinned;
    }

    public setVisible(visible: boolean): void {
        let newValue = visible===true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            this.eventService.dispatchEvent(Column.EVENT_VISIBLE_CHANGED);
        }
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public getColDef(): ColDef {
        return this.colDef;
    }

    public getColumnGroupShow(): string {
        return this.colDef.columnGroupShow;
    }

    public getColId(): string {
        return this.colId;
    }

    public getId(): string {
        return this.getColId();
    }

    public getDefinition(): AbstractColDef {
        return this.colDef;
    }

    public getActualWidth(): number {
        return this.actualWidth;
    }

    public getColSpan(rowNode: RowNode): number {
        if (_.missing(this.colDef.colSpan)) {
            return 1;
        } else {
            let params: ColSpanParams = {
                node: rowNode,
                data: rowNode.data,
                colDef: this.colDef,
                column: this,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            let colSpan = this.colDef.colSpan(params);
            // colSpan must be number equal to or greater than 1
            if (colSpan > 1) {
                return colSpan;
            } else {
                return 1;
            }
        }
    }

    public setActualWidth(actualWidth: number): void {
        if (this.actualWidth !== actualWidth) {
            this.actualWidth = actualWidth;
            this.eventService.dispatchEvent(Column.EVENT_WIDTH_CHANGED);
        }
    }

    public isGreaterThanMax(width: number): boolean {
        if (this.maxWidth) {
            return width > this.maxWidth;
        } else {
            return false;
        }
    }

    public getMinWidth(): number {
        return this.minWidth;
    }

    public getMaxWidth(): number {
        return this.maxWidth;
    }

    public setMinimum(): void {
        this.setActualWidth(this.minWidth);
    }
    
    public setRowGroupActive(rowGroup: boolean): void {
        if (this.rowGroupActive !== rowGroup) {
            this.rowGroupActive = rowGroup;
            this.eventService.dispatchEvent(Column.EVENT_ROW_GROUP_CHANGED, this);
        }
    }
    
    public isRowGroupActive(): boolean {
        return this.rowGroupActive;
    }

    public setPivotActive(pivot: boolean): void {
        if (this.pivotActive !== pivot) {
            this.pivotActive = pivot;
            this.eventService.dispatchEvent(Column.EVENT_PIVOT_CHANGED, this);
        }
    }

    public isPivotActive(): boolean {
        return this.pivotActive;
    }

    public isAnyFunctionActive(): boolean {
        return this.isPivotActive() || this.isRowGroupActive() || this.isValueActive();
    }

    public isAnyFunctionAllowed(): boolean {
        return this.isAllowPivot() || this.isAllowRowGroup() || this.isAllowValue();
    }

    public setValueActive(value: boolean): void {
        if (this.aggregationActive !== value) {
            this.aggregationActive = value;
            this.eventService.dispatchEvent(Column.EVENT_VALUE_CHANGED, this);
        }
    }

    public isValueActive(): boolean {
        return this.aggregationActive;
    }

    public isAllowPivot(): boolean {
        return this.colDef.enablePivot === true;
    }

    public isAllowValue(): boolean {
        return this.colDef.enableValue === true;
    }

    public isAllowRowGroup(): boolean {
        return this.colDef.enableRowGroup === true;
    }

    public getMenuTabs(defaultValues:string[]):string [] {
        let menuTabs: string[] = this.getColDef().menuTabs;
        if (menuTabs == null) {
            menuTabs = defaultValues;
        };
        return menuTabs;
    }
}
