/// <reference path='columnController.ts' />
/// <reference path='utils.ts' />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="selectionRendererFactory.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="selectionController.ts" />
/// <reference path="templateService.ts" />

module awk.grid {

    var _ = Utils;

    export class RenderedCell {

        private eGridCell: any; // the outer cell
        private eSpanWithValue: any; // inner cell

        private column: Column;
        private data: any;
        private node: any;
        private rowIndex: number;
        private editingCell: boolean;

        private valueGetter: any;
        private scope: any;
        private isFirstColumn: boolean = false;

        private gridOptionsWrapper: GridOptionsWrapper;
        private expressionService: ExpressionService;
        private selectionRendererFactory: SelectionRendererFactory;
        private rowRenderer: RowRenderer;
        private selectionController: SelectionController;
        private $compile: any;
        private templateService: TemplateService;
        private cellRendererMap: {[key: string]: any};

        constructor(isFirstColumn: any, column: any, node: any, rowIndex: number,
                    scope: any, $compile: any, rowRenderer: RowRenderer,
                    gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService,
                    selectionRendererFactory: SelectionRendererFactory, selectionController: SelectionController,
                    templateService: TemplateService, cellRendererMap: {[key: string]: any}) {

            this.isFirstColumn = isFirstColumn;
            this.node = node;
            this.column = column;
            this.rowIndex = rowIndex;
            this.scope = scope;
            this.rowRenderer = rowRenderer;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.expressionService = expressionService;
            this.selectionRendererFactory = selectionRendererFactory;
            this.selectionController = selectionController;
            this.cellRendererMap = cellRendererMap;
            this.$compile = $compile;
            this.templateService = templateService;

            this.data = this.getDataForRow();
            this.valueGetter = this.createValueGetter();

            this.createCell();
        }

        public getGridCell(): any {
            return this.eGridCell;
        }

        private getDataForRow() {
            if (this.node.footer) {
                // if footer, we always show the data
                return this.node.data;
            } else if (this.node.group) {
                // if header and header is expanded, we show data in footer only
                var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
                return (this.node.expanded && footersEnabled) ? undefined : this.node.data;
            } else {
                // otherwise it's a normal node, just return data as normal
                return this.node.data;
            }
        }

        private createValueGetter() {
            var that = this;
            return function () {
                var api = that.gridOptionsWrapper.getApi();
                var context = that.gridOptionsWrapper.getContext();
                return _.getValue(that.expressionService, that.data, that.column.colDef, that.node, api, context);
            };
        }

        private createCell() {
            this.eGridCell = document.createElement("div");
            this.eGridCell.setAttribute("col", this.column.index);

            // only set tab index if cell selection is enabled
            if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
                this.eGridCell.setAttribute("tabindex", "-1");
            }

            var value: any;
            if (this.valueGetter) {
                value = this.valueGetter();
            }

            // these are the grid styles, don't change between soft refreshes
            this.addClassesToCell();

            this.populateAndStyleGridCell(value);

            this.addCellClickedHandler(value);
            this.addCellDoubleClickedHandler(value);

            this.addCellNavigationHandler();

            this.eGridCell.style.width = _.formatWidth(this.column.actualWidth);
        }

