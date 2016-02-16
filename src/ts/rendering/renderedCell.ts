import _ from '../utils';
import Column from "../entities/column";
import {RowNode} from "../entities/rowNode";
import GridOptionsWrapper from "../gridOptionsWrapper";
import ExpressionService from "../expressionService";
import SelectionRendererFactory from "../selectionRendererFactory";
import RowRenderer from "./rowRenderer";
import TemplateService from "../templateService";
import {ColumnController} from "../columnController/columnController";
import ValueService from "../valueService";
import EventService from "../eventService";
import Constants from "../constants";
import {Events} from "../events";
import RenderedRow from "./renderedRow";
import {Qualifier} from "../context/context";
import {Autowired} from "../context/context";

export default class RenderedCell {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('selectionRendererFactory') private selectionRendererFactory: SelectionRendererFactory;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('$compile') private $compile: any;
    @Autowired('templateService') private templateService: TemplateService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;

    private eGridCell: HTMLElement; // the outer cell
    private eSpanWithValue: HTMLElement; // inner cell
    private eCellWrapper: HTMLElement;
    private eParentOfValue: HTMLElement;

    private column: Column;
    private data: any;
    private node: RowNode;
    private rowIndex: number;
    private colIndex: number;
    private editingCell: boolean;

    private scope: any;
    private firstRightPinnedColumn: boolean;

    private cellRendererMap: {[key: string]: Function};
    private eCheckbox: HTMLInputElement;

    private value: any;
    private checkboxSelection: boolean;
    private renderedRow: RenderedRow;

    private destroyMethods: Function[] = [];

    constructor(firstRightPinnedCol: boolean, column: any,
                cellRendererMap: {[key: string]: any},
                node: any, rowIndex: number, colIndex: number, scope: any,
                renderedRow: RenderedRow) {

        this.firstRightPinnedColumn = firstRightPinnedCol;
        this.column = column;
        this.cellRendererMap = cellRendererMap;

        this.node = node;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.scope = scope;
        this.renderedRow = renderedRow;
    }

    public agPostWire(): void {
        this.data = this.getDataForRow();
        this.value = this.getValue();
        this.checkboxSelection = this.calculateCheckboxSelection();

        this.setupComponents();
    }

    public destroy(): void {
        this.destroyMethods.forEach( theFunction => {
            theFunction();
        });
    }

    public calculateCheckboxSelection() {
        // never allow selection on floating rows
        if (this.node.floating) {
            return false;
        }

        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        if (typeof colDef.checkboxSelection === 'boolean') {
            return colDef.checkboxSelection;
        }

        // if function, then call the function to find out. we first check colDef for
        // a function, and if missing then check gridOptions, so colDef has precedence
        var selectionFunc: Function;
        if (typeof colDef.checkboxSelection === 'function') {
            selectionFunc = <Function>colDef.checkboxSelection;
        }
        if (!selectionFunc && this.gridOptionsWrapper.getCheckboxSelection()) {
            selectionFunc = this.gridOptionsWrapper.getCheckboxSelection();
        }
        if (selectionFunc) {
            var params = this.createParams();
            return selectionFunc(params);
        }

        return false;
    }

    public getColumn(): Column {
        return this.column;
    }

    private getValue(): any {
        return this.valueService.getValue(this.column.getColDef(), this.data, this.node);
    }

    public getVGridCell(): HTMLElement {
        return this.eGridCell;
    }

    private getDataForRow() {
        if (this.node.footer) {
            // if footer, we always show the data
            return this.node.data;
        } else if (this.node.group) {
            // if header and header is expanded, we show data in footer only
            var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
            var suppressHideHeader = this.gridOptionsWrapper.isGroupSuppressBlankHeader();
            if (this.node.expanded && footersEnabled && !suppressHideHeader) {
                return undefined;
            } else {
                return this.node.data;
            }
        } else {
            // otherwise it's a normal node, just return data as normal
            return this.node.data;
        }
    }

    private setLeftOnCell(): void {
        var leftChangedListener = () => {
            this.eGridCell.style.left = this.column.getLeft() + 'px';
        };

        this.column.addEventListener(Column.EVENT_LEFT_CHANGED, leftChangedListener);
        this.destroyMethods.push( () => {
            this.column.removeEventListener(Column.EVENT_LEFT_CHANGED, leftChangedListener);
        });

        leftChangedListener();
    }

    private setWidthOnCell(): void {
        var widthChangedListener = () => {
            this.eGridCell.style.width = this.column.getActualWidth() + "px";
        };

        this.column.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.destroyMethods.push( () => {
            this.column.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });

        widthChangedListener();
    }

