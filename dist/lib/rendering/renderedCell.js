/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var vHtmlElement_1 = require("../virtualDom/vHtmlElement");
var column_1 = require("../entities/column");
var constants_1 = require("../constants");
var events_1 = require("../events");
var vWrapperElement_1 = require("../virtualDom/vWrapperElement");
var RenderedCell = (function () {
    function RenderedCell(firstRightPinnedCol, column, $compile, rowRenderer, gridOptionsWrapper, expressionService, selectionRendererFactory, selectionController, templateService, cellRendererMap, node, rowIndex, colIndex, scope, columnController, valueService, eventService) {
        this.destroyMethods = [];
        this.firstRightPinnedColumn = firstRightPinnedCol;
        this.column = column;
        this.rowRenderer = rowRenderer;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.expressionService = expressionService;
        this.selectionRendererFactory = selectionRendererFactory;
        this.selectionController = selectionController;
        this.cellRendererMap = cellRendererMap;
        this.$compile = $compile;
        this.templateService = templateService;
        this.columnController = columnController;
        this.valueService = valueService;
        this.eventService = eventService;
        this.node = node;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.scope = scope;
        this.data = this.getDataForRow();
        this.value = this.getValue();
        this.checkboxSelection = this.calculateCheckboxSelection();
        this.setupComponents();
    }
    RenderedCell.prototype.destroy = function () {
        this.destroyMethods.forEach(function (theFunction) {
            theFunction();
        });
    };
    RenderedCell.prototype.calculateCheckboxSelection = function () {
        // never allow selection on floating rows
        if (this.node.floating) {
            return false;
        }
        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        if (typeof colDef.checkboxSelection === 'boolean') {
            return colDef.checkboxSelection;
        }
        // if function, then call the function to find out. we first check colDef for
        // a function, and if missing then check gridOptions, so colDef has precedence
        var selectionFunc;
        if (typeof colDef.checkboxSelection === 'function') {
            selectionFunc = colDef.checkboxSelection;
        }
        if (!selectionFunc && this.gridOptionsWrapper.getCheckboxSelection()) {
            selectionFunc = this.gridOptionsWrapper.getCheckboxSelection();
        }
        if (selectionFunc) {
            var params = this.createParams();
            return selectionFunc(params);
        }
        return false;
    };
    RenderedCell.prototype.getColumn = function () {
        return this.column;
    };
    RenderedCell.prototype.getValue = function () {
        return this.valueService.getValue(this.column.getColDef(), this.data, this.node);
    };
    RenderedCell.prototype.getVGridCell = function () {
        return this.vGridCell;
    };
    RenderedCell.prototype.getDataForRow = function () {
        if (this.node.footer) {
            // if footer, we always show the data
            return this.node.data;
        }
        else if (this.node.group) {
            // if header and header is expanded, we show data in footer only
            var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
            var suppressHideHeader = this.gridOptionsWrapper.isGroupSuppressBlankHeader();
            if (this.node.expanded && footersEnabled && !suppressHideHeader) {
                return undefined;
            }
            else {
                return this.node.data;
            }
        }
        else {
            // otherwise it's a normal node, just return data as normal
            return this.node.data;
        }
    };
    RenderedCell.prototype.setLeftOnCell = function () {
        var _this = this;
        var leftChangedListener = function () {
            //if (this.column.getColId()==='age') {
            //    console.log('left changed: ' + this.column.getColId() + ' ' + this.column.getLeft());
            //}
            _this.vGridCell.addStyles({ left: _this.column.getLeft() + 'px' });
        };
        this.column.addEventListener(column_1.default.EVENT_LEFT_CHANGED, leftChangedListener);
        this.destroyMethods.push(function () {
            _this.column.removeEventListener(column_1.default.EVENT_LEFT_CHANGED, leftChangedListener);
        });
        leftChangedListener();
    };
    RenderedCell.prototype.setWidthOnCell = function () {
        var _this = this;
        var widthChangedListener = function () {
            _this.vGridCell.addStyles({ width: _this.column.getActualWidth() + "px" });
        };
        this.column.addEventListener(column_1.default.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.destroyMethods.push(function () {
            _this.column.removeEventListener(column_1.default.EVENT_WIDTH_CHANGED, widthChangedListener);
        });
        widthChangedListener();
    };
    RenderedCell.prototype.setupComponents = function () {
        this.vGridCell = new vHtmlElement_1.default("div");
        this.setLeftOnCell();
        this.setWidthOnCell();
        // only set tab index if cell selection is enabled
        if (!this.gridOptionsWrapper.isSuppressCellSelection() && !this.node.floating) {
            this.vGridCell.setAttribute("tabindex", "-1");
        }
        // these are the grid styles, don't change between soft refreshes
        this.addClasses();
        this.addCellClickedHandler();
        this.addCellDoubleClickedHandler();
        this.addCellContextMenuHandler();
        if (!this.node.floating) {
            this.addCellNavigationHandler();
        }
        this.createParentOfValue();
        this.populateCell();
        if (this.eCheckbox) {
            this.setSelected(this.selectionController.isNodeSelected(this.node));
        }
    };
    // called by rowRenderer when user navigates via tab key
    RenderedCell.prototype.startEditing = function (key) {
        var _this = this;
        var that = this;
        this.editingCell = true;
        utils_1.default.removeAllChildren(this.vGridCell.getElement());
        var eInput = document.createElement('input');
        eInput.type = 'text';
        utils_1.default.addCssClass(eInput, 'ag-cell-edit-input');
        var startWithOldValue = key !== constants_1.default.KEY_BACKSPACE && key !== constants_1.default.KEY_DELETE;
        var value = this.getValue();
        if (startWithOldValue && value !== null && value !== undefined) {
            eInput.value = value;
        }
        eInput.style.width = (this.column.getActualWidth() - 14) + 'px';
        this.vGridCell.appendChild(eInput);
        eInput.focus();
        eInput.select();
        var blurListener = function () {
            that.stopEditing(eInput, blurListener);
        };
        //stop entering if we loose focus
        eInput.addEventListener("blur", blurListener);
        //stop editing if enter pressed
        eInput.addEventListener('keypress', function (event) {
            var key = event.which || event.keyCode;
            if (key === constants_1.default.KEY_ENTER) {
                _this.stopEditing(eInput, blurListener);
                _this.focusCell(true);
            }
        });
        //stop editing if enter pressed
        eInput.addEventListener('keydown', function (event) {
            var key = event.which || event.keyCode;
            if (key === constants_1.default.KEY_ESCAPE) {
                _this.stopEditing(eInput, blurListener, true);
                _this.focusCell(true);
            }
        });
        // tab key doesn't generate keypress, so need keydown to listen for that
        eInput.addEventListener('keydown', function (event) {
            var key = event.which || event.keyCode;
            if (key == constants_1.default.KEY_TAB) {
                that.stopEditing(eInput, blurListener);
                that.rowRenderer.startEditingNextCell(that.rowIndex, that.column, event.shiftKey);
                // we don't want the default tab action, so return false, this stops the event from bubbling
                event.preventDefault();
                return false;
            }
        });
    };
    RenderedCell.prototype.focusCell = function (forceBrowserFocus) {
        this.rowRenderer.focusCell(this.vGridCell.getElement(), this.rowIndex, this.column.getColId(), this.column.getColDef(), forceBrowserFocus);
    };
    RenderedCell.prototype.stopEditing = function (eInput, blurListener, reset) {
        if (reset === void 0) { reset = false; }
        this.editingCell = false;
        var newValue = eInput.value;
        var colDef = this.column.getColDef();
        //If we don't remove the blur listener first, we get:
        //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
        eInput.removeEventListener('blur', blurListener);
        if (!reset) {
            var paramsForCallbacks = {
                node: this.node,
                data: this.node.data,
                oldValue: this.node.data[colDef.field],
                newValue: newValue,
                rowIndex: this.rowIndex,
                colDef: colDef,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            if (colDef.newValueHandler) {
                colDef.newValueHandler(paramsForCallbacks);
            }
            else {
                this.valueService.setValueUsingField(this.node.data, colDef.field, newValue);
            }
            // at this point, the value has been updated
            this.value = this.getValue();
            paramsForCallbacks.newValue = this.value;
            if (typeof colDef.onCellValueChanged === 'function') {
                colDef.onCellValueChanged(paramsForCallbacks);
            }
            this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
        }
        utils_1.default.removeAllChildren(this.vGridCell.getElement());
        if (this.checkboxSelection) {
            this.vGridCell.appendChild(this.vCellWrapper.getElement());
        }
        this.refreshCell();
    };
    RenderedCell.prototype.createParams = function () {
        var params = {
            node: this.node,
            data: this.node.data,
            value: this.value,
            rowIndex: this.rowIndex,
            colIndex: this.colIndex,
            colDef: this.column.getColDef(),
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };
        return params;
    };
    RenderedCell.prototype.createEvent = function (event, eventSource) {
        var agEvent = this.createParams();
        agEvent.event = event;
        agEvent.eventSource = eventSource;
        return agEvent;
    };
    RenderedCell.prototype.addCellDoubleClickedHandler = function () {
        var that = this;
        var colDef = this.column.getColDef();
        this.vGridCell.addEventListener('dblclick', function (event) {
            // always dispatch event to eventService
            var agEvent = that.createEvent(event, this);
            that.eventService.dispatchEvent(events_1.Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);
            // check if colDef also wants to handle event
            if (typeof colDef.onCellDoubleClicked === 'function') {
                colDef.onCellDoubleClicked(agEvent);
            }
            if (!that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                that.startEditing();
            }
        });
    };
    RenderedCell.prototype.addCellContextMenuHandler = function () {
        var that = this;
        var colDef = this.column.getColDef();
        this.vGridCell.addEventListener('contextmenu', function (event) {
            var agEvent = that.createEvent(event, this);
            that.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CONTEXT_MENU, agEvent);
            if (colDef.onCellContextMenu) {
                colDef.onCellContextMenu(agEvent);
            }
        });
    };
    RenderedCell.prototype.isCellEditable = function () {
        if (this.editingCell) {
            return false;
        }
        // never allow editing of groups
        if (this.node.group) {
            return false;
        }
        // if boolean set, then just use it
        var colDef = this.column.getColDef();
        if (typeof colDef.editable === 'boolean') {
            return colDef.editable;
        }
        // if function, then call the function to find out
        if (typeof colDef.editable === 'function') {
            var params = this.createParams();
            var editableFunc = colDef.editable;
            return editableFunc(params);
        }
        return false;
    };
    RenderedCell.prototype.addCellClickedHandler = function () {
        var colDef = this.column.getColDef();
        var that = this;
        this.vGridCell.addEventListener("click", function (event) {
            // we pass false to focusCell, as we don't want the cell to focus
            // also get the browser focus. if we did, then the cellRenderer could
            // have a text field in it, for example, and as the user clicks on the
            // text field, the text field, the focus doesn't get to the text
            // field, instead to goes to the div behind, making it impossible to
            // select the text field.
            if (!that.node.floating) {
                that.focusCell(false);
            }
            var agEvent = that.createEvent(event, this);
            that.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CLICKED, agEvent);
            if (colDef.onCellClicked) {
                colDef.onCellClicked(agEvent);
            }
            if (that.gridOptionsWrapper.isSingleClickEdit() && that.isCellEditable()) {
                that.startEditing();
            }
        });
    };
    RenderedCell.prototype.populateCell = function () {
        // populate
        this.putDataIntoCell();
        // style
        this.addStylesFromCollDef();
        this.addClassesFromCollDef();
        this.addClassesFromRules();
    };
    RenderedCell.prototype.addStylesFromCollDef = function () {
        var colDef = this.column.getColDef();
        if (colDef.cellStyle) {
            var cssToUse;
            if (typeof colDef.cellStyle === 'function') {
                var cellStyleParams = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var cellStyleFunc = colDef.cellStyle;
                cssToUse = cellStyleFunc(cellStyleParams);
            }
            else {
                cssToUse = colDef.cellStyle;
            }
            if (cssToUse) {
                this.vGridCell.addStyles(cssToUse);
            }
        }
    };
    RenderedCell.prototype.addClassesFromCollDef = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        if (colDef.cellClass) {
            var classToUse;
            if (typeof colDef.cellClass === 'function') {
                var cellClassParams = {
                    value: this.value,
                    data: this.node.data,
                    node: this.node,
                    colDef: colDef,
                    $scope: this.scope,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var cellClassFunc = colDef.cellClass;
                classToUse = cellClassFunc(cellClassParams);
            }
            else {
                classToUse = colDef.cellClass;
            }
            if (typeof classToUse === 'string') {
                this.vGridCell.addClass(classToUse);
            }
            else if (Array.isArray(classToUse)) {
                classToUse.forEach(function (cssClassItem) {
                    _this.vGridCell.addClass(cssClassItem);
                });
            }
        }
    };
    RenderedCell.prototype.addClassesFromRules = function () {
        var colDef = this.column.getColDef();
        var classRules = colDef.cellClassRules;
        if (typeof classRules === 'object' && classRules !== null) {
            var params = {
                value: this.value,
                data: this.node.data,
                node: this.node,
                colDef: colDef,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            var classNames = Object.keys(classRules);
            for (var i = 0; i < classNames.length; i++) {
                var className = classNames[i];
                var rule = classRules[className];
                var resultOfRule;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                }
                else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                if (resultOfRule) {
                    this.vGridCell.addClass(className);
                }
                else {
                    this.vGridCell.removeClass(className);
                }
            }
        }
    };
    // rename this to 'add key event listener
    RenderedCell.prototype.addCellNavigationHandler = function () {
        var that = this;
        this.vGridCell.addEventListener('keydown', function (event) {
            if (that.editingCell) {
                return;
            }
            // only interested on key presses that are directly on this element, not any children elements. this
            // stops navigation if the user is in, for example, a text field inside the cell, and user hits
            // on of the keys we are looking for.
            if (event.target !== that.vGridCell.getElement()) {
                return;
            }
            var key = event.which || event.keyCode;
            var startNavigation = key === constants_1.default.KEY_DOWN || key === constants_1.default.KEY_UP
                || key === constants_1.default.KEY_LEFT || key === constants_1.default.KEY_RIGHT;
            if (startNavigation) {
                event.preventDefault();
                that.rowRenderer.navigateToNextCell(key, that.rowIndex, that.column);
                return;
            }
            var startEdit = that.isKeycodeForStartEditing(key);
            if (startEdit && that.isCellEditable()) {
                that.startEditing(key);
                // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
                // press, and stops editing immediately, hence giving he user experience that nothing happened
                event.preventDefault();
                return;
            }
            var selectRow = key === constants_1.default.KEY_SPACE;
            if (selectRow && that.gridOptionsWrapper.isRowSelection()) {
                var selected = that.selectionController.isNodeSelected(that.node);
                if (selected) {
                    that.selectionController.deselectNode(that.node);
                }
                else {
                    that.selectionController.selectNode(that.node, true);
                }
                event.preventDefault();
                return;
            }
        });
    };
    RenderedCell.prototype.isKeycodeForStartEditing = function (key) {
        return key === constants_1.default.KEY_ENTER || key === constants_1.default.KEY_BACKSPACE || key === constants_1.default.KEY_DELETE;
    };
    RenderedCell.prototype.createSelectionCheckbox = function () {
        this.eCheckbox = document.createElement('input');
        this.eCheckbox.type = "checkbox";
        this.eCheckbox.name = "name";
        this.eCheckbox.className = 'ag-selection-checkbox';
        this.eCheckbox.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        var that = this;
        this.checkboxOnChangeListener = function () {
            var newValue = that.eCheckbox.checked;
            if (newValue) {
                that.selectionController.selectIndex(that.rowIndex, true);
            }
            else {
                that.selectionController.deselectIndex(that.rowIndex);
            }
        };
        this.eCheckbox.onchange = this.checkboxOnChangeListener;
    };
    RenderedCell.prototype.setSelected = function (state) {
        if (!this.eCheckbox) {
            return;
        }
        this.eCheckbox.onchange = null;
        if (typeof state === 'boolean') {
            this.eCheckbox.checked = state;
            this.eCheckbox.indeterminate = false;
        }
        else {
            // isNodeSelected returns back undefined if it's a group and the children
            // are a mix of selected and unselected
            this.eCheckbox.indeterminate = true;
        }
        this.eCheckbox.onchange = this.checkboxOnChangeListener;
    };
    RenderedCell.prototype.createParentOfValue = function () {
        if (this.checkboxSelection) {
            this.vCellWrapper = new vHtmlElement_1.default('span');
            this.vCellWrapper.addClass('ag-cell-wrapper');
            this.vGridCell.appendChild(this.vCellWrapper);
            this.createSelectionCheckbox();
            this.vCellWrapper.appendChild(new vWrapperElement_1.default(this.eCheckbox));
            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
            this.vSpanWithValue = new vHtmlElement_1.default('span');
            this.vSpanWithValue.addClass('ag-cell-value');
            this.vCellWrapper.appendChild(this.vSpanWithValue);
            this.vParentOfValue = this.vSpanWithValue;
        }
        else {
            this.vGridCell.addClass('ag-cell-value');
            this.vParentOfValue = this.vGridCell;
        }
    };
    RenderedCell.prototype.isVolatile = function () {
        return this.column.getColDef().volatile;
    };
    RenderedCell.prototype.refreshCell = function () {
        utils_1.default.removeAllChildren(this.vParentOfValue.getElement());
        this.value = this.getValue();
        this.populateCell();
        if (this.checkboxSelection) {
            this.setSelected(this.selectionController.isNodeSelected(this.node));
        }
        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            this.$compile(this.vGridCell.getElement())(this.scope);
        }
    };
    RenderedCell.prototype.putDataIntoCell = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        if (colDef.template) {
            this.vParentOfValue.setInnerHtml(colDef.template);
        }
        else if (colDef.templateUrl) {
            var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.vParentOfValue.setInnerHtml(template);
            }
        }
        else if (colDef.floatingCellRenderer && this.node.floating) {
            this.useCellRenderer(colDef.floatingCellRenderer);
        }
        else if (colDef.cellRenderer) {
            this.useCellRenderer(colDef.cellRenderer);
        }
        else {
            // if we insert undefined, then it displays as the string 'undefined', ugly!
            if (this.value !== undefined && this.value !== null && this.value !== '') {
                this.vParentOfValue.setInnerHtml(this.value.toString());
            }
        }
    };
    RenderedCell.prototype.useCellRenderer = function (cellRenderer) {
        var colDef = this.column.getColDef();
        var rendererParams = {
            value: this.value,
            valueGetter: this.getValue,
            data: this.node.data,
            node: this.node,
            colDef: colDef,
            column: this.column,
            $scope: this.scope,
            rowIndex: this.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.vGridCell,
            eParentOfValue: this.vParentOfValue
        };
        // start duplicated code
        var actualCellRenderer;
        if (typeof cellRenderer === 'object' && cellRenderer !== null) {
            var cellRendererObj = cellRenderer;
            actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
            if (!actualCellRenderer) {
                throw 'Cell renderer ' + cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
            }
        }
        else if (typeof cellRenderer === 'function') {
            actualCellRenderer = cellRenderer;
        }
        else {
            throw 'Cell Renderer must be String or Function';
        }
        var resultFromRenderer = actualCellRenderer(rendererParams);
        // end duplicated code
        if (utils_1.default.isNodeOrElement(resultFromRenderer)) {
            // a dom node or element was returned, so add child
            this.vParentOfValue.appendChild(resultFromRenderer);
        }
        else {
            // otherwise assume it was html, so just insert
            this.vParentOfValue.setInnerHtml(resultFromRenderer);
        }
    };
    RenderedCell.prototype.addClasses = function () {
        this.vGridCell.addClass('ag-cell');
        this.vGridCell.addClass('ag-cell-no-focus');
        this.vGridCell.setAttribute("colId", this.column.getColId());
        if (this.node.group && this.node.footer) {
            this.vGridCell.addClass('ag-footer-cell');
        }
        if (this.node.group && !this.node.footer) {
            this.vGridCell.addClass('ag-group-cell');
        }
        if (this.firstRightPinnedColumn) {
            this.vGridCell.addClass('ag-cell-first-right-pinned');
        }
    };
    return RenderedCell;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RenderedCell;
