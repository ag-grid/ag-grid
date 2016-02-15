/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var renderedCell_1 = require("./renderedCell");
var column_1 = require("../entities/column");
var vHtmlElement_1 = require("../virtualDom/vHtmlElement");
var events_1 = require("../events");
var RenderedRow = (function () {
    function RenderedRow(gridOptionsWrapper, valueService, parentScope, angularGrid, columnController, expressionService, cellRendererMap, selectionRendererFactory, $compile, templateService, selectionController, rowRenderer, eBodyContainer, ePinnedLeftContainer, ePinnedRightContainer, node, rowIndex, eventService) {
        this.renderedCells = {};
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
        this.ePinnedLeftContainer = ePinnedLeftContainer;
        this.ePinnedRightContainer = ePinnedRightContainer;
        this.pinningLeft = columnController.isPinningLeft();
        this.pinningRight = columnController.isPinningRight();
        this.eventService = eventService;
        var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
        var rowIsHeaderThatSpans = node.group && groupHeaderTakesEntireRow;
        this.vBodyRow = this.createRowContainer();
        if (this.pinningLeft) {
            this.vPinnedLeftRow = this.createRowContainer();
        }
        if (this.pinningRight) {
            this.vPinnedRightRow = this.createRowContainer();
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
        }
        else if (this.node.floatingTop) {
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
            var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.node);
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
            var topPx = this.node.rowTop + "px";
            this.vBodyRow.style.top = topPx;
            if (this.pinningLeft) {
                this.vPinnedLeftRow.style.top = topPx;
            }
            if (this.pinningRight) {
                this.vPinnedRightRow.style.top = topPx;
            }
        }
        var heightPx = this.node.rowHeight + 'px';
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
    }
    RenderedRow.prototype.onRowSelected = function (selected) {
        utils_1.default.iterateObject(this.renderedCells, function (key, renderedCell) {
            renderedCell.setSelected(selected);
        });
    };
    RenderedRow.prototype.softRefresh = function () {
        utils_1.default.iterateObject(this.renderedCells, function (key, renderedCell) {
            if (renderedCell.isVolatile()) {
                renderedCell.refreshCell();
            }
        });
    };
    RenderedRow.prototype.getRenderedCellForColumn = function (column) {
        return this.renderedCells[column.getColId()];
    };
    RenderedRow.prototype.getCellForCol = function (column) {
        var renderedCell = this.renderedCells[column.getColId()];
        if (renderedCell) {
            return renderedCell.getVGridCell().getElement();
        }
        else {
            return null;
        }
    };
    RenderedRow.prototype.destroy = function () {
        this.destroyScope();
        if (this.pinningLeft) {
            this.ePinnedLeftContainer.removeChild(this.vPinnedLeftRow.getElement());
        }
        if (this.pinningRight) {
            this.ePinnedRightContainer.removeChild(this.vPinnedRightRow.getElement());
        }
        this.eBodyContainer.removeChild(this.vBodyRow.getElement());
        utils_1.default.iterateObject(this.renderedCells, function (key, renderedCell) {
            renderedCell.destroy();
        });
    };
    RenderedRow.prototype.destroyScope = function () {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    };
    RenderedRow.prototype.isDataInList = function (rows) {
        return rows.indexOf(this.node.data) >= 0;
    };
    RenderedRow.prototype.isNodeInList = function (nodes) {
        return nodes.indexOf(this.node) >= 0;
    };
    RenderedRow.prototype.isGroup = function () {
        return this.node.group === true;
    };
    RenderedRow.prototype.drawNormalRow = function () {
        var columns = this.columnController.getAllDisplayedColumns();
        var firstRightPinnedColIndex = this.columnController.getFirstRightPinnedColIndex();
        for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var column = columns[colIndex];
            var firstRightPinnedCol = colIndex === firstRightPinnedColIndex;
            var renderedCell = new renderedCell_1.default(firstRightPinnedCol, column, this.$compile, this.rowRenderer, this.gridOptionsWrapper, this.expressionService, this.selectionRendererFactory, this.selectionController, this.templateService, this.cellRendererMap, this.node, this.rowIndex, colIndex, this.scope, this.columnController, this.valueService, this.eventService);
            var vGridCell = renderedCell.getVGridCell();
            if (column.getPinned() === column_1.default.PINNED_LEFT) {
                this.vPinnedLeftRow.appendChild(vGridCell);
            }
            else if (column.getPinned() === column_1.default.PINNED_RIGHT) {
                this.vPinnedRightRow.appendChild(vGridCell);
            }
            else {
                this.vBodyRow.appendChild(vGridCell);
            }
            this.renderedCells[column.getColId()] = renderedCell;
        }
    };
    RenderedRow.prototype.bindVirtualElement = function (vElement) {
        var html = vElement.toHtmlString();
        var element = utils_1.default.loadTemplate(html);
        vElement.elementAttached(element);
    };
    RenderedRow.prototype.createGroupRow = function () {
        var eGroupRow = this.createGroupSpanningEntireRowCell(false);
        if (this.pinningLeft) {
            this.vPinnedLeftRow.appendChild(eGroupRow);
            var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
            this.vBodyRow.appendChild(eGroupRowPadding);
        }
        else {
            this.vBodyRow.appendChild(eGroupRow);
        }
        if (this.pinningRight) {
            var ePinnedRightPadding = this.createGroupSpanningEntireRowCell(true);
            this.vPinnedRightRow.appendChild(ePinnedRightPadding);
        }
    };
    RenderedRow.prototype.createGroupSpanningEntireRowCell = function (padding) {
        var eRow;
        // padding means we are on the right hand side of a pinned table, ie
        // in the main body.
        if (padding) {
            eRow = document.createElement('span');
        }
        else {
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
            // start duplicated code
            var actualCellRenderer;
            if (typeof rowCellRenderer === 'object' && rowCellRenderer !== null) {
                var cellRendererObj = rowCellRenderer;
                actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                if (!actualCellRenderer) {
                    throw 'Cell renderer ' + rowCellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                }
            }
            else if (typeof rowCellRenderer === 'function') {
                actualCellRenderer = rowCellRenderer;
            }
            else {
                throw 'Cell Renderer must be String or Function';
            }
            var resultFromRenderer = actualCellRenderer(params);
            // end duplicated code
            if (utils_1.default.isNodeOrElement(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                eRow = resultFromRenderer;
            }
            else {
                // otherwise assume it was html, so just insert
                eRow = utils_1.default.loadTemplate(resultFromRenderer);
            }
        }
        if (this.node.footer) {
            utils_1.default.addCssClass(eRow, 'ag-footer-cell-entire-row');
        }
        else {
            utils_1.default.addCssClass(eRow, 'ag-group-cell-entire-row');
        }
        return eRow;
    };
    //public setMainRowWidth(width: number) {
    //    this.vBodyRow.addStyles({width: width + "px"});
    //}
    RenderedRow.prototype.createChildScopeOrNull = function (data) {
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            var newChildScope = this.parentScope.$new();
            newChildScope.data = data;
            return newChildScope;
        }
        else {
            return null;
        }
    };
    RenderedRow.prototype.addDynamicStyles = function () {
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (rowStyle) {
            if (typeof rowStyle === 'function') {
                console.log('ag-Grid: rowStyle should be a string or an array, not be a function, use getRowStyle() instead');
            }
            else {
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
                data: this.node.data,
                node: this.node,
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
    };
    RenderedRow.prototype.createParams = function () {
        var params = {
            node: this.node,
            data: this.node.data,
            rowIndex: this.rowIndex,
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };
        return params;
    };
    RenderedRow.prototype.createEvent = function (event, eventSource) {
        var agEvent = this.createParams();
        agEvent.event = event;
        agEvent.eventSource = eventSource;
        return agEvent;
    };
    RenderedRow.prototype.createRowContainer = function () {
        var vRow = new vHtmlElement_1.default('div');
        var that = this;
        vRow.addEventListener("click", function (event) {
            var agEvent = that.createEvent(event, this);
            that.eventService.dispatchEvent(events_1.Events.EVENT_ROW_CLICKED, agEvent);
            // ctrlKey for windows, metaKey for Apple
            var multiSelectKeyPressed = event.ctrlKey || event.metaKey;
            that.angularGrid.onRowClicked(multiSelectKeyPressed, that.rowIndex, that.node);
        });
        vRow.addEventListener("dblclick", function (event) {
            var agEvent = that.createEvent(event, this);
            that.eventService.dispatchEvent(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
        });
        return vRow;
    };
    RenderedRow.prototype.getRowNode = function () {
        return this.node;
    };
    RenderedRow.prototype.getRowIndex = function () {
        return this.rowIndex;
    };
    RenderedRow.prototype.refreshCells = function (colIds) {
        if (!colIds) {
            return;
        }
        var columnsToRefresh = this.columnController.getColumns(colIds);
        utils_1.default.iterateObject(this.renderedCells, function (key, renderedCell) {
            var colForCel = renderedCell.getColumn();
            if (columnsToRefresh.indexOf(colForCel) >= 0) {
                renderedCell.refreshCell();
            }
        });
    };
    RenderedRow.prototype.addDynamicClasses = function () {
        var classes = [];
        classes.push('ag-row');
        classes.push('ag-row-no-focus');
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
        }
        else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (this.node.parent) {
                classes.push("ag-row-level-" + (this.node.parent.level + 1));
            }
            else {
                classes.push("ag-row-level-0");
            }
        }
        // add in extra classes provided by the config
        var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
        if (gridOptionsRowClass) {
            if (typeof gridOptionsRowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
            }
            else {
                if (typeof gridOptionsRowClass === 'string') {
                    classes.push(gridOptionsRowClass);
                }
                else if (Array.isArray(gridOptionsRowClass)) {
                    gridOptionsRowClass.forEach(function (classItem) {
                        classes.push(classItem);
                    });
                }
            }
        }
        var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
        if (gridOptionsRowClassFunc) {
            var params = {
                node: this.node,
                data: this.node.data,
                rowIndex: this.rowIndex,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi()
            };
            var classToUseFromFunc = gridOptionsRowClassFunc(params);
            if (classToUseFromFunc) {
                if (typeof classToUseFromFunc === 'string') {
                    classes.push(classToUseFromFunc);
                }
                else if (Array.isArray(classToUseFromFunc)) {
                    classToUseFromFunc.forEach(function (classItem) {
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
    };
    return RenderedRow;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RenderedRow;
