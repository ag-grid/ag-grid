import _ from '../utils';
import RenderedCell from "./renderedCell";
import {RowNode} from "../entities/rowNode";
import GridOptionsWrapper from "../gridOptionsWrapper";
import {Grid} from "../grid";
import {ColumnController} from "../columnController/columnController";
import ExpressionService from "../expressionService";
import RowRenderer from "./rowRenderer";
import SelectionRendererFactory from "../selectionRendererFactory";
import TemplateService from "../templateService";
import ValueService from "../valueService";
import Column from "../entities/column";
import VHtmlElement from "../virtualDom/vHtmlElement";
import {Events} from "../events";
import {GridCore} from "../gridCore";
import EventService from "../eventService";
import {Qualifier} from "../context/context";
import {Context} from "../context/context";
import {Autowired} from "../context/context";

export default class RenderedRow {

    public static EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';

    public vPinnedLeftRow: VHtmlElement;
    public vPinnedRightRow: VHtmlElement;
    public vBodyRow: VHtmlElement;

    private renderedCells: {[key: string]: RenderedCell} = {};
    private scope: any;
    private rowNode: RowNode;
    private rowIndex: number;

    private cellRendererMap: {[key: string]: any};

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('$compile') private $compile: any;
    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('context') private context: Context;

    private parentScope: any;
    private rowRenderer: RowRenderer;
    private pinningLeft: boolean;
    private pinningRight: boolean;
    private eBodyContainer: HTMLElement;
    private ePinnedLeftContainer: HTMLElement;
    private ePinnedRightContainer: HTMLElement;

    private destroyFunctions: Function[] = [];

    private renderedRowEventService: EventService;

    constructor(parentScope: any,
                cellRendererMap: {[key: string]: any},
                rowRenderer: RowRenderer,
                eBodyContainer: HTMLElement,
                ePinnedLeftContainer: HTMLElement,
                ePinnedRightContainer: HTMLElement,
                node: RowNode,
                rowIndex: number) {
        this.parentScope = parentScope;
        this.cellRendererMap = cellRendererMap;
        this.rowRenderer = rowRenderer;
        this.eBodyContainer = eBodyContainer;
        this.ePinnedLeftContainer = ePinnedLeftContainer;
        this.ePinnedRightContainer = ePinnedRightContainer;

        this.rowIndex = rowIndex;
        this.rowNode = node;
    }

    public agPostWire(): void {
        this.pinningLeft = this.columnController.isPinningLeft();
        this.pinningRight = this.columnController.isPinningRight();

        var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
        var rowIsHeaderThatSpans = this.rowNode.group && groupHeaderTakesEntireRow;

        this.vBodyRow = this.createRowContainer();
        if (this.pinningLeft) {
            this.vPinnedLeftRow = this.createRowContainer();
        }
        if (this.pinningRight) {
            this.vPinnedRightRow = this.createRowContainer();
        }

        this.scope = this.createChildScopeOrNull(this.rowNode.data);

        if (!rowIsHeaderThatSpans) {
            this.drawNormalRow();
        }

        this.addDynamicStyles();
        this.addDynamicClasses();

        var rowStr = this.rowIndex.toString();
        if (this.rowNode.floatingBottom) {
            rowStr = 'fb-' + rowStr;
        } else if (this.rowNode.floatingTop) {
            rowStr = 'ft-' + rowStr;
        }

        this.vBodyRow.setAttribute('row', rowStr);
        if (this.pinningLeft) {
            this.vPinnedLeftRow.setAttribute('row', rowStr);
        }
        if (this.pinningRight) {
            this.vPinnedRightRow.setAttribute('row', rowStr);
        }

        if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            if (typeof businessKey === 'string' || typeof businessKey === 'number') {
                this.vBodyRow.setAttribute('row-id', businessKey);
                if (this.pinningLeft) {
                    this.vPinnedLeftRow.setAttribute('row-id', businessKey);
                }
                if (this.pinningRight) {
                    this.vPinnedRightRow.setAttribute('row-id', businessKey);
                }
            }
        }

