/// <reference path="../gridOptionsWrapper.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../columnController.ts" />
/// <reference path="../expressionService.ts" />
/// <reference path="rowRenderer.ts" />
/// <reference path="../templateService.ts" />
/// <reference path="../selectionController.ts" />
/// <reference path="renderedCell.ts" />

module awk.grid {

    var _ = Utils;

    export class RenderedRow {

        public ePinnedRow: any;
        public eBodyRow: any;

        private dynamicClasses: string[];
        private fixedClasses: string[];

        private currentStyles: any;
        private dynamicStyles: any;

        private renderedCells: {[key: number]: RenderedCell} = {};
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
        private selectionRendererFactory: SelectionRendererFactory;
        private $compile: any;
        private templateService: TemplateService;
        private selectionController: SelectionController;
        private pinning: boolean;
        private eBodyContainer: HTMLElement;
        private ePinnedContainer: HTMLElement;

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
                    rowRenderer: RowRenderer,
                    eBodyContainer: HTMLElement,
                    ePinnedContainer: HTMLElement,
                    node: any,
                    rowIndex: number) {
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
            this.pinning = this.columns[0].pinned;
            this.eBodyContainer = eBodyContainer;
            this.ePinnedContainer = ePinnedContainer;

            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
            var rowIsHeaderThatSpans = node.group && groupHeaderTakesEntireRow;

            this.eBodyRow = this.createRowContainer();
            this.eBodyContainer.appendChild(this.eBodyRow);
            if (this.pinning) {
                this.ePinnedRow = this.createRowContainer();
                this.ePinnedContainer.appendChild(this.ePinnedRow);
            }
            this.fixedClasses = [];
            this.addFixedClassesToRow();

            this.rowIndex = rowIndex;
            this.node = node;
            this.destroyScope();
            this.scope = this.createChildScopeOrNull(node.data);

            if (!rowIsHeaderThatSpans) {
                this.drawNormalRow();
            }

            this.dynamicStyles = {};
            this.dynamicClasses = [];

            this.addDynamicStyles();
            this.addDynamicClasses();

            this.eBodyRow.setAttribute('row', this.rowIndex.toString());
            if (this.pinning) {
                this.ePinnedRow.setAttribute('row', this.rowIndex.toString());
            }

            // if showing scrolls, position on the container
            if (!this.gridOptionsWrapper.isDontUseScrolls()) {
                this.eBodyRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
                if (this.pinning) {
                    this.ePinnedRow.style.top = (this.gridOptionsWrapper.getRowHeight() * this.rowIndex) + "px";
                }
            }
            this.eBodyRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";
            if (this.pinning) {
                this.ePinnedRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";
            }

            // if group item, insert the first row
            if (rowIsHeaderThatSpans) {
                this.bindGroupRow();
            }

            this.applyStyles();
            this.applyClasses();

            if (this.scope) {
                this.$compile(this.eBodyRow)(this.scope);
                if (this.pinning) {
                    this.$compile(this.ePinnedRow)(this.scope);
                }
            }
        }

        private applyClasses(): void {
            this.eBodyRow.className = this.fixedClasses.join(' ') + ' ' + this.dynamicClasses.join(' ');
            if (this.pinning) {
                this.ePinnedRow.className = this.fixedClasses.join(' ') + ' ' + this.dynamicClasses.join(' ');
            }
        }

