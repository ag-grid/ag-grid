define([
    "./utils",
    "text!./filter.html",
], function(utils, template) {

    var ROW_HEIGHT = 20;

    function Filter(model, grid) {
        this.miniFilter = null;
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

        this.eGui = utils.loadTemplate(template);

        this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
        this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
        this.eSelectAll = this.eGui.querySelector("#selectAll");
        this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
        this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
        this.eListContainer.style.height = (this.model.getUniqueValueCount() * ROW_HEIGHT) + "px";

        utils.addChangeListener(this.eMiniFilter, function() {_this.onFilterChanged();} );

        utils.removeAllChildren(this.eListContainer);

        this.eSelectAll.onclick = function () { _this.onSelectAll();}

        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        } else if (this.model.isNothingSelected()) {
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
            if (this.model.getUniqueValueCount() > rowIndex) {
                var value = this.model.getUniqueValue(rowIndex);
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
        eFilterValue.querySelector(".ag-filter-value").innerText = displayNameOfValue;
        var eCheckbox = eFilterValue.querySelector("input");
        eCheckbox.checked = this.model.isValueSelected(value);

        eCheckbox.onclick = function () { _this.onCheckboxClicked(eCheckbox, value); }

        eFilterValue.style.top = (ROW_HEIGHT * rowIndex) + "px";

        this.eListContainer.appendChild(eFilterValue);
        this.rowsInBodyContainer[rowIndex] = eFilterValue;
    };

    Filter.prototype.onCheckboxClicked = function(eCheckbox, value) {
        var checked = eCheckbox.checked;
        if (checked) {
            this.model.selectValue(value);
            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        } else {
            this.model.unselectValue(value);
            //if set is empty, nothing is selected
            if (this.model.isNothingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        }

        this.grid.onFilterChanged();
    };

    Filter.prototype.onFilterChanged = function() {
        var newMiniFilter = utils.makeNull(this.eMiniFilter.value);
        if (this.miniFilter===newMiniFilter) {
            //do nothing if filter has not changed
            return;
        }
        this.miniFilter = newMiniFilter;
    };

    Filter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        } else {
            this.model.selectNothing();
        }
        this.updateAllCheckboxes(checked);
        this.grid.onFilterChanged();
    };

    Filter.prototype.updateAllCheckboxes = function(checked) {
        var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll(".ag-filter-checkbox");
        for (var i = 0, l = currentlyDisplayedCheckboxes.length; i<l; i++) {
            currentlyDisplayedCheckboxes[i].checked = checked;
        }
    }

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