        // if showing scrolls, position on the container
        if (!this.gridOptionsWrapper.isForPrint()) {
            var topPx = this.rowNode.rowTop + "px";
            this.vBodyRow.style.top = topPx;
            if (this.pinningLeft) {
                this.vPinnedLeftRow.style.top = topPx;
            }
            if (this.pinningRight) {
                this.vPinnedRightRow.style.top = topPx;
            }
        }
        var heightPx = this.rowNode.rowHeight + 'px';
        this.vBodyRow.style.height = heightPx;
        if (this.pinningLeft) {
            this.vPinnedLeftRow.style.height = heightPx;
        }
        if (this.pinningRight) {
            this.vPinnedRightRow.style.height = heightPx;
        }

        // if group item, insert the first row
        if (rowIsHeaderThatSpans) {
            this.createGroupRow();
        }

        this.bindVirtualElement(this.vBodyRow);
        if (this.pinningLeft) {
            this.bindVirtualElement(this.vPinnedLeftRow);
        }
        if (this.pinningRight) {
            this.bindVirtualElement(this.vPinnedRightRow);
        }

        if (this.scope) {
            this.$compile(this.vBodyRow.getElement())(this.scope);
            if (this.pinningLeft) {
                this.$compile(this.vPinnedLeftRow.getElement())(this.scope);
            }
            if (this.pinningRight) {
                this.$compile(this.vPinnedRightRow.getElement())(this.scope);
            }
        }

        this.eBodyContainer.appendChild(this.vBodyRow.getElement());
        if (this.pinningLeft) {
            this.ePinnedLeftContainer.appendChild(this.vPinnedLeftRow.getElement());
        }
        if (this.pinningRight) {
            this.ePinnedRightContainer.appendChild(this.vPinnedRightRow.getElement());
        }

        var rowSelectedListener = this.onRowSelected.bind(this);
        this.rowNode.addEventListener(RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        this.destroyFunctions.push(()=> {
            this.rowNode.removeEventListener(RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        });
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.renderedRowEventService) { this.renderedRowEventService = new EventService(); }
        this.renderedRowEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.renderedRowEventService.removeEventListener(eventType, listener);
    }

    public onRowSelected(): void {

        var vRows: VHtmlElement[] = [];
        if (this.vPinnedLeftRow) { vRows.push(this.vPinnedLeftRow); }
        if (this.vPinnedRightRow) { vRows.push(this.vPinnedRightRow); }
        if (this.vBodyRow) { vRows.push(this.vBodyRow); }

        var selected = this.rowNode.isSelected();
        vRows.forEach( (vRow) => {
            var element = vRow.getElement();
            if (!element) {
                throw 'element is not bound';
            }
            _.addOrRemoveCssClass(element, 'ag-row-selected', selected);
        });
    }

    public softRefresh(): void {
        _.iterateObject(this.renderedCells, (key: any, renderedCell: RenderedCell)=> {
            if (renderedCell.isVolatile()) {
                renderedCell.refreshCell();
            }
        });
    }

    public getRenderedCellForColumn(column: Column): RenderedCell {
        return this.renderedCells[column.getColId()];
    }

    public getCellForCol(column: Column): HTMLElement {
        var renderedCell = this.renderedCells[column.getColId()];
        if (renderedCell) {
            return renderedCell.getVGridCell().getElement();
        } else {
            return null;
        }
    }

