/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="grid.ts" />
/// <reference path="utils.ts" />
/// <reference path="columnController.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="templateService.ts" />
/// <reference path="selectionController.ts" />
/// <reference path="renderedCell.ts" />

module awk.grid {

    var _ = Utils;

    enum RowType {Normal, GroupSpanningRow};

    export class RenderedRow {

        public pinnedElement: any;
        public bodyElement: any;

        private type: RowType;

        private eVolatileCells = <any> {};
        private eCells = <any> {};
        private renderedCells: RenderedCell[];
        private scope: any;
        private node: any;
        private rowIndex: number;

        private cellRendererMap: {[key: string]: any};

        private gridOptionsWrapper: GridOptionsWrapper;
        private parentScope: any;
        private angularGrid: Grid;
        private columns: Column[];
        private expressionService: ExpressionService;
        private rowRenderer: RowRenderer;
        private editingCell: boolean;
        private selectionRendererFactory: SelectionRendererFactory;
        private $compile: any;
        private templateService: TemplateService;
        private selectionController: SelectionController;

        constructor(gridOptionsWrapper: GridOptionsWrapper,
                    parentScope: any,
                    angularGrid: Grid,
                    columnModel: any,
                    expressionService: ExpressionService,
                    cellRendererMap: {[key: string]: any},
                    selectionRendererFactory: SelectionRendererFactory,
                    $compile: any,
                    templateService: TemplateService,
                    selectionController: SelectionController,
                    rowRenderer: RowRenderer) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.parentScope = parentScope;
            this.angularGrid = angularGrid;
            this.expressionService = expressionService;
            this.columns = columnModel.getDisplayedColumns();
            this.cellRendererMap = cellRendererMap;
            this.selectionRendererFactory = selectionRendererFactory;
            this.$compile = $compile;
            this.templateService = templateService;
            this.selectionController = selectionController;
            this.rowRenderer = rowRenderer;
        }

        public init(node: any, rowIndex: number) {
            this.rowIndex = rowIndex;
            this.node = node;
            this.scope = this.createChildScopeOrNull(node.data);
            this.pinnedElement = this.createRowContainer();
            this.bodyElement = this.createRowContainer();

            // if group item, insert the first row
            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
            var drawGroupRow = node.group && groupHeaderTakesEntireRow;

            if (drawGroupRow) {
                this.drawGroupRow();
                this.type = RowType.GroupSpanningRow;
            } else {
                this.drawNormalRow();
                this.type = RowType.Normal;
            }

            if (this.scope) {
                this.$compile(this.pinnedElement)(this.scope);
                this.$compile(this.bodyElement)(this.scope);
            }
        }

        public getCellForCol(column: Column): any {
            return this.eCells[column.colId];
        }

        public destroy(): void {
            if (this.scope) {
                this.scope.$destroy();
            }
        }

        public isRowDataChanged(rows: any[]): boolean {
            return rows.indexOf(this.node.data) >= 0;
        }

        public isGroup(): boolean {
            return this.node.group === true;
        }

        private drawNormalRow() {
            for (var i = 0; i<this.columns.length; i++) {
                var column = this.columns[i];
                var firstCol = i === 0;
                var data = this.getDataForRow();
                var valueGetter = this.createValueGetter(data, column.colDef);
                this.createCellFromColDef(firstCol, column, valueGetter);
            }
        }

        private drawGroupRow() {
            var firstColumnPinned = this.columns[0].pinned;

            var eGroupRow = this.createGroupSpanningEntireRowCell(false);
            if (firstColumnPinned) {
                this.pinnedElement.appendChild(eGroupRow);

                var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
                this.bodyElement.appendChild(eGroupRowPadding);
            } else {
                this.bodyElement.appendChild(eGroupRow);
            }
        }