    private setupComponents() {
        this.eGridCell = document.createElement('div');

        this.setLeftOnCell();
        this.setWidthOnCell();

        // only set tab index if cell selection is enabled
        if (!this.gridOptionsWrapper.isSuppressCellSelection() && !this.node.floating) {
            this.eGridCell.setAttribute("tabindex", "-1");
        }

        // these are the grid styles, don't change between soft refreshes
        this.addClasses();

        this.addCellClickedHandler();
        this.addCellDoubleClickedHandler();
        this.addCellContextMenuHandler();

        if (!this.node.floating) { // not allowing navigation on the floating until i have time to figure it out
            this.addCellNavigationHandler();
        }

        this.createParentOfValue();

        this.populateCell();

    }

    // called by rowRenderer when user navigates via tab key
    public startEditing(key?: number) {
        var that = this;
        this.editingCell = true;
        _.removeAllChildren(this.eGridCell);
        var eInput = document.createElement('input');
        eInput.type = 'text';
        _.addCssClass(eInput, 'ag-cell-edit-input');

        var startWithOldValue = key !== Constants.KEY_BACKSPACE && key !== Constants.KEY_DELETE;
        var value = this.getValue();
        if (startWithOldValue && value !== null && value !== undefined) {
            eInput.value = value;
        }

        eInput.style.width = (this.column.getActualWidth() - 14) + 'px';
        this.eGridCell.appendChild(eInput);
        eInput.focus();
        eInput.select();

        var blurListener = function () {
            that.stopEditing(eInput, blurListener);
        };

        //stop entering if we loose focus
        eInput.addEventListener("blur", blurListener);

        //stop editing if enter pressed
        eInput.addEventListener('keypress', (event: any) => {
            var key = event.which || event.keyCode;
            if (key === Constants.KEY_ENTER) {
                this.stopEditing(eInput, blurListener);
                this.focusCell(true);
            }
        });

        //stop editing if enter pressed
        eInput.addEventListener('keydown', (event: any) => {
            var key = event.which || event.keyCode;
            if (key === Constants.KEY_ESCAPE) {
                this.stopEditing(eInput, blurListener, true);
                this.focusCell(true);
            }
        });

        // tab key doesn't generate keypress, so need keydown to listen for that
        eInput.addEventListener('keydown', function (event:any) {
            var key = event.which || event.keyCode;
            if (key == Constants.KEY_TAB) {
                that.stopEditing(eInput, blurListener);
                that.rowRenderer.startEditingNextCell(that.rowIndex, that.column, event.shiftKey);
                // we don't want the default tab action, so return false, this stops the event from bubbling
                event.preventDefault();
                return false;
            }
        });
    }

    public focusCell(forceBrowserFocus: boolean): void {
        this.rowRenderer.focusCell(this.eGridCell, this.rowIndex, this.column.getColId(), this.column.getColDef(), forceBrowserFocus);
    }

