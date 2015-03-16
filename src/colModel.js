define(['./constants'], function(constants) {

    function ColModel(angularGrid) {
        this.angularGrid = angularGrid;
    }

    ColModel.prototype.setColumnDefs = function (columnDefs, pinnedColCount, checkboxSelectionColumn) {
        this.pinnedColumnCount = pinnedColCount;
        var colDefWrappers = [];

        var colIndex = 0;

        if (checkboxSelectionColumn) {
            var checkboxColDef = this.createCheckboxColDef();
            var checkboxColDefWrapper = new ColDefWrapper(checkboxColDef, colIndex++);
            colDefWrappers.push(checkboxColDefWrapper);
        }

        if (columnDefs) {
            columnDefs.forEach(function (colDef) {
                var newColDefWrapper = new ColDefWrapper(colDef, colIndex++);
                colDefWrappers.push(newColDefWrapper);
            });
        }
        this.colDefWrappers = colDefWrappers;
        this.ensureEachColHasSize();
    };

    ColModel.prototype.getColDefWrappers = function () {
        return this.colDefWrappers;
    };

    // set the actual widths for each col
    ColModel.prototype.ensureEachColHasSize = function () {
        this.colDefWrappers.forEach(function (colDefWrapper) {
            var colDef = colDefWrapper.colDef;
            if (colDefWrapper.actualWidth) {
                // if actual width already set, do nothing
                return;
            } else if (!colDef.width) {
                // if no width defined in colDef, default to 200
                colDefWrapper.actualWidth = 200;
            } else if (colDef.width < constants.MIN_COL_WIDTH) {
                // if width in col def to small, set to min width
                colDefWrapper.actualWidth = constants.MIN_COL_WIDTH;
            } else {
                // otherwise use the provided width
                colDefWrapper.actualWidth = colDef.width;
            }
        });
    };

    ColModel.prototype.getTotalUnpinnedColWidth = function() {
        return this.getTotalColWidth(false);
    };

    ColModel.prototype.getTotalPinnedColWidth = function() {
        return this.getTotalColWidth(true);
    };

    ColModel.prototype.getTotalColWidth = function(includePinned) {
        var widthSoFar = 0;
        var pinnedColCount = this.pinnedColumnCount;

        this.colDefWrappers.forEach(function(colDefWrapper, index) {
            var columnIsPined = index<pinnedColCount;
            var includeThisCol = columnIsPined === includePinned;
            if (includeThisCol) {
                widthSoFar += colDefWrapper.actualWidth;
            }
        });

        return widthSoFar;
    };

    ColModel.prototype.createCheckboxColDef = function () {
        return {
            width: 30,
            suppressMenu: true,
            suppressSorting: true,
            headerCellRenderer: function() {
                var eCheckbox = document.createElement('input');
                eCheckbox.type = 'checkbox';
                eCheckbox.name = 'name';
                return eCheckbox;
            },
            cellRenderer: checkboxCellRendererFactory(this.angularGrid)
        };
    };

    function checkboxCellRendererFactory(angularGrid) {
        return function(params) {

            var eCheckbox = document.createElement('input');
            eCheckbox.type = "checkbox";
            eCheckbox.name = "name";
            eCheckbox.checked = angularGrid.isRowSelected(params.data);

            eCheckbox.onchange = function () {
                var newValue = eCheckbox.checked;
                if (newValue) {
                    angularGrid.selectRow(true, params.rowIndex, params.data);
                } else {
                    angularGrid.unselectRow(params.rowIndex, params.data);
                }
            };

            angularGrid.addVirtualRowListener(params.rowIndex, {
                rowSelected: function (selected) {
                    eCheckbox.checked = selected;
                },
                rowRemoved: function () {
                    console.log('rowRemoved: ' + params.rowIndex);
                }
            });

            return eCheckbox;
        };
    }

    function ColDefWrapper(colDef, colKey) {
        this.colDef = colDef;
        this.colKey = colKey;
    }

    return ColModel;

});