        private createGroupSpanningEntireRowCell(padding: any) {
            var eRow: any;
            // padding means we are on the right hand side of a pinned table, ie
            // in the main body.
            if (padding) {
                eRow = document.createElement('span');
            } else {
                var params = {
                    node: this.node,
                    data: this.node.data,
                    rowIndex: this.rowIndex,
                    api: this.gridOptionsWrapper.getApi(),
                    colDef: {
                        cellRenderer: {
                            renderer: 'group',
                            innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
                        }
                    }
                };
                eRow = this.cellRendererMap['group'](params);
            }

            if (this.node.footer) {
                _.addCssClass(eRow, 'ag-footer-cell-entire-row');
            } else {
                _.addCssClass(eRow, 'ag-group-cell-entire-row');
            }

            return eRow;
        }

        private createCell(isFirstColumn: any, column: any, valueGetter: any) {
            var that = this;
            var eGridCell = document.createElement("div");
            eGridCell.setAttribute("col", column.index);

            // only set tab index if cell selection is enabled
            if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
                eGridCell.setAttribute("tabindex", "-1");
            }

            var value: any;
            if (valueGetter) {
                value = valueGetter();
            }

            // these are the grid styles, don't change between soft refreshes
            this.addClassesToCell(column, eGridCell);

            this.populateAndStyleGridCell(valueGetter, value, eGridCell, isFirstColumn, column);

            this.addCellClickedHandler(eGridCell, column, value);
            this.addCellDoubleClickedHandler(eGridCell,  column, value, isFirstColumn, valueGetter);

            this.addCellNavigationHandler(eGridCell, column);

            eGridCell.style.width = _.formatWidth(column.actualWidth);

            // add the 'start editing' call to the chain of editors
/*            this.renderedRowStartEditingListeners[rowIndex][column.colId] = function () {
                if (that.isCellEditable(column.colDef, node)) {
                    that.startEditing(eGridCell, column, isFirstColumn, valueGetter);
                    return true;
                } else {
                    return false;
                }
            };*/

