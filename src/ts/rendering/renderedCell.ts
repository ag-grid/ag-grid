/// <reference path='../columnController.ts' />
/// <reference path='../utils.ts' />
/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="../selectionRendererFactory.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../virtualDom/vHtmlElement.ts" />
/// <reference path="../virtualDom/vWrapperElement.ts" />

module awk.grid {

    var _ = Utils;

    export class RenderedCell {

        private vGridCell: awk.vdom.VHtmlElement; // the outer cell
        private vSpanWithValue: awk.vdom.VHtmlElement; // inner cell
        private vCellWrapper: awk.vdom.VHtmlElement;
        private vParentOfValue: awk.vdom.VHtmlElement;

        private checkboxOnChangeListener: EventListener;

        private column: Column;
        private data: any;
        private node: RowNode;
        private rowIndex: number;
        private editingCell: boolean;

        private scope: any;
        private isFirstColumn: boolean = false;

        private gridOptionsWrapper: GridOptionsWrapper;
        private expressionService: ExpressionService;
        private selectionRendererFactory: SelectionRendererFactory;
        private rowRenderer: RowRenderer;
        private selectionController: SelectionController;
        private $compile: any;
        private templateService: TemplateService;
        private cellRendererMap: {[key: string]: Function};
        private eCheckbox: HTMLInputElement;
        private columnController: ColumnController;
        private valueService: ValueService;

        private value: any;
        private checkboxSelection: boolean;

        constructor(isFirstColumn: any, column: any, $compile: any, rowRenderer: RowRenderer,
                    gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService,
                    selectionRendererFactory: SelectionRendererFactory, selectionController: SelectionController,
                    templateService: TemplateService, cellRendererMap: {[key: string]: any},
                    node: any, rowIndex: number, scope: any, columnController: ColumnController,
                    valueService: ValueService) {

            this.isFirstColumn = isFirstColumn;
            this.column = column;
            this.rowRenderer = rowRenderer;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.expressionService = expressionService;
            this.selectionRendererFactory = selectionRendererFactory;
            this.selectionController = selectionController;
            this.cellRendererMap = cellRendererMap;
            this.$compile = $compile;
            this.templateService = templateService;
            this.columnController = columnController;
            this.valueService = valueService;

            this.checkboxSelection = this.column.colDef.checkboxSelection && !node.floating;

            this.node = node;
            this.rowIndex = rowIndex;
            this.scope = scope;
            this.data = this.getDataForRow();
            this.value = this.getValue();

            this.setupComponents();
        }

        private getValue(): any {
            return this.valueService.getValue(this.column.colDef, this.data, this.node);
        }

        public getVGridCell(): awk.vdom.VHtmlElement {
            return this.vGridCell;
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

        private setupComponents() {
            this.vGridCell = new awk.vdom.VHtmlElement("div");
            this.vGridCell.setAttribute("col", (this.column.index !== undefined && this.column.index !== null) ? this.column.index.toString() : '');

            // only set tab index if cell selection is enabled
            if (!this.gridOptionsWrapper.isSuppressCellSelection() && !this.node.floating) {
                this.vGridCell.setAttribute("tabindex", "-1");
            }

            // these are the grid styles, don't change between soft refreshes
            this.addClasses();

            this.addCellClickedHandler();
            this.addCellDoubleClickedHandler();

            if (!this.node.floating) { // not allowing navigation on the floating until i have time to figure it out
                this.addCellNavigationHandler();
            }

            this.vGridCell.addStyles({width: this.column.actualWidth + "px"});

            this.createParentOfValue();

            this.populateCell();

            if (this.eCheckbox) {
                this.setSelected(this.selectionController.isNodeSelected(this.node));
            }

        }

        // called by rowRenderer when user navigates via tab key
        public startEditing() {
            var that = this;
            this.editingCell = true;
            _.removeAllChildren(this.vGridCell.getElement());
            var eInput = document.createElement('input');
            eInput.type = 'text';
            _.addCssClass(eInput, 'ag-cell-edit-input');

            var value = this.getValue();
            if (value !== null && value !== undefined) {
                eInput.value = value;
            }

            eInput.style.width = (this.column.actualWidth - 14) + 'px';
            this.vGridCell.appendChild(eInput);
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
                // 13 is enter
                if (key == Constants.KEY_ENTER) {
                    this.stopEditing(eInput, blurListener);
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
            this.rowRenderer.focusCell(this.vGridCell.getElement(), this.rowIndex, this.column.index, this.column.colDef, forceBrowserFocus);
        }

        private stopEditing(eInput: any, blurListener: any) {
            this.editingCell = false;
            var newValue = eInput.value;
            var colDef = this.column.colDef;

            //If we don't remove the blur listener first, we get:
            //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
            eInput.removeEventListener('blur', blurListener);

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
                this.node.data[colDef.field] = newValue;
            }

            // at this point, the value has been updated
            this.value = this.getValue();

            paramsForCallbacks.newValue = this.value;
            if (typeof colDef.cellValueChanged === 'function') {
                colDef.cellValueChanged(paramsForCallbacks);
            }
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);

            _.removeAllChildren(this.vGridCell.getElement());
            if (this.checkboxSelection) {
                this.vGridCell.appendChild(this.vCellWrapper.getElement());
            }
            this.refreshCell();
        }