        private applyStyles(): void {

            // set the styles
            if (this.dynamicStyles) {
                _.iterateObject(this.dynamicStyles, (key: string, value: any) => {
                    this.eBodyRow.style[key] = value;
                    if (this.pinning) {
                        this.ePinnedRow.style[key] = value;
                    }
                });
            }

            // remove old styles. go through the old list, and if not in the new
            // list, the style was applied before, but not now, so should be removed
            if (this.currentStyles) {
                _.iterateObject(this.currentStyles, (key: string, value: any) => {
                    if (!this.dynamicStyles || !this.dynamicStyles[key]) {
                        this.eBodyRow.style[key] = null;
                        if (this.pinning) {
                            this.ePinnedRow.style[key] = null;
                        }
                    }
                });
            }

            this.currentStyles = this.dynamicStyles;
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

        public getRenderedCellForColumn(column: Column): any {
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
                this.ePinnedContainer.removeChild(this.ePinnedRow);
            }
            this.eBodyContainer.removeChild(this.eBodyRow);
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
            for (var i = 0; i<this.columns.length; i++) {
                var column = this.columns[i];
                var firstCol = i === 0;

                var renderedCell = new RenderedCell(firstCol, column,
                    this.$compile, this.rowRenderer, this.gridOptionsWrapper, this.expressionService,
                    this.selectionRendererFactory, this.selectionController, this.templateService,
                    this.cellRendererMap, this.node, this.rowIndex, this.scope);

                var vGridCell = renderedCell.getVGridCell();
                var eGridCell = this.createRealElementFromVirtual(vGridCell);

                if (column.pinned) {
                    this.ePinnedRow.appendChild(eGridCell);
                } else {
                    this.eBodyRow.appendChild(eGridCell);
                }

                this.renderedCells[column.index] = renderedCell;
            }
        }

        private createRealElementFromVirtual(vElement: awk.vdom.VHtmlElement): Element {
            var html = vElement.toHtmlString();
            var element: Element = <Element> _.loadTemplate(html);
            vElement.elementAttached(element);
            return element;
        }

        private bindGroupRow() {
            var eGroupRow = this.createGroupSpanningEntireRowCell(false);
            _.removeAllChildren(this.eBodyRow);
            if (this.pinning) {
                _.removeAllChildren(this.ePinnedRow);
            }

            if (this.pinning) {
                this.ePinnedRow.appendChild(eGroupRow);
                var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
                this.eBodyRow.appendChild(eGroupRowPadding);
            } else {
                this.eBodyRow.appendChild(eGroupRow);
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

        public setMainRowWidth(width: number) {
            this.eBodyRow.style.width = width + "px";
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

                if (cssToUse) {
                    Object.keys(cssToUse).forEach(function (key: any) {
                        _.assign(this.dynamicStyles, cssToUse);
                    });
                }
            }
        }

        private createRowContainer() {
            var eRow = document.createElement("div");
            var that = this;
            eRow.addEventListener("click", function (event) {
                that.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), that.node)
            });

            return eRow;
        }

        public getRowNode(): any {
            return this.node;
        }

        public getRowIndex(): any {
            return this.rowIndex;
        }

        private addDynamicClasses() {
            this.dynamicClasses.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");

            if (this.selectionController.isNodeSelected(this.node)) {
                this.dynamicClasses.push("ag-row-selected");
            }

            if (this.node.group) {
                this.dynamicClasses.push("ag-row-group");
                // if a group, put the level of the group in
                this.dynamicClasses.push("ag-row-level-" + this.node.level);

                if (!this.node.footer && this.node.expanded) {
                    this.dynamicClasses.push("ag-row-group-expanded");
                }
                if (!this.node.footer && !this.node.expanded) {
                    // opposite of expanded is contracted according to the internet.
                    this.dynamicClasses.push("ag-row-group-contracted");
                }
                if (this.node.footer) {
                    this.dynamicClasses.push("ag-row-footer");
                }
            } else {
                // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
                if (this.node.parent) {
                    this.dynamicClasses.push("ag-row-level-" + (this.node.parent.level + 1));
                } else {
                    this.dynamicClasses.push("ag-row-level-0");
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
                        this.dynamicClasses.push(classToUse);
                    } else if (Array.isArray(classToUse)) {
                        classToUse.forEach(function (classItem: any) {
                            this.dynamicClasses.push(classItem);
                        });
                    }
                }
            }
        }

        private addFixedClassesToRow() {
            this.fixedClasses.push("ag-row");
        }
    }

}