    public destroy(): void {

        this.destroyFunctions.forEach( func => func() );

        this.destroyScope();

        if (this.pinningLeft) {
            this.ePinnedLeftContainer.removeChild(this.vPinnedLeftRow.getElement());
        }
        if (this.pinningRight) {
            this.ePinnedRightContainer.removeChild(this.vPinnedRightRow.getElement());
        }
        this.eBodyContainer.removeChild(this.vBodyRow.getElement());

        _.iterateObject(this.renderedCells, (key: any, renderedCell: RenderedCell)=> {
            renderedCell.destroy();
        });

        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(RenderedRow.EVENT_RENDERED_ROW_REMOVED, {node: this.rowNode});
        }
    }

    private destroyScope(): void {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    }

    public isDataInList(rows: any[]): boolean {
        return rows.indexOf(this.rowNode.data) >= 0;
    }

    public isNodeInList(nodes: RowNode[]): boolean {
        return nodes.indexOf(this.rowNode) >= 0;
    }

    public isGroup(): boolean {
        return this.rowNode.group === true;
    }

    private drawNormalRow() {
        var columns = this.columnController.getAllDisplayedColumns();
        var firstRightPinnedColIndex = this.columnController.getFirstRightPinnedColIndex();
        for (var colIndex = 0; colIndex<columns.length; colIndex++) {
            var column = columns[colIndex];
            var firstRightPinnedCol = colIndex === firstRightPinnedColIndex;

            var renderedCell = new RenderedCell(firstRightPinnedCol, column,
                this.cellRendererMap, this.rowNode,
                this.rowIndex, colIndex, this.scope, this);
            this.context.wireBean(renderedCell);

            var vGridCell = renderedCell.getVGridCell();

            if (column.getPinned() === Column.PINNED_LEFT) {
                this.vPinnedLeftRow.appendChild(vGridCell);
            } else if (column.getPinned()=== Column.PINNED_RIGHT) {
                this.vPinnedRightRow.appendChild(vGridCell);
            } else {
                this.vBodyRow.appendChild(vGridCell);
            }

            this.renderedCells[column.getColId()] = renderedCell;
        }
    }

    private bindVirtualElement(vElement: VHtmlElement): void {
        var html = vElement.toHtmlString();
        var element: Element = <Element> _.loadTemplate(html);
        vElement.elementAttached(element);
    }

    private createGroupRow() {
        var eGroupRow = this.createGroupSpanningEntireRowCell(false);

        if (this.pinningLeft) {
            this.vPinnedLeftRow.appendChild(eGroupRow);
            var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
            this.vBodyRow.appendChild(eGroupRowPadding);
        } else {
            this.vBodyRow.appendChild(eGroupRow);
        }

        if (this.pinningRight) {
            var ePinnedRightPadding = this.createGroupSpanningEntireRowCell(true);
            this.vPinnedRightRow.appendChild(ePinnedRightPadding);
        }
    }

    private createGroupSpanningEntireRowCell(padding: any) {
        var eRow: any;
        // padding means we are on the right hand side of a pinned table, ie
        // in the main body.
        if (padding) {
            eRow = document.createElement('span');
        } else {
            var rowCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
            if (!rowCellRenderer) {
                rowCellRenderer = {
                    renderer: 'group',
                    innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
                };
            }
            var params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                colDef: {
                    cellRenderer: rowCellRenderer
                }
            };

            // start duplicated code
            var actualCellRenderer: Function;
            if (typeof rowCellRenderer === 'object' && rowCellRenderer !== null) {
                var cellRendererObj = <{ renderer: string }> rowCellRenderer;
                actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                if (!actualCellRenderer) {
                    throw 'Cell renderer ' + rowCellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                }
            } else if (typeof rowCellRenderer === 'function') {
                actualCellRenderer = <Function>rowCellRenderer;
            } else {
                throw 'Cell Renderer must be String or Function';
            }
            var resultFromRenderer = actualCellRenderer(params);
            // end duplicated code

            if (_.isNodeOrElement(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                eRow = resultFromRenderer;
            } else {
                // otherwise assume it was html, so just insert
                eRow = _.loadTemplate(resultFromRenderer);
            }
        }
        if (this.rowNode.footer) {
            _.addCssClass(eRow, 'ag-footer-cell-entire-row');
        } else {
            _.addCssClass(eRow, 'ag-group-cell-entire-row');
        }

        return eRow;
    }

    //public setMainRowWidth(width: number) {
    //    this.vBodyRow.addStyles({width: width + "px"});
    //}

    private createChildScopeOrNull(data: any) {
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            var newChildScope = this.parentScope.$new();
            newChildScope.data = data;
            return newChildScope;
        } else {
            return null;
        }
    }

    private addDynamicStyles() {
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (rowStyle) {
            if (typeof rowStyle === 'function') {
                console.log('ag-Grid: rowStyle should be a string or an array, not be a function, use getRowStyle() instead');
            } else {
                this.vBodyRow.addStyles(rowStyle);
                if (this.pinningLeft) {
                    this.vPinnedLeftRow.addStyles(rowStyle);
                }
                if (this.pinningRight) {
                    this.vPinnedRightRow.addStyles(rowStyle);
                }
            }
        }
        var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
        if (rowStyleFunc) {
            var params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            var cssToUseFromFunc = rowStyleFunc(params);
            this.vBodyRow.addStyles(cssToUseFromFunc);
            if (this.pinningLeft) {
                this.vPinnedLeftRow.addStyles(cssToUseFromFunc);
            }
            if (this.pinningRight) {
                this.vPinnedRightRow.addStyles(cssToUseFromFunc);
            }
        }
    }

    private createParams(): any {
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowIndex,
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };
        return params;
    }

    private createEvent(event: any, eventSource: any): any {
        var agEvent = this.createParams();
        agEvent.event = event;
        agEvent.eventSource = eventSource;
        return agEvent;
    }

    private createRowContainer(): VHtmlElement {
        var vRow = new VHtmlElement('div');
        vRow.addEventListener("click", this.onRowClicked.bind(this));
        vRow.addEventListener("dblclick", (event: any) => {
            var agEvent = this.createEvent(event, this);
            this.mainEventService.dispatchEvent(Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
        });

        return vRow;
    }

    public onRowClicked(event: MouseEvent) {

        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(Events.EVENT_ROW_CLICKED, agEvent);

        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = event.ctrlKey || event.metaKey;

        // we do not allow selecting groups by clicking (as the click here expands the group)
        // so return if it's a group row
        if (this.rowNode.group) {
            return;
        }

        // we also don't allow selection of floating rows
        if (this.rowNode.floating) {
            return;
        }

        // making local variables to make the below more readable
        var gridOptionsWrapper = this.gridOptionsWrapper;

        // if no selection method enabled, do nothing
        if (!gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        if (this.rowNode.isSelected()) {
            var deselectAllowed = multiSelectKeyPressed && gridOptionsWrapper.isRowDeselection();
            if (deselectAllowed) {
                this.rowNode.setSelected(false);
            }
        } else {
            this.rowNode.setSelected(true, !multiSelectKeyPressed);
        }
    }

    public getRowNode(): any {
        return this.rowNode;
    }

    public getRowIndex(): any {
        return this.rowIndex;
    }

    public refreshCells(colIds: string[]): void {
        if (!colIds) {
            return;
        }
        var columnsToRefresh = this.columnController.getColumns(colIds);

        _.iterateObject(this.renderedCells, (key: any, renderedCell: RenderedCell)=> {
            var colForCel = renderedCell.getColumn();
            if (columnsToRefresh.indexOf(colForCel)>=0) {
                renderedCell.refreshCell();
            }
        });
    }

    private addDynamicClasses() {
        var classes: string[] = [];

        classes.push('ag-row');
        classes.push('ag-row-no-focus');

        classes.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");

        if (this.rowNode.isSelected()) {
            classes.push("ag-row-selected");
        }

        if (this.rowNode.group) {
            classes.push("ag-row-group");
            // if a group, put the level of the group in
            classes.push("ag-row-level-" + this.rowNode.level);

            if (!this.rowNode.footer && this.rowNode.expanded) {
                classes.push("ag-row-group-expanded");
            }
            if (!this.rowNode.footer && !this.rowNode.expanded) {
                // opposite of expanded is contracted according to the internet.
                classes.push("ag-row-group-contracted");
            }
            if (this.rowNode.footer) {
                classes.push("ag-row-footer");
            }
        } else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (this.rowNode.parent) {
                classes.push("ag-row-level-" + (this.rowNode.parent.level + 1));
            } else {
                classes.push("ag-row-level-0");
            }
        }

        // add in extra classes provided by the config
        var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
        if (gridOptionsRowClass) {
            if (typeof gridOptionsRowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
            } else {
                if (typeof gridOptionsRowClass === 'string') {
                    classes.push(gridOptionsRowClass);
                } else if (Array.isArray(gridOptionsRowClass)) {
                    gridOptionsRowClass.forEach(function (classItem: any) {
                        classes.push(classItem);
                    });
                }
            }
        }

        var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
        if (gridOptionsRowClassFunc) {
            var params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowIndex,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi()
            };
            var classToUseFromFunc = gridOptionsRowClassFunc(params);
            if (classToUseFromFunc) {
                if (typeof classToUseFromFunc === 'string') {
                    classes.push(classToUseFromFunc);
                } else if (Array.isArray(classToUseFromFunc)) {
                    classToUseFromFunc.forEach(function (classItem: any) {
                        classes.push(classItem);
                    });
                }
            }
        }

        this.vBodyRow.addClasses(classes);
        if (this.pinningLeft) {
            this.vPinnedLeftRow.addClasses(classes);
        }
        if (this.pinningRight) {
            this.vPinnedRightRow.addClasses(classes);
        }
    }
}