        private addCellDoubleClickedHandler() {
            var that = this;
            var colDef = this.column.colDef;
            this.vGridCell.addEventListener('dblclick', function (event: any) {
                var paramsForGrid = {
                    node: that.node,
                    data: that.node.data,
                    value: that.value,
                    rowIndex: that.rowIndex,
                    colDef: colDef,
                    event: event,
                    eventSource: this,
                    context: that.gridOptionsWrapper.getContext(),
                    api: that.gridOptionsWrapper.getApi()
                };
                that.gridOptionsWrapper.fireEvent(Constants.EVENT_CELL_DOUBLE_CLICKED, paramsForGrid);

                if (colDef.cellDoubleClicked) {
                    var paramsForColDef = {
                        node: that.node,
                        data: that.node.data,
                        value: that.value,
                        rowIndex: that.rowIndex,
                        colDef: colDef,
                        event: event,
                        eventSource: this,
                        context: that.gridOptionsWrapper.getContext(),
                        api: that.gridOptionsWrapper.getApi()
                    };
                    colDef.cellDoubleClicked(paramsForColDef);
                }
                if (that.isCellEditable()) {
                    that.startEditing();
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
            var colDef = this.column.colDef;
            if (typeof colDef.editable === 'boolean') {
                return colDef.editable;
            }

            // if function, then call the function to find out
            if (typeof colDef.editable === 'function') {

                var params = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };

                var editableFunc = <Function>colDef.editable;

                return editableFunc(params);
            }

            return false;
        }

        private addCellClickedHandler() {
            var colDef = this.column.colDef;
            var that = this;
            this.vGridCell.addEventListener("click", function (event: any) {
                // we pass false to focusCell, as we don't want the cell to focus
                // also get the browser focus. if we did, then the cellRenderer could
                // have a text field in it, for example, and as the user clicks on the
                // text field, the text field, the focus doesn't get to the text
                // field, instead to goes to the div behind, making it impossible to
                // select the text field.
                if (!that.node.floating) {
                    that.focusCell(false);
                }
                var paramsForGrid = {
                    node: that.node,
                    data: that.node.data,
                    value: that.value,
                    rowIndex: that.rowIndex,
                    colDef: colDef,
                    event: event,
                    eventSource: this,
                    context: that.gridOptionsWrapper.getContext(),
                    api: that.gridOptionsWrapper.getApi()
                };
                that.gridOptionsWrapper.fireEvent(Constants.EVENT_CELL_CLICKED, paramsForGrid);
                if (colDef.cellClicked) {
                    var paramsForColDef = {
                        node: that.node,
                        data: that.node.data,
                        value: that.value,
                        rowIndex: that.rowIndex,
                        colDef: colDef,
                        event: event,
                        eventSource: this,
                        context: that.gridOptionsWrapper.getContext(),
                        api: that.gridOptionsWrapper.getApi()
                    };
                    colDef.cellClicked(paramsForColDef);
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
            var colDef = this.column.colDef;
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
                    this.vGridCell.addStyles(cssToUse);
                }
            }
        }

        private addClassesFromCollDef() {
            var colDef = this.column.colDef;
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
                    this.vGridCell.addClass(classToUse);
                } else if (Array.isArray(classToUse)) {
                    classToUse.forEach( (cssClassItem: string)=> {
                        this.vGridCell.addClass(cssClassItem);
                    });
                }
            }
        }

        private addClassesFromRules() {
            var colDef = this.column.colDef;
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
                        this.vGridCell.addClass(className);
                    } else {
                        this.vGridCell.removeClass(className);
                    }
                }
            }
        }

        // rename this to 'add key event listener
        private addCellNavigationHandler() {
            var that = this;
            this.vGridCell.addEventListener('keydown', function (event: any) {
                if (that.editingCell) {
                    return;
                }
                // only interested on key presses that are directly on this element, not any children elements. this
                // stops navigation if the user is in, for example, a text field inside the cell, and user hits
                // on of the keys we are looking for.
                if (event.target !== that.vGridCell.getElement()) {
                    return;
                }

                var key = event.which || event.keyCode;

                var startNavigation = key === Constants.KEY_DOWN || key === Constants.KEY_UP
                    || key === Constants.KEY_LEFT || key === Constants.KEY_RIGHT;
                if (startNavigation) {
                    event.preventDefault();
                    that.rowRenderer.navigateToNextCell(key, that.rowIndex, that.column);
                }

                var startEdit = key === Constants.KEY_ENTER;
                if (startEdit && that.isCellEditable()) {
                    that.startEditing();
                    // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                    // press, and stops editing immediately, hence giving he user experience that nothing happened
                    event.preventDefault();
                }

                var selectRow = key === Constants.KEY_SPACE;
                if (selectRow && that.gridOptionsWrapper.isRowSelection()) {
                    var selected = that.selectionController.isNodeSelected(that.node);
                    if (selected) {
                        that.selectionController.deselectNode(that.node);
                    } else {
                        that.selectionController.selectNode(that.node, true);
                    }
                    event.preventDefault();
                }
            });
        }

        public createSelectionCheckbox() {

            this.eCheckbox = document.createElement('input');
            this.eCheckbox.type = "checkbox";
            this.eCheckbox.name = "name";
            this.eCheckbox.className = 'ag-selection-checkbox';

            //this.eCheckbox.addEventListener('click', function (event) {
            //    event.stopPropagation();
            //});

            var that = this;
            this.checkboxOnChangeListener = function() {
                var newValue = that.eCheckbox.checked;
                if (newValue) {
                    that.selectionController.selectIndex(that.rowIndex, true);
                } else {
                    that.selectionController.deselectIndex(that.rowIndex);
                }
            };
            this.eCheckbox.onchange = this.checkboxOnChangeListener;
        }

        public setSelected(state: boolean) {
            if (!this.eCheckbox) {
                return;
            }
            this.eCheckbox.onchange = null;
            if (typeof state === 'boolean') {
                this.eCheckbox.checked = state;
                this.eCheckbox.indeterminate = false;
            } else {
                // isNodeSelected returns back undefined if it's a group and the children
                // are a mix of selected and unselected
                this.eCheckbox.indeterminate = true;
            }
            this.eCheckbox.onchange = this.checkboxOnChangeListener;
        }

        private createParentOfValue() {
            if (this.checkboxSelection) {
                this.vCellWrapper = new awk.vdom.VHtmlElement('span');
                this.vCellWrapper.addClass('ag-cell-wrapper');
                this.vGridCell.appendChild(this.vCellWrapper);

                this.createSelectionCheckbox();
                this.vCellWrapper.appendChild(new awk.vdom.VWrapperElement(this.eCheckbox));

                // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
                this.vSpanWithValue = new awk.vdom.VHtmlElement('span');
                this.vSpanWithValue.addClass('ag-cell-value');

                this.vCellWrapper.appendChild(this.vSpanWithValue);

                this.vParentOfValue = this.vSpanWithValue;
            } else {
                this.vGridCell.addClass('ag-cell-value');
                this.vParentOfValue = this.vGridCell;
            }
        }

        public isVolatile() {
            return this.column.colDef.volatile;
        }

        public refreshCell() {

            _.removeAllChildren(this.vParentOfValue.getElement());
            this.value = this.getValue();

            this.populateCell();

            if (this.checkboxSelection) {
                this.setSelected(this.selectionController.isNodeSelected(this.node));
            }

            // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
            if (this.gridOptionsWrapper.isAngularCompileRows()) {
                this.$compile(this.vGridCell.getElement())(this.scope);
            }
        }

        private putDataIntoCell() {
            // template gets preference, then cellRenderer, then do it ourselves
            var colDef = this.column.colDef;
            if (colDef.template) {
                this.vParentOfValue.setInnerHtml(colDef.template);
            } else if (colDef.templateUrl) {
                var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
                if (template) {
                    this.vParentOfValue.setInnerHtml(template);
                }
            } else if (colDef.floatingCellRenderer && this.node.floating) {
                this.useCellRenderer(colDef.floatingCellRenderer);
            } else if (colDef.cellRenderer) {
                this.useCellRenderer(colDef.cellRenderer);
            } else {
                // if we insert undefined, then it displays as the string 'undefined', ugly!
                if (this.value !== undefined && this.value !== null && this.value !== '') {
                    this.vParentOfValue.setInnerHtml(this.value.toString());
                }
            }
        }

        private useCellRenderer(cellRenderer: Function | {}) {
            var colDef = this.column.colDef;

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
                eGridCell: this.vGridCell
            };
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
            if (_.isNodeOrElement(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                this.vParentOfValue.appendChild(resultFromRenderer);
            } else {
                // otherwise assume it was html, so just insert
                this.vParentOfValue.setInnerHtml(resultFromRenderer);
            }
        }

        private addClasses() {
            this.vGridCell.addClass('ag-cell');
            this.vGridCell.addClass('ag-cell-no-focus');
            this.vGridCell.addClass('cell-col-' + this.column.index);

            if (this.node.group && this.node.footer) {
                this.vGridCell.addClass('ag-footer-cell');
            }
            if (this.node.group && !this.node.footer) {
                this.vGridCell.addClass('ag-group-cell');
            }
        }

    }

}