            return eGridCell;
        }

        private populateAndStyleGridCell(valueGetter: any, value: any, eGridCell: any,
                                         isFirstColumn: any, column: any) {
            var colDef = column.colDef;

            // populate
            this.populateGridCell(eGridCell, isFirstColumn, column, value, valueGetter);
            // style
            this.addStylesFromCollDef(column, value, eGridCell);
            this.addClassesFromCollDef(colDef, value, eGridCell);
            this.addClassesFromRules(colDef, eGridCell, value);
        }

        private populateGridCell(eGridCell: any, isFirstColumn: any, column: any, value: any, valueGetter: any) {
            var eCellWrapper = document.createElement('span');
            _.addCssClass(eCellWrapper, "ag-cell-wrapper");
            eGridCell.appendChild(eCellWrapper);

            var colDef = column.colDef;
            if (colDef.checkboxSelection) {
                var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(this.node, this.rowIndex);
                eCellWrapper.appendChild(eCheckbox);
            }

            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            var eSpanWithValue = document.createElement("span");
            _.addCssClass(eSpanWithValue, "ag-cell-value");

            eCellWrapper.appendChild(eSpanWithValue);

            var that = this;
            var refreshCellFunction = function () {
                that.softRefreshCell(eGridCell, isFirstColumn, column);
            };

            this.putDataIntoCell(column, value, valueGetter, eSpanWithValue, eGridCell, refreshCellFunction);
        }

        private softRefreshCell(eGridCell: any, isFirstColumn: any, column: any) {

            _.removeAllChildren(eGridCell);

            var data = this.getDataForRow();
            var valueGetter = this.createValueGetter(data, column.colDef);

            var value: any;
            if (valueGetter) {
                value = valueGetter();
            }

            this.populateAndStyleGridCell(valueGetter, value, eGridCell, isFirstColumn, column);

            // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
            if (this.gridOptionsWrapper.isAngularCompileRows()) {
                this.$compile(eGridCell)(this.scope);
            }
        }

        private putDataIntoCell(column: any, value: any, valueGetter: any, eSpanWithValue: any,
                                eGridCell: any, refreshCellFunction: any) {
            // template gets preference, then cellRenderer, then do it ourselves
            var colDef = column.colDef;
            if (colDef.template) {
                eSpanWithValue.innerHTML = colDef.template;
            } else if (colDef.templateUrl) {
                var template = this.templateService.getTemplate(colDef.templateUrl, refreshCellFunction);
                if (template) {
                    eSpanWithValue.innerHTML = template;
                }
            } else if (colDef.cellRenderer) {
                this.useCellRenderer(column, value, eSpanWithValue, refreshCellFunction, valueGetter, eGridCell);
            } else {
                // if we insert undefined, then it displays as the string 'undefined', ugly!
                if (value !== undefined && value !== null && value !== '') {
                    eSpanWithValue.innerHTML = value;
                }
            }
        }

        private useCellRenderer(column: any, value: any, eSpanWithValue: any,
                        refreshCellFunction: any, valueGetter: any, eGridCell: any) {
            var colDef = column.colDef;
            var rendererParams = {
                value: value,
                valueGetter: valueGetter,
                data: this.node.data,
                node: this.node,
                colDef: colDef,
                column: column,
                $scope: this.scope,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                refreshCell: refreshCellFunction,
                eGridCell: eGridCell
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
                eSpanWithValue.appendChild(resultFromRenderer);
            } else {
                // otherwise assume it was html, so just insert
                eSpanWithValue.innerHTML = resultFromRenderer;
            }
        }

        private addCellDoubleClickedHandler(eGridCell: any, column: any, value: any, isFirstColumn: any, valueGetter: any) {
            var that = this;
            var colDef = column.colDef;
            eGridCell.addEventListener('dblclick', function (event: any) {
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
                if (that.isCellEditable(colDef, that.node)) {
                    that.startEditing(eGridCell, column, isFirstColumn, valueGetter);
                }
            });
        }


        addStylesFromCollDef(column: any, value: any, eGridCell: any) {
            var colDef = column.colDef;
            if (colDef.cellStyle) {
                var cssToUse: any;
                if (typeof colDef.cellStyle === 'function') {
                    var cellStyleParams = {
                        value: value,
                        data: this.node.data,
                        node: this.node,
                        colDef: colDef,
                        column: column,
                        $scope: this.scope,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    cssToUse = colDef.cellStyle(cellStyleParams);
                } else {
                    cssToUse = colDef.cellStyle;
                }

                if (cssToUse) {
                    _.addStylesToElement(eGridCell, cssToUse);
                }
            }
        }

        private addClassesFromCollDef(colDef: any, value: any, eGridCell: any) {
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
                    _.addCssClass(eGridCell, classToUse);
                } else if (Array.isArray(classToUse)) {
                    classToUse.forEach(function (cssClassItem: any) {
                        _.addCssClass(eGridCell, cssClassItem);
                    });
                }
            }
        }

        private addClassesFromRules(colDef: any, eGridCell: any, value: any) {
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
                        _.addCssClass(eGridCell, className);
                    } else {
                        _.removeCssClass(eGridCell, className);
                    }
                }
            }
        }

        // rename this to 'add key event listener
        private addCellNavigationHandler(eGridCell: any, column: any) {
            var that = this;
            eGridCell.addEventListener('keydown', function (event: any) {
                if (that.editingCell) {
                    return;
                }
                // only interested on key presses that are directly on this element, not any children elements. this
                // stops navigation if the user is in, for example, a text field inside the cell, and user hits
                // on of the keys we are looking for.
                if (event.target !== eGridCell) {
                    return;
                }

                var key = event.which || event.keyCode;

                var startNavigation = key === Constants.KEY_DOWN || key === Constants.KEY_UP
                    || key === Constants.KEY_LEFT || key === Constants.KEY_RIGHT;
                if (startNavigation) {
                    event.preventDefault();
                    that.rowRenderer.navigateToNextCell(key, that.rowIndex, column);
                }

/*                var startEdit = key === Constants.KEY_ENTER;
                if (startEdit) {
                    var startEditingFunc = that.renderedRowStartEditingListeners[rowIndex][column.colId];
                    if (startEditingFunc) {
                        var editingStarted = startEditingFunc();
                        if (editingStarted) {
                            // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                            // press, and stops editing immediately, hence giving he user experience that nothing happened
                            event.preventDefault();
                        }
                    }
                }*/

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

        private startEditing(eGridCell: any, column: any, isFirstColumn: any, valueGetter: any) {
            var that = this;
            this.editingCell = true;
            _.removeAllChildren(eGridCell);
            var eInput = document.createElement('input');
            eInput.type = 'text';
            _.addCssClass(eInput, 'ag-cell-edit-input');

            if (valueGetter) {
                var value = valueGetter();
                if (value !== null && value !== undefined) {
                    eInput.value = value;
                }
            }

            eInput.style.width = (column.actualWidth - 14) + 'px';
            eGridCell.appendChild(eInput);
            eInput.focus();
            eInput.select();

            var blurListener = function () {
                that.stopEditing(eGridCell, column, eInput, blurListener, isFirstColumn, valueGetter);
            };

            //stop entering if we loose focus
            eInput.addEventListener("blur", blurListener);

            //stop editing if enter pressed
            eInput.addEventListener('keypress', function (event: any) {
                var key = event.which || event.keyCode;
                // 13 is enter
                if (key == Constants.KEY_ENTER) {
                    that.stopEditing(eGridCell, column, eInput, blurListener, isFirstColumn, valueGetter);
                    that.rowRenderer.focusCell(eGridCell, this.rowIndex, column.index, true);
                }
            });

            // tab key doesn't generate keypress, so need keydown to listen for that
/*            eInput.addEventListener('keydown', function (event: any) {
                var key = event.which || event.keyCode;
                if (key == Constants.KEY_TAB) {
                    that.stopEditing(eGridCell, column, eInput, blurListener, isFirstColumn, valueGetter);
                    that.startEditingNextCell(this.rowIndex, column, event.shiftKey);
                    // we don't want the default tab action, so return false, this stops the event from bubbling
                    event.preventDefault();
                    return false;
                }
            });*/
        }

        private stopEditing(eGridCell: any, column: any,eInput: any, blurListener: any,
                            isFirstColumn: any, valueGetter: any) {
            this.editingCell = false;
            var newValue = eInput.value;
            var colDef = column.colDef;

            //If we don't remove the blur listener first, we get:
            //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
            eInput.removeEventListener('blur', blurListener);

            _.removeAllChildren(eGridCell);

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
            if (valueGetter) {
                newValue = valueGetter();
            }
            paramsForCallbacks.newValue = newValue;
            if (typeof colDef.cellValueChanged === 'function') {
                colDef.cellValueChanged(paramsForCallbacks);
            }
            if (typeof this.gridOptionsWrapper.getCellValueChanged() === 'function') {
                this.gridOptionsWrapper.getCellValueChanged()(paramsForCallbacks);
            }

            this.populateAndStyleGridCell(valueGetter, newValue, eGridCell, isFirstColumn, column);
        }

        private isCellEditable(colDef: any, node: any) {
            if (this.editingCell) {
                return false;
            }

            // never allow editing of groups
            if (node.group) {
                return false;
            }

            // if boolean set, then just use it
            if (typeof colDef.editable === 'boolean') {
                return colDef.editable;
            }

            // if function, then call the function to find out
            if (typeof colDef.editable === 'function') {
                // should change this, so it gets passed params with nice useful values
                return colDef.editable(node.data);
            }

            return false;
        }

        private addCellClickedHandler(eGridCell: any, column: any, value: any) {
            var colDef = column.colDef;
            var that = this;
            eGridCell.addEventListener("click", function (event: any) {
                // we pass false to focusCell, as we don't want the cell to focus
                // also get the browser focus. if we did, then the cellRenderer could
                // have a text field in it, for example, and as the user clicks on the
                // text field, the text field, the focus doesn't get to the text
                // field, instead to goes to the div behind, making it impossible to
                // select the text field.
                that.rowRenderer.focusCell(eGridCell, that.rowIndex, column.index, false);
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

        private addClassesToCell(column: any, eGridCell: any) {
            var classes = ['ag-cell', 'ag-cell-no-focus', 'cell-col-' + column.index];
            if (this.node.group) {
                if (this.node.footer) {
                    classes.push('ag-footer-cell');
                } else {
                    classes.push('ag-group-cell');
                }
            }
            eGridCell.className = classes.join(' ');
        }

        private createCellFromColDef(isFirstColumn: any, column: any, valueGetter: any) {
            var eGridCell = this.createCell(isFirstColumn, column, valueGetter);

            if (column.colDef.volatile) {
                this.eVolatileCells[column.colId] = eGridCell;
            }
            this.eCells[column.colId] = eGridCell;

            if (column.pinned) {
                this.pinnedElement.appendChild(eGridCell);
            } else {
                this.bodyElement.appendChild(eGridCell);
            }
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

        public setMainRowWidth(width: number) {
            this.bodyElement.style.width = width + "px";
        }

        private createChildScopeOrNull(data: any) {
            if (this.gridOptionsWrapper.isAngularCompileRows()) {
                var newChildScope = this.parentScope.$new();
                newChildScope.data = data;
                return newChildScope;
            } else {
                return null;
            }
        }

        private createRowContainer() {
            var eRow = document.createElement("div");

            this.addClassesToRow(eRow);

            eRow.setAttribute('row', this.rowIndex.toString());

            // if showing scrolls, position on the container
            if (!this.gridOptionsWrapper.isDontUseScrolls()) {
                eRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
            }
            eRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";

            if (this.gridOptionsWrapper.getRowStyle()) {
                var cssToUse: any;
                var rowStyle = this.gridOptionsWrapper.getRowStyle();
                if (typeof rowStyle === 'function') {
                    var params = {
                        data: this.node.data,
                        node: this.node,
                        api: this.gridOptionsWrapper.getApi(),
                        context: this.gridOptionsWrapper.getContext(),
                        $scope: this.scope
                    };
                    cssToUse = rowStyle(params);
                } else {
                    cssToUse = rowStyle;
                }

                if (cssToUse) {
                    Object.keys(cssToUse).forEach(function (key: any) {
                        eRow.style[key] = cssToUse[key];
                    });
                }
            }

            var that = this;
            eRow.addEventListener("click", function (event) {
                that.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), that.node)
            });

            return eRow;
        }

        private createValueGetter(data: any, colDef: any) {
            var that = this;
            return function () {
                var api = that.gridOptionsWrapper.getApi();
                var context = that.gridOptionsWrapper.getContext();
                return _.getValue(that.expressionService, data, colDef, that.node, api, context);
            };
        }

        public getRowNode(): any {
            return this.node;
        }

        public getRowIndex(): any {
            return this.rowIndex;
        }

        private addClassesToRow(eRow: any) {
            var classesList = ["ag-row"];
            classesList.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");

            if (this.node.group) {
                // if a group, put the level of the group in
                classesList.push("ag-row-level-" + this.node.level);
            } else {
                // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
                if (this.node.parent) {
                    classesList.push("ag-row-level-" + (this.node.parent.level + 1));
                } else {
                    classesList.push("ag-row-level-0");
                }
            }
            if (this.node.group) {
                classesList.push("ag-row-group");
            }
            if (this.node.group && !this.node.footer && this.node.expanded) {
                classesList.push("ag-row-group-expanded");
            }
            if (this.node.group && !this.node.footer && !this.node.expanded) {
                // opposite of expanded is contracted according to the internet.
                classesList.push("ag-row-group-contracted");
            }
            if (this.node.group && this.node.footer) {
                classesList.push("ag-row-footer");
            }

            // add in extra classes provided by the config
            if (this.gridOptionsWrapper.getRowClass()) {
                var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();

                var classToUse: any;
                if (typeof gridOptionsRowClass === 'function') {
                    var params = {
                        node: this.node,
                        data: this.node.data,
                        rowIndex: this.rowIndex,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    classToUse = gridOptionsRowClass(params);
                } else {
                    classToUse = gridOptionsRowClass;
                }

                if (classToUse) {
                    if (typeof classToUse === 'string') {
                        classesList.push(classToUse);
                    } else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (classItem: any) {
                            classesList.push(classItem);
                        });
                    }
                }
            }

            var classes = classesList.join(" ");

            eRow.className = classes;
        }
    }

}