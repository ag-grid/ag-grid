/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../columnController.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="renderedCell.ts" />
/// <reference path="../virtualDom/vHtmlElement.ts" />

module awk.grid {

    var _ = Utils;

    export class RenderedRow {

        public vPinnedRow: any;
        public vBodyRow: any;

        private renderedCells: {[key: number]: RenderedCell} = {};
        private scope: any;
        private node: any;
        private rowIndex: number;

        private cellRendererMap: {[key: string]: any};

        private gridOptionsWrapper: GridOptionsWrapper;
        private parentScope: any;
        private angularGrid: Grid;
        private columnController: ColumnController;
        private expressionService: ExpressionService;
        private rowRenderer: RowRenderer;
        private selectionRendererFactory: SelectionRendererFactory;
        private $compile: any;
        private templateService: TemplateService;
        private selectionController: SelectionController;
        private pinning: boolean;
        private eBodyContainer: HTMLElement;
        private ePinnedContainer: HTMLElement;
        private valueService: ValueService;

        constructor(gridOptionsWrapper: GridOptionsWrapper,
                    valueService: ValueService,
                    parentScope: any,
                    angularGrid: Grid,
                    columnController: ColumnController,
                    expressionService: ExpressionService,
                    cellRendererMap: {[key: string]: any},
                    selectionRendererFactory: SelectionRendererFactory,
                    $compile: any,
                    templateService: TemplateService,
                    selectionController: SelectionController,
                    rowRenderer: RowRenderer,
                    eBodyContainer: HTMLElement,
                    ePinnedContainer: HTMLElement,
                    node: any,
                    rowIndex: number) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.valueService = valueService;
            this.parentScope = parentScope;
            this.angularGrid = angularGrid;
            this.expressionService = expressionService;
            this.columnController = columnController;
            this.cellRendererMap = cellRendererMap;
            this.selectionRendererFactory = selectionRendererFactory;
            this.$compile = $compile;
            this.templateService = templateService;
            this.selectionController = selectionController;
            this.rowRenderer = rowRenderer;
            this.eBodyContainer = eBodyContainer;
            this.ePinnedContainer = ePinnedContainer;
            this.pinning = columnController.isPinning();

            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
            var rowIsHeaderThatSpans = node.group && groupHeaderTakesEntireRow;

            this.vBodyRow = this.createRowContainer();
            if (this.pinning) {
                this.vPinnedRow = this.createRowContainer();
            }

            this.rowIndex = rowIndex;
            this.node = node;
            this.scope = this.createChildScopeOrNull(node.data);

            if (!rowIsHeaderThatSpans) {
                this.drawNormalRow();
            }

            this.addDynamicStyles();
            this.addDynamicClasses();

            var rowStr = this.rowIndex.toString();
            if (this.node.floatingBottom) {
                rowStr = 'fb-' + rowStr;
            } else if (this.node.floatingTop) {
                rowStr = 'ft-' + rowStr;
            }

            this.vBodyRow.setAttribute('row', rowStr);
            if (this.pinning) {
                this.vPinnedRow.setAttribute('row', rowStr);
            }

            // if showing scrolls, position on the container
            if (!this.gridOptionsWrapper.isDontUseScrolls()) {
                this.vBodyRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
                if (this.pinning) {
                    this.vPinnedRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
                }
            }
            this.vBodyRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";
            if (this.pinning) {
                this.vPinnedRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";
            }

            // if group item, insert the first row
            if (rowIsHeaderThatSpans) {
                this.createGroupRow();
            }

            this.bindVirtualElement(this.vBodyRow);
            if (this.pinning) {
                this.bindVirtualElement(this.vPinnedRow);
            }

            if (this.scope) {
                this.$compile(this.vBodyRow.getElement())(this.scope);
                if (this.pinning) {
                    this.$compile(this.vPinnedRow.getElement())(this.scope);
                }
            }

            this.eBodyContainer.appendChild(this.vBodyRow.getElement());
            if (this.pinning) {
                this.ePinnedContainer.appendChild(this.vPinnedRow.getElement());
            }
        }

