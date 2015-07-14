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
            this.pinning = this.columns[0].pinned;
        }

        public init(node: any, rowIndex: number) {
            this.rowIndex = rowIndex;
            this.node = node;
            this.scope = this.createChildScopeOrNull(node.data);
            this.bodyElement = this.createRowContainer();
            if (this.pinning) {
                this.pinnedElement = this.createRowContainer();
            }

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
                this.$compile(this.bodyElement)(this.scope);
                if (this.pinning) {
                    this.$compile(this.pinnedElement)(this.scope);
                }
            }
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
                return renderedCell.getGridCell();
            } else {
                return null;
            }
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

                var renderedCell = new RenderedCell(firstCol, column, this.node, this.rowIndex, this.scope,
                    this.$compile, this.rowRenderer, this.gridOptionsWrapper, this.expressionService,
                    this.selectionRendererFactory, this.selectionController, this.templateService,
                    this.cellRendererMap);

                var eGridCell = renderedCell.getGridCell();
                if (column.pinned) {
                    this.pinnedElement.appendChild(eGridCell);
                } else {
                    this.bodyElement.appendChild(eGridCell);
                }

                this.renderedCells[column.index] = renderedCell;
            }
        }

        private drawGroupRow() {
            var eGroupRow = this.createGroupSpanningEntireRowCell(false);
            if (this.pinning) {
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