        // called by rowRenderer when user navigates via tab key
        public startEditing() {
            var that = this;
            this.editingCell = true;
            _.removeAllChildren(this.eGridCell);
            var eInput = document.createElement('input');
            eInput.type = 'text';
            _.addCssClass(eInput, 'ag-cell-edit-input');

            if (this.valueGetter) {
                var value = this.valueGetter();
                if (value !== null && value !== undefined) {
                    eInput.value = value;
                }
            }

            eInput.style.width = (this.column.actualWidth - 14) + 'px';
            this.eGridCell.appendChild(eInput);
            eInput.focus();
            eInput.select();

            var blurListener = function () {
                that.stopEditing(eInput, blurListener);
            };

            //stop entering if we loose focus
            eInput.addEventListener("blur", blurListener);

            //stop editing if enter pressed
            eInput.addEventListener('keypress', function (event: any) {
                var key = event.which || event.keyCode;
                // 13 is enter
                if (key == Constants.KEY_ENTER) {
                    that.stopEditing(eInput, blurListener);
                    that.rowRenderer.focusCell(that.eGridCell, that.rowIndex, that.column.index, true);
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

        private stopEditing(eInput: any, blurListener: any) {
            this.editingCell = false;
            var newValue = eInput.value;
            var colDef = this.column.colDef;

            //If we don't remove the blur listener first, we get:
            //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
            eInput.removeEventListener('blur', blurListener);

            _.removeAllChildren(this.eGridCell);

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
            var newValue: any;
            if (this.valueGetter) {
                newValue = this.valueGetter();
            }
            paramsForCallbacks.newValue = newValue;
            if (typeof colDef.cellValueChanged === 'function') {
                colDef.cellValueChanged(paramsForCallbacks);
            }
            if (typeof this.gridOptionsWrapper.getCellValueChanged() === 'function') {
                this.gridOptionsWrapper.getCellValueChanged()(paramsForCallbacks);
            }

            this.populateAndStyleGridCell(newValue);
        }

        private addCellDoubleClickedHandler(value: any) {
            var that = this;
            var colDef = this.column.colDef;
            this.eGridCell.addEventListener('dblclick', function (event: any) {
                if (that.gridOptionsWrapper.getCellDoubleClicked()) {
                    var paramsForGrid = {
                        node: that.node,
                        data: that.node.data,
                        value: value,
                        rowIndex: that.rowIndex,
                        colDef: colDef,
                        event: event,
                        eventSource: this,
                        api: that.gridOptionsWrapper.getApi()
                    };
                    that.gridOptionsWrapper.getCellDoubleClicked()(paramsForGrid);
                }
                if (colDef.cellDoubleClicked) {
                    var paramsForColDef = {
                        node: that.node,
                        data: that.node.data,
                        value: value,
                        rowIndex: that.rowIndex,
                        colDef: colDef,
                        event: event,
                        eventSource: this,
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
                // should change this, so it gets passed params with nice useful values
                return colDef.editable(this.node.data);
            }

            return false;
        }

        private addCellClickedHandler(value: any) {
            var colDef = this.column.colDef;
            var that = this;
            this.eGridCell.addEventListener("click", function (event: any) {
                // we pass false to focusCell, as we don't want the cell to focus
                // also get the browser focus. if we did, then the cellRenderer could
                // have a text field in it, for example, and as the user clicks on the
                // text field, the text field, the focus doesn't get to the text
                // field, instead to goes to the div behind, making it impossible to
                // select the text field.
                that.rowRenderer.focusCell(that.eGridCell, that.rowIndex, that.column.index, false);
                if (that.gridOptionsWrapper.getCellClicked()) {
                    var paramsForGrid = {
                        node: that.node,
                        data: that.node.data,
                        value: value,
                        rowIndex: that.rowIndex,
                        colDef: colDef,
                        event: event,
                        eventSource: this,
                        api: that.gridOptionsWrapper.getApi()
                    };
                    that.gridOptionsWrapper.getCellClicked()(paramsForGrid);
                }
                if (colDef.cellClicked) {
                    var paramsForColDef = {
                        node: that.node,
                        data: that.node.data,
                        value: value,
                        rowIndex: that.rowIndex,
                        colDef: colDef,
                        event: event,
                        eventSource: this,
                        api: that.gridOptionsWrapper.getApi()
                    };
                    colDef.cellClicked(paramsForColDef);
                }
            });
        }

        private populateAndStyleGridCell(value: any) {
            // populate
            this.populateGridCell(value);
            // style
            this.addStylesFromCollDef(value);
            this.addClassesFromCollDef(value);
            this.addClassesFromRules(value);
        }

        private addStylesFromCollDef(value: any) {
            var colDef = this.column.colDef;
            if (colDef.cellStyle) {
                var cssToUse: any;
                if (typeof colDef.cellStyle === 'function') {
                    var cellStyleParams = {
                        value: value,
                        data: this.node.data,
                        node: this.node,
                        colDef: colDef,
                        column: this.column,
                        $scope: this.scope,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    cssToUse = colDef.cellStyle(cellStyleParams);
                } else {
                    cssToUse = colDef.cellStyle;
                }

                if (cssToUse) {
                    _.addStylesToElement(this.eGridCell, cssToUse);
                }
            }
        }

        private addClassesFromCollDef(value: any) {
            var colDef = this.column.colDef;
            if (colDef.cellClass) {
                var classToUse: any;
                if (typeof colDef.cellClass === 'function') {
                    var cellClassParams = {
                        value: value,
                        data: this.node.data,
                        node: this.node,
                        colDef: colDef,
                        $scope: this.scope,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    classToUse = colDef.cellClass(cellClassParams);
                } else {
                    classToUse = colDef.cellClass;
                }

                if (typeof classToUse === 'string') {
                    _.addCssClass(this.eGridCell, classToUse);
                } else if (Array.isArray(classToUse)) {
                    classToUse.forEach(function (cssClassItem: any) {
                        _.addCssClass(this.eGridCell, cssClassItem);
                    });
                }
            }
        }

        private addClassesFromRules(value: any) {
            var colDef = this.column.colDef;
            var classRules = colDef.cellClassRules;
            if (typeof classRules === 'object' && classRules !== null) {

                var params = {
                    value: value,
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

        private populateGridCell(value: any) {
            var eCellWrapper = document.createElement('span');
            _.addCssClass(eCellWrapper, "ag-cell-wrapper");
            this.eGridCell.appendChild(eCellWrapper);

            var colDef = this.column.colDef;
            if (colDef.checkboxSelection) {
                var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(this.node, this.rowIndex);
                eCellWrapper.appendChild(eCheckbox);
            }

            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.eSpanWithValue = document.createElement("span");
            _.addCssClass(this.eSpanWithValue, "ag-cell-value");

            eCellWrapper.appendChild(this.eSpanWithValue);

            var that = this;
            var refreshCellFunction = function () {
                that.refreshCell();
            };

            this.putDataIntoCell(value, refreshCellFunction);
        }

        public isVolatile() {
            return this.column.colDef.volatile;
        }

        public refreshCell() {

            _.removeAllChildren(this.eGridCell);

            var valueGetter = this.createValueGetter();

            var value: any;
            if (valueGetter) {
                value = valueGetter();
            }

            this.populateAndStyleGridCell(value);

            // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
            if (this.gridOptionsWrapper.isAngularCompileRows()) {
                this.$compile(this.eGridCell)(this.scope);
            }
        }

        private putDataIntoCell(value: any, refreshCellFunction: any) {
            // template gets preference, then cellRenderer, then do it ourselves
            var colDef = this.column.colDef;
            if (colDef.template) {
                this.eSpanWithValue.innerHTML = colDef.template;
            } else if (colDef.templateUrl) {
                var template = this.templateService.getTemplate(colDef.templateUrl, refreshCellFunction);
                if (template) {
                    this.eSpanWithValue.innerHTML = template;
                }
            } else if (colDef.cellRenderer) {
                this.useCellRenderer(value, refreshCellFunction);
            } else {
                // if we insert undefined, then it displays as the string 'undefined', ugly!
                if (value !== undefined && value !== null && value !== '') {
                    this.eSpanWithValue.innerHTML = value;
                }
            }
        }

        private useCellRenderer(value: any, refreshCellFunction: any) {
            var colDef = this.column.colDef;
            var rendererParams = {
                value: value,
                valueGetter: this.valueGetter,
                data: this.node.data,
                node: this.node,
                colDef: colDef,
                column: this.column,
                $scope: this.scope,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                refreshCell: refreshCellFunction,
                eGridCell: this.eGridCell
            };
            var cellRenderer: any;
            if (typeof colDef.cellRenderer === 'object' && colDef.cellRenderer !== null) {
                cellRenderer = this.cellRendererMap[colDef.cellRenderer.renderer];
                if (!cellRenderer) {
                    throw 'Cell renderer ' + colDef.cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                }
            } else if (typeof colDef.cellRenderer === 'function') {
                cellRenderer = colDef.cellRenderer;
            } else {
                throw 'Cell Renderer must be String or Function';
            }
            var resultFromRenderer = cellRenderer(rendererParams);
            if (_.isNodeOrElement(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                this.eSpanWithValue.appendChild(resultFromRenderer);
            } else {
                // otherwise assume it was html, so just insert
                this.eSpanWithValue.innerHTML = resultFromRenderer;
            }
        }

        private addClassesToCell() {
            var classes = ['ag-cell', 'ag-cell-no-focus', 'cell-col-' + this.column.index];
            if (this.node.group) {
                if (this.node.footer) {
                    classes.push('ag-footer-cell');
                } else {
                    classes.push('ag-group-cell');
                }
            }
            this.eGridCell.className = classes.join(' ');
        }

    }

}