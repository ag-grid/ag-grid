define(["./constants","./svgFactory","./utils"], function(constants, SvgFactory, utils) {

    var svgFactory = new SvgFactory();

    function RowRenderer(gridOptions, rowModel, gridOptionsWrapper, eGrid, angularGrid, $compile, $scope) {
        this.gridOptions = gridOptions;
        this.rowModel = rowModel;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.findAllElements(eGrid);
        this.$compile = $compile;
        this.$scope = $scope;

        // map of row ids to row objects. keeps track of which elements
        // are rendered for which rows in the dom. each row object has:
        // [scope, bodyRow, pinnedRow, rowData]
        this.renderedRows = {};

        this.editingCell = false; //gets set to true when editing a cell
    }

    RowRenderer.prototype.setMainRowWidths = function() {
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth() + "px";

        var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
        for (var i = 0; i<unpinnedRows.length; i++) {
            unpinnedRows[i].style.width = mainRowWidth;
        }
    };

    RowRenderer.prototype.findAllElements = function (eGrid) {
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
    };

    RowRenderer.prototype.refreshView = function() {
        var rowCount = this.rowModel.getRowsAfterMap().length;
        var containerHeight = this.gridOptionsWrapper.getRowHeight() * rowCount;
        this.eBodyContainer.style.height = containerHeight + "px";
        this.ePinnedColsContainer.style.height = containerHeight + "px";

        this.refreshAllVirtualRows();
    };

    RowRenderer.prototype.rowDataChanged = function(rows) {
        //get indexes for the rows
        var indexesToRemove = [];
        var rowsAfterMap = this.rowModel.getRowsAfterMap();
        rows.forEach(function(row) {
            var index = rowsAfterMap.indexOf(row);
            if (index>=0) {
                indexesToRemove.push(index);
            }
        });
        //remove the rows
        this.removeVirtualRows(indexesToRemove);
        //add draw them again
        this.drawVirtualRows();
    };

    RowRenderer.prototype.refreshAllVirtualRows = function () {
        //remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRows(rowsToRemove);

        //add in new rows
        this.drawVirtualRows();
    };

    //takes array of row id's
    RowRenderer.prototype.removeVirtualRows = function (rowsToRemove) {
        var that = this;
        rowsToRemove.forEach(function (indexToRemove) {
            var renderedRow = that.renderedRows[indexToRemove];
            if (renderedRow.pinnedElement) {
                that.ePinnedColsContainer.removeChild(renderedRow.pinnedElement);
            }

            if (renderedRow.bodyElement) {
                that.eBodyContainer.removeChild(renderedRow.bodyElement);
            }

            if (renderedRow.scope) {
                renderedRow.scope.$destroy();
            }

            if (that.gridOptionsWrapper.getVirtualRowRemoved()) {
                that.gridOptionsWrapper.getVirtualRowRemoved()(renderedRow.rowData, indexToRemove);
            }

            delete that.renderedRows[indexToRemove];
        });
    };

    RowRenderer.prototype.drawVirtualRows = function() {
        var topPixel = this.eBodyViewport.scrollTop;
        var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / this.gridOptionsWrapper.getRowHeight());
        var lastRow = Math.floor(bottomPixel / this.gridOptionsWrapper.getRowHeight());

        //add in buffer
        firstRow = firstRow - constants.ROW_BUFFER_SIZE;
        lastRow = lastRow + constants.ROW_BUFFER_SIZE;

        this.ensureRowsRendered(firstRow, lastRow);
    };

    RowRenderer.prototype.ensureRowsRendered = function (start, finish) {
        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth();
        var _this = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.renderedRows);

        //add in new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            var data = this.rowModel.getRowsAfterMap()[rowIndex];
            if (data) {
                _this.insertRow(data, rowIndex, mainRowWidth, pinnedColumnCount);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);

        //if we are doing angular compiling, then do it here if not in digest
        //this.$scope.$$phase || this.$scope.$apply();
        //if(this.gridOptions.angularCompile && !this.$scope.$$phase) {
        //    this.$scope.$apply();
        //}
    };

    RowRenderer.prototype.insertRow = function(data, rowIndex, mainRowWidth, pinnedColumnCount) {
        //if no cols, don't draw row
        if (!this.gridOptionsWrapper.isColumDefsPresent()) { return; }

        var rowIsAGroup = data._angularGrid_group; //_angularGrid_group is set to true on groups

        var ePinnedRow = this.createRowContainer(rowIndex, data, rowIsAGroup);
        var eMainRow = this.createRowContainer(rowIndex, data, rowIsAGroup);
        var _this = this;

        eMainRow.style.width = mainRowWidth+"px";

        //try compiling as we insert rows
        var newChildScope = this.createChildScopeOrNull(data, rowIndex);

        var renderedRow = {
            scope: newChildScope,
            rowData: data
        };
        this.renderedRows[rowIndex] = renderedRow;

        //if group item, insert the first row
        var columnDefs = this.gridOptionsWrapper.getColumnDefs();
        if (rowIsAGroup) {
            var firstCol = columnDefs[0];
            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();

            var eGroupRow = _this.createGroupElement(data, firstCol, groupHeaderTakesEntireRow, false);
            if (pinnedColumnCount>0) {
                ePinnedRow.appendChild(eGroupRow);
            } else {
                eMainRow.appendChild(eGroupRow);
            }

            if (pinnedColumnCount>0 && groupHeaderTakesEntireRow) {
                var eGroupRowPadding = _this.createGroupElement(data, firstCol, groupHeaderTakesEntireRow, true);
                eMainRow.appendChild(eGroupRowPadding);
            }

            if (!groupHeaderTakesEntireRow) {

                //draw in blank cells for the rest of the row
                var groupHasData = data.aggData!==undefined && data.aggData!==null;
                columnDefs.forEach(function(colDef, colIndex) {
                    if (colIndex==0) { //skip first col, as this is the group col we already inserted
                        return;
                    }
                    var item = null;
                    if (groupHasData) {
                        item = data.aggData[colDef.field];
                    }
                    _this.createCellFromColDef(colDef, item, data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, newChildScope);
                });
            }

        } else {
            columnDefs.forEach(function(colDef, colIndex) {
                _this.createCellFromColDef(colDef, data[colDef.field], data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, newChildScope);
            });
        }

        //try compiling as we insert rows
        renderedRow.pinnedElement = this.compileAndAdd(this.ePinnedColsContainer, rowIndex, ePinnedRow, newChildScope);
        renderedRow.bodyElement = this.compileAndAdd(this.eBodyContainer, rowIndex, eMainRow, newChildScope);
    };

    RowRenderer.prototype.createChildScopeOrNull = function(data, rowIndex) {
        if (this.gridOptionsWrapper.isAngularCompile()) {
            var newChildScope = this.$scope.$new();
            newChildScope.rowData = data;
            return newChildScope;
        } else {
            return null;
        }
    };

    RowRenderer.prototype.compileAndAdd = function(container, rowIndex, element, scope) {
        if (scope) {
            var eElementCompiled = this.$compile(element)(scope);
            container.appendChild(eElementCompiled[0]);
            return eElementCompiled[0];
        } else {
            container.appendChild(element);
            return element;
        }
    };

    RowRenderer.prototype.createCellFromColDef = function(colDef, value, data, rowIndex, colIndex, pinnedColumnCount, eMainRow, ePinnedRow, $childScope) {
        var eGridCell = this.createCell(colDef, value, data, rowIndex, colIndex, colIndex, $childScope);

        if (colIndex>=pinnedColumnCount) {
            eMainRow.appendChild(eGridCell);
        } else {
            ePinnedRow.appendChild(eGridCell);
        }
    };

    RowRenderer.prototype.createRowContainer = function(rowIndex, row, groupRow) {
        var eRow = document.createElement("div");
        var classesList = ["ag-row"];
        classesList.push(rowIndex%2==0 ? "ag-row-even" : "ag-row-odd");
        if (this.gridOptions.selectedRows.indexOf(row)>=0) {
            classesList.push("ag-row-selected");
        }

        // add in extra classes provided by the config
        if (this.gridOptionsWrapper.getRowClass()) {
            var extraRowClasses = this.gridOptionsWrapper.getRowClass()(row, rowIndex, groupRow);
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

        eRow.setAttribute("row", rowIndex);

        eRow.style.top = (this.gridOptionsWrapper.getRowHeight() * rowIndex) + "px";
        eRow.style.height = (this.gridOptionsWrapper.getRowHeight()) + "px";

        if (this.gridOptionsWrapper.getRowStyle()) {
            var cssToUse;
            var rowStyle = this.gridOptionsWrapper.getRowStyle();
            if (typeof rowStyle === 'function') {
                cssToUse = rowStyle(row, rowIndex, groupRow);
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

    RowRenderer.prototype.createGroupElement = function(data, firstColDef, useEntireRow, padding) {
        var eGridGroupRow = document.createElement('div');
        if (useEntireRow) {
            eGridGroupRow.className = 'ag-group-cell';
            //eGridGroupRow.style.width = '500px';
        } else {
            eGridGroupRow.className = 'ag-cell cell-col-'+0;
        }

        if (!padding) {
            var eSvg = svgFactory.createGroupSvg(data.expanded);
            eGridGroupRow.appendChild(eSvg);
        }

        //if renderer provided, use it
        if (this.gridOptions.groupInnerCellRenderer) {
            var resultFromRenderer = this.gridOptions.groupInnerCellRenderer(data, padding);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eGridGroupRow.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement('span');
                eTextSpan.innerHTML = resultFromRenderer;
                eGridGroupRow.appendChild(eTextSpan);
            }
        } else {
            //otherwise default is display the key along with the child count
            if (!padding) { //only do it if not padding - if we are padding, we display blank row
                var eText = document.createTextNode(" " + data.key + " (" + data.allChildrenCount + ")");
                eGridGroupRow.appendChild(eText);
            }
        }

        if (!useEntireRow) {
            eGridGroupRow.style.width = utils.formatWidth(firstColDef.actualWidth);
        }

        //indent with the group level
        if (!padding) {
            eGridGroupRow.style.paddingLeft = ((data.level + 1) * 10) + "px";
        }

        var _this = this;
        eGridGroupRow.addEventListener("click", function(event) {
            data.expanded = !data.expanded;
            _this.angularGrid.updateModelAndRefresh(constants.STEP_MAP);
        });

        return eGridGroupRow;
    };

    RowRenderer.prototype.putDataIntoCell = function(colDef, value, data, $childScope, eGridCell, rowIndex) {
        if (colDef.cellRenderer) {
            var resultFromRenderer = colDef.cellRenderer(value, data, colDef, $childScope, this.gridOptionsWrapper.getGridOptions(), rowIndex);
            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                eGridCell.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                eGridCell.innerHTML = resultFromRenderer;
            }
        } else {
            //if we insert undefined, then it displays as the string 'undefined', ugly!
            if (value!==undefined && value!==null && value!=='') {
                eGridCell.innerText = value;
            }
        }
    };

    RowRenderer.prototype.createCell = function(colDef, value, data, rowIndex, colIndex, $childScope) {
        var that = this;
        var eGridCell = document.createElement("div");
        eGridCell.className = "ag-cell cell-col-"+colIndex;
        eGridCell.setAttribute("col", colIndex);

        this.putDataIntoCell(colDef, value, data, $childScope, eGridCell, rowIndex);

        if (colDef.cellStyle) {
            var cssToUse;
            if (typeof colDef.cellStyle === 'function') {
                cssToUse = colDef.cellStyle(value, data, colDef, $childScope);
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
                classToUse = colDef.cellClass(value, data, colDef);
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
                that.gridOptionsWrapper.getCellClicked()(data, colDef, event, this, this.gridOptionsWrapper.getGridOptions());
            }
            if (colDef.cellClicked) {
                colDef.cellClicked(data, colDef, event, this, that.gridOptionsWrapper.getGridOptions());
            }
            if (that.isCellEditable(colDef, data)) {
                that.startEditing(eGridCell, colDef, data, $childScope);
            }
        });

        eGridCell.style.width = utils.formatWidth(colDef.actualWidth);

        return eGridCell;
    };

    RowRenderer.prototype.isCellEditable = function(colDef, data) {
        if (this.editingCell) {
            return false;
        }

        if (typeof colDef.editable === 'boolean') {
            return colDef.editable;
        }

        if (typeof colDef.editable === 'function') {
            return colDef.editable(data);
        }

        return false;
    };

    RowRenderer.prototype.stopEditing = function(eGridCell, colDef, data, $childScope, eInput) {
        this.editingCell = false;
        utils.removeAllChildren(eGridCell);
        var newValue = eInput.value;

        if (colDef.newValueHandler) {
            colDef.newValueHandler(data, newValue, colDef, this.gridOptionsWrapper.getGridOptions());
        } else {
            data[colDef.field] = newValue;
        }

        var value = data[colDef.field];
        this.putDataIntoCell(colDef, value, data, $childScope, eGridCell);
    };

    RowRenderer.prototype.startEditing = function(eGridCell, colDef, data, $childScope) {
        var that = this;
        this.editingCell = true;
        utils.removeAllChildren(eGridCell);
        var eInput = document.createElement('input');
        eInput.type = 'text';
        utils.addCssClass(eInput, 'ag-cell-edit-input');

        var value = data[colDef.field];
        if (value!==null && value!==undefined) {
            eInput.value = data[colDef.field];
        }

        eInput.style.width = (colDef.actualWidth - 14) + 'px';
        eGridCell.appendChild(eInput);
        eInput.focus();
        eInput.select();


        //stop editing if enter pressed
        eInput.addEventListener('keypress', function (event) {
            var key = event.which || event.keyCode;
            if (key == 13) { // 13 is enter
                that.stopEditing(eGridCell, colDef, data, $childScope, eInput);
            }
        });

        //stop entering if we loose focus
        eInput.addEventListener("blur", function() {
            that.stopEditing(eGridCell, colDef, data, $childScope, eInput);
        });
    };

    return RowRenderer;

});