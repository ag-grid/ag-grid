import {ColumnGroupChild} from "./columnGroupChild";
import {OriginalColumnGroupChild} from "./originalColumnGroupChild";
import {
    ColDef,
    AbstractColDef,
    IAggFunc,
    IsColumnFunc,
    IsColumnFuncParams
} from "./colDef";
import {EventService} from "../eventService";
import {Utils as _} from "../utils";
import {Autowired, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnUtils} from "../columnController/columnUtils";
import {RowNode} from "./rowNode";
import {ICellRenderer, ICellRendererFunc, ICellRendererComp} from "../rendering/cellRenderers/iCellRenderer";
import {ICellEditorComp} from "../rendering/cellEditors/iCellEditor";
import {IFilter} from "../interfaces/iFilter";
import {IFrameworkFactory} from "../interfaces/iFrameworkFactory";

// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
// can only appear in OriginalColumn tree).
export class Column implements ColumnGroupChild, OriginalColumnGroupChild {

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
    // + renderedHeaderCell - marks the header with filter icon
    public static EVENT_FILTER_CHANGED = 'filterChanged';
    // + renderedHeaderCell - marks the header with sort icon
    public static EVENT_SORT_CHANGED = 'sortChanged';

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

        var minColWidth = this.gridOptionsWrapper.getMinColWidth();
        var maxColWidth = this.gridOptionsWrapper.getMaxColWidth();

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

        var suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.fieldContainsDots = _.exists(this.colDef.field) && this.colDef.field.indexOf('.')>=0 && !suppressDotNotation;
        this.tooltipFieldContainsDots = _.exists(this.colDef.tooltipField) && this.colDef.tooltipField.indexOf('.')>=0 && !suppressDotNotation;

        this.validate();
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
        }
        if (_.exists(this.colDef.width) && typeof this.colDef.width !== 'number') {
            console.warn('ag-Grid: colDef.width should be a number, not ' + typeof this.colDef.width);
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
            var params = this.createIsColumnFuncParams(rowNode);
            var suppressNaviableFunc = <IsColumnFunc> this.colDef.suppressNavigable;
            return suppressNaviableFunc(params);
        }

        return false;
    }

    public isCellEditable(rowNode: RowNode): boolean {
        // if boolean set, then just use it
        if (typeof this.colDef.editable === 'boolean') {
            return <boolean> this.colDef.editable;
        }

        // if function, then call the function to find out
        if (typeof this.colDef.editable === 'function') {
            var params = this.createIsColumnFuncParams(rowNode);
            var editableFunc = <IsColumnFunc> this.colDef.editable;
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

    public isSortAscending(): boolean {
        return this.sort === Column.SORT_ASC;
    }

    public isSortDescending(): boolean {
        return this.sort === Column.SORT_DESC;
    }

    public isSortNone(): boolean {
        return _.missing(this.sort);
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
            this.eventService.dispatchEvent(Column.EVENT_FILTER_CHANGED);
        }
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
        var newValue = visible===true;
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
}