    private stopEditing(eInput: any, blurListener: any, reset: boolean = false) {
        this.editingCell = false;
        var newValue = eInput.value;
        var colDef = this.column.getColDef();

        //If we don't remove the blur listener first, we get:
        //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
        eInput.removeEventListener('blur', blurListener);

        if (!reset) {
            var paramsForCallbacks = {
                node: this.node,
                data: this.node.data,
                oldValue: this.node.data[colDef.field],
                newValue: newValue,
                rowIndex: this.rowIndex,
                colDef: colDef,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            if (colDef.newValueHandler) {
                colDef.newValueHandler(paramsForCallbacks);
            } else {
                this.valueService.setValueUsingField(this.node.data, colDef.field, newValue);
            }

            // at this point, the value has been updated
            this.value = this.getValue();

            paramsForCallbacks.newValue = this.value;
            if (typeof colDef.onCellValueChanged === 'function') {
                colDef.onCellValueChanged(paramsForCallbacks);
            }
            this.eventService.dispatchEvent(Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
        }

        _.removeAllChildren(this.eGridCell);
        if (this.checkboxSelection) {
            this.eGridCell.appendChild(this.eCellWrapper);
        }
        this.refreshCell();
    }

    private createParams(): any {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            rowIndex: this.rowIndex,
            colIndex: this.colIndex,
            colDef: this.column.getColDef(),
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

    private addCellDoubleClickedHandler() {
        var that = this;
        var colDef = this.column.getColDef();
        this.eGridCell.addEventListener('dblclick', function (event: any) {
            // always dispatch event to eventService
            var agEvent: any = that.createEvent(event, this);
            that.eventService.dispatchEvent(Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);

            // check if colDef also wants to handle event
            if (typeof colDef.onCellDoubleClicked === 'function') {
                colDef.onCellDoubleClicked(agEvent);
            }

            if (!that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                that.startEditing();
            }
        });
    }

    private addCellContextMenuHandler() {
        var that = this;
        var colDef = this.column.getColDef();
        this.eGridCell.addEventListener('contextmenu', function (event: any) {
            var agEvent: any = that.createEvent(event, this);
            that.eventService.dispatchEvent(Events.EVENT_CELL_CONTEXT_MENU, agEvent);

            if (colDef.onCellContextMenu) {
                colDef.onCellContextMenu(agEvent);
            }
        });
    }

    public isCellEditable() {
        if (this.editingCell) {
            return false;
        }

        // never allow editing of groups
        if (this.node.group) {
            return false;
        }

        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        if (typeof colDef.editable === 'boolean') {
            return colDef.editable;
        }

        // if function, then call the function to find out
        if (typeof colDef.editable === 'function') {
            var params = this.createParams();
            var editableFunc = <Function>colDef.editable;
            return editableFunc(params);
        }

        return false;
    }

    private addCellClickedHandler() {
        var colDef = this.column.getColDef();
        var that = this;
        this.eGridCell.addEventListener("click", function (event: any) {
            // we pass false to focusCell, as we don't want the cell to focus
            // also get the browser focus. if we did, then the cellRenderer could
            // have a text field in it, for example, and as the user clicks on the
            // text field, the text field, the focus doesn't get to the text
            // field, instead to goes to the div behind, making it impossible to
            // select the text field.
            if (!that.node.floating) {
                that.focusCell(false);
            }
            var agEvent = that.createEvent(event, this);
            that.eventService.dispatchEvent(Events.EVENT_CELL_CLICKED, agEvent);
            if (colDef.onCellClicked) {
                colDef.onCellClicked(agEvent);
            }

            if (that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                that.startEditing();
            }
        });
    }

    private populateCell() {
        // populate
        this.putDataIntoCell();
        // style
        this.addStylesFromCollDef();
        this.addClassesFromCollDef();
        this.addClassesFromRules();
    }

    private addStylesFromCollDef() {
        var colDef = this.column.getColDef();
        if (colDef.cellStyle) {
            var cssToUse: any;
            if (typeof colDef.cellStyle === 'function') {
                var cellStyleParams = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
              };
                var cellStyleFunc = <Function>colDef.cellStyle;
                cssToUse = cellStyleFunc(cellStyleParams);
            } else {
                cssToUse = colDef.cellStyle;
            }

            if (cssToUse) {
                _.addStylesToElement(this.eGridCell, cssToUse);
            }
        }
    }

    private addClassesFromCollDef() {
        var colDef = this.column.getColDef();
        if (colDef.cellClass) {
          var classToUse: any;

            if (typeof colDef.cellClass === 'function') {
                var cellClassParams = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var cellClassFunc = <(cellClassParams: any) => string|string[]> colDef.cellClass;
                classToUse = cellClassFunc(cellClassParams);
            } else {
                classToUse = colDef.cellClass;
            }

            if (typeof classToUse === 'string') {
                _.addCssClass(this.eGridCell, classToUse);
            } else if (Array.isArray(classToUse)) {
                classToUse.forEach( (cssClassItem: string)=> {
                    _.addCssClass(this.eGridCell, cssClassItem);
                });
            }
        }
    }

    private addClassesFromRules() {
        var colDef = this.column.getColDef();
        var classRules = colDef.cellClassRules;
        if (typeof classRules === 'object' && classRules !== null) {

            var params = {
                value: this.value,
                data: this.node.data,
                node: this.node,
                colDef: colDef,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };

            var classNames = Object.keys(classRules);
            for (var i = 0; i < classNames.length; i++) {
                var className = classNames[i];
                var rule = classRules[className];
                var resultOfRule: any;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                } else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                if (resultOfRule) {
                    _.addCssClass(this.eGridCell, className);
                } else {
                    _.removeCssClass(this.eGridCell, className);
                }
            }
        }
    }

    // rename this to 'add key event listener
    private addCellNavigationHandler() {
        var that = this;
        this.eGridCell.addEventListener('keydown', function (event: any) {
            if (that.editingCell) {
                return;
            }
            // only interested on key presses that are directly on this element, not any children elements. this
            // stops navigation if the user is in, for example, a text field inside the cell, and user hits
            // on of the keys we are looking for.
            if (event.target !== that.eGridCell) {
                return;
            }

            var key = event.which || event.keyCode;

            var startNavigation = key === Constants.KEY_DOWN || key === Constants.KEY_UP
                || key === Constants.KEY_LEFT || key === Constants.KEY_RIGHT;
            if (startNavigation) {
                event.preventDefault();
                that.rowRenderer.navigateToNextCell(key, that.rowIndex, that.column);
                return;
            }

            var startEdit = that.isKeycodeForStartEditing(key);
            if (startEdit && that.isCellEditable()) {
                that.startEditing(key);
                // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                // press, and stops editing immediately, hence giving he user experience that nothing happened
                event.preventDefault();
                return;
            }

            var selectRow = key === Constants.KEY_SPACE;
            if (selectRow && that.gridOptionsWrapper.isRowSelection()) {
                var selected = that.node.isSelected();
                if (selected) {
                    that.node.setSelected(false);
                } else {
                    that.node.setSelected(true);
                }
                event.preventDefault();
                return;
            }
        });
    }

    private isKeycodeForStartEditing(key: number): boolean {
        return key === Constants.KEY_ENTER || key === Constants.KEY_BACKSPACE || key === Constants.KEY_DELETE;
    }

    private createParentOfValue() {
        if (this.checkboxSelection) {
            this.eCellWrapper = document.createElement('span');
            _.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
            this.eGridCell.appendChild(this.eCellWrapper);

            //this.createSelectionCheckbox();
            this.eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(this.node, this.rowIndex, this.renderedRow.addEventListener.bind(this.renderedRow));
            this.eCellWrapper.appendChild(this.eCheckbox);

            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement('span');
            _.addCssClass(this.eSpanWithValue, 'ag-cell-value');

            this.eCellWrapper.appendChild(this.eSpanWithValue);

            this.eParentOfValue = this.eSpanWithValue;
        } else {
            _.addCssClass(this.eGridCell, 'ag-cell-value');
            this.eParentOfValue = this.eGridCell;
        }
    }

    public isVolatile() {
        return this.column.getColDef().volatile;
    }

    public refreshCell() {

        _.removeAllChildren(this.eParentOfValue);
        this.value = this.getValue();

        this.populateCell();

        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.eGridCell)(this.scope);
        }
    }

    private putDataIntoCell() {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        if (colDef.template) {
            this.eParentOfValue.innerHTML = colDef.template;
        } else if (colDef.templateUrl) {
            var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
            }
        } else if (colDef.floatingCellRenderer && this.node.floating) {
            this.useCellRenderer(colDef.floatingCellRenderer);
        } else if (colDef.cellRenderer) {
            this.useCellRenderer(colDef.cellRenderer);
        } else {
            // if we insert undefined, then it displays as the string 'undefined', ugly!
            if (this.value !== undefined && this.value !== null && this.value !== '') {
                this.eParentOfValue.innerHTML = this.value.toString();
            }
        }
    }

    private useCellRenderer(cellRenderer: Function | {}) {
        var colDef = this.column.getColDef();

        var rendererParams = {
            value: this.value,
            valueGetter: this.getValue,
            data: this.node.data,
            node: this.node,
            colDef: colDef,
            column: this.column,
            $scope: this.scope,
            rowIndex: this.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.eGridCell,
            eParentOfValue: this.eParentOfValue,
            addRenderedRowListener: this.renderedRow.addEventListener.bind(this.renderedRow)
        };
        // start duplicated code
        var actualCellRenderer: Function;
        if (typeof cellRenderer === 'object' && cellRenderer !== null) {
            var cellRendererObj = <{ renderer: string }> cellRenderer;
            actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
            if (!actualCellRenderer) {
                throw 'Cell renderer ' + cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
            }
        } else if (typeof cellRenderer === 'function') {
            actualCellRenderer = <Function>cellRenderer;
        } else {
            throw 'Cell Renderer must be String or Function';
        }
        var resultFromRenderer = actualCellRenderer(rendererParams);
        // end duplicated code
        if (_.isNodeOrElement(resultFromRenderer)) {
            // a dom node or element was returned, so add child
            this.eParentOfValue.appendChild(resultFromRenderer);
        } else {
            // otherwise assume it was html, so just insert
            this.eParentOfValue.innerHTML = resultFromRenderer;
        }
    }

    private addClasses() {
        _.addCssClass(this.eGridCell, 'ag-cell');
        _.addCssClass(this.eGridCell, 'ag-cell-no-focus');
        this.eGridCell.setAttribute("colId", this.column.getColId());

        if (this.node.group && this.node.footer) {
            _.addCssClass(this.eGridCell, 'ag-footer-cell');
        }
        if (this.node.group && !this.node.footer) {
            _.addCssClass(this.eGridCell, 'ag-group-cell');
        }

        if (this.firstRightPinnedColumn) {
            _.addCssClass(this.eGridCell, 'ag-cell-first-right-pinned');
        }
    }

}
