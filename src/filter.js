define([
    "./utils",
    "text!./filter.html",
], function(utils, template) {

    var ROW_HEIGHT = 20;

    function Filter(model, grid) {
        this.model = model;
        this.grid = grid;
        this.rowsInBodyContainer = {};
        this.createGui();
        this.addScrollListener();
    }

    Filter.prototype.getGui = function () {
        return this.eGui;
    };

    Filter.prototype.createGui = function () {
        var _this = this;

        this.eGui = document.createElement("div");
        this.eGui.innerHTML = template;

        this.eListContainer = this.eGui.querySelector(".ag-advanced-filter-list-container");
        this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
        this.eSelectAll = this.eGui.querySelector("#selectAll");
        this.eListViewport = this.eGui.querySelector(".ag-advanced-filter-list-viewport");

        this.eCheckboxes = [];

        this.eListContainer.style.height = (this.model.uniqueValues.length * ROW_HEIGHT) + "px";

        utils.removeAllChildren(this.eListContainer);

        this.eSelectAll.onclick = function () { _this.onSelectAll();}

        if (this.model.uniqueValues.length === this.model.selectedValues.length) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        } else if (this.model.selectedValues.length == 0) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        } else {
            this.eSelectAll.indeterminate = true;
        }
    };

    Filter.prototype.drawVirtualRows = function () {
        var topPixel = this.eListViewport.scrollTop;
        var bottomPixel = topPixel + this.eListViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / ROW_HEIGHT);
        var lastRow = Math.floor(bottomPixel / ROW_HEIGHT);

        this.ensureRowsRendered(firstRow, lastRow);
    };

    Filter.prototype.ensureRowsRendered = function (start, finish) {
        var _this = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);

        //add in new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            //see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            //check this row actually exists (in case overflow buffer window exceeds real data)
            if (this.model.uniqueValues.length > rowIndex) {
                var value = this.model.uniqueValues[rowIndex];
                _this.insertRow(value, rowIndex);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    };

    //takes array of row id's
    Filter.prototype.removeVirtualRows = function(rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function(indexToRemove) {
            var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eListContainer.removeChild(eRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };

    Filter.prototype.insertRow = function(value, rowIndex) {
        var _this = this;

        var eFilterValue = this.eFilterValueTemplate.cloneNode(true);
        var displayNameOfValue = value === null ? "(Blanks)" : value;
        eFilterValue.querySelector(".ag-advanced-filter-value").innerText = displayNameOfValue;
        var eCheckbox = eFilterValue.querySelector("input");
        eCheckbox.checked = this.model.selectedValues.indexOf(value) >= 0;

        eCheckbox.onclick = function () { _this.onCheckboxClicked(eCheckbox, value); }

        eFilterValue.style.top = (ROW_HEIGHT * rowIndex) + "px";

        this.eListContainer.appendChild(eFilterValue);
        this.eCheckboxes.push(eCheckbox);
        this.rowsInBodyContainer[rowIndex] = eFilterValue;
    };

    Filter.prototype.onCheckboxClicked = function(eCheckbox, value) {
        var checked = eCheckbox.checked;
        if (checked) {
            if (this.model.selectedValues.indexOf(value)<0) {
                this.model.selectedValues.push(value);
            }
            //if box arrays are same size, then everything is checked
            if (this.model.selectedValues.length==this.model.uniqueValues.length) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        } else {
            utils.removeFromArray(this.model.selectedValues, value);
            //if set is empty, nothing is selected
            if (this.model.selectedValues.length==0) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        }

        this.grid.onFilterChanged();
    };

    Filter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectedValues = this.model.uniqueValues.slice(0);
        } else {
            this.model.selectedValues.length = 0;
        }
        this.eCheckboxes.forEach(function (eCheckbox) {
            eCheckbox.checked = checked;
        });
        this.grid.onFilterChanged();
    };


    Filter.prototype.addScrollListener = function() {
        var _this = this;

        this.eListViewport.addEventListener("scroll", function() {
            _this.drawVirtualRows();
        });
    };

    //we need to have the gui attached before we can draw the virtual rows, as the
    //virtual row logic needs info about the gui state
    Filter.prototype.guiAttached = function() {
        this.drawVirtualRows();
    };

    return function(model, grid) {
        return new Filter(model, grid);
    };

});