// Angular Grid
// Written by Niall Crosby
// www.angulargrid.com



(function() {





    var DEFAULT_ROW_HEIGHT = 20;
    var angular = window.angular;

    var constants = {};

    constants.STEP_EVERYTHING = 0;
    constants.STEP_FILTER = 1;
    constants.STEP_SORT = 2;
    constants.STEP_MAP = 3;

    constants.ASC = "asc";
    constants.DESC = "desc";

    constants.ROW_BUFFER_SIZE = 5;

    constants.SORT_STYLE_SHOW = "display:inline;";
    constants.SORT_STYLE_HIDE = "display:none;";

    constants.MIN_COL_WIDTH = 10;



    var utils = new Utils();
    var svgFactory = new SvgFactory();






    // if angular is present, register the directive
    if (angular) {
        var angularModule = angular.module("angularGrid", []);
        angularModule.directive("angularGrid", function() {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', AngularDirectiveController],
                scope: {
                    angularGrid: "="
                }
            };
        });
    }







    function template() {
        return [
            '<div class="ag-root ag-scrolls">',
            '    <!-- The loading panel -->',
            '    <!-- wrapping in outer div, and wrapper, is needed to center the loading icon -->',
            '    <!-- The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/ -->',
            '    <div class="ag-loading-panel">',
            '        <div class="ag-loading-wrapper">',
            '            <span class="ag-loading-center">Loading...</span>',
            '        </div>',
            '    </div>',
            '    <!-- header -->',
            '    <div class="ag-header">',
            '        <div class="ag-pinned-header"></div><div class="ag-header-viewport"><div class="ag-header-container"></div></div>',
            '    </div>',
            '    <!-- body -->',
            '    <div class="ag-body">',
            '        <div class="ag-pinned-cols-viewport">',
            '            <div class="ag-pinned-cols-container"></div>',
            '        </div>',
            '        <div class="ag-body-viewport-wrapper">',
            '            <div class="ag-body-viewport">',
            '                <div class="ag-body-container"></div>',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <!-- Paging -->',
            '    <div class="ag-paging-panel">',
            '    </div>',
            '    </div>',
        ].join('');
    }


    function templateNoScrolls() {
        return [
            '<div class="ag-root ag-no-scrolls">',
            '    <!-- See comment in template.html for why loading is laid out like so -->',
            '    <div class="ag-loading-panel">',
            '        <div class="ag-loading-wrapper">',
            '            <span class="ag-loading-center">Loading...</span>',
            '        </div>',
            '    </div>',
            '    <!-- header -->',
            '    <div class="ag-header-container"></div>',
            '    <!-- body -->',
            '    <div class="ag-body-container"></div>',
            '</div>'
        ].join('');
    }














    /** Singleton util class, with jquery and underscore like features. */
    function Utils() {}

    //Returns true if it is a DOM node
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.prototype.isNode = function(o) {
        return (
            typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    };

    //Returns true if it is a DOM element
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    Utils.prototype.isElement = function(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    };

    Utils.prototype.isNodeOrElement = function(o) {
        return this.isNode(o) || this.isElement(o);
    };

    //adds all type of change listeners to an element, intended to be a text field
    Utils.prototype.addChangeListener = function(element, listener) {
        element.addEventListener("changed", listener);
        element.addEventListener("paste", listener);
        element.addEventListener("input", listener);
    };

    //if value is undefined, null or blank, returns null, otherwise returns the value
    Utils.prototype.makeNull = function(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        } else {
            return value;
        }
    };

    Utils.prototype.removeAllChildren = function(node) {
        if (node) {
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }
        }
    };

    //adds an element to a div, but also adds a background checking for clicks,
    //so that when the background is clicked, the child is removed again, giving
    //a model look to popups.
    Utils.prototype.addAsModalPopup = function(eParent, eChild) {
        var eBackdrop = document.createElement("div");
        eBackdrop.className = "ag-popup-backdrop";

        eBackdrop.onclick = function() {
            eParent.removeChild(eChild);
            eParent.removeChild(eBackdrop);
        };

        eParent.appendChild(eBackdrop);
        eParent.appendChild(eChild);
    };

    //loads the template and returns it as an element. makes up for no simple way in
    //the dom api to load html directly, eg we cannot do this: document.createElement(template)
    Utils.prototype.loadTemplate = function(template) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template();
        return tempDiv.firstChild;
    };

    //if passed '42px' then returns the number 42
    Utils.prototype.pixelStringToNumber = function(val) {
        if (typeof val === "string") {
            if (val.indexOf("px") >= 0) {
                val.replace("px", "");
            }
            return parseInt(val);
        } else {
            return val;
        }
    };

    Utils.prototype.querySelectorAll_addCssClass = function(eParent, selector, cssClass) {
        var eRows = eParent.querySelectorAll(selector);
        for (var k = 0; k < eRows.length; k++) {
            this.addCssClass(eRows[k], cssClass);
        }
    };

    Utils.prototype.querySelectorAll_removeCssClass = function(eParent, selector, cssClass) {
        var eRows = eParent.querySelectorAll(selector);
        for (var k = 0; k < eRows.length; k++) {
            this.removeCssClass(eRows[k], cssClass);
        }
    };

    Utils.prototype.addCssClass = function(element, className) {
        var oldClasses = element.className;
        if (oldClasses) {
            if (oldClasses.indexOf(className) >= 0) {
                return;
            }
            element.className = oldClasses + " " + className;
        } else {
            element.className = className;
        }
    };

    Utils.prototype.removeCssClass = function(element, className) {
        var oldClasses = element.className;
        if (oldClasses.indexOf(className) < 0) {
            return;
        }
        var newClasses = oldClasses.replace(" " + className, "");
        newClasses = newClasses.replace(className + " ", "");
        if (newClasses == className) {
            newClasses = "";
        }
        element.className = newClasses;
    };

    Utils.prototype.removeFromArray = function(array, object) {
        array.splice(array.indexOf(object), 1);
    };

    Utils.prototype.defaultComparator = function(valueA, valueB) {
        var valueAMissing = valueA === null || valueA === undefined;
        var valueBMissing = valueB === null || valueB === undefined;
        if (valueAMissing && valueBMissing) {
            return 0;
        }
        if (valueAMissing) {
            return -1;
        }
        if (valueBMissing) {
            return 1;
        }

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    };

    Utils.prototype.formatWidth = function(width) {
        if (typeof width === "number") {
            return width + "px";
        } else {
            return width;
        }
    };

    // tries to use the provided renderer. if a renderer found, returns true.
    // if no renderer, returns false.
    Utils.prototype.useRenderer = function(eParent, eRenderer, params) {
        var resultFromRenderer = eRenderer(params);
        if (this.isNode(resultFromRenderer) || this.isElement(resultFromRenderer)) {
            //a dom node or element was returned, so add child
            eParent.appendChild(resultFromRenderer);
        } else {
            //otherwise assume it was html, so just insert
            var eTextSpan = document.createElement('span');
            eTextSpan.innerHTML = resultFromRenderer;
            eParent.appendChild(eTextSpan);
        }
    };

    // if icon provided, use this (either a string, or a function callback).
    // if not, then use the second parameter, which is the svgFactory function
    Utils.prototype.createIcon = function(iconName, gridOptionsWrapper, colDefWrapper, svgFactoryFunc) {
        var eResult = document.createElement('span');
        var userProvidedIcon;
        // check col for icon first
        if (colDefWrapper && colDefWrapper.colDef.icons) {
            userProvidedIcon = colDefWrapper.colDef.icons[iconName];
        }
        // it not in col, try grid options
        if (!userProvidedIcon && gridOptionsWrapper.getIcons()) {
            userProvidedIcon = gridOptionsWrapper.getIcons()[iconName];
        }
        // now if user provided, use it
        if (userProvidedIcon) {
            var rendererResult;
            if (typeof userProvidedIcon === 'function') {
                rendererResult = userProvidedIcon();
            } else if (typeof userProvidedIcon === 'string') {
                rendererResult = userProvidedIcon;
            } else {
                throw 'icon from grid options needs to be a string or a function';
            }
            if (typeof rendererResult === 'string') {
                eResult.innerHTML = rendererResult;
            } else if (this.isNodeOrElement(rendererResult)) {
                eResult.appendChild(rendererResult);
            } else {
                throw 'iconRenderer should return back a string or a dom object';
            }
        } else {
            // otherwise we use the built in icon
            eResult.appendChild(svgFactoryFunc());
        }
        return eResult;
    };




























    function SetFilterModel(colDef, rowModel) {

        this.createUniqueValues(rowModel, colDef.field);
        if (colDef.comparator) {
            this.uniqueValues.sort(colDef.comparator);
        } else {
            this.uniqueValues.sort(utils.defaultComparator);
        }

        this.displayedValues = this.uniqueValues;
        this.miniFilter = null;
        //we use a map rather than an array for the selected values as the lookup
        //for a map is much faster than the lookup for an array, especially when
        //the length of the array is thousands of records long
        this.selectedValuesMap = {};
        this.selectEverything();
    }

    SetFilterModel.prototype.createUniqueValues = function(rowModel, key) {
        var uniqueCheck = {};
        var result = [];
        for (var i = 0, l = rowModel.getVirtualRowCount(); i < l; i++) {
            var data = rowModel.getVirtualRow(i).data;
            var value = data ? data[key] : null;
            if (value === "" || value === undefined) {
                value = null;
            }
            if (!uniqueCheck.hasOwnProperty(value)) {
                result.push(value);
                uniqueCheck[value] = 1;
            }
        }
        this.uniqueValues = result;
    };

    //sets mini filter. returns true if it changed from last value, otherwise false
    SetFilterModel.prototype.setMiniFilter = function(newMiniFilter) {
        newMiniFilter = utils.makeNull(newMiniFilter);
        if (this.miniFilter === newMiniFilter) {
            //do nothing if filter has not changed
            return false;
        }
        this.miniFilter = newMiniFilter;
        this.filterDisplayedValues();
        return true;
    };

    SetFilterModel.prototype.getMiniFilter = function() {
        return this.miniFilter;
    };

    SetFilterModel.prototype.filterDisplayedValues = function() {
        // if no filter, just use the unique values
        if (this.miniFilter === null) {
            this.displayedValues = this.uniqueValues;
            return;
        }

        // if filter present, we filter down the list
        this.displayedValues = [];
        var miniFilterUpperCase = this.miniFilter.toUpperCase();
        for (var i = 0, l = this.uniqueValues.length; i < l; i++) {
            var uniqueValue = this.uniqueValues[i];
            if (uniqueValue !== null && uniqueValue.toString().toUpperCase().indexOf(miniFilterUpperCase) >= 0) {
                this.displayedValues.push(uniqueValue);
            }
        }

    };

    SetFilterModel.prototype.getDisplayedValueCount = function() {
        return this.displayedValues.length;
    };

    SetFilterModel.prototype.getDisplayedValue = function(index) {
        return this.displayedValues[index];
    };

    SetFilterModel.prototype.selectEverything = function() {
        var count = this.uniqueValues.length;
        for (var i = 0; i < count; i++) {
            var value = this.uniqueValues[i];
            this.selectedValuesMap[value] = null;
        }
        this.selectedValuesCount = count;
    };

    SetFilterModel.prototype.isFilterActive = function() {
        return this.uniqueValues.length !== this.selectedValuesCount;
    };

    SetFilterModel.prototype.selectNothing = function() {
        this.selectedValuesMap = {};
        this.selectedValuesCount = 0;
    };

    SetFilterModel.prototype.getUniqueValueCount = function() {
        return this.uniqueValues.length;
    };

    SetFilterModel.prototype.unselectValue = function(value) {
        if (this.selectedValuesMap[value] !== undefined) {
            delete this.selectedValuesMap[value];
            this.selectedValuesCount--;
        }
    };

    SetFilterModel.prototype.selectValue = function(value) {
        if (this.selectedValuesMap[value] === undefined) {
            this.selectedValuesMap[value] = null;
            this.selectedValuesCount++;
        }
    };

    SetFilterModel.prototype.isValueSelected = function(value) {
        return this.selectedValuesMap[value] !== undefined;
    };

    SetFilterModel.prototype.isEverythingSelected = function() {
        return this.uniqueValues.length === this.selectedValuesCount;
    };

    SetFilterModel.prototype.isNothingSelected = function() {
        return this.uniqueValues.length === 0;
    };


















    function setFilterTemplate() {
        return [
            '<div>',
            '    <div class="ag-filter-header-container">',
            '        <input class="ag-filter-filter" type="text" placeholder="search..."/>',
            '    </div>',
            '    <div class="ag-filter-header-container">',
            '        <label>',
            '            <input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>',
            '            (Select All)',
            '        </label>',
            '    </div>',
            '    <div class="ag-filter-list-viewport">',
            '        <div class="ag-filter-list-container">',
            '            <div id="itemForRepeat" class="ag-filter-item">',
            '                <label>',
            '                    <input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>',
            '                    <span class="ag-filter-value"></span>',
            '                </label>',
            '            </div>',
            '        </div>',
            '    </div>',
            '</div>',
        ].join('');
    }








    function SetFilter(params) {
        var filterParams = params.filterParams;
        this.rowHeight = (filterParams && filterParams.cellHeight) ? filterParams.cellHeight : DEFAULT_ROW_HEIGHT;
        this.model = new SetFilterModel(params.colDef, params.rowModel);
        this.filterChangedCallback = params.filterChangedCallback;
        this.rowsInBodyContainer = {};
        this.colDef = params.colDef;
        if (filterParams) {
            this.cellRenderer = filterParams.cellRenderer;
        }
        this.createGui();
        this.addScrollListener();
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    /* public */
    SetFilter.prototype.afterGuiAttached = function() {
        this.drawVirtualRows();
    };

    /* public */
    SetFilter.prototype.isFilterActive = function() {
        return this.model.isFilterActive();
    };

    /* public */
    SetFilter.prototype.doesFilterPass = function(node) {
        var value = node.value;
        var model = node.model;
        //if no filter, always pass
        if (model.isEverythingSelected()) {
            return true;
        }
        //if nothing selected in filter, always fail
        if (model.isNothingSelected()) {
            return false;
        }

        value = utils.makeNull(value);
        var filterPassed = model.selectedValuesMap[value] !== undefined;
        return filterPassed;
    };

    /* public */
    SetFilter.prototype.getGui = function() {
        return this.eGui;
    };

    /* public */
    SetFilter.prototype.onNewRowsLoaded = function() {
        this.model.selectEverything();
        this.updateAllCheckboxes(true);
    };

    /* public */
    SetFilter.prototype.getModel = function() {
        return this.model;
    };

    SetFilter.prototype.createGui = function() {
        var _this = this;

        this.eGui = utils.loadTemplate(template);

        this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
        this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
        this.eSelectAll = this.eGui.querySelector("#selectAll");
        this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
        this.eMiniFilter = this.eGui.querySelector(".ag-filter-filter");
        this.eListContainer.style.height = (this.model.getUniqueValueCount() * this.rowHeight) + "px";

        this.setContainerHeight();
        this.eMiniFilter.value = this.model.getMiniFilter();
        utils.addChangeListener(this.eMiniFilter, function() {
            _this.onFilterChanged();
        });
        utils.removeAllChildren(this.eListContainer);

        this.eSelectAll.onclick = this.onSelectAll.bind(this);

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

    SetFilter.prototype.setContainerHeight = function() {
        this.eListContainer.style.height = (this.model.getDisplayedValueCount() * this.rowHeight) + "px";
    };

    SetFilter.prototype.drawVirtualRows = function() {
        var topPixel = this.eListViewport.scrollTop;
        var bottomPixel = topPixel + this.eListViewport.offsetHeight;

        var firstRow = Math.floor(topPixel / this.rowHeight);
        var lastRow = Math.floor(bottomPixel / this.rowHeight);

        this.ensureRowsRendered(firstRow, lastRow);
    };

    SetFilter.prototype.ensureRowsRendered = function(start, finish) {
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
            if (this.model.getDisplayedValueCount() > rowIndex) {
                var value = this.model.getDisplayedValue(rowIndex);
                _this.insertRow(value, rowIndex);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    };

    //takes array of row id's
    SetFilter.prototype.removeVirtualRows = function(rowsToRemove) {
        var _this = this;
        rowsToRemove.forEach(function(indexToRemove) {
            var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
            _this.eListContainer.removeChild(eRowToRemove);
            delete _this.rowsInBodyContainer[indexToRemove];
        });
    };

    SetFilter.prototype.insertRow = function(value, rowIndex) {
        var _this = this;

        var eFilterValue = this.eFilterValueTemplate.cloneNode(true);

        var valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (this.cellRenderer) {
            //renderer provided, so use it
            var resultFromRenderer = this.cellRenderer({
                value: value
            });

            if (utils.isNode(resultFromRenderer) || utils.isElement(resultFromRenderer)) {
                //a dom node or element was returned, so add child
                valueElement.appendChild(resultFromRenderer);
            } else {
                //otherwise assume it was html, so just insert
                valueElement.innerHTML = resultFromRenderer;
            }

        } else {
            //otherwise display as a string
            var displayNameOfValue = value === null ? "(Blanks)" : value;
            valueElement.innerHTML = displayNameOfValue;
        }
        var eCheckbox = eFilterValue.querySelector("input");
        eCheckbox.checked = this.model.isValueSelected(value);

        eCheckbox.onclick = function() {
            _this.onCheckboxClicked(eCheckbox, value);
        };

        eFilterValue.style.top = (this.rowHeight * rowIndex) + "px";

        this.eListContainer.appendChild(eFilterValue);
        this.rowsInBodyContainer[rowIndex] = eFilterValue;
    };

    SetFilter.prototype.onCheckboxClicked = function(eCheckbox, value) {
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

        this.filterChangedCallback();
    };

    SetFilter.prototype.onFilterChanged = function() {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.setContainerHeight();
            this.clearVirtualRows();
            this.drawVirtualRows();
        }
    };

    SetFilter.prototype.clearVirtualRows = function() {
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);
    };

    SetFilter.prototype.onSelectAll = function() {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        } else {
            this.model.selectNothing();
        }
        this.updateAllCheckboxes(checked);
        this.filterChangedCallback();
    };

    SetFilter.prototype.updateAllCheckboxes = function(checked) {
        var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
        for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
            currentlyDisplayedCheckboxes[i].checked = checked;
        }
    };

    SetFilter.prototype.addScrollListener = function() {
        var _this = this;

        this.eListViewport.addEventListener("scroll", function() {
            _this.drawVirtualRows();
        });
    };

    function numberFilterTemplate() {
        return [
            '<div>',
            '    <div>',
            '        <select class="ag-filter-select" id="filterType">',
            '            <option value="1">Equals</option>',
            '            <option value="2">Less than</option>',
            '            <option value="3">Greater than</option>',
            '        </select>',
            '    </div>',
            '    <div>',
            '        <input class="ag-filter-filter" id="filterText" type="text" placeholder="filter..."/>',
            '    </div>',
            '</div>',
        ].join('');
    }

    function NumberFilter(params) {
        this.constants = {
            EQUALS: 1,
            LESS_THAN: 2,
            GREATER_THAN: 3,
        };
        this.filterChangedCallback = params.filterChangedCallback;
        this.createGui();
        this.filterNumber = null;
        this.filterType = this.constants.EQUALS;
    }

    /* public */
    NumberFilter.prototype.afterGuiAttached = function() {
        this.eFilterTextField.focus();
    };

    /* public */
    NumberFilter.prototype.doesFilterPass = function(node) {
        if (this.filterNumber === null) {
            return true;
        }
        var value = node.value;

        if (!value && value !== 0) {
            return false;
        }

        var valueAsNumber;
        if (typeof value === 'number') {
            valueAsNumber = value;
        } else {
            valueAsNumber = parseFloat(value);
        }

        switch (this.filterType) {
            case this.constants.EQUALS:
                return valueAsNumber === this.filterNumber;
            case this.constants.LESS_THAN:
                return valueAsNumber <= this.filterNumber;
            case this.constants.GREATER_THAN:
                return valueAsNumber >= this.filterNumber;
            default:
                // should never happen
                console.log('invalid filter type ' + this.filterType);
                return false;
        }
    };

    /* public */
    NumberFilter.prototype.getGui = function() {
        return this.eGui;
    };

    /* public */
    NumberFilter.prototype.isFilterActive = function() {
        return this.filterNumber !== null;
    };

    NumberFilter.prototype.createGui = function() {
        this.eGui = utils.loadTemplate(template);
        this.eFilterTextField = this.eGui.querySelector("#filterText");
        this.eTypeSelect = this.eGui.querySelector("#filterType");

        utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
    };

    NumberFilter.prototype.onTypeChanged = function() {
        this.filterType = parseInt(this.eTypeSelect.value);
        this.filterChangedCallback();
    };

    NumberFilter.prototype.onFilterChanged = function() {
        var filterText = utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        if (filterText) {
            this.filterNumber = parseFloat(filterText);
        } else {
            this.filterNumber = null;
        }
        this.filterChangedCallback();
    };














    function textFilterTemplate() {
        return [
            '<div>',
            '    <div>',
            '        <select class="ag-filter-select" id="filterType">',
            '            <option value="1">Contains</option>',
            '            <option value="2">Equals</option>',
            '            <option value="3">Starts with</option>',
            '            <option value="4">Ends with</option>',
            '        </select>',
            '    </div>',
            '    <div>',
            '        <input class="ag-filter-filter" id="filterText" type="text" placeholder="filter..."/>',
            '    </div>',
            '</div>'
        ].join('');
    }











    function TextFilter(params) {
        this.constants = {
            CONTAINS: 1,
            EQUALS: 2,
            STARTS_WITH: 3,
            ENDS_WITH: 4,
        };
        this.filterChangedCallback = params.filterChangedCallback;
        this.createGui();
        this.filterText = null;
        this.filterType = this.constants.CONTAINS;
    }

    /* public */
    TextFilter.prototype.afterGuiAttached = function() {
        this.eFilterTextField.focus();
    };

    /* public */
    TextFilter.prototype.doesFilterPass = function(node) {
        if (!this.filterText) {
            return true;
        }
        var value = node.value;
        if (!value) {
            return false;
        }
        var valueLowerCase = value.toString().toLowerCase();
        switch (this.filterType) {
            case this.constants.CONTAINS:
                return valueLowerCase.indexOf(this.filterText) >= 0;
            case this.constants.EQUALS:
                return valueLowerCase === this.filterText;
            case this.constants.STARTS_WITH:
                return valueLowerCase.indexOf(this.filterText) === 0;
            case this.constants.ENDS_WITH:
                var index = valueLowerCase.indexOf(this.filterText);
                return index >= 0 && index === (valueLowerCase.length - this.filterText.length);
            default:
                // should never happen
                console.log('invalid filter type ' + this.filterType);
                return false;
        }
    };

    /* public */
    TextFilter.prototype.getGui = function() {
        return this.eGui;
    };

    /* public */
    TextFilter.prototype.isFilterActive = function() {
        return this.filterText !== null;
    };

    TextFilter.prototype.createGui = function() {
        this.eGui = utils.loadTemplate(template);
        this.eFilterTextField = this.eGui.querySelector("#filterText");
        this.eTypeSelect = this.eGui.querySelector("#filterType");

        utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
    };

    TextFilter.prototype.onTypeChanged = function() {
        this.filterType = parseInt(this.eTypeSelect.value);
        this.filterChangedCallback();
    };

    TextFilter.prototype.onFilterChanged = function() {
        var filterText = utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        if (filterText) {
            this.filterText = filterText.toLowerCase();
        } else {
            this.filterText = null;
        }
        this.filterChangedCallback();
    };













    function FilterManager() {}

    FilterManager.prototype.init = function(grid, gridOptionsWrapper, $compile, $scope) {
        this.$compile = $compile;
        this.$scope = $scope;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.grid = grid;
        this.allFilters = {};
    };

    FilterManager.prototype.setRowModel = function(rowModel) {
        this.rowModel = rowModel;
    };

    // returns true if at least one filter is active
    FilterManager.prototype.isFilterPresent = function() {
        var atLeastOneActive = false;
        var that = this;

        var keys = Object.keys(this.allFilters);
        keys.forEach(function(key) {
            var filterWrapper = that.allFilters[key];
            if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method isFilterActive');
            }
            if (filterWrapper.filter.isFilterActive()) {
                atLeastOneActive = true;
            }
        });
        return atLeastOneActive;
    };

    // returns true if given col has a filter active
    FilterManager.prototype.isFilterPresentForCol = function(colKey) {
        var filterWrapper = this.allFilters[colKey];
        if (!filterWrapper) {
            return false;
        }
        if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method isFilterActive');
        }
        var filterPresent = filterWrapper.filter.isFilterActive();
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function(node) {
        var data = node.data;
        var colKeys = Object.keys(this.allFilters);
        for (var i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming

            var colKey = colKeys[i];
            var filterWrapper = this.allFilters[colKey];

            // if no filter, always pass
            if (filterWrapper === undefined) {
                continue;
            }

            var value = data[filterWrapper.field];
            if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method doesFilterPass');
            }
            var model;
            // if model is exposed, grab it
            if (filterWrapper.filter.getModel) {
                model = filterWrapper.filter.getModel();
            }
            var params = {
                value: value,
                model: model,
                node: node,
                data: data
            };
            if (!filterWrapper.filter.doesFilterPass(params)) {
                return false;
            }
        }
        // all filters passed
        return true;
    };

    FilterManager.prototype.onNewRowsLoaded = function() {
        var that = this;
        Object.keys(this.allFilters).forEach(function(field) {
            var filter = that.allFilters[field].filter;
            if (filter.onNewRowsLoaded) {
                filter.onNewRowsLoaded();
            }
        });
    };

    FilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = ePopupRoot.getBoundingClientRect();

        var x = sourceRect.left - parentRect.left;
        var y = sourceRect.top - parentRect.top + sourceRect.height;

        // if popup is overflowing to the right, move it left
        var widthOfPopup = 200; // this is set in the css
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - widthOfPopup - 20; // 20 pixels grace
        if (x > maxX) { // move position left, back into view
            x = maxX;
        }
        if (x < 0) { // in case the popup has a negative value
            x = 0;
        }

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDefWrapper, eventSource) {

        var filterWrapper = this.allFilters[colDefWrapper.colKey];
        var colDef = colDefWrapper.colDef;

        if (!filterWrapper) {
            filterWrapper = {
                colKey: colDefWrapper.colKey,
                field: colDef.field
            };
            var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
            var filterParams = colDef.filterParams;
            var params = {
                colDef: colDef,
                rowModel: this.rowModel,
                filterChangedCallback: filterChangedCallback,
                filterParams: filterParams,
                scope: filterWrapper.scope
            };
            if (typeof colDef.filter === 'function') {
                // if user provided a filter, just use it
                // first up, create child scope if needed
                if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                    var scope = this.$scope.$new();
                    filterWrapper.scope = scope;
                    params.$scope = scope;
                }
                // now create filter
                filterWrapper.filter = new colDef.filter(params);
            } else if (colDef.filter === 'text') {
                filterWrapper.filter = new StringFilter(params);
            } else if (colDef.filter === 'number') {
                filterWrapper.filter = new NumberFilter(params);
            } else {
                filterWrapper.filter = new SetFilter(params);
            }
            this.allFilters[colDefWrapper.colKey] = filterWrapper;

            if (!filterWrapper.filter.getGui) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method getGui');
            }

            var eFilterGui = document.createElement('div');
            eFilterGui.className = 'ag-filter';
            var guiFromFilter = filterWrapper.filter.getGui();
            if (utils.isNode(guiFromFilter) || utils.isElement(guiFromFilter)) {
                //a dom node or element was returned, so add child
                eFilterGui.appendChild(guiFromFilter);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement('span');
                eTextSpan.innerHTML = guiFromFilter;
                eFilterGui.appendChild(eTextSpan);
            }

            if (filterWrapper.scope) {
                filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
            } else {
                filterWrapper.gui = eFilterGui;
            }

        }

        var ePopupParent = this.grid.getPopupParent();
        this.positionPopup(eventSource, filterWrapper.gui, ePopupParent);

        utils.addAsModalPopup(ePopupParent, filterWrapper.gui);

        if (filterWrapper.filter.afterGuiAttached) {
            filterWrapper.filter.afterGuiAttached();
        }
    };


    function GroupCreator() {}

    GroupCreator.prototype.group = function(rowNodes, groupByFields, groupAggFunction, expandByDefault) {

        var topMostGroup = {
            level: -1,
            children: [],
            childrenMap: {}
        };

        var allGroups = [];
        allGroups.push(topMostGroup);

        var levelToInsertChild = groupByFields.length - 1;
        var i, currentLevel, node, data, currentGroup, groupByField, groupKey, nextGroup;

        // start at -1 and go backwards, as all the positive indexes
        // are already used by the nodes.
        var index = -1;

        for (i = 0; i < rowNodes.length; i++) {
            node = rowNodes[i];
            data = node.data;

            for (currentLevel = 0; currentLevel < groupByFields.length; currentLevel++) {
                groupByField = groupByFields[currentLevel];
                groupKey = data[groupByField];

                if (currentLevel == 0) {
                    currentGroup = topMostGroup;
                }

                //if group doesn't exist yet, create it
                nextGroup = currentGroup.childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = {
                        group: true,
                        field: groupByField,
                        id: index--,
                        key: groupKey,
                        expanded: this.isExpanded(expandByDefault, currentLevel),
                        children: [],
                        // for top most level, parent is null
                        parent: currentGroup === topMostGroup ? null : currentGroup,
                        allChildrenCount: 0,
                        level: currentGroup.level + 1,
                        childrenMap: {} //this is a temporary map, we remove at the end of this method
                    };
                    currentGroup.childrenMap[groupKey] = nextGroup;
                    currentGroup.children.push(nextGroup);
                    allGroups.push(nextGroup);
                }

                nextGroup.allChildrenCount++;

                if (currentLevel == levelToInsertChild) {
                    node.parent = nextGroup === topMostGroup ? null : nextGroup;
                    nextGroup.children.push(node);
                } else {
                    currentGroup = nextGroup;
                }
            }

        }

        //remove the temporary map
        for (i = 0; i < allGroups.length; i++) {
            delete allGroups[i].childrenMap;
        }

        return topMostGroup.children;
    };

    GroupCreator.prototype.isExpanded = function(expandByDefault, level) {
        if (typeof expandByDefault === 'number') {
            return level < expandByDefault;
        } else {
            return expandByDefault === true || expandByDefault === 'true';
        }
    };





























    function InMemoryRowController() {
        this.createModel();
    }

    InMemoryRowController.prototype.init = function(gridOptionsWrapper, columnModel, angularGrid, filterManager, $scope) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.columnModel = columnModel;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
        this.$scope = $scope;

        this.allRows = null;
        this.rowsAfterGroup = null;
        this.rowsAfterFilter = null;
        this.rowsAfterSort = null;
        this.rowsAfterMap = null;
    };

    // private
    InMemoryRowController.prototype.createModel = function() {
        var that = this;
        this.model = {
            // this method is implemented by the inMemory model only,
            // it gives the top level of the selection. used by the selection
            // controller, when it needs to do a full traversal
            getTopLevelNodes: function() {
                return that.rowsAfterGroup;
            },
            getVirtualRow: function(index) {
                return that.rowsAfterMap[index];
            },
            getVirtualRowCount: function() {
                if (that.rowsAfterMap) {
                    return that.rowsAfterMap.length;
                } else {
                    return 0;
                }
            }
        };
    };

    // public
    InMemoryRowController.prototype.getModel = function() {
        return this.model;
    };

    // public
    InMemoryRowController.prototype.updateModel = function(step) {


        // fallthrough in below switch is on purpose
        switch (step) {
            case constants.STEP_EVERYTHING:
                this.doGrouping();
            case constants.STEP_FILTER:
                this.doFilter();
                this.doAggregate();
            case constants.STEP_SORT:
                this.doSort();
            case constants.STEP_MAP:
                this.doGroupMapping();
        }

        if (typeof this.gridOptionsWrapper.getModelUpdated() === 'function') {
            this.gridOptionsWrapper.getModelUpdated()();
            var $scope = this.$scope;
            if ($scope) {
                setTimeout(function() {
                    $scope.$apply();
                }, 0);
            }
        }

    };

    // public - it's possible to recompute the aggregate without doing the other parts
    InMemoryRowController.prototype.doAggregate = function() {

        var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
        if (typeof groupAggFunction !== 'function') {
            return;
        }

        this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction);
    };

    // public
    InMemoryRowController.prototype.expandOrCollapseAll = function(expand, rowNodes) {
        // if first call in recursion, we set list to parent list
        if (rowNodes === null) {
            rowNodes = this.rowsAfterGroup;
        }

        if (!rowNodes) {
            return;
        }

        var _this = this;
        rowNodes.forEach(function(node) {
            if (node.group) {
                node.expanded = expand;
                _this.expandOrCollapseAll(expand, node.children);
            }
        });
    };

    // private
    InMemoryRowController.prototype.recursivelyCreateAggData = function(nodes, groupAggFunction) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyCreateAggData(node.children, groupAggFunction);
                // after traversal, we can now do the agg at this level
                var data = groupAggFunction(node.children);
                node.data = data;
                // if we are grouping, then it's possible there is a sibling footer
                // to the group, so update the data here also if thers is one
                if (node.sibling) {
                    node.sibling.data = data;
                }
            }
        }
    };

    // private
    InMemoryRowController.prototype.doSort = function() {
        //see if there is a col we are sorting by
        var columnForSorting = null;
        this.columnModel.getAllColumns().forEach(function(colDefWrapper) {
            if (colDefWrapper.sort) {
                columnForSorting = colDefWrapper;
            }
        });

        var rowNodesBeforeSort = this.rowsAfterFilter.slice(0);

        if (columnForSorting) {
            var ascending = columnForSorting.sort === constants.ASC;
            var inverter = ascending ? 1 : -1;

            this.sortList(rowNodesBeforeSort, columnForSorting.colDef, inverter);
        } else {
            //if no sorting, set all group children after sort to the original list
            this.resetSortInGroups(rowNodesBeforeSort);
        }

        this.rowsAfterSort = rowNodesBeforeSort;
    };

    // private
    InMemoryRowController.prototype.resetSortInGroups = function(rowNodes) {
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group && item.children) {
                item.childrenAfterSort = item.children;
                this.resetSortInGroups(item.children);
            }
        }
    };

    // private
    InMemoryRowController.prototype.sortList = function(nodes, columnForSorting, inverter) {

        // sort any groups recursively
        for (var i = 0, l = nodes.length; i < l; i++) { // critical section, no functional programming
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterSort = node.children.slice(0);
                this.sortList(node.childrenAfterSort, columnForSorting, inverter);
            }
        }

        nodes.sort(function(objA, objB) {
            var keyForSort = columnForSorting.field;
            var valueA = objA.data ? objA.data[keyForSort] : null;
            var valueB = objB.data ? objB.data[keyForSort] : null;

            if (columnForSorting.comparator) {
                //if comparator provided, use it
                return columnForSorting.comparator(valueA, valueB) * inverter;
            } else {
                //otherwise do our own comparison
                return utils.defaultComparator(valueA, valueB) * inverter;
            }

        });
    };

    // private
    InMemoryRowController.prototype.doGrouping = function() {
        var rowsAfterGroup;
        if (this.gridOptionsWrapper.isDoInternalGrouping()) {
            var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
            rowsAfterGroup = groupCreator.group(this.allRows, this.gridOptionsWrapper.getGroupKeys(),
                this.gridOptionsWrapper.getGroupAggFunction(), expandByDefault);
        } else {
            rowsAfterGroup = this.allRows;
        }
        this.rowsAfterGroup = rowsAfterGroup;
    };

    // private
    InMemoryRowController.prototype.doFilter = function() {
        var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
        var advancedFilterPresent = this.filterManager.isFilterPresent();
        var filterPresent = quickFilterPresent || advancedFilterPresent;

        var rowsAfterFilter;
        if (filterPresent) {
            rowsAfterFilter = this.filterItems(this.rowsAfterGroup, quickFilterPresent, advancedFilterPresent);
        } else {
            rowsAfterFilter = this.rowsAfterGroup;
        }
        this.rowsAfterFilter = rowsAfterFilter;
    };

    // private
    InMemoryRowController.prototype.filterItems = function(rowNodes, quickFilterPresent, advancedFilterPresent) {
        var result = [];

        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var node = rowNodes[i];

            if (node.group) {
                // deal with group
                var filteredChildren = this.filterItems(node.children, quickFilterPresent, advancedFilterPresent);
                if (filteredChildren.length > 0) {
                    var allChildrenCount = this.getTotalChildCount(filteredChildren);
                    var newGroup = this.copyGroupNode(node, filteredChildren, allChildrenCount);

                    result.push(newGroup);
                }
            } else {
                if (this.doesRowPassFilter(node, quickFilterPresent, advancedFilterPresent)) {
                    result.push(node);
                }
            }
        }

        return result;
    };

    // private
    // rows: the rows to put into the model
    // firstId: the first id to use, used for paging, where we are not on the first page
    InMemoryRowController.prototype.setAllRows = function(rows, firstId) {
        var nodes;
        if (this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
            nodes = rows;
            this.recursivelyCheckUserProvidedNodes(nodes, null, 0);
        } else {
            // place each row into a wrapper
            nodes = [];
            if (rows) {
                for (var i = 0; i < rows.length; i++) { // could be lots of rows, don't use functional programming
                    nodes.push({
                        data: rows[i]
                    });
                }
            }
        }

        // if firstId provided, use it, otherwise start at 0
        var firstIdToUse = firstId ? firstId : 0;
        this.recursivelyAddIdToNodes(nodes, firstIdToUse);
        this.allRows = nodes;
    };

    // add in index - this is used by the selectionController - so quick
    // to look up selected rows
    InMemoryRowController.prototype.recursivelyAddIdToNodes = function(nodes, index) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.id = index++;
            if (node.group && node.children) {
                index = this.recursivelyAddIdToNodes(node.children, index);
            }
        }
        return index;
    };

    // add in index - this is used by the selectionController - so quick
    // to look up selected rows
    InMemoryRowController.prototype.recursivelyCheckUserProvidedNodes = function(nodes, parent, level) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (parent) {
                node.parent = parent;
            }
            node.level = level;
            if (node.group && node.children) {
                this.recursivelyCheckUserProvidedNodes(node.children, node, level + 1);
            }
        }
    };

    // private
    InMemoryRowController.prototype.getTotalChildCount = function(rowNodes) {
        var count = 0;
        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var item = rowNodes[i];
            if (item.group) {
                count += item.allChildrenCount;
            } else {
                count++;
            }
        }
        return count;
    };

    // private
    InMemoryRowController.prototype.copyGroupNode = function(groupNode, children, allChildrenCount) {
        return {
            group: true,
            data: groupNode.data,
            field: groupNode.field,
            key: groupNode.key,
            expanded: groupNode.expanded,
            children: children,
            allChildrenCount: allChildrenCount,
            level: groupNode.level
        };
    };

    // private
    InMemoryRowController.prototype.doGroupMapping = function() {
        // even if not going grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var rowsAfterMap = [];
        this.addToMap(rowsAfterMap, this.rowsAfterSort);
        this.rowsAfterMap = rowsAfterMap;
    };

    // private
    InMemoryRowController.prototype.addToMap = function(mappedData, originalNodes) {
        if (!originalNodes) {
            return;
        }
        for (var i = 0; i < originalNodes.length; i++) {
            var node = originalNodes[i];
            mappedData.push(node);
            if (node.group && node.expanded) {
                this.addToMap(mappedData, node.childrenAfterSort);

                // put a footer in if user is looking for it
                if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                    var footerNode = this.createFooterNode(node);
                    mappedData.push(footerNode);
                }
            }
        }
    };

    // private
    InMemoryRowController.prototype.createFooterNode = function(groupNode) {
        var footerNode = {};
        Object.keys(groupNode).forEach(function(key) {
            footerNode[key] = groupNode[key];
        });
        footerNode.footer = true;
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
        return footerNode;
    };

    // private
    InMemoryRowController.prototype.doesRowPassFilter = function(node, quickFilterPresent, advancedFilterPresent) {
        //first up, check quick filter
        if (quickFilterPresent) {
            if (!node.quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(node);
            }
            if (node.quickFilterAggregateText.indexOf(this.angularGrid.getQuickFilter()) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }

        //second, check advanced filter
        if (advancedFilterPresent) {
            if (!this.filterManager.doesFilterPass(node)) {
                return false;
            }
        }

        //got this far, all filters pass
        return true;
    };

    // private
    InMemoryRowController.prototype.aggregateRowForQuickFilter = function(node) {
        var aggregatedText = '';
        this.columnModel.getAllColumns().forEach(function(colDefWrapper) {
            var data = node.data;
            var value = data ? data[colDefWrapper.colDef.field] : null;
            if (value && value !== '') {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        node.quickFilterAggregateText = aggregatedText;
    };






















    function VirtualPageRowController() {
        this.logging = true;
    }

    VirtualPageRowController.prototype.init = function(rowRenderer) {
        this.rowRenderer = rowRenderer;
        this.datasourceVersion = 0;
    };

    VirtualPageRowController.prototype.setDatasource = function(datasource) {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to working with
            return;
        }

        this.reset();
    };

    VirtualPageRowController.prototype.reset = function() {
        // see if datasource knows how many rows there are
        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
            this.virtualRowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
        } else {
            this.virtualRowCount = 0;
            this.foundMaxRow = false;
        }

        // in case any daemon requests coming from datasource, we know it ignore them
        this.datasourceVersion++;

        // map of page numbers to rows in that page
        this.pageCache = {};
        this.pageCacheSize = 0;

        // if a number is in this array, it means we are pending a load from it
        this.pageLoadsInProgress = [];
        this.pageLoadsQueued = [];
        this.pageAccessTimes = {}; // keeps a record of when each page was last viewed, used for LRU cache
        this.accessTime = 0; // rather than using the clock, we use this counter

        // the number of concurrent loads we are allowed to the server
        if (typeof this.datasource.maxConcurrentRequests === 'number' && this.datasource.maxConcurrentRequests > 0) {
            this.maxConcurrentDatasourceRequests = this.datasource.maxConcurrentRequests;
        } else {
            this.maxConcurrentDatasourceRequests = 2;
        }

        // the number of pages to keep in browser cache
        if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
            this.maxPagesInCache = this.datasource.maxPagesInCache;
        } else {
            // null is default, means don't  have any max size on the cache
            this.maxPagesInCache = null;
        }

        this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
        this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing

        this.doLoadOrQueue(0);
    };

    VirtualPageRowController.prototype.createNodesFromRows = function(pageNumber, rows) {
        var nodes = [];
        if (rows) {
            for (var i = 0, j = rows.length; i < j; i++) {
                var virtualRowIndex = (pageNumber * this.pageSize) + i;
                nodes.push({
                    data: rows[i],
                    id: virtualRowIndex
                });
            }
        }
        return nodes;
    };

    VirtualPageRowController.prototype.removeFromLoading = function(pageNumber) {
        var index = this.pageLoadsInProgress.indexOf(pageNumber);
        this.pageLoadsInProgress.splice(index, 1);
    };

    VirtualPageRowController.prototype.pageLoadFailed = function(pageNumber) {
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    };

    VirtualPageRowController.prototype.pageLoaded = function(pageNumber, rows, lastRow) {
        this.putPageIntoCacheAndPurge(pageNumber, rows);
        this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
        this.removeFromLoading(pageNumber);
        this.checkQueueForNextLoad();
    };

    VirtualPageRowController.prototype.putPageIntoCacheAndPurge = function(pageNumber, rows) {
        this.pageCache[pageNumber] = this.createNodesFromRows(pageNumber, rows);
        this.pageCacheSize++;
        if (this.logging) {
            console.log('adding page ' + pageNumber);
        }

        var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageCacheSize;
        if (needToPurge) {
            // find the LRU page
            var youngestPageIndex = this.findLeastRecentlyAccessedPage(Object.keys(this.pageCache));

            if (this.logging) {
                console.log('purging page ' + youngestPageIndex + ' from cache ' + Object.keys(this.pageCache));
            }
            delete this.pageCache[youngestPageIndex];
            this.pageCacheSize--;
        }

    };

    VirtualPageRowController.prototype.checkMaxRowAndInformRowRenderer = function(pageNumber, lastRow) {
        if (!this.foundMaxRow) {
            // if we know the last row, use if
            if (typeof lastRow === 'number' && lastRow >= 0) {
                this.virtualRowCount = lastRow;
                this.foundMaxRow = true;
            } else {
                // otherwise, see if we need to add some virtual rows
                var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
                if (this.virtualRowCount < thisPagePlusBuffer) {
                    this.virtualRowCount = thisPagePlusBuffer;
                }
            }
            // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
            this.rowRenderer.refreshView();
        } else {
            this.rowRenderer.refreshAllVirtualRows();
        }
    };

    VirtualPageRowController.prototype.isPageAlreadyLoading = function(pageNumber) {
        var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
        return result;
    };

    VirtualPageRowController.prototype.doLoadOrQueue = function(pageNumber) {
        // if we already tried to load this page, then ignore the request,
        // otherwise server would be hit 50 times just to display one page, the
        // first row to find the page missing is enough.
        if (this.isPageAlreadyLoading(pageNumber)) {
            return;
        }

        // try the page load - if not already doing a load, then we can go ahead
        if (this.pageLoadsInProgress.length < this.maxConcurrentDatasourceRequests) {
            // go ahead, load the page
            this.loadPage(pageNumber);
        } else {
            // otherwise, queue the request
            this.addToQueueAndPurgeQueue(pageNumber);
        }
    };

    VirtualPageRowController.prototype.addToQueueAndPurgeQueue = function(pageNumber) {
        if (this.logging) {
            console.log('queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
        }
        this.pageLoadsQueued.push(pageNumber);

        // see if there are more pages queued that are actually in our cache, if so there is
        // no point in loading them all as some will be purged as soon as loaded
        var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageLoadsQueued.length;
        if (needToPurge) {
            // find the LRU page
            var youngestPageIndex = this.findLeastRecentlyAccessedPage(this.pageLoadsQueued);

            if (this.logging) {
                console.log('de-queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
            }

            var indexToRemove = this.pageLoadsQueued.indexOf(youngestPageIndex);
            this.pageLoadsQueued.splice(indexToRemove, 1);
        }
    };

    VirtualPageRowController.prototype.findLeastRecentlyAccessedPage = function(pageIndexes) {
        var youngestPageIndex = -1;
        var youngestPageAccessTime = Number.MAX_VALUE;
        var that = this;

        pageIndexes.forEach(function(pageIndex) {
            var accessTimeThisPage = that.pageAccessTimes[pageIndex];
            if (accessTimeThisPage < youngestPageAccessTime) {
                youngestPageAccessTime = accessTimeThisPage;
                youngestPageIndex = pageIndex;
            }
        });

        return youngestPageIndex;
    };

    VirtualPageRowController.prototype.checkQueueForNextLoad = function() {
        if (this.pageLoadsQueued.length > 0) {
            // take from the front of the queue
            var pageToLoad = this.pageLoadsQueued[0];
            this.pageLoadsQueued.splice(0, 1);

            if (this.logging) {
                console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued);
            }

            this.loadPage(pageToLoad);
        }
    };

    VirtualPageRowController.prototype.loadPage = function(pageNumber) {

        this.pageLoadsInProgress.push(pageNumber);

        var startRow = pageNumber * this.pageSize;
        var endRow = (pageNumber + 1) * this.pageSize;

        var that = this;
        var datasourceVersionCopy = this.datasourceVersion;

        this.datasource.getRows(startRow, endRow,
            function success(rows, lastRow) {
                if (that.requestIsDaemon(datasourceVersionCopy)) {
                    return;
                }
                that.pageLoaded(pageNumber, rows, lastRow);
            },
            function fail() {
                if (that.requestIsDaemon(datasourceVersionCopy)) {
                    return;
                }
                that.pageLoadFailed(pageNumber);
            }
        );
    };

    // check that the datasource has not changed since the lats time we did a request
    VirtualPageRowController.prototype.requestIsDaemon = function(datasourceVersionCopy) {
        return this.datasourceVersion !== datasourceVersionCopy;
    };

    VirtualPageRowController.prototype.getVirtualRow = function(rowIndex) {
        if (rowIndex > this.virtualRowCount) {
            return null;
        }

        var pageNumber = Math.floor(rowIndex / this.pageSize);
        var page = this.pageCache[pageNumber];

        // for LRU cache, track when this page was last hit
        this.pageAccessTimes[pageNumber] = this.accessTime++;

        if (!page) {
            this.doLoadOrQueue(pageNumber);
            // return back an empty row, so table can at least render empty cells
            return {
                data: {},
                id: rowIndex
            };
        } else {
            var indexInThisPage = rowIndex % this.pageSize;
            return page[indexInThisPage];
        }
    };

    VirtualPageRowController.prototype.getModel = function() {
        var that = this;
        return {
            getVirtualRow: function(index) {
                return that.getVirtualRow(index);
            },
            getVirtualRowCount: function() {
                return that.virtualRowCount;
            }
        };
    };


























    function SvgFactory() {
        this.SVG_NS = "http://www.w3.org/2000/svg";
    }

    SvgFactory.prototype.createFilterSvg = function() {
        var eSvg = createIconSvg();

        var eFunnel = document.createElementNS(this.SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    };

    SvgFactory.prototype.createMenuSvg = function() {
        var eSvg = document.createElementNS(this.SVG_NS, "svg");
        var size = "12";
        eSvg.setAttribute("width", size);
        eSvg.setAttribute("height", size);

        ["0", "5", "10"].forEach(function(y) {
            var eLine = document.createElementNS(this.SVG_NS, "rect");
            eLine.setAttribute("y", y);
            eLine.setAttribute("width", size);
            eLine.setAttribute("height", "2");
            eLine.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eLine);
        });

        return eSvg;
    };

    SvgFactory.prototype.createArrowUpSvg = function() {
        return createPolygonSvg("0,10 5,0 10,10");
    };

    SvgFactory.prototype.createArrowLeftSvg = function() {
        return createPolygonSvg("10,0 0,5 10,10");
    };

    SvgFactory.prototype.createArrowDownSvg = function() {
        return createPolygonSvg("0,0 5,10 10,0");
    };

    SvgFactory.prototype.createArrowRightSvg = function() {
        return createPolygonSvg("0,0 10,5 0,10");
    };

    function createPolygonSvg(points) {
        var eSvg = createIconSvg();

        var eDescIcon = document.createElementNS(this.SVG_NS, "polygon");
        eDescIcon.setAttribute("points", points);
        eSvg.appendChild(eDescIcon);

        return eSvg;
    }

    // util function for the above
    function createIconSvg() {
        var eSvg = document.createElementNS(this.SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        return eSvg;
    }























    function RowRenderer() {
        this.TAB_KEY = 9;
        this.ENTER_KEY = 13;
    }

    RowRenderer.prototype.init = function(gridOptions, columnModel, gridOptionsWrapper, eGrid,
        angularGrid, selectionRendererFactory, $compile, $scope,
        selectionController) {
        this.gridOptions = gridOptions;
        this.columnModel = columnModel;
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

        this.renderedRowStartEditingListeners = {};

        this.editingCell = false; //gets set to true when editing a cell
    };

    RowRenderer.prototype.setRowModel = function(rowModel) {
        this.rowModel = rowModel;
    };

    RowRenderer.prototype.setMainRowWidths = function() {
        var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";

        var unpinnedRows = this.eBodyContainer.querySelectorAll(".ag-row");
        for (var i = 0; i < unpinnedRows.length; i++) {
            unpinnedRows[i].style.width = mainRowWidth;
        }
    };

    RowRenderer.prototype.findAllElements = function(eGrid) {
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
            var rowCount = this.rowModel.getVirtualRowCount();
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
        Object.keys(renderedRows).forEach(function(key) {
            var renderedRow = renderedRows[key];
            // see if the rendered row is in the list of rows we have to update
            var rowNeedsUpdating = rows.indexOf(renderedRow.node.data) >= 0;
            if (rowNeedsUpdating) {
                indexesToRemove.push(key);
            }
        });
        // remove the rows
        this.removeVirtualRows(indexesToRemove);
        // add draw them again
        this.drawVirtualRows();
    };

    RowRenderer.prototype.refreshAllVirtualRows = function() {
        // remove all current virtual rows, as they have old data
        var rowsToRemove = Object.keys(this.renderedRows);
        this.removeVirtualRows(rowsToRemove);

        // add in new rows
        this.drawVirtualRows();
    };

    // public - removes the group rows and then redraws them again
    RowRenderer.prototype.refreshGroupRows = function() {
        // find all the group rows
        var rowsToRemove = [];
        var that = this;
        Object.keys(this.renderedRows).forEach(function(key) {
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

    // takes array of row indexes
    RowRenderer.prototype.removeVirtualRows = function(rowsToRemove) {
        var that = this;
        rowsToRemove.forEach(function(indexToRemove) {
            that.removeVirtualRow(indexToRemove);
        });
    };

    RowRenderer.prototype.removeVirtualRow = function(indexToRemove) {
        var renderedRow = this.renderedRows[indexToRemove];
        if (renderedRow.pinnedElement && this.ePinnedColsContainer) {
            this.ePinnedColsContainer.removeChild(renderedRow.pinnedElement);
        }

        if (renderedRow.bodyElement) {
            this.eBodyContainer.removeChild(renderedRow.bodyElement);
        }

        if (renderedRow.scope) {
            renderedRow.scope.$destroy();
        }

        if (this.gridOptionsWrapper.getVirtualRowRemoved()) {
            this.gridOptionsWrapper.getVirtualRowRemoved()(renderedRow.data, indexToRemove);
        }
        this.angularGrid.onVirtualRowRemoved(indexToRemove);

        delete this.renderedRows[indexToRemove];
        delete this.renderedRowStartEditingListeners[indexToRemove];
    };

    RowRenderer.prototype.drawVirtualRows = function() {
        var first;
        var last;

        var rowCount = this.rowModel.getVirtualRowCount();

        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            first = 0;
            last = rowCount;
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

    RowRenderer.prototype.isIndexRendered = function(index) {
        return index >= this.firstVirtualRenderedRow && index <= this.lastVirtualRenderedRow;
    };

    RowRenderer.prototype.getFirstVirtualRenderedRow = function() {
        return this.firstVirtualRenderedRow;
    };

    RowRenderer.prototype.getLastVirtualRenderedRow = function() {
        return this.lastVirtualRenderedRow;
    };

    RowRenderer.prototype.ensureRowsRendered = function() {

        var mainRowWidth = this.columnModel.getBodyContainerWidth();
        var that = this;

        //at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.renderedRows);

        //add in new rows
        for (var rowIndex = this.firstVirtualRenderedRow; rowIndex <= this.lastVirtualRenderedRow; rowIndex++) {
            // see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            var node = this.rowModel.getVirtualRow(rowIndex);
            if (node) {

                that.insertRow(node, rowIndex, mainRowWidth);
            }
        }

        //at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);

        //if we are doing angular compiling, then do digest the scope here
        if (this.gridOptions.angularCompileRows) {
            // we do it in a timeout, in case we are already in an apply
            setTimeout(function() {
                that.$scope.$apply();
            }, 0);
        }
    };

    RowRenderer.prototype.insertRow = function(node, rowIndex, mainRowWidth) {
        //if no cols, don't draw row
        if (!this.gridOptionsWrapper.isColumDefsPresent()) {
            return;
        }

        //var rowData = node.rowData;
        var rowIsAGroup = node.group;
        var rowIsAFooter = node.footer;

        var ePinnedRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
        var eMainRow = this.createRowContainer(rowIndex, node, rowIsAGroup);
        var _this = this;

        eMainRow.style.width = mainRowWidth + "px";

        // try compiling as we insert rows
        var newChildScope = this.createChildScopeOrNull(node.data);

        var renderedRow = {
            scope: newChildScope,
            node: node,
            rowIndex: rowIndex
        };
        this.renderedRows[rowIndex] = renderedRow;
        this.renderedRowStartEditingListeners[rowIndex] = {};

        // if group item, insert the first row
        var columns = this.columnModel.getVisibleColumns();
        if (rowIsAGroup) {
            var firstColumn = columns[0];
            var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();

            var eGroupRow = _this.createGroupElement(node, firstColumn, groupHeaderTakesEntireRow, false, rowIndex, rowIsAFooter);
            if (firstColumn.pinned) {
                ePinnedRow.appendChild(eGroupRow);
            } else {
                eMainRow.appendChild(eGroupRow);
            }

            if (firstColumn.pinned && groupHeaderTakesEntireRow) {
                var eGroupRowPadding = _this.createGroupElement(node, firstColumn, groupHeaderTakesEntireRow, true, rowIndex, rowIsAFooter);
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
                columns.forEach(function(column, colIndex) {
                    if (colIndex == 0) { //skip first col, as this is the group col we already inserted
                        return;
                    }
                    var value = groupData ? groupData[column.colDef.field] : undefined;
                    _this.createCellFromColDef(false, column, value, node, rowIndex, eMainRow, ePinnedRow, newChildScope);
                });
            }

        } else {
            columns.forEach(function(column, index) {
                var firstCol = index === 0;
                _this.createCellFromColDef(firstCol, column, node.data[column.colDef.field], node, rowIndex, eMainRow, ePinnedRow, newChildScope);
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

    RowRenderer.prototype.createCellFromColDef = function(isFirstColumn, column, value, node, rowIndex, eMainRow, ePinnedRow, $childScope) {
        var eGridCell = this.createCell(isFirstColumn, column, value, node, rowIndex, $childScope);

        if (column.pinned) {
            ePinnedRow.appendChild(eGridCell);
        } else {
            eMainRow.appendChild(eGridCell);
        }
    };

    RowRenderer.prototype.addClassesToRow = function(rowIndex, node, eRow) {
        var classesList = ["ag-row"];
        classesList.push(rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");

        if (this.selectionController.isNodeSelected(node)) {
            classesList.push("ag-row-selected");
        }
        if (node.group) {
            // if a group, put the level of the group in
            classesList.push("ag-row-level-" + node.level);
        } else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (node.parent) {
                classesList.push("ag-row-level-" + (node.parent.level + 1));
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
            var params = {
                node: node,
                data: node.data,
                rowIndex: rowIndex,
                gridOptions: this.gridOptionsWrapper.getGridOptions()
            };
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
                _this.angularGrid.onRowClicked(event, Number(this.getAttribute("row")), node)
            });
        }

        return eRow;
    };

    RowRenderer.prototype.getIndexOfRenderedNode = function(node) {
        var renderedRows = this.renderedRows;
        var keys = Object.keys(renderedRows);
        for (var i = 0; i < keys.length; i++) {
            if (renderedRows[keys[i]].node === node) {
                return renderedRows[keys[i]].rowIndex;
            }
        }
        return -1;
    };

    RowRenderer.prototype.setCssClassForGroupCell = function(eGridGroupRow, footer, useEntireRow, firstColumnIndex) {
        if (useEntireRow) {
            if (footer) {
                eGridGroupRow.className = 'ag-footer-cell-entire-row';
            } else {
                eGridGroupRow.className = 'ag-group-cell-entire-row';
            }
        } else {
            if (footer) {
                eGridGroupRow.className = 'ag-footer-cell ag-cell cell-col-' + firstColumnIndex;
            } else {
                eGridGroupRow.className = 'ag-group-cell ag-cell cell-col-' + firstColumnIndex;
            }
        }
    };

    RowRenderer.prototype.createGroupElement = function(node, firstColumn, useEntireRow, padding, rowIndex, footer) {
        var eGridGroupRow = document.createElement('div');

        this.setCssClassForGroupCell(eGridGroupRow, footer, useEntireRow, firstColumn.index);

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
            var rendererParams = {
                data: node.data,
                node: node,
                padding: padding,
                gridOptions: this.gridOptions
            };
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
            eGridGroupRow.style.width = utils.formatWidth(firstColumn.actualWidth);
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
            eGroupIcon = utils.createIcon('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
        } else {
            eGroupIcon = utils.createIcon('groupContracted', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        }

        eGridGroupRow.appendChild(eGroupIcon);
    };

    RowRenderer.prototype.putDataIntoCell = function(colDef, value, node, $childScope, eGridCell, rowIndex) {
        if (colDef.cellRenderer) {
            var rendererParams = {
                value: value,
                data: node.data,
                node: node,
                colDef: colDef,
                $scope: $childScope,
                rowIndex: rowIndex,
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
            if (value !== undefined && value !== null && value !== '') {
                eGridCell.innerHTML = value;
            }
        }
    };

    RowRenderer.prototype.createCell = function(isFirstColumn, column, value, node, rowIndex, $childScope) {
        var that = this;
        var eGridCell = document.createElement("div");
        eGridCell.setAttribute("col", column.index);

        // set class, only include ag-group-cell if it's a group cell
        var classes = ['ag-cell', 'cell-col-' + column.index];
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
        if (isFirstColumn && (node.parent)) {
            var pixelsToIndent = 20 + (node.parent.level * 10);
            eCellWrapper.style['padding-left'] = pixelsToIndent + 'px';
        }

        var colDef = column.colDef;
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
                var cellStyleParams = {
                    value: value,
                    data: node.data,
                    node: node,
                    colDef: colDef,
                    $scope: $childScope,
                    gridOptions: this.gridOptionsWrapper.getGridOptions()
                };
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
                var cellClassParams = {
                    value: value,
                    data: node.data,
                    node: node,
                    colDef: colDef,
                    $scope: $childScope,
                    gridOptions: this.gridOptionsWrapper.getGridOptions()
                };
                classToUse = colDef.cellClass(cellClassParams);
            } else {
                classToUse = colDef.cellClass;
            }

            if (typeof classToUse === 'string') {
                utils.addCssClass(eGridCell, classToUse);
            } else if (Array.isArray(classToUse)) {
                classToUse.forEach(function(cssClassItem) {
                    utils.addCssClass(eGridCell, cssClassItem);
                });
            }
        }

        this.addCellClickedHandler(eGridCell, node, column, value, rowIndex);
        this.addCellDoubleClickedHandler(eGridCell, node, column, value, rowIndex, $childScope);

        eGridCell.style.width = utils.formatWidth(column.actualWidth);

        // add the 'start editing' call to the chain of editors
        this.renderedRowStartEditingListeners[rowIndex][column.index] = function() {
            if (that.isCellEditable(colDef, node)) {
                that.startEditing(eGridCell, column, node, $childScope, rowIndex);
                return true;
            } else {
                return false;
            }
        };

        return eGridCell;
    };

    RowRenderer.prototype.addCellDoubleClickedHandler = function(eGridCell, node, column, value, rowIndex, $childScope) {
        var that = this;
        var colDef = column.colDef;
        eGridCell.addEventListener("dblclick", function(event) {
            if (that.gridOptionsWrapper.getCellDoubleClicked()) {
                var paramsForGrid = {
                    node: node,
                    data: node.data,
                    value: value,
                    rowIndex: rowIndex,
                    colDef: colDef,
                    event: event,
                    eventSource: this,
                    gridOptions: that.gridOptionsWrapper.getGridOptions()
                };
                that.gridOptionsWrapper.getCellDoubleClicked()(paramsForGrid);
            }
            if (colDef.cellDoubleClicked) {
                var paramsForColDef = {
                    node: node,
                    data: node.data,
                    value: value,
                    rowIndex: rowIndex,
                    colDef: colDef,
                    event: event,
                    eventSource: this,
                    gridOptions: that.gridOptionsWrapper.getGridOptions()
                };
                colDef.cellDoubleClicked(paramsForColDef);
            }
            if (that.isCellEditable(colDef, node)) {
                that.startEditing(eGridCell, column, node, $childScope, rowIndex);
            }
        });
    };

    RowRenderer.prototype.addCellClickedHandler = function(eGridCell, node, colDefWrapper, value, rowIndex) {
        var that = this;
        var colDef = colDefWrapper.colDef;
        eGridCell.addEventListener("click", function(event) {
            if (that.gridOptionsWrapper.getCellClicked()) {
                var paramsForGrid = {
                    node: node,
                    data: node.data,
                    value: value,
                    rowIndex: rowIndex,
                    colDef: colDef,
                    event: event,
                    eventSource: this,
                    gridOptions: that.gridOptionsWrapper.getGridOptions()
                };
                that.gridOptionsWrapper.getCellClicked()(paramsForGrid);
            }
            if (colDef.cellClicked) {
                var paramsForColDef = {
                    node: node,
                    data: node.data,
                    value: value,
                    rowIndex: rowIndex,
                    colDef: colDef,
                    event: event,
                    eventSource: this,
                    gridOptions: that.gridOptionsWrapper.getGridOptions()
                };
                colDef.cellClicked(paramsForColDef);
            }
        });
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

    RowRenderer.prototype.startEditing = function(eGridCell, column, node, $childScope, rowIndex) {
        var that = this;
        var colDef = column.colDef;
        this.editingCell = true;
        utils.removeAllChildren(eGridCell);
        var eInput = document.createElement('input');
        eInput.type = 'text';
        utils.addCssClass(eInput, 'ag-cell-edit-input');

        var value = node.data[colDef.field];
        if (value !== null && value !== undefined) {
            eInput.value = value;
        }

        eInput.style.width = (column.actualWidth - 14) + 'px';
        eGridCell.appendChild(eInput);
        eInput.focus();
        eInput.select();

        var blurListener = function() {
            that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
        };

        //stop entering if we loose focus
        eInput.addEventListener("blur", blurListener);

        //stop editing if enter pressed
        eInput.addEventListener('keypress', function(event) {
            var key = event.which || event.keyCode;
            // 13 is enter
            if (key == this.ENTER_KEY) {
                that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
            }
        });

        // tab key doesn't generate keypress, so need keydown to listen for that
        eInput.addEventListener('keydown', function(event) {
            var key = event.which || event.keyCode;
            if (key == this.TAB_KEY) {
                that.stopEditing(eGridCell, colDef, node, $childScope, eInput, blurListener, rowIndex);
                that.startEditingNextCell(rowIndex, column, event.shiftKey);
                // we don't want the default tab action, so return false, this stops the event from bubbling
                event.preventDefault();
                return false;
            }
        });
    };

    RowRenderer.prototype.startEditingNextCell = function(rowIndex, column, shiftKey) {

        var firstRowToCheck = this.firstVirtualRenderedRow;
        var lastRowToCheck = this.lastVirtualRenderedRow;
        var currentRowIndex = rowIndex;

        var visibleColumns = this.columnModel.getVisibleColumns();
        var currentCol = column;

        while (true) {

            var indexOfCurrentCol = visibleColumns.indexOf(currentCol);

            // move backward
            if (shiftKey) {
                // move along to the previous cell
                currentCol = visibleColumns[indexOfCurrentCol - 1];
                // check if end of the row, and if so, go back a row
                if (!currentCol) {
                    currentCol = visibleColumns[visibleColumns.length - 1];
                    currentRowIndex--;
                }

                // if got to end of rendered rows, then quit looking
                if (currentRowIndex < firstRowToCheck) {
                    return;
                }
                // move forward
            } else {
                // move along to the next cell
                currentCol = visibleColumns[indexOfCurrentCol + 1];
                // check if end of the row, and if so, go forward a row
                if (!currentCol) {
                    currentCol = visibleColumns[0];
                    currentRowIndex++;
                }

                // if got to end of rendered rows, then quit looking
                if (currentRowIndex > lastRowToCheck) {
                    return;
                }
            }

            var nextFunc = this.renderedRowStartEditingListeners[currentRowIndex][currentCol.colKey];
            if (nextFunc) {
                // see if the next cell is editable, and if so, we have come to
                // the end of our search, so stop looking for the next cell
                var nextCellAcceptedEdit = nextFunc();
                if (nextCellAcceptedEdit) {
                    return;
                }
            }
        }

    };























    function HeaderRenderer() {}

    HeaderRenderer.prototype.init = function(gridOptionsWrapper, columnController, columnModel, eGrid, angularGrid, filterManager, $scope, $compile) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.columnModel = columnModel;
        this.columnController = columnController;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
        this.$scope = $scope;
        this.$compile = $compile;
        this.findAllElements(eGrid);
    };

    HeaderRenderer.prototype.findAllElements = function(eGrid) {

        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
            this.eRoot = eGrid.querySelector(".ag-root");
            // for no-scroll, all header cells live in the header container (the ag-header doesn't exist)
            this.eHeaderParent = this.eHeaderContainer;
        } else {
            this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
            this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
            this.eHeader = eGrid.querySelector(".ag-header");
            this.eRoot = eGrid.querySelector(".ag-root");
            // for scroll, all header cells live in the header (contains both normal and pinned headers)
            this.eHeaderParent = this.eHeader;
        }
    };

    HeaderRenderer.prototype.refreshHeader = function() {
        utils.removeAllChildren(this.ePinnedHeader);
        utils.removeAllChildren(this.eHeaderContainer);

        if (this.childScopes) {
            this.childScopes.forEach(function(childScope) {
                childScope.$destroy();
            });
        }
        this.childScopes = [];

        if (this.gridOptionsWrapper.isGroupHeaders()) {
            this.insertHeadersWithGrouping();
        } else {
            this.insertHeadersWithoutGrouping();
        }

    };

    HeaderRenderer.prototype.insertHeadersWithGrouping = function() {
        var groups = this.columnModel.getColumnGroups();
        var that = this;
        groups.forEach(function(group) {
            var eHeaderCell = that.createGroupedHeaderCell(group);
            var eContainerToAddTo = group.pinned ? that.ePinnedHeader : that.eHeaderContainer;
            eContainerToAddTo.appendChild(eHeaderCell);
        });
    };

    HeaderRenderer.prototype.createGroupedHeaderCell = function(group) {

        var eHeaderGroup = document.createElement('div');
        eHeaderGroup.className = 'ag-header-group';

        var eHeaderGroupCell = document.createElement('div');
        group.eHeaderGroupCell = eHeaderGroupCell;
        var classNames = ['ag-header-group-cell'];
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (group.name) {
            classNames.push('ag-header-group-cell-with-group');
        } else {
            classNames.push('ag-header-group-cell-no-group');
        }
        eHeaderGroupCell.className = classNames.join(' ');

        if (this.gridOptionsWrapper.isEnableColResize()) {
            var eHeaderCellResize = document.createElement("div");
            eHeaderCellResize.className = "ag-header-cell-resize";
            eHeaderGroupCell.appendChild(eHeaderCellResize);
            group.eHeaderCellResize = eHeaderCellResize;
            var dragCallback = this.groupDragCallbackFactory(group);
            this.addDragHandler(eHeaderCellResize, dragCallback);
        }

        // no renderer, default text render
        var groupName = group.name;
        if (groupName && groupName !== '') {
            var eGroupCellLabel = document.createElement("div");
            eGroupCellLabel.className = 'ag-header-group-cell-label';
            eHeaderGroupCell.appendChild(eGroupCellLabel);

            var eInnerText = document.createElement("span");
            eInnerText.className = 'ag-header-group-text';
            eInnerText.innerHTML = groupName;
            eGroupCellLabel.appendChild(eInnerText);

            if (group.expandable) {
                this.addGroupExpandIcon(group, eGroupCellLabel, group.expanded);
            }
        }
        eHeaderGroup.appendChild(eHeaderGroupCell);

        var that = this;
        group.visibleColumns.forEach(function(column) {
            var eHeaderCell = that.createHeaderCell(column, true, group);
            eHeaderGroup.appendChild(eHeaderCell);
        });

        that.setWidthOfGroupHeaderCell(group);

        return eHeaderGroup;
    };

    HeaderRenderer.prototype.addGroupExpandIcon = function(group, eHeaderGroup, expanded) {
        var eGroupIcon;
        if (expanded) {
            eGroupIcon = utils.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
        } else {
            eGroupIcon = utils.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        }
        eGroupIcon.className = 'ag-header-expand-icon';
        eHeaderGroup.appendChild(eGroupIcon);

        var that = this;
        eGroupIcon.onclick = function() {
            that.columnController.columnGroupOpened(group);
        };
    };

    HeaderRenderer.prototype.addDragHandler = function(eDraggableElement, dragCallback) {
        var that = this;
        eDraggableElement.onmousedown = function(downEvent) {
            dragCallback.onDragStart();
            that.eRoot.style.cursor = "col-resize";
            that.dragStartX = downEvent.clientX;

            that.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - that.dragStartX;
                dragCallback.onDragging(change);
            };
            that.eRoot.onmouseup = function() {
                that.stopDragging();
            };
            that.eRoot.onmouseleave = function() {
                that.stopDragging();
            };
        };
    };

    HeaderRenderer.prototype.setWidthOfGroupHeaderCell = function(headerGroup) {
        var totalWidth = 0;
        headerGroup.visibleColumns.forEach(function(column) {
            totalWidth += column.actualWidth;
        });
        headerGroup.eHeaderGroupCell.style.width = utils.formatWidth(totalWidth);
        headerGroup.actualWidth = totalWidth;
    };

    HeaderRenderer.prototype.insertHeadersWithoutGrouping = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        var that = this;

        this.columnModel.getVisibleColumns().forEach(function(column) {
            // only include the first x cols
            var headerCell = that.createHeaderCell(column, false);
            if (column.pinned) {
                ePinnedHeader.appendChild(headerCell);
            } else {
                eHeaderContainer.appendChild(headerCell);
            }
        });
    };

    HeaderRenderer.prototype.createHeaderCell = function(column, grouped, headerGroup) {
        var that = this;
        var colDef = column.colDef;
        var eHeaderCell = document.createElement("div");
        // stick the header cell in column, as we access it when group is re-sized
        column.eHeaderCell = eHeaderCell;

        var headerCellClasses = ['ag-header-cell'];
        if (grouped) {
            headerCellClasses.push('ag-header-cell-grouped'); // this takes 50% height
        } else {
            headerCellClasses.push('ag-header-cell-not-grouped'); // this takes 100% height
        }
        eHeaderCell.className = headerCellClasses.join(' ');

        // add tooltip if exists
        if (colDef.headerTooltip) {
            eHeaderCell.title = colDef.headerTooltip;
        }

        if (this.gridOptionsWrapper.isEnableColResize()) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            eHeaderCell.appendChild(headerCellResize);
            var dragCallback = this.headerDragCallbackFactory(eHeaderCell, column, headerGroup);
            this.addDragHandler(headerCellResize, dragCallback);
        }

        // filter button
        var showMenu = this.gridOptionsWrapper.isEnableFilter() && !colDef.suppressMenu;
        if (showMenu) {
            var eMenuButton = utils.createIcon('menu', this.gridOptionsWrapper, column, svgFactory.createMenuSvg);
            utils.addCssClass(eMenuButton, 'ag-header-icon');

            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            eMenuButton.onclick = function() {
                that.filterManager.showFilter(column, this);
            };
            eHeaderCell.appendChild(eMenuButton);
            eHeaderCell.onmouseenter = function() {
                eMenuButton.style.opacity = 1;
            };
            eHeaderCell.onmouseleave = function() {
                eMenuButton.style.opacity = 0;
            };
            eMenuButton.style.opacity = 0;
            eMenuButton.style["-webkit-transition"] = "opacity 0.5s, border 0.2s";
            eMenuButton.style["transition"] = "opacity 0.5s, border 0.2s";
        }

        // label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";

        // add in sort icons
        if (this.gridOptionsWrapper.isEnableSorting() && !colDef.suppressSorting) {
            column.eSortAsc = utils.createIcon('sortAscending', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
            column.eSortDesc = utils.createIcon('sortDescending', this.gridOptionsWrapper, column, svgFactory.createArrowDownSvg);
            utils.addCssClass(column.eSortAsc, 'ag-header-icon');
            utils.addCssClass(column.eSortDesc, 'ag-header-icon');
            headerCellLabel.appendChild(column.eSortAsc);
            headerCellLabel.appendChild(column.eSortDesc);
            column.eSortAsc.style.display = 'none';
            column.eSortDesc.style.display = 'none';
            this.addSortHandling(headerCellLabel, column);
        }

        // add in filter icon
        column.eFilterIcon = utils.createIcon('filter', this.gridOptionsWrapper, column, svgFactory.createFilterSvg);
        utils.addCssClass(column.eFilterIcon, 'ag-header-icon');
        headerCellLabel.appendChild(column.eFilterIcon);

        // render the cell, use a renderer if one is provided
        var headerCellRenderer;
        if (colDef.headerCellRenderer) { // first look for a renderer in col def
            headerCellRenderer = colDef.headerCellRenderer;
        } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
            headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
        }
        if (headerCellRenderer) {
            // renderer provided, use it
            var newChildScope;
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                newChildScope = this.$scope.$new();
            }
            var cellRendererParams = {
                colDef: colDef,
                $scope: newChildScope,
                gridOptions: this.gridOptionsWrapper.getGridOptions()
            };
            var cellRendererResult = headerCellRenderer(cellRendererParams);
            var childToAppend;
            if (utils.isNode(cellRendererResult) || utils.isElement(cellRendererResult)) {
                // a dom node or element was returned, so add child
                childToAppend = cellRendererResult;
            } else {
                // otherwise assume it was html, so just insert
                var eTextSpan = document.createElement("span");
                eTextSpan.innerHTML = cellRendererResult;
                childToAppend = eTextSpan;
            }
            // angular compile header if option is turned on
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                newChildScope.colDef = colDef;
                newChildScope.colIndex = colDef.index;
                newChildScope.colDefWrapper = column;
                this.childScopes.push(newChildScope);
                var childToAppendCompiled = this.$compile(childToAppend)(newChildScope)[0];
                headerCellLabel.appendChild(childToAppendCompiled);
            } else {
                headerCellLabel.appendChild(childToAppend);
            }
        } else {
            // no renderer, default text render
            var eInnerText = document.createElement("span");
            eInnerText.className = 'ag-header-cell-text';
            eInnerText.innerHTML = colDef.displayName;
            headerCellLabel.appendChild(eInnerText);
        }

        eHeaderCell.appendChild(headerCellLabel);
        eHeaderCell.style.width = utils.formatWidth(column.actualWidth);

        return eHeaderCell;
    };

    HeaderRenderer.prototype.addSortHandling = function(headerCellLabel, colDefWrapper) {
        var that = this;

        headerCellLabel.addEventListener("click", function() {

            // update sort on current col
            if (colDefWrapper.sort === constants.ASC) {
                colDefWrapper.sort = constants.DESC;
            } else if (colDefWrapper.sort === constants.DESC) {
                colDefWrapper.sort = null
            } else {
                colDefWrapper.sort = constants.ASC;
            }

            // clear sort on all columns except this one, and update the icons
            that.columnModel.getAllColumns().forEach(function(columnToClear) {
                if (columnToClear !== colDefWrapper) {
                    columnToClear.sort = null;
                }

                // check in case no sorting on this particular col, as sorting is optional per col
                if (columnToClear.colDef.suppressSorting) {
                    return;
                }

                // update visibility of icons
                var sortAscending = columnToClear.sort === constants.ASC;
                var sortDescending = columnToClear.sort === constants.DESC;

                if (columnToClear.eSortAsc) {
                    columnToClear.eSortAsc.style.display = sortAscending ? 'inline' : 'none';
                }
                if (columnToClear.eSortDesc) {
                    columnToClear.eSortDesc.style.display = sortDescending ? 'inline' : 'none';
                }
            });

            that.angularGrid.updateModelAndRefresh(constants.STEP_SORT);
        });
    };

    HeaderRenderer.prototype.groupDragCallbackFactory = function(currentGroup) {
        var parent = this;
        var visibleColumns = currentGroup.visibleColumns;
        return {
            onDragStart: function() {
                this.groupWidthStart = currentGroup.actualWidth;
                this.childrenWidthStarts = [];
                var that = this;
                visibleColumns.forEach(function(colDefWrapper) {
                    that.childrenWidthStarts.push(colDefWrapper.actualWidth);
                });
                this.minWidth = visibleColumns.length * constants.MIN_COL_WIDTH;
            },
            onDragging: function(dragChange) {

                var newWidth = this.groupWidthStart + dragChange;
                if (newWidth < this.minWidth) {
                    newWidth = this.minWidth;
                }

                // set the new width to the group header
                var newWidthPx = newWidth + "px";
                currentGroup.eHeaderGroupCell.style.width = newWidthPx;
                currentGroup.actualWidth = newWidth;

                // distribute the new width to the child headers
                var changeRatio = newWidth / this.groupWidthStart;
                // keep track of pixels used, and last column gets the remaining,
                // to cater for rounding errors, and min width adjustments
                var pixelsToDistribute = newWidth;
                var that = this;
                currentGroup.visibleColumns.forEach(function(colDefWrapper, index) {
                    var notLastCol = index !== (visibleColumns.length - 1);
                    var newChildSize;
                    if (notLastCol) {
                        // if not the last col, calculate the column width as normal
                        var startChildSize = that.childrenWidthStarts[index];
                        newChildSize = startChildSize * changeRatio;
                        if (newChildSize < constants.MIN_COL_WIDTH) {
                            newChildSize = constants.MIN_COL_WIDTH;
                        }
                        pixelsToDistribute -= newChildSize;
                    } else {
                        // if last col, give it the remaining pixels
                        newChildSize = pixelsToDistribute;
                    }
                    var eHeaderCell = visibleColumns[index].eHeaderCell;
                    parent.adjustColumnWidth(newChildSize, colDefWrapper, eHeaderCell);
                });

                // should not be calling these here, should do something else
                if (currentGroup.pinned) {
                    parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
                } else {
                    parent.angularGrid.updateBodyContainerWidthAfterColResize();
                }
            }
        };
    };

    HeaderRenderer.prototype.adjustColumnWidth = function(newWidth, column, eHeaderCell) {
        var newWidthPx = newWidth + "px";
        var selectorForAllColsInCell = ".cell-col-" + column.index;
        var cellsForThisCol = this.eRoot.querySelectorAll(selectorForAllColsInCell);
        for (var i = 0; i < cellsForThisCol.length; i++) {
            cellsForThisCol[i].style.width = newWidthPx;
        }

        eHeaderCell.style.width = newWidthPx;
        column.actualWidth = newWidth;
    };

    // gets called when a header (not a header group) gets resized
    HeaderRenderer.prototype.headerDragCallbackFactory = function(headerCell, column, headerGroup) {
        var parent = this;
        return {
            onDragStart: function() {
                this.startWidth = column.actualWidth;
            },
            onDragging: function(dragChange) {
                var newWidth = this.startWidth + dragChange;
                if (newWidth < constants.MIN_COL_WIDTH) {
                    newWidth = constants.MIN_COL_WIDTH;
                }

                parent.adjustColumnWidth(newWidth, column, headerCell);

                if (headerGroup) {
                    parent.setWidthOfGroupHeaderCell(headerGroup);
                }

                // should not be calling these here, should do something else
                if (column.pinned) {
                    parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
                } else {
                    parent.angularGrid.updateBodyContainerWidthAfterColResize();
                }
            }
        };
    };

    HeaderRenderer.prototype.stopDragging = function() {
        this.eRoot.style.cursor = "";
        this.eRoot.onmouseup = null;
        this.eRoot.onmouseleave = null;
        this.eRoot.onmousemove = null;
    };

    HeaderRenderer.prototype.updateFilterIcons = function() {
        var that = this;
        this.columnModel.getVisibleColumns().forEach(function(column) {
            // todo: need to change this, so only updates if column is visible
            if (column.eFilterIcon) {
                var filterPresent = that.filterManager.isFilterPresentForCol(column.colKey);
                var displayStyle = filterPresent ? 'inline' : 'none';
                column.eFilterIcon.style.display = displayStyle;
            }
        });
    };




































    function GridOptionsWrapper(gridOptions) {
        this.DEFAULT_ROW_HEIGHT = 30;
        this.gridOptions = gridOptions;
        this.setupDefaults();
    }

    function isTrue(value) {
        return value === true || value === 'true';
    }

    GridOptionsWrapper.prototype.isRowSelection = function() {
        return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple";
    };
    GridOptionsWrapper.prototype.isRowSelectionMulti = function() {
        return this.gridOptions.rowSelection === 'multiple';
    };
    GridOptionsWrapper.prototype.isVirtualPaging = function() {
        return isTrue(this.gridOptions.virtualPaging);
    };
    GridOptionsWrapper.prototype.isRowsAlreadyGrouped = function() {
        return isTrue(this.gridOptions.rowsAlreadyGrouped);
    };
    GridOptionsWrapper.prototype.isGroupCheckboxSelectionGroup = function() {
        return this.gridOptions.groupCheckboxSelection === 'group';
    };
    GridOptionsWrapper.prototype.isGroupCheckboxSelectionChildren = function() {
        return this.gridOptions.groupCheckboxSelection === 'children';
    };
    GridOptionsWrapper.prototype.isGroupIncludeFooter = function() {
        return isTrue(this.gridOptions.groupIncludeFooter);
    };
    GridOptionsWrapper.prototype.isSuppressRowClickSelection = function() {
        return isTrue(this.gridOptions.suppressRowClickSelection);
    };
    GridOptionsWrapper.prototype.isGroupHeaders = function() {
        return isTrue(this.gridOptions.groupHeaders);
    };
    GridOptionsWrapper.prototype.isDontUseScrolls = function() {
        return isTrue(this.gridOptions.dontUseScrolls);
    };
    GridOptionsWrapper.prototype.getRowStyle = function() {
        return this.gridOptions.rowStyle;
    };
    GridOptionsWrapper.prototype.getRowClass = function() {
        return this.gridOptions.rowClass;
    };
    GridOptionsWrapper.prototype.getGridOptions = function() {
        return this.gridOptions;
    };
    GridOptionsWrapper.prototype.getHeaderCellRenderer = function() {
        return this.gridOptions.headerCellRenderer;
    };
    GridOptionsWrapper.prototype.isEnableSorting = function() {
        return this.gridOptions.enableSorting;
    };
    GridOptionsWrapper.prototype.isEnableColResize = function() {
        return this.gridOptions.enableColResize;
    };
    GridOptionsWrapper.prototype.isEnableFilter = function() {
        return this.gridOptions.enableFilter;
    };
    GridOptionsWrapper.prototype.getGroupDefaultExpanded = function() {
        return this.gridOptions.groupDefaultExpanded;
    };
    GridOptionsWrapper.prototype.getGroupKeys = function() {
        return this.gridOptions.groupKeys;
    };
    GridOptionsWrapper.prototype.getGroupIconRenderer = function() {
        return this.gridOptions.groupIconRenderer;
    };
    GridOptionsWrapper.prototype.getGroupAggFunction = function() {
        return this.gridOptions.groupAggFunction;
    };
    GridOptionsWrapper.prototype.getAllRows = function() {
        return this.gridOptions.rowData;
    };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function() {
        return isTrue(this.gridOptions.groupUseEntireRow);
    };
    GridOptionsWrapper.prototype.isAngularCompileRows = function() {
        return isTrue(this.gridOptions.angularCompileRows);
    };
    GridOptionsWrapper.prototype.isAngularCompileFilters = function() {
        return isTrue(this.gridOptions.angularCompileFilters);
    };
    GridOptionsWrapper.prototype.isAngularCompileHeaders = function() {
        return isTrue(this.gridOptions.angularCompileHeaders);
    };
    GridOptionsWrapper.prototype.getColumnDefs = function() {
        return this.gridOptions.columnDefs;
    };
    GridOptionsWrapper.prototype.getRowHeight = function() {
        return this.gridOptions.rowHeight;
    };
    GridOptionsWrapper.prototype.getModelUpdated = function() {
        return this.gridOptions.modelUpdated;
    };
    GridOptionsWrapper.prototype.getCellClicked = function() {
        return this.gridOptions.cellClicked;
    };
    GridOptionsWrapper.prototype.getCellDoubleClicked = function() {
        return this.gridOptions.cellDoubleClicked;
    };
    GridOptionsWrapper.prototype.getRowSelected = function() {
        return this.gridOptions.rowSelected;
    };
    GridOptionsWrapper.prototype.getSelectionChanged = function() {
        return this.gridOptions.selectionChanged;
    };
    GridOptionsWrapper.prototype.getVirtualRowRemoved = function() {
        return this.gridOptions.virtualRowRemoved;
    };
    GridOptionsWrapper.prototype.getDatasource = function() {
        return this.gridOptions.datasource;
    };

    GridOptionsWrapper.prototype.setSelectedRows = function(newSelectedRows) {
        return this.gridOptions.selectedRows = newSelectedRows;
    };
    GridOptionsWrapper.prototype.setSelectedNodesById = function(newSelectedNodes) {
        return this.gridOptions.selectedNodesById = newSelectedNodes;
    };

    GridOptionsWrapper.prototype.getIcons = function() {
        return this.gridOptions.icons;
    };

    GridOptionsWrapper.prototype.isDoInternalGrouping = function() {
        return !this.isRowsAlreadyGrouped() && this.gridOptions.groupKeys;
    };

    GridOptionsWrapper.prototype.isGroupCheckboxSelection = function() {
        return this.isGroupCheckboxSelectionChildren() || this.isGroupCheckboxSelectionGroup();
    };

    GridOptionsWrapper.prototype.getHeaderHeight = function() {
        if (typeof this.gridOptions.headerHeight === 'number') {
            // if header height provided, used it
            return this.gridOptions.headerHeight;
        } else {
            // otherwise return 25 if no grouping, 50 if grouping
            if (this.isGroupHeaders()) {
                return 50;
            } else {
                return 25;
            }
        }
    };

    GridOptionsWrapper.prototype.isColumDefsPresent = function() {
        return this.gridOptions.columnDefs && this.gridOptions.columnDefs.length != 0;
    };

    GridOptionsWrapper.prototype.setupDefaults = function() {
        if (!this.gridOptions.rowHeight) {
            this.gridOptions.rowHeight = this.DEFAULT_ROW_HEIGHT;
        }
    };

    GridOptionsWrapper.prototype.getPinnedColCount = function() {
        // if not using scrolls, then pinned columns doesn't make
        // sense, so always return 0
        if (this.isDontUseScrolls()) {
            return 0;
        }
        if (this.gridOptions.pinnedColumnCount) {
            //in case user puts in a string, cast to number
            return Number(this.gridOptions.pinnedColumnCount);
        } else {
            return 0;
        }
    };




























    function ColumnController() {
        this.createModel();
    }

    ColumnController.prototype.init = function(angularGrid, selectionRendererFactory, gridOptionsWrapper) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.angularGrid = angularGrid;
        this.selectionRendererFactory = selectionRendererFactory;
    };

    ColumnController.prototype.createModel = function() {
        var that = this;
        this.model = {
            // used by:
            // + inMemoryRowController -> sorting, building quick filter text
            // + headerRenderer -> sorting (clearing icon)
            getAllColumns: function() {
                return that.columns;
            },
            // + rowController -> while inserting rows, and when tabbing through cells (need to change this)
            // need a newMethod - get next col index
            getVisibleColumns: function() {
                return that.visibleColumns;
            },
            // used by:
            // + angularGrid -> for setting body width
            // + rowController -> setting main row widths (when inserting and resizing)
            getBodyContainerWidth: function() {
                return that.getTotalColWidth(false);
            },
            // used by:
            // + angularGrid -> setting pinned body width
            getPinnedContainerWidth: function() {
                return that.getTotalColWidth(true);
            },
            // used by:
            // + headerRenderer -> setting pinned body width
            getColumnGroups: function() {
                return that.columnGroups;
            }
        };
    };

    ColumnController.prototype.getModel = function() {
        return this.model;
    };

    // called by angularGrid
    ColumnController.prototype.setColumns = function(columnDefs) {
        this.buildColumns(columnDefs);
        this.ensureEachColHasSize();
        this.buildGroups();
        this.updateGroups();
        this.updateVisibleColumns();
    };

    // called by headerRenderer - when a header is opened or closed
    ColumnController.prototype.columnGroupOpened = function(group) {
        group.expanded = !group.expanded;
        this.updateGroups();
        this.updateVisibleColumns();
        this.angularGrid.refreshHeaderAndBody();
    };

    // private
    ColumnController.prototype.updateVisibleColumns = function() {
        // if not grouping by headers, then all columns are visible
        if (!this.gridOptionsWrapper.isGroupHeaders()) {
            this.visibleColumns = this.columns;
            return;
        }

        // if grouping, then only show col as per group rules
        this.visibleColumns = [];
        for (var i = 0; i < this.columnGroups.length; i++) {
            var group = this.columnGroups[i];
            group.addToVisibleColumns(this.visibleColumns);
        }
    };

    // private
    ColumnController.prototype.buildGroups = function() {
        // if not grouping by headers, do nothing
        if (!this.gridOptionsWrapper.isGroupHeaders()) {
            this.columnGroups = null;
            return;
        }

        // split the columns into groups
        var currentGroup = null;
        this.columnGroups = [];
        var that = this;

        var lastColWasPinned = true;

        this.columns.forEach(function(column) {
            // do we need a new group, because we move from pinned to non-pinned columns?
            var endOfPinnedHeader = lastColWasPinned && !column.pinned;
            if (!column.pinned) {
                lastColWasPinned = false;
            }
            // do we need a new group, because the group names doesn't match from previous col?
            var groupKeyMismatch = currentGroup && column.colDef.group !== currentGroup.name;
            // we don't group columns where no group is specified
            var colNotInGroup = currentGroup && !currentGroup.name;
            // do we need a new group, because we are just starting
            var processingFirstCol = column.index === 0;
            var newGroupNeeded = processingFirstCol || endOfPinnedHeader || groupKeyMismatch || colNotInGroup;
            // create new group, if it's needed
            if (newGroupNeeded) {
                var pinned = column.pinned;
                currentGroup = new ColumnGroup(pinned, column.colDef.group);
                that.columnGroups.push(currentGroup);
            }
            currentGroup.addColumn(column);
        });
    };

    // private
    ColumnController.prototype.updateGroups = function() {
        // if not grouping by headers, do nothing
        if (!this.gridOptionsWrapper.isGroupHeaders()) {
            return;
        }

        for (var i = 0; i < this.columnGroups.length; i++) {
            var group = this.columnGroups[i];
            group.calculateExpandable();
            group.calculateVisibleColumns();
        }
    };

    // private
    ColumnController.prototype.buildColumns = function(columnDefs) {
        this.columns = [];
        var that = this;
        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        if (columnDefs) {
            for (var i = 0; i < columnDefs.length; i++) {
                var colDef = columnDefs[i];
                // this is messy - we swap in another col def if it's checkbox selection - not happy :(
                if (colDef === 'checkboxSelection') {
                    colDef = that.selectionRendererFactory.createCheckboxColDef();
                }
                var pinned = pinnedColumnCount > i;
                var column = new Column(colDef, i, pinned);
                that.columns.push(column);
            }
        }
    };

    // private
    // set the actual widths for each col
    ColumnController.prototype.ensureEachColHasSize = function() {
        this.columns.forEach(function(colDefWrapper) {
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

    // private
    ColumnController.prototype.getTotalColWidth = function(includePinned) {
        var widthSoFar = 0;

        this.visibleColumns.forEach(function(column) {
            var includeThisCol = column.pinned === includePinned;
            if (includeThisCol) {
                widthSoFar += column.actualWidth;
            }
        });

        return widthSoFar;
    };

    function ColumnGroup(pinned, name) {
        this.pinned = pinned;
        this.name = name;
        this.allColumns = [];
        this.visibleColumns = [];
        this.expandable = false; // whether this group can be expanded or not
        this.expanded = false;
    }

    ColumnGroup.prototype.addColumn = function(column) {
        this.allColumns.push(column);
    };

    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    ColumnGroup.prototype.calculateExpandable = function() {
        // want to make sure the group doesn't disappear when it's open
        var atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        var atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        var atLeastOneChangeable = false;
        for (var i = 0, j = this.allColumns.length; i < j; i++) {
            var column = this.allColumns[i];
            if (column.colDef.groupShow === 'open') {
                atLeastOneShowingWhenOpen = true;
                atLeastOneChangeable = true;
            } else if (column.colDef.groupShow === 'closed') {
                atLeastOneShowingWhenClosed = true;
                atLeastOneChangeable = true;
            } else {
                atLeastOneShowingWhenOpen = true;
                atLeastOneShowingWhenClosed = true;
            }
        }

        this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
    };

    ColumnGroup.prototype.calculateVisibleColumns = function() {
        // clear out last time we calculated
        this.visibleColumns = [];
        // it not expandable, everything is visible
        if (!this.expandable) {
            this.visibleColumns = this.allColumns;
            return;
        }
        // and calculate again
        for (var i = 0, j = this.allColumns.length; i < j; i++) {
            var column = this.allColumns[i];
            switch (column.colDef.groupShow) {
                case 'open':
                    // when set to open, only show col if group is open
                    if (this.expanded) {
                        this.visibleColumns.push(column);
                    }
                    break;
                case 'closed':
                    // when set to open, only show col if group is open
                    if (!this.expanded) {
                        this.visibleColumns.push(column);
                    }
                    break;
                default:
                    // default is always show the column
                    this.visibleColumns.push(column);
                    break;
            }
        }
    };

    ColumnGroup.prototype.addToVisibleColumns = function(allVisibleColumns) {
        for (var i = 0; i < this.visibleColumns.length; i++) {
            var column = this.visibleColumns[i];
            allVisibleColumns.push(column);
        }
    };

    function Column(colDef, index, pinned) {
        this.colDef = colDef;
        this.index = index;
        this.pinned = pinned;
        // in the future, the colKey might be something other than the index
        this.colKey = index;
    }





























    function SelectionRendererFactory() {}

    SelectionRendererFactory.prototype.init = function(angularGrid, selectionController) {
        this.angularGrid = angularGrid;
        this.selectionController = selectionController;
    };

    SelectionRendererFactory.prototype.createCheckboxColDef = function() {
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
            cellRenderer: this.createCheckboxRenderer()
        };
    };

    SelectionRendererFactory.prototype.createCheckboxRenderer = function() {
        var that = this;
        return function(params) {
            return that.createSelectionCheckbox(params.node, params.rowIndex);
        };
    };

    SelectionRendererFactory.prototype.createSelectionCheckbox = function(node, rowIndex) {

        var eCheckbox = document.createElement('input');
        eCheckbox.type = "checkbox";
        eCheckbox.name = "name";
        eCheckbox.className = 'ag-selection-checkbox';
        setCheckboxState(eCheckbox, this.selectionController.isNodeSelected(node));

        var that = this;
        eCheckbox.onclick = function(event) {
            event.stopPropagation();
        };

        eCheckbox.onchange = function() {
            var newValue = eCheckbox.checked;
            if (newValue) {
                that.selectionController.selectIndex(rowIndex, true);
            } else {
                that.selectionController.deselectIndex(rowIndex);
            }
        };

        this.angularGrid.addVirtualRowListener(rowIndex, {
            rowSelected: function(selected) {
                setCheckboxState(eCheckbox, selected);
            },
            rowRemoved: function() {}
        });

        return eCheckbox;
    };

    function setCheckboxState(eCheckbox, state) {
        if (typeof state === 'boolean') {
            eCheckbox.checked = state;
            eCheckbox.indeterminate = false;
        } else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            eCheckbox.indeterminate = true;
        }
    }




























    // these constants are used for determining if groups should
    // be selected or deselected when selecting groups, and the group
    // then selects the children.

    function SelectionController() {
        this.constants = {
            SELECTED: 0,
            UNSELECTED: 1,
            MIXED: 2,
            DO_NOT_CARE: 3,
        }
    }

    SelectionController.prototype.init = function(angularGrid, eRowsParent, gridOptionsWrapper, $scope, rowRenderer) {
        this.eRowsParent = eRowsParent;
        this.angularGrid = angularGrid;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.$scope = $scope;
        this.rowRenderer = rowRenderer;

        this.selectedNodesById = {};
        this.selectedRows = [];

        gridOptionsWrapper.setSelectedRows(this.selectedRows);
        gridOptionsWrapper.setSelectedNodesById(this.selectedNodesById);
    };

    SelectionController.prototype.getSelectedNodes = function() {
        var selectedNodes = [];
        var keys = Object.keys(this.selectedNodesById);
        for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            var selectedNode = this.selectedNodesById[id];
            selectedNodes.push(selectedNode);
        }
    };

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    SelectionController.prototype.getBestCostNodeSelection = function() {

        var topLevelNodes = this.rowModel.getTopLevelNodes();

        var result = [];
        var that = this;

        // recursive function, to find the selected nodes
        function traverse(nodes) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (that.isNodeSelected(node)) {
                    result.push(node);
                } else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    if (node.group && node.children) {
                        traverse(node.children);
                    }
                }
            }
        }

        traverse(topLevelNodes);

        return result;
    };

    SelectionController.prototype.setRowModel = function(rowModel) {
        this.rowModel = rowModel;
    };

    // public
    SelectionController.prototype.clearSelection = function() {
        this.selectedRows.length = 0;
        var keys = Object.keys(this.selectedNodesById);
        for (var i = 0; i < keys.length; i++) {
            delete this.selectedNodesById[keys[i]];
        }
    };

    // public
    SelectionController.prototype.selectNode = function(node, tryMulti, suppressEvents) {
        var multiSelect = this.gridOptionsWrapper.isRowSelectionMulti() && tryMulti;

        // if the node is a group, then selecting this is the same as selecting the parent,
        // so to have only one flow through the below, we always select the header parent
        // (which then has the side effect of selecting the child).
        var nodeToSelect;
        if (node.footer) {
            nodeToSelect = node.sibling;
        } else {
            nodeToSelect = node;
        }

        // at the end, if this is true, we inform the callback
        var atLeastOneItemUnselected = false;
        var atLeastOneItemSelected = false;

        // see if rows to be deselected
        if (!multiSelect) {
            atLeastOneItemUnselected = this.doWorkOfDeselectAllNodes();
        }

        if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && nodeToSelect.group) {
            // don't select the group, select the children instead
            atLeastOneItemSelected = this.recursivelySelectAllChildren(nodeToSelect);
        } else {
            // see if row needs to be selected
            atLeastOneItemSelected = this.doWorkOfSelectNode(nodeToSelect, suppressEvents);
        }

        if (atLeastOneItemUnselected || atLeastOneItemSelected) {
            this.syncSelectedRowsAndCallListener(suppressEvents);
        }

        this.updateGroupParentsIfNeeded();
    };

    SelectionController.prototype.recursivelySelectAllChildren = function(node, suppressEvents) {
        var atLeastOne = false;
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                if (child.group) {
                    if (this.recursivelySelectAllChildren(child)) {
                        atLeastOne = true;
                    }
                } else {
                    if (this.doWorkOfSelectNode(child, suppressEvents)) {
                        atLeastOne = true;
                    }
                }
            }
        }
        return atLeastOne;
    };

    SelectionController.prototype.recursivelyDeselectAllChildren = function(node) {
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                if (child.group) {
                    this.recursivelyDeselectAllChildren(child);
                } else {
                    this.deselectNode(child);
                }
            }
        }
    };

    // private
    // 1 - selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    SelectionController.prototype.doWorkOfSelectNode = function(node, suppressEvents) {
        if (this.selectedNodesById[node.id]) {
            return false;
        }

        this.selectedNodesById[node.id] = node;

        this.addCssClassForNode_andInformVirtualRowListener(node);

        // also color in the footer if there is one
        if (node.group && node.expanded && node.sibling) {
            this.addCssClassForNode_andInformVirtualRowListener(node.sibling);
        }

        // inform the rowSelected listener, if any
        if (!suppressEvents && typeof this.gridOptionsWrapper.getRowSelected() === "function") {
            this.gridOptionsWrapper.getRowSelected()(node.data, node);
        }

        return true;
    };

    // private
    // 1 - selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    // wow - what a big name for a method, exception case, it's saying what the method does
    SelectionController.prototype.addCssClassForNode_andInformVirtualRowListener = function(node) {
        var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
        if (virtualRenderedRowIndex >= 0) {
            utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');

            // inform virtual row listener
            this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, true);
        }
    };

    // private
    // 1 - un-selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    SelectionController.prototype.doWorkOfDeselectAllNodes = function(nodeToKeepSelected) {
        // not doing multi-select, so deselect everything other than the 'just selected' row
        var atLeastOneSelectionChange;
        var selectedNodeKeys = Object.keys(this.selectedNodesById);
        for (var i = 0; i < selectedNodeKeys.length; i++) {
            // skip the 'just selected' row
            var key = selectedNodeKeys[i];
            var nodeToDeselect = this.selectedNodesById[key];
            if (nodeToDeselect === nodeToKeepSelected) {
                continue;
            } else {
                this.deselectNode(nodeToDeselect);
                atLeastOneSelectionChange = true;
            }
        }
        return atLeastOneSelectionChange;
    };

    // private
    SelectionController.prototype.deselectNode = function(node) {
        // deselect the css
        this.removeCssClassForNode(node);

        // if node is a header, and if it has a sibling footer, deselect the footer also
        if (node.group && node.expanded && node.sibling) { // also check that it's expanded, as sibling could be a ghost
            this.removeCssClassForNode(node.sibling);
        }

        // remove the row
        this.selectedNodesById[node.id] = undefined;
    };

    // private
    SelectionController.prototype.removeCssClassForNode = function(node) {
        var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
        if (virtualRenderedRowIndex >= 0) {
            utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
            // inform virtual row listener
            this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
        }
    };

    // public (selectionRendererFactory)
    SelectionController.prototype.deselectIndex = function(rowIndex) {
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node) {
            if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
                // want to deselect children, not this node, so recursively deselect
                this.recursivelyDeselectAllChildren(node);
            } else {
                this.deselectNode(node);
            }
        }
        this.syncSelectedRowsAndCallListener();
        this.updateGroupParentsIfNeeded();
    };

    // public (selectionRendererFactory & api)
    SelectionController.prototype.selectIndex = function(index, tryMulti, suppressEvents) {
        var node = this.rowModel.getVirtualRow(index);
        this.selectNode(node, tryMulti, suppressEvents);
    };

    // private
    // updates the selectedRows with the selectedNodes and calls selectionChanged listener
    SelectionController.prototype.syncSelectedRowsAndCallListener = function(suppressEvents) {
        // update selected rows
        var selectedRows = this.selectedRows;
        // clear selected rows
        selectedRows.length = 0;
        var keys = Object.keys(this.selectedNodesById);
        for (var i = 0; i < keys.length; i++) {
            if (this.selectedNodesById[keys[i]] !== undefined) {
                var selectedNode = this.selectedNodesById[keys[i]];
                selectedRows.push(selectedNode.data);
            }
        }

        if (!suppressEvents && typeof this.gridOptionsWrapper.getSelectionChanged() === "function") {
            this.gridOptionsWrapper.getSelectionChanged()();
        }

        var that = this;
        setTimeout(function() {
            that.$scope.$apply();
        }, 0);
    };

    // private
    SelectionController.prototype.recursivelyCheckIfSelected = function(node) {
        var foundSelected = false;
        var foundUnselected = false;

        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                var result;
                if (child.group) {
                    result = this.recursivelyCheckIfSelected(child);
                    switch (result) {
                        case this.constants.SELECTED:
                            foundSelected = true;
                            break;
                        case this.constants.UNSELECTED:
                            foundUnselected = true;
                            break;
                        case this.constants.MIXED:
                            foundSelected = true;
                            foundUnselected = true;
                            break;
                            // we can ignore the DO_NOT_CARE, as it doesn't impact, means the child
                            // has no children and shouldn't be considered when deciding
                    }
                } else {
                    if (this.isNodeSelected(child)) {
                        foundSelected = true;
                    } else {
                        foundUnselected = true;
                    }
                }

                if (foundSelected && foundUnselected) {
                    // if mixed, then no need to go further, just return up the chain
                    return this.constants.MIXED;
                }
            }
        }

        // got this far, so no conflicts, either all children selected, unselected, or neither
        if (foundSelected) {
            return this.constants.SELECTED;
        } else if (foundUnselected) {
            return this.constants.UNSELECTED;
        } else {
            return this.constants.DO_NOT_CARE;
        }
    };

    // public (selectionRendererFactory)
    // returns:
    // true: if selected
    // false: if unselected
    // undefined: if it's a group and 'children selection' is used and 'children' are a mix of selected and unselected
    SelectionController.prototype.isNodeSelected = function(node) {
        if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
            // doing child selection, we need to traverse the children
            var resultOfChildren = this.recursivelyCheckIfSelected(node);
            switch (resultOfChildren) {
                case this.constants.SELECTED:
                    return true;
                case this.constants.UNSELECTED:
                    return false;
                default:
                    return undefined;
            }
        } else {
            return this.selectedNodesById[node.id] !== undefined;
        }
    };

    SelectionController.prototype.updateGroupParentsIfNeeded = function() {
        // we only do this if parent nodes are responsible
        // for selecting their children.
        if (!this.gridOptionsWrapper.isGroupCheckboxSelectionChildren()) {
            return;
        }

        var firstRow = this.rowRenderer.getFirstVirtualRenderedRow();
        var lastRow = this.rowRenderer.getLastVirtualRenderedRow();
        for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            // see if node is a group
            var node = this.rowModel.getVirtualRow(rowIndex);
            if (node.group) {
                var selected = this.isNodeSelected(node);
                this.angularGrid.onVirtualRowSelected(rowIndex, selected);

                if (selected) {
                    utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
                } else {
                    utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
                }
            }
        }
    };


























    function PaginationController() {}

    PaginationController.prototype.init = function(ePagingPanel, angularGrid) {
        this.angularGrid = angularGrid;
        this.populatePanel(ePagingPanel);
        this.callVersion = 0;
    };

    PaginationController.prototype.setDatasource = function(datasource) {
        this.datasource = datasource;

        if (!datasource) {
            // only continue if we have a valid datasource to work with
            return;
        }

        this.reset();
    };

    PaginationController.prototype.reset = function() {
        // copy pageSize, to guard against it changing the the datasource between calls
        this.pageSize = this.datasource.pageSize;
        // see if we know the total number of pages, or if it's 'to be decided'
        if (this.datasource.rowCount >= 0) {
            this.rowCount = this.datasource.rowCount;
            this.foundMaxRow = true;
            this.calculateTotalPages();
        } else {
            this.rowCount = 0;
            this.foundMaxRow = false;
            this.totalPages = null;
        }

        this.currentPage = 0;

        // hide the summary panel until something is loaded
        this.ePageRowSummaryPanel.style.visibility = 'hidden';

        this.setTotalLabels();
        this.loadPage();
    };

    PaginationController.prototype.setTotalLabels = function() {
        if (this.foundMaxRow) {
            this.lbTotal.innerHTML = this.totalPages.toLocaleString();
            this.lbRecordCount.innerHTML = this.rowCount.toLocaleString();
        } else {
            this.lbTotal.innerHTML = 'more';
            this.lbRecordCount.innerHTML = 'more';
        }
    };

    PaginationController.prototype.calculateTotalPages = function() {
        this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
    };

    PaginationController.prototype.pageLoaded = function(rows, lastRowIndex) {
        var firstId = this.currentPage * this.pageSize;
        this.angularGrid.setRows(rows, firstId);
        // see if we hit the last row
        if (!this.foundMaxRow && typeof lastRowIndex === 'number' && lastRowIndex >= 0) {
            this.foundMaxRow = true;
            this.rowCount = lastRowIndex;
            this.calculateTotalPages();
            this.setTotalLabels();

            // if overshot pages, go back
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages - 1;
                this.loadPage();
            }
        }
        this.enableOrDisableButtons();
        this.updateRowLabels();
    };

    PaginationController.prototype.updateRowLabels = function() {
        var startRow = (this.pageSize * this.currentPage) + 1;
        var endRow = startRow + this.pageSize - 1;
        if (this.foundMaxRow && endRow > this.rowCount) {
            endRow = this.rowCount;
        }
        this.lbFirstRowOnPage.innerHTML = (startRow).toLocaleString();
        this.lbLastRowOnPage.innerHTML = (endRow).toLocaleString();

        // show the summary panel, when first shown, this is blank
        this.ePageRowSummaryPanel.style.visibility = null;
    };

    PaginationController.prototype.loadPage = function() {
        this.enableOrDisableButtons();
        var startRow = this.currentPage * this.datasource.pageSize;
        var endRow = (this.currentPage + 1) * this.datasource.pageSize;

        this.lbCurrent.innerHTML = (this.currentPage + 1).toLocaleString();

        this.callVersion++;
        var callVersionCopy = this.callVersion;
        var that = this;
        this.angularGrid.showLoadingPanel(true);
        this.datasource.getRows(startRow, endRow,
            function success(rows, lastRowIndex) {
                if (that.isCallDaemon(callVersionCopy)) {
                    return;
                }
                that.pageLoaded(rows, lastRowIndex);
            },
            function fail() {
                if (that.isCallDaemon(callVersionCopy)) {
                    return;
                }
                // set in an empty set of rows, this will at
                // least get rid of the loading panel, and
                // stop blocking things
                that.angularGrid.setRows([]);
            }
        );
    };

    PaginationController.prototype.isCallDaemon = function(versionCopy) {
        return versionCopy !== this.callVersion;
    };

    PaginationController.prototype.onBtNext = function() {
        this.currentPage++;
        this.loadPage();
    };

    PaginationController.prototype.onBtPrevious = function() {
        this.currentPage--;
        this.loadPage();
    };

    PaginationController.prototype.onBtFirst = function() {
        this.currentPage = 0;
        this.loadPage();
    };

    PaginationController.prototype.onBtLast = function() {
        this.currentPage = this.totalPages - 1;
        this.loadPage();
    };

    PaginationController.prototype.enableOrDisableButtons = function() {
        var disablePreviousAndFirst = this.currentPage === 0;
        this.btPrevious.disabled = disablePreviousAndFirst;
        this.btFirst.disabled = disablePreviousAndFirst;

        var disableNext = this.foundMaxRow && this.currentPage === (this.totalPages - 1);
        this.btNext.disabled = disableNext;

        var disableLast = !this.foundMaxRow || this.currentPage === (this.totalPages - 1);
        this.btLast.disabled = disableLast;
    };

    PaginationController.prototype.populatePanel = function(ePagingPanel) {

        ePagingPanel.innerHTML = [
            '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">',
            '<span id="firstRowOnPage"></span>',
            ' to ',
            '<span id="lastRowOnPage"></span>',
            ' of ',
            '<span id="recordCount"></span>',
            '</span>',
            '<span clas="ag-paging-page-summary-panel">',
            '<button class="ag-paging-button" id="btFirst">First</button>',
            '<button class="ag-paging-button" id="btPrevious">Previous</button>',
            ' Page ',
            '<span id="current"></span>',
            ' of ',
            '<span id="total"></span>',
            '<button class="ag-paging-button" id="btNext">Next</button>',
            '<button class="ag-paging-button" id="btLast">Last</button>',
            '</span>'
        ].join('');

        this.btNext = ePagingPanel.querySelector('#btNext');
        this.btPrevious = ePagingPanel.querySelector('#btPrevious');
        this.btFirst = ePagingPanel.querySelector('#btFirst');
        this.btLast = ePagingPanel.querySelector('#btLast');
        this.lbCurrent = ePagingPanel.querySelector('#current');
        this.lbTotal = ePagingPanel.querySelector('#total');

        this.lbRecordCount = ePagingPanel.querySelector('#recordCount');
        this.lbFirstRowOnPage = ePagingPanel.querySelector('#firstRowOnPage');
        this.lbLastRowOnPage = ePagingPanel.querySelector('#lastRowOnPage');
        this.ePageRowSummaryPanel = ePagingPanel.querySelector('#pageRowSummaryPanel');

        var that = this;

        this.btNext.addEventListener('click', function() {
            that.onBtNext();
        });

        this.btPrevious.addEventListener('click', function() {
            that.onBtPrevious();
        });

        this.btFirst.addEventListener('click', function() {
            that.onBtFirst();
        });

        this.btLast.addEventListener('click', function() {
            that.onBtLast();
        });
    };











    // this function is used for creating a grid, outside of any AngularJS
    function angularGridGlobalFunction(element, gridOptions) {
        // see if element is a query selector, or a real element
        var eGridDiv;
        if (typeof element === 'string') {
            eGridDiv = document.querySelector(element);
            if (!eGridDiv) {
                console.log('WARNING - was not able to find element ' + element + ' in the DOM, Angular Grid initialisation aborted.');
                return;
            }
        }
        new Grid(eGridDiv, gridOptions, null, null);
    }

    function AngularDirectiveController($element, $scope, $compile) {
        var eGridDiv = $element[0];
        var gridOptions = $scope.angularGrid;
        if (!gridOptions) {
            console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute angular-grid points to a valid object on the scope");
            return;
        }

        var grid = new Grid(eGridDiv, gridOptions, $scope, $compile);

        $scope.$on("$destroy", function() {
            grid.setFinished();
        });
    }

    function Grid(eGridDiv, gridOptions, $scope, $compile) {

        this.gridOptions = gridOptions;
        this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);

        var useScrolls = !this.gridOptionsWrapper.isDontUseScrolls();
        if (useScrolls) {
            eGridDiv.innerHTML = template();
        } else {
            eGridDiv.innerHTML = templateNoScrolls();
        }

        var that = this;
        this.quickFilter = null;

        // if using angular, watch for quickFilter changes
        if ($scope) {
            $scope.$watch("angularGrid.quickFilterText", function(newFilter) {
                that.onQuickFilterChanged(newFilter);
            });
        }


        this.virtualRowCallbacks = {};

        this.addApi();
        this.findAllElements(eGridDiv);
        this.createAndWireBeans($scope, $compile, eGridDiv, useScrolls);

        this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getAllRows());

        if (useScrolls) {
            this.addScrollListener();
            this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes
        }

        // done when cols change
        this.setupColumns();

        // done when rows change
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);

        // flag to mark when the directive is destroyed
        this.finished = false;

        // if no data provided initially, and not doing infinite scrolling, show the loading panel
        var showLoading = !this.gridOptionsWrapper.getAllRows() && !this.gridOptionsWrapper.isVirtualPaging();
        this.showLoadingPanel(showLoading);

        // if datasource provided, use it
        if (this.gridOptionsWrapper.getDatasource()) {
            this.setDatasource();
        }
    }

    Grid.prototype.createAndWireBeans = function($scope, $compile, eGridDiv, useScrolls) {

        // make local references, to make the below more human readable
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var gridOptions = this.gridOptions;

        // create all the beans
        var selectionController = new SelectionController();
        var filterManager = new FilterManager();
        var selectionRendererFactory = new SelectionRendererFactory();
        var columnController = new ColumnController();
        var rowRenderer = new RowRenderer();
        var headerRenderer = new HeaderRenderer();
        var inMemoryRowController = new InMemoryRowController();
        var virtualPageRowController = new VirtualPageRowController();


        var columnModel = columnController.getModel();

        // initialise all the beans
        selectionController.init(this, this.eParentOfRows, gridOptionsWrapper, $scope, rowRenderer);
        filterManager.init(this, gridOptionsWrapper, $compile, $scope);
        selectionRendererFactory.init(this, selectionController);
        columnController.init(this, selectionRendererFactory, gridOptionsWrapper);
        rowRenderer.init(gridOptions, columnModel, gridOptionsWrapper, eGridDiv, this,
            selectionRendererFactory, $compile, $scope, selectionController);
        headerRenderer.init(gridOptionsWrapper, columnController, columnModel, eGridDiv, this, filterManager, $scope, $compile);
        inMemoryRowController.init(gridOptionsWrapper, columnModel, this, filterManager, $scope);
        virtualPageRowController.init(rowRenderer);

        // this is a child bean, get a reference and pass it on
        // CAN WE DELETE THIS? it's done in the setDatasource section
        var rowModel = inMemoryRowController.getModel();
        selectionController.setRowModel(rowModel);
        filterManager.setRowModel(rowModel);
        rowRenderer.setRowModel(rowModel);

        // and the last bean, done in it's own section, as it's optional
        var paginationController = null;
        if (useScrolls) {
            paginationController = new PaginationController();
            paginationController.init(this.ePagingPanel, this);
        }

        this.rowModel = rowModel;
        this.selectionController = selectionController;
        this.columnController = columnController;
        this.columnModel = columnModel;
        this.inMemoryRowController = inMemoryRowController;
        this.virtualPageRowController = virtualPageRowController;
        this.rowRenderer = rowRenderer;
        this.headerRenderer = headerRenderer;
        this.paginationController = paginationController;
        this.filterManager = filterManager;
    };

    Grid.prototype.showAndPositionPagingPanel = function() {
        // no paging when no-scrolls
        if (!this.ePagingPanel) {
            return;
        }

        if (this.isShowPagingPanel()) {
            this.ePagingPanel.style['display'] = null;
            var heightOfPager = this.ePagingPanel.offsetHeight;
            this.eBody.style['padding-bottom'] = heightOfPager + 'px';
            var heightOfRoot = this.eRoot.clientHeight;
            var topOfPager = heightOfRoot - heightOfPager;
            this.ePagingPanel.style['top'] = topOfPager + 'px';
        } else {
            this.ePagingPanel.style['display'] = 'none';
            this.eBody.style['padding-bottom'] = null;
        }

    };

    Grid.prototype.isShowPagingPanel = function() {
        return this.showPagingPanel;
    };

    Grid.prototype.setDatasource = function(datasource) {
        // if datasource provided, then set it
        if (datasource) {
            this.gridOptions.datasource = datasource;
        }
        // get the set datasource (if null was passed to this method,
        // then need to get the actual datasource from options
        var datasourceToUse = this.gridOptionsWrapper.getDatasource();
        var virtualPaging = this.gridOptionsWrapper.isVirtualPaging() && datasourceToUse;
        var pagination = datasourceToUse && !virtualPaging;

        if (virtualPaging) {
            this.paginationController.setDatasource(null);
            this.virtualPageRowController.setDatasource(datasource);
            this.rowModel = this.virtualPageRowController.getModel();
            this.showPagingPanel = false;
        } else if (pagination) {
            this.paginationController.setDatasource(datasourceToUse);
            this.virtualPageRowController.setDatasource(null);
            this.rowModel = this.inMemoryRowController.getModel();
            this.showPagingPanel = true;
        } else {
            this.paginationController.setDatasource(null);
            this.virtualPageRowController.setDatasource(null);
            this.rowModel = this.inMemoryRowController.getModel();
            this.showPagingPanel = false;
        }

        this.selectionController.setRowModel(this.rowModel);
        this.filterManager.setRowModel(this.rowModel);
        this.rowRenderer.setRowModel(this.rowModel);

        // we may of just shown or hidden the paging panel, so need
        // to get table to check the body size, which also hides and
        // shows the paging panel.
        this.setBodySize();

        // because we just set the rowModel, need to update the gui
        this.rowRenderer.refreshView();
    };

    // gets called after columns are shown / hidden from groups expanding
    Grid.prototype.refreshHeaderAndBody = function() {
        this.headerRenderer.refreshHeader();
        this.headerRenderer.updateFilterIcons();
        this.setBodyContainerWidth();
        this.setPinnedColContainerWidth();
        this.rowRenderer.refreshView();
    };

    Grid.prototype.setFinished = function() {
        this.finished = true;
    };

    Grid.prototype.getPopupParent = function() {
        return this.eRoot;
    };

    Grid.prototype.getQuickFilter = function() {
        return this.quickFilter;
    };

    Grid.prototype.onQuickFilterChanged = function(newFilter) {
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (this.quickFilter !== newFilter) {
            //want 'null' to mean to filter, so remove undefined and empty string
            if (newFilter === undefined || newFilter === "") {
                newFilter = null;
            }
            if (newFilter !== null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            this.onFilterChanged();
        }
    };

    Grid.prototype.onFilterChanged = function() {
        this.updateModelAndRefresh(constants.STEP_FILTER);
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.onRowClicked = function(event, rowIndex, node) {

        if (this.gridOptions.rowClicked) {
            var params = {
                node: node,
                data: node.data,
                event: event
            };
            this.gridOptions.rowClicked(params);
        }

        // if no selection method enabled, do nothing
        if (!this.gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        // ctrlKey for windows, metaKey for Apple
        var tryMulti = event.ctrlKey || event.metaKey;
        this.selectionController.selectNode(node, tryMulti);
    };

    Grid.prototype.setHeaderHeight = function() {
        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var headerHeightPixels = headerHeight + 'px';
        var dontUseScrolls = this.gridOptionsWrapper.isDontUseScrolls();
        if (dontUseScrolls) {
            this.eHeaderContainer.style.height = headerHeightPixels;
        } else {
            this.eHeader.style.height = headerHeightPixels;
            this.eBody.style['padding-top'] = headerHeightPixels;
            this.eLoadingPanel.style['margin-top'] = headerHeightPixels;
        }
    };

    Grid.prototype.showLoadingPanel = function(show) {
        if (show) {
            // setting display to null, actually has the impact of setting it
            // to 'table', as this is part of the ag-loading-panel core style
            this.eLoadingPanel.style.display = null;
        } else {
            this.eLoadingPanel.style.display = 'none';
        }
    };

    Grid.prototype.setupColumns = function() {
        this.setHeaderHeight();
        this.columnController.setColumns(this.gridOptions.columnDefs);
        this.showPinnedColContainersIfNeeded();
        this.headerRenderer.refreshHeader();
        if (!this.gridOptionsWrapper.isDontUseScrolls()) {
            this.setPinnedColContainerWidth();
            this.setBodyContainerWidth();
        }
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function() {
        var mainRowWidth = this.columnModel.getBodyContainerWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.updateModelAndRefresh = function(step) {
        this.inMemoryRowController.updateModel(step);
        this.rowRenderer.refreshView();
    };

    Grid.prototype.setRows = function(rows, firstId) {
        if (rows) {
            this.gridOptions.rowData = rows;
        }
        this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getAllRows(), firstId);
        this.selectionController.clearSelection();
        this.filterManager.onNewRowsLoaded();
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);
        this.headerRenderer.updateFilterIcons();
        this.showLoadingPanel(false);
    };

    Grid.prototype.addApi = function() {
        var that = this;
        window.tanner = that;
        var api = {
            setDatasource: function(datasource) {
                that.setDatasource(datasource);
            },
            onNewDatasource: function() {
                that.setDatasource();
            },
            setRows: function(rows) {
                that.setRows(rows);
            },
            onNewRows: function() {
                that.setRows();
            },
            onNewCols: function() {
                that.onNewCols();
            },
            unselectAll: function() {
                that.selectionController.clearSelection();
                that.rowRenderer.refreshView();
            },
            refreshView: function() {
                that.rowRenderer.refreshView();
            },
            refreshHeader: function() {
                // need to review this - the refreshHeader should also refresh all icons in the header
                that.headerRenderer.refreshHeader();
                that.headerRenderer.updateFilterIcons();
            },
            getModel: function() {
                return that.rowModel;
            },
            onGroupExpandedOrCollapsed: function() {
                that.updateModelAndRefresh(constants.STEP_MAP);
            },
            expandAll: function() {
                that.inMemoryRowController.expandOrCollapseAll(true, null);
                that.updateModelAndRefresh(constants.STEP_MAP);
            },
            collapseAll: function() {
                that.inMemoryRowController.expandOrCollapseAll(false, null);
                that.updateModelAndRefresh(constants.STEP_MAP);
            },
            addVirtualRowListener: function(rowIndex, callback) {
                that.addVirtualRowListener(rowIndex, callback);
            },
            rowDataChanged: function(rows) {
                that.rowRenderer.rowDataChanged(rows);
            },
            setQuickFilter: function(newFilter) {
                that.onQuickFilterChanged(newFilter);
            },
            selectIndex: function(index, tryMulti, suppressEvents) {
                that.selectionController.selectIndex(index, tryMulti, suppressEvents);
            },
            recomputeAggregates: function() {
                that.inMemoryRowController.doAggregate();
                that.rowRenderer.refreshGroupRows();
            },
            showLoading: function(show) {
                that.showLoadingPanel(show);
            },
            isNodeSelected: function(node) {
                return that.selectionController.isNodeSelected(node);
            },
            getSelectedNodes: function() {
                return that.selectionController.getSelectedNodes();
            },
            getBestCostNodeSelection: function() {
                return that.selectionController.getBestCostNodeSelection();
            }
        };
        this.gridOptions.api = api;
    };

    Grid.prototype.addVirtualRowListener = function(rowIndex, callback) {
        if (!this.virtualRowCallbacks[rowIndex]) {
            this.virtualRowCallbacks[rowIndex] = [];
        }
        this.virtualRowCallbacks[rowIndex].push(callback);
    };

    Grid.prototype.onVirtualRowSelected = function(rowIndex, selected) {
        // inform the callbacks of the event
        if (this.virtualRowCallbacks[rowIndex]) {
            this.virtualRowCallbacks[rowIndex].forEach(function(callback) {
                if (typeof callback.rowRemoved === 'function') {
                    callback.rowSelected(selected);
                }
            });
        }
    };

    Grid.prototype.onVirtualRowRemoved = function(rowIndex) {
        // inform the callbacks of the event
        if (this.virtualRowCallbacks[rowIndex]) {
            this.virtualRowCallbacks[rowIndex].forEach(function(callback) {
                if (typeof callback.rowRemoved === 'function') {
                    callback.rowRemoved();
                }
            });
        }
        // remove the callbacks
        delete this.virtualRowCallbacks[rowIndex];
    };

    Grid.prototype.onNewCols = function() {
        this.setupColumns();
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);
    };

    Grid.prototype.findAllElements = function(eGridDiv) {
        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            this.eRoot = eGridDiv.querySelector(".ag-root");
            this.eHeaderContainer = eGridDiv.querySelector(".ag-header-container");
            this.eBodyContainer = eGridDiv.querySelector(".ag-body-container");
            this.eLoadingPanel = eGridDiv.querySelector('.ag-loading-panel');
            // for no-scrolls, all rows live in the body container
            this.eParentOfRows = this.eBodyContainer;
        } else {
            this.eRoot = eGridDiv.querySelector(".ag-root");
            this.eBody = eGridDiv.querySelector(".ag-body");
            this.eBodyContainer = eGridDiv.querySelector(".ag-body-container");
            this.eBodyViewport = eGridDiv.querySelector(".ag-body-viewport");
            this.eBodyViewportWrapper = eGridDiv.querySelector(".ag-body-viewport-wrapper");
            this.ePinnedColsContainer = eGridDiv.querySelector(".ag-pinned-cols-container");
            this.ePinnedColsViewport = eGridDiv.querySelector(".ag-pinned-cols-viewport");
            this.ePinnedHeader = eGridDiv.querySelector(".ag-pinned-header");
            this.eHeader = eGridDiv.querySelector(".ag-header");
            this.eHeaderContainer = eGridDiv.querySelector(".ag-header-container");
            this.eLoadingPanel = eGridDiv.querySelector('.ag-loading-panel');
            // for scrolls, all rows live in eBody (containing pinned and normal body)
            this.eParentOfRows = this.eBody;
            this.ePagingPanel = eGridDiv.querySelector('.ag-paging-panel');
        }
    };

    Grid.prototype.showPinnedColContainersIfNeeded = function() {
        // no need to do this if not using scrolls
        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            return;
        }

        var showingPinnedCols = this.gridOptionsWrapper.getPinnedColCount() > 0;

        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (showingPinnedCols) {
            this.ePinnedHeader.style.display = 'inline-block';
            this.ePinnedColsViewport.style.display = 'inline';
        } else {
            this.ePinnedHeader.style.display = 'none';
            this.ePinnedColsViewport.style.display = 'none';
        }
    };

    Grid.prototype.updateBodyContainerWidthAfterColResize = function() {
        this.rowRenderer.setMainRowWidths();
        this.setBodyContainerWidth();
    };

    Grid.prototype.updatePinnedColContainerWidthAfterColResize = function() {
        this.setPinnedColContainerWidth();
    };

    Grid.prototype.setPinnedColContainerWidth = function() {
        var pinnedColWidth = this.columnModel.getPinnedContainerWidth() + "px";
        this.ePinnedColsContainer.style.width = pinnedColWidth;
        this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
    };

    // see if a grey box is needed at the bottom of the pinned col
    Grid.prototype.setPinnedColHeight = function() {
        // var bodyHeight = utils.pixelStringToNumber(this.eBody.style.height);
        var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        var bodyHeight = this.eBodyViewport.offsetHeight;
        if (scrollShowing) {
            this.ePinnedColsViewport.style.height = (bodyHeight - 20) + "px";
        } else {
            this.ePinnedColsViewport.style.height = bodyHeight + "px";
        }
        // also the loading overlay, needs to have it's height adjusted
        this.eLoadingPanel.style.height = bodyHeight + 'px';
    };

    Grid.prototype.setBodySize = function() {
        var _this = this;

        var bodyHeight = this.eBodyViewport.offsetHeight;
        var pagingVisible = this.isShowPagingPanel();

        if (this.bodyHeightLastTime != bodyHeight || this.showPagingPanelVisibleLastTime != pagingVisible) {
            this.bodyHeightLastTime = bodyHeight;
            this.showPagingPanelVisibleLastTime = pagingVisible;

            this.setPinnedColHeight();

            //only draw virtual rows if done sort & filter - this
            //means we don't draw rows if table is not yet initialised
            if (this.rowModel.getVirtualRowCount() > 0) {
                this.rowRenderer.drawVirtualRows();
            }

            // show and position paging panel
            this.showAndPositionPagingPanel();
        }

        if (!this.finished) {
            setTimeout(function() {
                _this.setBodySize();
            }, 200);
        }
    };

    Grid.prototype.addScrollListener = function() {
        var _this = this;

        this.eBodyViewport.addEventListener("scroll", function() {
            _this.scrollHeaderAndPinned();
            _this.rowRenderer.drawVirtualRows();
        });
    };

    Grid.prototype.scrollHeaderAndPinned = function() {
        this.eHeaderContainer.style.left = -this.eBodyViewport.scrollLeft + "px";
        this.ePinnedColsContainer.style.top = -this.eBodyViewport.scrollTop + "px";
    };


})();
