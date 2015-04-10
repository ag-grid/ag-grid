define(["./constants","./svgFactory","./utils"], function(constants, SvgFactory, utils) {

    var svgFactory = new SvgFactory();

    function RowRenderer(gridOptions, rowModel, colModel, gridOptionsWrapper, eGrid,
                         angularGrid, selectionRendererFactory, $compile, $scope,
                         selectionController) {
        this.gridOptions = gridOptions;
        this.rowModel = rowModel;
        this.colModel = colModel;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.selectionRendererFactory = selectionRendererFactory;
        this.findAllElements(eGrid);
        this.$compile = $compile;
        this.$scope = $scope;
        this.selectionController = selectionController;

        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom. each row object has:
        // [scope, bodyRow, pinnedRow, rowData]
        this.renderedRows = {};

        this.editingCell = false; //gets set to true when editing a cell
    }

    RowRenderer.prototype.setMainRowWidths = function() {
        var mainRowWidth = this.colModel.getTotalUnpinnedColWidth() + "px";

        var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
        for (var i = 0; i<unpinnedRows.length; i++) {
            unpinnedRows[i].style.width = mainRowWidth;
        }
    };

    RowRenderer.prototype.findAllElements = function (eGrid) {
        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        } else {
            this.eBodyContainer = eGrid.querySelector(".ag-body-container");
            this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
            this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
        }
    };

    RowRenderer.prototype.refreshView = function() {
        if (!this.gridOptionsWrapper.isDontUseScrolls()) {
            var rowCount = this.rowModel.getRowsAfterMap().length;
            var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
            this.eBodyContainer.style.height = containerHeight + "px";
            this.ePinnedColsContainer.style.height = containerHeight + "px";
        }

        this.refreshAllVirtualRows();
    };

    RowRenderer.prototype.rowDataChanged = function(rows) {
        // we only need to be worried about rendered rows, as this method is
        // called to whats rendered. if the row isn't rendered, we don't care
        var indexesToRemove = [];
        var renderedRows = this.renderedRows;
        Object.keys(renderedRows).forEach(function (key) {
            var renderedRow = renderedRows[key];
            // see if the rendered row is in the list of rows we have to update
            var rowNeedsUpdating = rows.indexOf(renderedRow.node.data) >= 0;
            if (rowNeedsUpdating) {
                indexesToRemove.push(renderedRow.rowIndex);
            }
        });
        // remove the rows
        this.removeVirtualRows(indexesToRemove);
        // add draw them again
        this.drawVirtualRows();
    };

    RowRenderer.prototype.refreshAllVirtualRows = function () {
        //remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRows(rowsToRemove);

        //add in new rows
        this.drawVirtualRows();
    };

    // public - removes the group rows and then redraws them again
    RowRenderer.prototype.refreshGroupRows = function (rowsToRemove) {
        // fine all the group rows
        var rowsToRemove = [];
        var that = this;
        Object.keys(this.renderedRows).forEach(function (key) {
            var renderedRow = that.renderedRows[key];
            var node = renderedRow.node;
            if (node.group) {
                rowsToRemove.push(key);
            }
        });
        // remove the rows
        this.removeVirtualRows(rowsToRemove);
        // and draw them back again
        this.ensureRowsRendered();
    };

    //takes array of row id's
    RowRenderer.prototype.removeVirtualRows = function (rowsToRemove) {
        var that = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var renderedRow = that.renderedRows[indexToRemove];
            if (renderedRow.pinnedElement && that.ePinnedColsContainer) {
                that.ePinnedColsContainer.removeChild(renderedRow.pinnedElement);
            }

            if (renderedRow.bodyElement) {
                that.eBodyContainer.removeChild(renderedRow.bodyElement);
            }

            if (renderedRow.scope) {
                renderedRow.scope.$destroy();
            }

            if (that.gridOptionsWrapper.getVirtualRowRemoved()) {
                that.gridOptionsWrapper.getVirtualRowRemoved()(renderedRow.data, indexToRemove);
            }
            that.angularGrid.onVirtualRowRemoved(indexToRemove);

            delete that.renderedRows[indexToRemove];
        });
    };

    RowRenderer.prototype.drawVirtualRows = function() {
        var first;
        var last;

        var rowCount = this.rowModel.getRowsAfterMap().length;

        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            first = 0;
            var rowsAfterMap = this.rowModel.getRowsAfterMap();
            if (rowsAfterMap) {
                last = rowCount - 1;
            } else {
                last = 0;
            }
        } else {
            var topPixel = this.eBodyViewport.scrollTop;
            var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

            first = Math.floor(topPixel / this.gridOptionsWrapper.getRowHeight());
            last = Math.floor(bottomPixel / this.gridOptionsWrapper.getRowHeight());

            //add in buffer
            first = first - constants.ROW_BUFFER_SIZE;
            last = last + constants.ROW_BUFFER_SIZE;

            // adjust, in case buffer extended actual size
            if (first < 0) {
                first = 0;
            }
            if (last > rowCount - 1) {
                last = rowCount - 1;
            }
        }

        this.firstVirtualRenderedRow = first;
        this.lastVirtualRenderedRow = last;

        this.ensureRowsRendered();
    };

    RowRenderer.prototype.isIndexRendered = function (index) {
        return index >= this.firstVirtualRenderedRow && index <= this.lastVirtualRenderedRow;
    };

    RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
        return this.firstVirtualRenderedRow;
    };

    RowRenderer.prototype.getLastVirtualRenderedRow = function () {
        return this.lastVirtualRenderedRow;
    };

    RowRenderer.prototype.ensureRowsRendered = function () {

        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var mainRowWidth = this.colModel.getTotalUnpinnedColWidth();
        var that = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.renderedRows);

        //add in new rows
        for (var rowIndex = this.firstVirtualRenderedRow; rowIndex <= this.lastVirtualRenderedRow; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            var node = this.rowModel.getVirtualRow(rowIndex);
            if (node) {
                that.insertRow(node, rowIndex, mainRowWidth, pinnedColumnCount);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);

        //if we are doing angular compiling, then do digest the scope here
        if (this.gridOptions.angularCompileRows) {
            // we do it in a timeout, in case we are already in an apply
            setTimeout(function () {
                that.$scope.$apply();
            }, 0);
        }
    };

    RowRenderer.prototype.insertRow = function(node, rowIndex, mainRowWidth, pinnedColumnCount) {
        //if no cols, don't draw row
        if (!this.gridOptionsWrapper.isColumDefsPresent()) { return; }

        //var rowData = node.rowData;
        var rowIsAGroup = node.group;
        var rowIsAFooter = node.footer;

        var ePinnedRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
        var eMainRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
        var _this = this;

        eMainRow.style.width = mainRowWidth+"px";

        // try compiling as we insert rows
        var newChildScope = this.createChildScopeOrNull(node.data);

        var renderedRow = {
            scope: newChildScope,
            node: node,
            rowIndex: rowIndex
        };
        this.renderedRows[rowIndex] = renderedRow;

        // if group item, insert the first row
        var columnDefWrappers = this.colModel.getColDefWrappers();
        if (rowIsAGroup) {
            var firstColWrapper = columnDefWrappers[0];
            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();

            var eGroupRow = _this.createGroupElement(node, firstColWrapper, groupHeaderTakesEntireRow, false, rowIndex, rowIsAFooter);
            if (pinnedColumnCount>0) {
                ePinnedRow.appendChild(eGroupRow);
            } else {
                eMainRow.appendChild(eGroupRow);
            }

            if (pinnedColumnCount>0 && groupHeaderTakesEntireRow) {
                var eGroupRowPadding = _this.createGroupElement(node, firstColWrapper, groupHeaderTakesEntireRow, true, rowIndex, rowIsAFooter);
                eMainRow.appendChild(eGroupRowPadding);
            }

            if (!groupHeaderTakesEntireRow) {

                // draw in cells for the rest of the row.
                // if group is a footer, always show the data.
                // if group is a header, only show data if not expanded
                var groupData;
                if (node.footer) {
                    groupData = node.data;
                } else {
                    // we show data in footer only
                    var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
                    groupData = (node.expanded && footersEnabled) ? undefined : node.data;
                }
                columnDefWrappers.forEach(function(colDefWrapper, colIndex) {
                    if (colIndex==0) { //skip first col, as this is the group col we already inserted
                        return;
                    }
                    var value = groupData ? groupData[colDefWrapper.colDef.field] : undefined;
                    _this.createCellFromColDef(colDefWrapper, value, node, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, newChildScope);
                });
            }

        } else {
            columnDefWrappers.forEach(function(colDefWrapper, colIndex) {
                _this.createCellFromColDef(colDefWrapper, node.data[colDefWrapper.colDef.field], node, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, newChildScope);
            });
        }

        //try compiling as we insert rows
        renderedRow.pinnedElement = this.compileAndAdd(this.ePinnedColsContainer, rowIndex, ePinnedRow, newChildScope);
        renderedRow.bodyElement = this.compileAndAdd(this.eBodyContainer, rowIndex, eMainRow, newChildScope);
    };

    RowRenderer.prototype.createChildScopeOrNull = function(data) {
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            var newChildScope = this.$scope.$new();
            newChildScope.data = data;
            return newChildScope;
        } else {
            return null;
        }
    };

    RowRenderer.prototype.compileAndAdd = function(container, rowIndex, element, scope) {
        if (scope) {
            var eElementCompiled = this.$compile(element)(scope);
            if (container) { // checking container, as if noScroll, pinned container is missing
                container.appendChild(eElementCompiled[0]);
            }
            return eElementCompiled[0];
        } else {
            if (container) {
                container.appendChild(element);
            }
            return element;
        }
    };

    RowRenderer.prototype.createCellFromColDef = function(colDefWrapper, value, node, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, $childScope) {
        var eGridCell = this.createCell(colDefWrapper, value, node, rowIndex, colIndex, $childScope);

        if (colIndex>=pinnedColumnCount) {
            eMainRow.appendChild(eGridCell);
        } else {
            ePinnedRow.appendChild(eGridCell);
        }
    };

    RowRenderer.prototype.addClassesToRow = function(rowIndex, node, eRow) {
        var classesList = ["ag-row"];
        classesList.push(rowIndex%2==0 ? "ag-row-even" : "ag-row-odd");

        if (this.selectionController.isNodeSelected(node)) {
            classesList.push("ag-row-selected");
        }
        if (node.group) {
            // if a group, put the level of the group in
            classesList.push("ag-row-level-" + node.level);
        } else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (node.parent) {
                classesList.push("ag-row-level-" + (node.parent.level + 1) );
            } else {
                classesList.push("ag-row-level-0");
            }
        }
        if (node.group) {
            classesList.push("ag-row-group");
        }
        if (node.group && !node.footer && node.expanded) {
            classesList.push("ag-row-group-expanded");
        }
        if (node.group && !node.footer && !node.expanded) {
            // opposite of expanded is contracted according to the internet.
            classesList.push("ag-row-group-contracted");
        }
        if (node.group && node.footer) {
            classesList.push("ag-row-footer");
        }

        // add in extra classes provided by the config
        if (this.gridOptionsWrapper.getRowClass()) {
            var params = {node: node, data: node.data, rowIndex: rowIndex,
                gridOptions: this.gridOptionsWrapper.getGridOptions()};
            var extraRowClasses = this.gridOptionsWrapper.getRowClass()(params);
            if (extraRowClasses) {
                if (typeof extraRowClasses === 'string') {
                    classesList.push(extraRowClasses);
                } else if (Array.isArray(extraRowClasses)) {
                    extraRowClasses.forEach(function(classItem) {
                        classesList.push(classItem);
                    });
                }
            }
        }

        var classes = classesList.join(" ");

        eRow.className = classes;
    };

    RowRenderer.prototype.createRowContainer = function(rowIndex, node, groupRow) {
        var eRow = document.createElement("div");

        this.addClassesToRow(rowIndex, node, eRow);

        eRow.setAttribute("row", rowIndex);

        // if showing scrolls, position on the container
        if (!this.gridOptionsWrapper.isDontUseScrolls()) {
            eRow.style.top = (this.gridOptionsWrapper.getRowHeight() * rowIndex) + "px";
        }
        eRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";

        if (this.gridOptionsWrapper.getRowStyle()) {
            var cssToUse;
            var rowStyle = this.gridOptionsWrapper.getRowStyle();
            if (typeof rowStyle === 'function') {
                cssToUse = rowStyle(node.data, rowIndex, groupRow);
            } else {
                cssToUse = rowStyle;
            }

            if (cssToUse) {
                Object.keys(cssToUse).forEach(function(key) {
                    eRow.style[key] = cssToUse[key];
                });
            }
        }

        if (!groupRow) {
            var _this = this;
            eRow.addEventListener("click", function(event) {
                _this.angularGrid.onRowClicked(event, Number(this.getAttribute("row")))
            });
        }

        return eRow;
    };

    RowRenderer.prototype.getIndexOfRenderedNode = function(node) {
        var renderedRows = this.renderedRows;
        var keys = Object.keys(renderedRows);
        for (var i = 0; i<keys.length; i++) {
            if (renderedRows[keys[i]].node === node) {
                return renderedRows[keys[i]].rowIndex;
            }
        }
        return -1;
    };

    RowRenderer.prototype.setCssClassForGroupCell = function(eGridGroupRow, footer, useEntireRow) {
        if (useEntireRow) {
            if (footer) {
                eGridGroupRow.className = 'ag-footer-cell-entire-row';
            } else {
                eGridGroupRow.className = 'ag-group-cell-entire-row';
            }
        } else {
            if (footer) {
                eGridGroupRow.className = 'ag-footer-cell ag-cell cell-col-'+0;
            } else {
                eGridGroupRow.className = 'ag-group-cell ag-cell cell-col-'+0;
            }
        }
    };

    RowRenderer.prototype.createGroupElement = function(node, firstColDefWrapper, useEntireRow, padding, rowIndex, footer) {
        var eGridGroupRow = document.createElement('div');

        this.setCssClassForGroupCell(eGridGroupRow, footer, useEntireRow);

        var expandIconNeeded = !padding && !footer;
        if (expandIconNeeded) {
            this.addGroupExpandIcon(eGridGroupRow, node.expanded);
        }

        var checkboxNeeded = !padding && !footer && this.gridOptionsWrapper.isGroupCheckboxSelection();
        if (checkboxNeeded) {
            var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(node, rowIndex);
            eGridGroupRow.appendChild(eCheckbox);
        }

        // try user custom rendering first
        var useRenderer = typeof this.gridOptions.groupInnerCellRenderer === 'function';
        if (useRenderer) {
            var rendererParams = { data: node.data, node: node, padding: padding, gridOptions: this.gridOptions };
            utils.useRenderer(eGridGroupRow, this.gridOptions.groupInnerCellRenderer, rendererParams);
        } else {
            if (!padding) {
                if (footer) {
                    this.createFooterCell(eGridGroupRow, node);
                } else {
                    this.createGroupCell(eGridGroupRow, node);
                }
            }
        }

        if (!useEntireRow) {
            eGridGroupRow.style.width = utils.formatWidth(firstColDefWrapper.actualWidth);
        }

        // indent with the group level
        if (!padding) {
            // only do this if an indent - as this overwrites the padding that
            // the theme set, which will make things look 'not aligned' for the
            // first group level.
            if (node.footer || node.level > 0) {
                var paddingPx = node.level * 10;
                if (footer) {
                    paddingPx += 10;
                }
                eGridGroupRow.style.paddingLeft = paddingPx + "px";
            }
        }

        var that = this;
        eGridGroupRow.addEventListener("click", function() {
            node.expanded = !node.expanded;
            that.angularGrid.updateModelAndRefresh(constants.STEP_MAP);
        });

        return eGridGroupRow;
    };

    // creates cell with 'Total {{key}}' for a group
    RowRenderer.prototype.createFooterCell = function(eParent, node) {
        // if we are doing cell - then it makes sense to put in 'total', which is just a best guess,
        // that the user is going to want to say 'total'. typically i expect the user to override
        // how this cell is rendered
        var textToDisplay;
        if (this.gridOptionsWrapper.isGroupUseEntireRow()) {
            textToDisplay = "Group footer - you should provide a custom groupInnerCellRenderer to render what makes sense for you"
        } else {
            textToDisplay = "Total " + node.key;
        }
        var eText = document.createTextNode(textToDisplay);
        eParent.appendChild(eText);
    };

    // creates cell with '{{key}} ({{childCount}})' for a group
    RowRenderer.prototype.createGroupCell = function(eParent, node) {
        var textToDisplay = " " + node.key;
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (node.allChildrenCount >= 0) {
            textToDisplay += " (" + node.allChildrenCount + ")";
        }
        var eText = document.createTextNode(textToDisplay);
        eParent.appendChild(eText);
    };

    RowRenderer.prototype.addGroupExpandIcon = function(eGridGroupRow, expanded) {
        var eGroupIcon;
        if (expanded) {
            eGroupIcon = utils.createIcon('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedSvg);
        } else {
            eGroupIcon = utils.createIcon('groupContracted', this.gridOptionsWrapper, null, svgFactory.createGroupContractedSvg);
        }

        eGridGroupRow.appendChild(eGroupIcon);
    };

    RowRenderer.prototype.putDataIntoCell = function(colDef, value, node, $childScope, eGridCell, rowIndex) {
        if (colDef.cellRenderer) {
            var rendererParams = {
                value: value, data: node.data, node: node, colDef: colDef, $scope: $childScope, rowIndex: rowIndex,
                gridOptions: this.gridOptionsWrapper.getGridOptions()
            };
            var resultFromRenderer = colDef.cellRenderer(rendererParams);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                eGridCell.appendChild(resultFromRenderer);
            } else {
                // otherwise assume it was html, so just insert
                eGridCell.innerHTML = resultFromRenderer;
            }
        } else {
            // if we insert undefined, then it displays as the string 'undefined', ugly!
            if (value!==undefined && value!==null && value!=='') {
                eGridCell.innerHTML = value;
            }
        }
    };

    RowRenderer.prototype.createCell = function(colDefWrapper, value, node, rowIndex, colIndex, $childScope) {
        var that = this;
        var eGridCell = document.createElement("div");
        eGridCell.setAttribute("col", colIndex);

        // set class, only include ag-group-cell if it's a group cell
        var classes = ['ag-cell', 'cell-col-'+colIndex];
        if (node.group) {
            if (node.footer) {
                classes.push('ag-footer-cell');
            } else {
                classes.push('ag-group-cell');
            }
        }
        eGridCell.className = classes.join(' ');

        var eCellWrapper = document.createElement('span');
        eGridCell.appendChild(eCellWrapper);

        // see if we need a padding box
        if (colIndex === 0 && (node.parent)) {
            var pixelsToIndent = 20 + (node.parent.level * 10);
            eCellWrapper.style['padding-left'] = pixelsToIndent + 'px';
        }

        var colDef = colDefWrapper.colDef;
        if (colDef.checkboxSelection) {
            var eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(node, rowIndex);
            eCellWrapper.appendChild(eCheckbox);
        }

        var eSpanWithValue = document.createElement("span");
        eCellWrapper.appendChild(eSpanWithValue);
        this.putDataIntoCell(colDef, value, node, $childScope, eSpanWithValue, rowIndex);

        if (colDef.cellStyle) {
            var cssToUse;
            if (typeof colDef.cellStyle === 'function') {
                var cellStyleParams = {value: value, data: node.data, node: node, colDef: colDef, $scope: $childScope,
                    gridOptions: this.gridOptionsWrapper.getGridOptions()};
                cssToUse = colDef.cellStyle(cellStyleParams);
            } else {
                cssToUse = colDef.cellStyle;
            }

            if (cssToUse) {
                Object.keys(cssToUse).forEach(function(key) {
                    eGridCell.style[key] = cssToUse[key];
                });
            }
        }

        if (colDef.cellClass) {
            var classToUse;
            if (typeof colDef.cellClass === 'function') {
                var cellClassParams = {value: value, data: node.data, node: node, colDef: colDef, $scope: $childScope,
                    gridOptions: this.gridOptionsWrapper.getGridOptions()};
                classToUse = colDef.cellClass(cellClassParams);
            } else {
                classToUse = colDef.cellClass;
            }

            if (typeof classToUse === 'string') {
                utils.addCssClass(eGridCell, classToUse);
            } else if (Array.isArray(classToUse)) {
                classToUse.forEach(function(cssClassItem) {
                    utils.addCssClass(eGridCell,cssClassItem);
                });
            }
        }

        eGridCell.addEventListener("click", function(event) {
            if (that.gridOptionsWrapper.getCellClicked()) {
                that.gridOptionsWrapper.getCellClicked()(node.data, colDef, event, this, that.gridOptionsWrapper.getGridOptions());
            }
            if (colDef.cellClicked) {
                colDef.cellClicked(node.data, colDef, event, this, that.gridOptionsWrapper.getGridOptions());
            }
            if (that.isCellEditable(colDef, node)) {
                that.startEditing(eGridCell, colDefWrapper, node, $childScope, rowIndex);
            }
        });

        eGridCell.style.width = utils.formatWidth(colDefWrapper.actualWidth);

        return eGridCell;
    };

    RowRenderer.prototype.isCellEditable = function(colDef, node) {
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
    };

    RowRenderer.prototype.stopEditing = function(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex) {
        this.editingCell = false;
        var newValue = eInput.value;

        //If we don't remove the blur listener first, we get:
        //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
        eInput.removeEventListener('blur', blurListener);

        utils.removeAllChildren(eGridCell);

        var paramsForCallbacks = {
            node: node,
            data: node.data,
            oldValue: node.data[colDef.field],
            newValue: newValue,
            rowIndex: rowIndex,
            colDef: colDef,
            gridOptions: this.gridOptionsWrapper.getGridOptions()
        };

        if (colDef.newValueHandler) {
            colDef.newValueHandler(paramsForCallbacks);
        } else {
            node.data[colDef.field] = newValue;
        }

        // at this point, the value has been updated
        paramsForCallbacks.newValue = node.data[colDef.field];
        if (typeof colDef.cellValueChanged === 'function') {
            colDef.cellValueChanged(paramsForCallbacks);
        }

        var value = node.data[colDef.field];
        this.putDataIntoCell(colDef, value, node, $childScope, eGridCell);
    };

    RowRenderer.prototype.startEditing = function(eGridCell, colDefWrapper, node, $childScope, rowIndex) {
        var that = this;
        var colDef = colDefWrapper.colDef;
        this.editingCell = true;
        utils.removeAllChildren(eGridCell);
        var eInput = document.createElement('input');
        eInput.type = 'text';
        utils.addCssClass(eInput, 'ag-cell-edit-input');

        var value = node.data[colDef.field];
        if (value!==null && value!==undefined) {
            eInput.value = value;
        }

        eInput.style.width = (colDefWrapper.actualWidth - 14) + 'px';
        eGridCell.appendChild(eInput);
        eInput.focus();
        eInput.select();

        var blurListener = function() {
            that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
        };

        //stop entering if we loose focus
        eInput.addEventListener("blur", blurListener);

        //stop editing if enter pressed
        eInput.addEventListener('keypress', function (event) {
            var key = event.which || event.keyCode;
            if (key == 13) { // 13 is enter
                that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
            }
        });

    };

    return RowRenderer;

});