        public onRowSelected(selected: boolean): void {
            _.iterateObject(this.renderedCells, (key: any, renderedCell: RenderedCell)=> {
                renderedCell.setSelected(selected);
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
            return this.renderedCells[column.index];
        }

        public getCellForCol(column: Column): any {
            var renderedCell = this.renderedCells[column.index];
            if (renderedCell) {
                return renderedCell.getVGridCell().getElement();
            } else {
                return null;
            }
        }

        public destroy(): void {
            this.destroyScope();

            if (this.pinning) {
                this.ePinnedContainer.removeChild(this.vPinnedRow.getElement());
            }
            this.eBodyContainer.removeChild(this.vBodyRow.getElement());
        }

        private destroyScope(): void {
            if (this.scope) {
                this.scope.$destroy();
                this.scope = null;
            }
        }

        public isDataInList(rows: any[]): boolean {
            return rows.indexOf(this.node.data) >= 0;
        }

        public isGroup(): boolean {
            return this.node.group === true;
        }

        private drawNormalRow() {
            var columns = this.columnController.getDisplayedColumns();
            for (var i = 0; i<columns.length; i++) {
                var column = columns[i];
                var firstCol = i === 0;

                var renderedCell = new RenderedCell(firstCol, column,
                    this.$compile, this.rowRenderer, this.gridOptionsWrapper, this.expressionService,
                    this.selectionRendererFactory, this.selectionController, this.templateService,
                    this.cellRendererMap, this.node, this.rowIndex, this.scope, this.columnController,
                    this.valueService);

                var vGridCell = renderedCell.getVGridCell();

                if (column.pinned) {
                    this.vPinnedRow.appendChild(vGridCell);
                } else {
                    this.vBodyRow.appendChild(vGridCell);
                }

                this.renderedCells[column.index] = renderedCell;
            }
        }

        private bindVirtualElement(vElement: awk.vdom.VHtmlElement): void {
            var html = vElement.toHtmlString();
            var element: Element = <Element> _.loadTemplate(html);
            vElement.elementAttached(element);
        }

        private createGroupRow() {
            var eGroupRow = this.createGroupSpanningEntireRowCell(false);

            if (this.pinning) {
                this.vPinnedRow.appendChild(eGroupRow);
                var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
                this.vBodyRow.appendChild(eGroupRowPadding);
            } else {
                this.vBodyRow.appendChild(eGroupRow);
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
                    node: this.node,
                    data: this.node.data,
                    rowIndex: this.rowIndex,
                    api: this.gridOptionsWrapper.getApi(),
                    colDef: {
                        cellRenderer: rowCellRenderer
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

        public setMainRowWidth(width: number) {
            this.vBodyRow.addStyles({width: width + "px"});
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

        private addDynamicStyles() {
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

                this.vBodyRow.addStyles(cssToUse);
                if (this.pinning) {
                    this.vPinnedRow.addStyles(cssToUse);
                }
            }
        }

        private createRowContainer() {
            var vRow = new awk.vdom.VHtmlElement('div');
            var that = this;
            vRow.addEventListener("click", function (event) {
                that.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), that.node)
            });

            return vRow;
        }

        public getRowNode(): any {
            return this.node;
        }

        public getRowIndex(): any {
            return this.rowIndex;
        }

        private addDynamicClasses() {
            var classes: string[] = [];

            classes.push('ag-row');

            classes.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");

            if (this.selectionController.isNodeSelected(this.node)) {
                classes.push("ag-row-selected");
            }

            if (this.node.group) {
                classes.push("ag-row-group");
                // if a group, put the level of the group in
                classes.push("ag-row-level-" + this.node.level);

                if (!this.node.footer && this.node.expanded) {
                    classes.push("ag-row-group-expanded");
                }
                if (!this.node.footer && !this.node.expanded) {
                    // opposite of expanded is contracted according to the internet.
                    classes.push("ag-row-group-contracted");
                }
                if (this.node.footer) {
                    classes.push("ag-row-footer");
                }
            } else {
                // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
                if (this.node.parent) {
                    classes.push("ag-row-level-" + (this.node.parent.level + 1));
                } else {
                    classes.push("ag-row-level-0");
                }
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
                        classes.push(classToUse);
                    } else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (classItem: any) {
                            classes.push(classItem);
                        });
                    }
                }
            }

            this.vBodyRow.addClasses(classes);
            if (this.pinning) {
                this.vPinnedRow.addClasses(classes);
            }
        }
    }

}