/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var column_1 = require("../entities/column");
var rowNode_1 = require("../entities/rowNode");
var constants_1 = require("../constants");
var events_1 = require("../events");
var gridCell_1 = require("../entities/gridCell");
var component_1 = require("../widgets/component");
var checkboxSelectionComponent_1 = require("./checkboxSelectionComponent");
var rowDragComp_1 = require("./rowDragComp");
var CellComp = (function (_super) {
    __extends(CellComp, _super);
    function CellComp(scope, beans, column, rowNode, rowComp) {
        var _this = _super.call(this) || this;
        _this.editingCell = false;
        // every time we go into edit mode, or back again, this gets incremented.
        // it's the components way of dealing with the async nature of framework components,
        // so if a framework component takes a while to be created, we know if the object
        // is still relevant when creating is finished. eg we could click edit / unedit 20
        // times before the first React edit component comes back - we should discard
        // the first 19.
        _this.cellEditorVersion = 0;
        _this.cellRendererVersion = 0;
        _this.scope = scope;
        _this.beans = beans;
        _this.column = column;
        _this.rowNode = rowNode;
        _this.rowComp = rowComp;
        _this.createGridCellVo();
        _this.rangeSelectionEnabled = beans.enterprise && beans.gridOptionsWrapper.isEnableRangeSelection();
        _this.cellFocused = _this.beans.focusedCellController.isCellFocused(_this.gridCell);
        _this.firstRightPinned = _this.column.isFirstRightPinned();
        _this.lastLeftPinned = _this.column.isLastLeftPinned();
        if (_this.rangeSelectionEnabled) {
            _this.rangeCount = _this.beans.rangeController.getCellRangeCount(_this.gridCell);
        }
        _this.getValueAndFormat();
        _this.setUsingWrapper();
        _this.chooseCellRenderer();
        _this.setupColSpan();
        return _this;
    }
    CellComp.prototype.getCreateTemplate = function () {
        var templateParts = [];
        var col = this.column;
        var width = this.getCellWidth();
        var left = col.getLeft();
        var valueToRender = this.getInitialValueToRender();
        var valueSanitised = utils_1._.get(this.column, 'colDef.template', null) ? valueToRender : utils_1._.escape(valueToRender);
        var tooltip = this.getToolTip();
        var tooltipSanitised = utils_1._.escape(tooltip);
        var colIdSanitised = utils_1._.escape(col.getId());
        var wrapperStartTemplate;
        var wrapperEndTemplate;
        var stylesFromColDef = this.preProcessStylesFromColDef();
        var cssClasses = this.getInitialCssClasses();
        if (this.usingWrapper) {
            wrapperStartTemplate = '<span ref="eCellWrapper" class="ag-cell-wrapper"><span ref="eCellValue" class="ag-cell-value">';
            wrapperEndTemplate = '</span></span>';
        }
        // hey, this looks like React!!!
        templateParts.push("<div");
        templateParts.push(" tabindex=\"-1\"");
        templateParts.push(" role=\"gridcell\"");
        templateParts.push(" comp-id=\"" + this.getCompId() + "\" ");
        templateParts.push(" col-id=\"" + colIdSanitised + "\"");
        templateParts.push(" class=\"" + cssClasses.join(' ') + "\"");
        templateParts.push(tooltipSanitised ? " title=\"" + tooltipSanitised + "\"" : "");
        templateParts.push(" style=\"width: " + width + "px; left: " + left + "px; " + stylesFromColDef + "\" >");
        templateParts.push(wrapperStartTemplate);
        templateParts.push(valueSanitised);
        templateParts.push(wrapperEndTemplate);
        templateParts.push("</div>");
        return templateParts.join('');
    };
    CellComp.prototype.afterAttached = function () {
        var querySelector = "[comp-id=\"" + this.getCompId() + "\"]";
        var eGui = this.eParentRow.querySelector(querySelector);
        this.setGui(eGui);
        // all of these have dependencies on the eGui, so only do them after eGui is set
        this.addDomData();
        this.populateTemplate();
        this.attachCellRenderer();
        this.angular1Compile();
        this.addDestroyableEventListener(this.beans.eventService, events_1.Events.EVENT_CELL_FOCUSED, this.onCellFocused.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, events_1.Events.EVENT_FLASH_CELLS, this.onFlashCells.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.onCellChanged.bind(this));
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onWidthChanged.bind(this));
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, this.onFirstRightPinnedChanged.bind(this));
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_LAST_LEFT_PINNED_CHANGED, this.onLastLeftPinnedChanged.bind(this));
        // if not doing enterprise, then range selection service would be missing
        // so need to check before trying to use it
        if (this.rangeSelectionEnabled) {
            this.addDestroyableEventListener(this.beans.eventService, events_1.Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        }
    };
    CellComp.prototype.onColumnHover = function () {
        var isHovered = this.beans.columnHoverService.isHovered(this.column);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    CellComp.prototype.onCellChanged = function (event) {
        var eventImpactsThisCell = event.column === this.column;
        if (eventImpactsThisCell) {
            this.refreshCell({});
        }
    };
    CellComp.prototype.getCellLeft = function () {
        var mostLeftCol;
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            mostLeftCol = this.colsSpanning[this.colsSpanning.length - 1];
        }
        else {
            mostLeftCol = this.column;
        }
        return mostLeftCol.getLeft();
    };
    CellComp.prototype.getCellWidth = function () {
        if (this.colsSpanning) {
            var result_1 = 0;
            this.colsSpanning.forEach(function (col) { return result_1 += col.getActualWidth(); });
            return result_1;
        }
        else {
            return this.column.getActualWidth();
        }
    };
    CellComp.prototype.onFlashCells = function (event) {
        var cellId = this.gridCell.createId();
        var shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell('highlight');
        }
    };
    CellComp.prototype.setupColSpan = function () {
        // if no col span is active, then we don't set it up, as it would be wasteful of CPU
        if (utils_1._.missing(this.column.getColDef().colSpan)) {
            return;
        }
        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        this.addDestroyableEventListener(this.beans.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayColumnsChanged.bind(this));
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favoring this easier way for more maintainable code.
        this.addDestroyableEventListener(this.beans.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onWidthChanged.bind(this));
        this.colsSpanning = this.getColSpanningList();
    };
    CellComp.prototype.getColSpanningList = function () {
        var colSpan = this.column.getColSpan(this.rowNode);
        var colsSpanning = [];
        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        }
        else {
            var pointer = this.column;
            var pinned = this.column.getPinned();
            for (var i = 0; i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.beans.columnController.getDisplayedColAfter(pointer);
                if (utils_1._.missing(pointer)) {
                    break;
                }
                // we do not allow col spanning to span outside of pinned areas
                if (pinned !== pointer.getPinned()) {
                    break;
                }
            }
        }
        return colsSpanning;
    };
    CellComp.prototype.onDisplayColumnsChanged = function () {
        var colsSpanning = this.getColSpanningList();
        if (!utils_1._.compareArrays(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    };
    CellComp.prototype.getInitialCssClasses = function () {
        var cssClasses = ["ag-cell", "ag-cell-not-inline-editing"];
        cssClasses.push(this.cellFocused ? 'ag-cell-focus' : 'ag-cell-no-focus');
        if (this.firstRightPinned) {
            cssClasses.push('ag-cell-first-right-pinned');
        }
        if (this.lastLeftPinned) {
            cssClasses.push('ag-cell-last-left-pinned');
        }
        if (this.beans.columnHoverService.isHovered(this.column)) {
            cssClasses.push('ag-column-hover');
        }
        utils_1._.pushAll(cssClasses, this.preProcessClassesFromColDef());
        utils_1._.pushAll(cssClasses, this.preProcessCellClassRules());
        utils_1._.pushAll(cssClasses, this.getRangeClasses());
        // if using the wrapper, this class goes on the wrapper instead
        if (!this.usingWrapper) {
            cssClasses.push('ag-cell-value');
        }
        return cssClasses;
    };
    CellComp.prototype.getInitialValueToRender = function () {
        // if using a cellRenderer, then render the html from the cell renderer if it exists
        if (this.usingCellRenderer) {
            if (typeof this.cellRendererGui === 'string') {
                return this.cellRendererGui;
            }
            else {
                return '';
            }
        }
        var colDef = this.column.getColDef();
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            return colDef.template;
        }
        else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            var template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                return template;
            }
            else {
                return '';
            }
        }
        else {
            return this.getValueToUse();
        }
    };
    CellComp.prototype.getRenderedRow = function () {
        return this.rowComp;
    };
    CellComp.prototype.isSuppressNavigable = function () {
        return this.column.isSuppressNavigable(this.rowNode);
    };
    // + stop editing {forceRefresh: true, suppressFlash: true}
    // + event cellChanged {}
    // + cellRenderer.params.refresh() {} -> method passes 'as is' to the cellRenderer, so params could be anything
    // + rowComp: event dataChanged {animate: update, newData: !update}
    // + rowComp: api refreshCells() {animate: true/false}
    // + rowRenderer: api softRefreshView() {}
    CellComp.prototype.refreshCell = function (params) {
        if (this.editingCell) {
            return;
        }
        var newData = params && params.newData;
        var suppressFlash = params && params.suppressFlash;
        var forceRefresh = params && params.forceRefresh;
        var oldValue = this.value;
        this.getValueAndFormat();
        // for simple values only (not pojo's), see if the value is the same, and if it is, skip the refresh.
        // when never allow skipping after an edit, as after editing, we need to put the GUI back to the way
        // if was before the edit.
        var valuesDifferent = !this.valuesAreEqual(oldValue, this.value);
        var dataNeedsUpdating = forceRefresh || valuesDifferent;
        if (dataNeedsUpdating) {
            var cellRendererRefreshed = void 0;
            // if it's 'new data', then we don't refresh the cellRenderer, even if refresh method is available.
            // this is because if the whole data is new (ie we are showing stock price 'BBA' now and not 'SSD')
            // then we are not showing a movement in the stock price, rather we are showing different stock.
            if (newData || suppressFlash) {
                cellRendererRefreshed = false;
            }
            else {
                cellRendererRefreshed = this.attemptCellRendererRefresh();
            }
            // we do the replace if not doing refresh, or if refresh was unsuccessful.
            // the refresh can be unsuccessful if we are using a framework (eg ng2 or react) and the framework
            // wrapper has the refresh method, but the underlying component doesn't
            if (!cellRendererRefreshed) {
                this.replaceContentsAfterRefresh();
            }
            this.refreshToolTip();
            if (!suppressFlash) {
                this.flashCell();
            }
            // need to check rules. note, we ignore colDef classes and styles, these are assumed to be static
            this.postProcessStylesFromColDef();
            this.postProcessClassesFromColDef();
        }
        // we do cellClassRules even if the value has not changed, so that users who have rules that
        // look at other parts of the row (where the other part of the row might of changed) will work.
        this.postProcessCellClassRules();
    };
    CellComp.prototype.flashCell = function () {
        if (this.beans.gridOptionsWrapper.isEnableCellChangeFlash() || this.column.getColDef().enableCellChangeFlash) {
            this.animateCell('data-changed');
        }
    };
    CellComp.prototype.animateCell = function (cssName) {
        var fullName = 'ag-cell-' + cssName;
        var animationFullName = 'ag-cell-' + cssName + '-animation';
        var element = this.getGui();
        // we want to highlight the cells, without any animation
        utils_1._.addCssClass(element, fullName);
        utils_1._.removeCssClass(element, animationFullName);
        // then once that is applied, we remove the highlight with animation
        setTimeout(function () {
            utils_1._.removeCssClass(element, fullName);
            utils_1._.addCssClass(element, animationFullName);
            setTimeout(function () {
                // and then to leave things as we got them, we remove the animation
                utils_1._.removeCssClass(element, animationFullName);
            }, 1000);
        }, 500);
    };
    CellComp.prototype.replaceContentsAfterRefresh = function () {
        // otherwise we rip out the cell and replace it
        utils_1._.removeAllChildren(this.eParentOfValue);
        // remove old renderer component if it exists
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
        }
        this.cellRenderer = null;
        this.cellRendererGui = null;
        // populate
        this.putDataIntoCellAfterRefresh();
        this.angular1Compile();
    };
    CellComp.prototype.angular1Compile = function () {
        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            var eGui = this.getGui();
            this.beans.$compile(eGui)(this.scope);
        }
    };
    CellComp.prototype.postProcessStylesFromColDef = function () {
        var stylesToUse = this.processStylesFromColDef();
        if (stylesToUse) {
            utils_1._.addStylesToElement(this.getGui(), stylesToUse);
        }
    };
    CellComp.prototype.preProcessStylesFromColDef = function () {
        var stylesToUse = this.processStylesFromColDef();
        return utils_1._.cssStyleObjectToMarkup(stylesToUse);
    };
    CellComp.prototype.processStylesFromColDef = function () {
        var colDef = this.column.getColDef();
        if (colDef.cellStyle) {
            var cssToUse = void 0;
            if (typeof colDef.cellStyle === 'function') {
                var cellStyleParams = {
                    value: this.value,
                    data: this.rowNode.data,
                    node: this.rowNode,
                    colDef: colDef,
                    column: this.column,
                    $scope: this.scope,
                    context: this.beans.gridOptionsWrapper.getContext(),
                    api: this.beans.gridOptionsWrapper.getApi()
                };
                var cellStyleFunc = colDef.cellStyle;
                cssToUse = cellStyleFunc(cellStyleParams);
            }
            else {
                cssToUse = colDef.cellStyle;
            }
            return cssToUse;
        }
    };
    CellComp.prototype.postProcessClassesFromColDef = function () {
        var _this = this;
        this.processClassesFromColDef(function (className) { return utils_1._.addCssClass(_this.getGui(), className); });
    };
    CellComp.prototype.preProcessClassesFromColDef = function () {
        var res = [];
        this.processClassesFromColDef(function (className) { return res.push(className); });
        return res;
    };
    CellComp.prototype.processClassesFromColDef = function (onApplicableClass) {
        this.beans.stylingService.processStaticCellClasses(this.column.getColDef(), {
            value: this.value,
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.column.getColDef(),
            rowIndex: this.rowNode.rowIndex,
            $scope: this.scope,
            api: this.beans.gridOptionsWrapper.getApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        }, onApplicableClass);
    };
    CellComp.prototype.putDataIntoCellAfterRefresh = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        if (colDef.template) {
            // template is really only used for angular 1 - as people using ng1 are used to providing templates with
            // bindings in it. in ng2, people will hopefully want to provide components, not templates.
            this.eParentOfValue.innerHTML = colDef.template;
        }
        else if (colDef.templateUrl) {
            // likewise for templateUrl - it's for ng1 really - when we move away from ng1, we can take these out.
            // niall was pro angular 1 when writing template and templateUrl, if writing from scratch now, would
            // not do these, but would follow a pattern that was friendly towards components, not templates.
            var template = this.beans.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
            if (template) {
                this.eParentOfValue.innerHTML = template;
            }
            // use cell renderer if it exists
        }
        else if (this.usingCellRenderer) {
            this.attachCellRenderer();
        }
        else {
            var valueToUse = this.getValueToUse();
            if (valueToUse !== null && valueToUse !== undefined) {
                this.eParentOfValue.innerText = valueToUse;
            }
        }
    };
    CellComp.prototype.attemptCellRendererRefresh = function () {
        if (utils_1._.missing(this.cellRenderer) || utils_1._.missing(this.cellRenderer.refresh)) {
            return false;
        }
        // if the cell renderer has a refresh method, we call this instead of doing a refresh
        // note: should pass in params here instead of value?? so that client has formattedValue
        var params = this.createCellRendererParams();
        var result = this.cellRenderer.refresh(params);
        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
        return result === true || result === undefined;
    };
    CellComp.prototype.refreshToolTip = function () {
        var tooltip = this.getToolTip();
        if (utils_1._.exists(tooltip)) {
            this.eParentOfValue.setAttribute('title', tooltip);
        }
        else {
            this.eParentOfValue.removeAttribute('title');
        }
    };
    CellComp.prototype.valuesAreEqual = function (val1, val2) {
        // if the user provided an equals method, use that, otherwise do simple comparison
        var colDef = this.column.getColDef();
        var equalsMethod = colDef ? colDef.equals : null;
        if (equalsMethod) {
            return equalsMethod(val1, val2);
        }
        else {
            return val1 === val2;
        }
    };
    CellComp.prototype.getToolTip = function () {
        var colDef = this.column.getColDef();
        var data = this.rowNode.data;
        if (colDef.tooltipField && utils_1._.exists(data)) {
            return utils_1._.getValueUsingField(data, colDef.tooltipField, this.column.isTooltipFieldContainsDots());
        }
        else if (colDef.tooltip) {
            return colDef.tooltip({
                value: this.value,
                valueFormatted: this.valueFormatted,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: this.column.getColDef(),
                api: this.beans.gridOptionsWrapper.getApi(),
                $scope: this.scope,
                context: this.beans.gridOptionsWrapper.getContext(),
                rowIndex: this.gridCell.rowIndex
            });
        }
        else {
            return null;
        }
    };
    CellComp.prototype.processCellClassRules = function (onApplicableClass, onNotApplicableClass) {
        this.beans.stylingService.processClassRules(this.column.getColDef().cellClassRules, {
            value: this.value,
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.column.getColDef(),
            rowIndex: this.gridCell.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            $scope: this.scope,
            context: this.beans.gridOptionsWrapper.getContext()
        }, onApplicableClass, onNotApplicableClass);
    };
    CellComp.prototype.postProcessCellClassRules = function () {
        var _this = this;
        this.processCellClassRules(function (className) {
            utils_1._.addCssClass(_this.getGui(), className);
        }, function (className) {
            utils_1._.removeCssClass(_this.getGui(), className);
        });
    };
    CellComp.prototype.preProcessCellClassRules = function () {
        var res = [];
        this.processCellClassRules(function (className) {
            res.push(className);
        }, function (className) {
            // not catered for, if creating, no need
            // to remove class as it was never there
        });
        return res;
    };
    // a wrapper is used when we are putting a selection checkbox in the cell with the value
    CellComp.prototype.setUsingWrapper = function () {
        var colDef = this.column.getColDef();
        // never allow selection or dragging on pinned rows
        if (this.rowNode.rowPinned) {
            this.usingWrapper = false;
            this.includeSelectionComponent = false;
            this.includeRowDraggingComponent = false;
            return;
        }
        var cbSelectionIsFunc = typeof colDef.checkboxSelection === 'function';
        var rowDraggableIsFunc = typeof colDef.rowDrag === 'function';
        this.includeSelectionComponent = cbSelectionIsFunc || colDef.checkboxSelection === true;
        this.includeRowDraggingComponent = rowDraggableIsFunc || colDef.rowDrag === true;
        this.usingWrapper = this.includeRowDraggingComponent || this.includeSelectionComponent;
    };
    CellComp.prototype.chooseCellRenderer = function () {
        // template gets preference, then cellRenderer, then do it ourselves
        var colDef = this.column.getColDef();
        // templates are for ng1, ideally we wouldn't have these, they are ng1 support
        // inside the core which is bad
        if (colDef.template || colDef.templateUrl) {
            this.usingCellRenderer = false;
            return;
        }
        var params = this.createCellRendererParams();
        var cellRenderer = this.beans.componentResolver.getComponentToUse(colDef, 'cellRenderer', params, null);
        var pinnedRowCellRenderer = this.beans.componentResolver.getComponentToUse(colDef, 'pinnedRowCellRenderer', params, null);
        if (pinnedRowCellRenderer && this.rowNode.rowPinned) {
            this.cellRendererType = 'pinnedRowCellRenderer';
            this.usingCellRenderer = true;
        }
        else if (cellRenderer) {
            this.cellRendererType = 'cellRenderer';
            this.usingCellRenderer = true;
        }
        else {
            this.usingCellRenderer = false;
        }
    };
    CellComp.prototype.createCellRendererInstance = function () {
        var params = this.createCellRendererParams();
        this.cellRendererVersion++;
        var callback = this.afterCellRendererCreated.bind(this, this.cellRendererVersion);
        this.beans.componentResolver.createAgGridComponent(this.column.getColDef(), params, this.cellRendererType, params, null).then(callback);
    };
    CellComp.prototype.afterCellRendererCreated = function (cellRendererVersion, cellRenderer) {
        // see if daemon
        if (cellRendererVersion !== this.cellRendererVersion) {
            if (cellRenderer.destroy) {
                cellRenderer.destroy();
            }
            return;
        }
        this.cellRenderer = cellRenderer;
        this.cellRendererGui = this.cellRenderer.getGui();
        if (utils_1._.missing(this.cellRendererGui)) {
            return;
        }
        // if async components, then it's possible the user started editing since
        // this call was made
        if (!this.editingCell) {
            this.eParentOfValue.appendChild(this.cellRendererGui);
        }
    };
    CellComp.prototype.attachCellRenderer = function () {
        if (!this.usingCellRenderer) {
            return;
        }
        this.createCellRendererInstance();
    };
    CellComp.prototype.createCellRendererParams = function () {
        var _this = this;
        var params = {
            value: this.value,
            valueFormatted: this.valueFormatted,
            getValue: this.getValue.bind(this),
            setValue: function (value) {
                _this.beans.valueService.setValue(_this.rowNode, _this.column, value);
            },
            formatValue: this.formatValue.bind(this),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: this.column.getColDef(),
            column: this.column,
            $scope: this.scope,
            rowIndex: this.gridCell.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            refreshCell: this.refreshCell.bind(this),
            eGridCell: this.getGui(),
            eParentOfValue: this.eParentOfValue,
            // these bits are not documented anywhere, so we could drop them?
            // it was in the olden days to allow user to register for when rendered
            // row was removed (the row comp was removed), however now that the user
            // can provide components for cells, the destroy method gets call when this
            // happens so no longer need to fire event.
            addRowCompListener: this.rowComp.addEventListener.bind(this.rowComp),
            addRenderedRowListener: function (eventType, listener) {
                console.warn('ag-Grid: since ag-Grid .v11, params.addRenderedRowListener() is now params.addRowCompListener()');
                _this.rowComp.addEventListener(eventType, listener);
            }
        };
        return params;
    };
    CellComp.prototype.formatValue = function (value) {
        var valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, value);
        var valueFormattedExists = valueFormatted !== null && valueFormatted !== undefined;
        return valueFormattedExists ? valueFormatted : value;
    };
    CellComp.prototype.getValueToUse = function () {
        var valueFormattedExists = this.valueFormatted !== null && this.valueFormatted !== undefined;
        return valueFormattedExists ? this.valueFormatted : this.value;
    };
    CellComp.prototype.getValueAndFormat = function () {
        this.value = this.getValue();
        this.valueFormatted = this.beans.valueFormatterService.formatValue(this.column, this.rowNode, this.scope, this.value);
    };
    CellComp.prototype.getValue = function () {
        // if we don't check this, then the grid will render leaf groups as open even if we are not
        // allowing the user to open leaf groups. confused? remember for pivot mode we don't allow
        // opening leaf groups, so we have to force leafGroups to be closed in case the user expanded
        // them via the API, or user user expanded them in the UI before turning on pivot mode
        var lockedClosedGroup = this.rowNode.leafGroup && this.beans.columnController.isPivotMode();
        var isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer && !lockedClosedGroup;
        if (isOpenGroup && this.beans.gridOptionsWrapper.isGroupIncludeFooter()) {
            // if doing grouping and footers, we don't want to include the agg value
            // in the header when the group is open
            return this.beans.valueService.getValue(this.column, this.rowNode, true);
        }
        else {
            return this.beans.valueService.getValue(this.column, this.rowNode);
        }
    };
    CellComp.prototype.onMouseEvent = function (eventName, mouseEvent) {
        if (utils_1._.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        switch (eventName) {
            case 'click':
                this.onCellClicked(mouseEvent);
                break;
            case 'mousedown':
                this.onMouseDown();
                break;
            case 'dblclick':
                this.onCellDoubleClicked(mouseEvent);
                break;
            case 'mouseout':
                this.onMouseOut(mouseEvent);
                break;
            case 'mouseover':
                this.onMouseOver(mouseEvent);
                break;
        }
    };
    CellComp.prototype.dispatchCellContextMenuEvent = function (event) {
        var colDef = this.column.getColDef();
        var cellContextMenuEvent = this.createEvent(event, events_1.Events.EVENT_CELL_CONTEXT_MENU);
        this.beans.eventService.dispatchEvent(cellContextMenuEvent);
        if (colDef.onCellContextMenu) {
            // to make the callback async, do in a timeout
            setTimeout(function () { return colDef.onCellContextMenu(cellContextMenuEvent); }, 0);
        }
    };
    CellComp.prototype.createEvent = function (domEvent, eventType) {
        var event = {
            node: this.rowNode,
            data: this.rowNode.data,
            value: this.value,
            column: this.column,
            colDef: this.column.getColDef(),
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridApi,
            columnApi: this.beans.columnApi,
            rowPinned: this.rowNode.rowPinned,
            event: domEvent,
            type: eventType,
            rowIndex: this.rowNode.rowIndex
        };
        // because we are hacking in $scope for angular 1, we have to de-reference
        if (this.scope) {
            event.$scope = this.scope;
        }
        return event;
    };
    CellComp.prototype.onMouseOut = function (mouseEvent) {
        var cellMouseOutEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OUT);
        this.beans.eventService.dispatchEvent(cellMouseOutEvent);
    };
    CellComp.prototype.onMouseOver = function (mouseEvent) {
        var cellMouseOverEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_MOUSE_OVER);
        this.beans.eventService.dispatchEvent(cellMouseOverEvent);
    };
    CellComp.prototype.onCellDoubleClicked = function (mouseEvent) {
        var colDef = this.column.getColDef();
        // always dispatch event to eventService
        var cellDoubleClickedEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_DOUBLE_CLICKED);
        this.beans.eventService.dispatchEvent(cellDoubleClickedEvent);
        // check if colDef also wants to handle event
        if (typeof colDef.onCellDoubleClicked === 'function') {
            // to make the callback async, do in a timeout
            setTimeout(function () { return colDef.onCellDoubleClicked(cellDoubleClickedEvent); }, 0);
        }
        var editOnDoubleClick = !this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnDoubleClick) {
            this.startRowOrCellEdit();
        }
    };
    // called by rowRenderer when user navigates via tab key
    CellComp.prototype.startRowOrCellEdit = function (keyPress, charPress) {
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.startRowEditing(keyPress, charPress, this);
        }
        else {
            this.startEditingIfEnabled(keyPress, charPress, true);
        }
    };
    CellComp.prototype.isCellEditable = function () {
        return this.column.isCellEditable(this.rowNode);
    };
    // either called internally if single cell editing, or called by rowRenderer if row editing
    CellComp.prototype.startEditingIfEnabled = function (keyPress, charPress, cellStartedEdit) {
        if (keyPress === void 0) { keyPress = null; }
        if (charPress === void 0) { charPress = null; }
        if (cellStartedEdit === void 0) { cellStartedEdit = false; }
        // don't do it if not editable
        if (!this.isCellEditable()) {
            return;
        }
        // don't do it if already editing
        if (this.editingCell) {
            return;
        }
        this.editingCell = true;
        this.cellEditorVersion++;
        var callback = this.afterCellEditorCreated.bind(this, this.cellEditorVersion);
        var params = this.createCellEditorParams(keyPress, charPress, cellStartedEdit);
        this.beans.cellEditorFactory.createCellEditor(this.column.getColDef(), params).then(callback);
        // if we don't do this, and editor component is async, then there will be a period
        // when the component isn't present and keyboard navigation won't work - so example
        // of user hitting tab quickly (more quickly than renderers getting created) won't work
        var cellEditorAsync = utils_1._.missing(this.cellEditor);
        if (cellEditorAsync && cellStartedEdit) {
            this.focusCell(true);
        }
    };
    CellComp.prototype.afterCellEditorCreated = function (cellEditorVersion, cellEditor) {
        // if editingCell=false, means user cancelled the editor before component was ready.
        // if versionMismatch, then user cancelled the edit, then started the edit again, and this
        //   is the first editor which is now stale.
        var versionMismatch = cellEditorVersion !== this.cellEditorVersion;
        if (versionMismatch || !this.editingCell) {
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            return;
        }
        if (cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart()) {
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            this.editingCell = false;
            return;
        }
        if (!cellEditor.getGui) {
            console.warn("ag-Grid: cellEditor for column " + this.column.getId() + " is missing getGui() method");
            // no getGui, for React guys, see if they attached a react component directly
            if (cellEditor.render) {
                console.warn("ag-Grid: we found 'render' on the component, are you trying to set a React renderer but added it as colDef.cellEditor instead of colDef.cellEditorFmk?");
            }
            if (cellEditor.destroy) {
                cellEditor.destroy();
            }
            this.editingCell = false;
            return;
        }
        this.cellEditor = cellEditor;
        this.cellEditorInPopup = cellEditor.isPopup && cellEditor.isPopup();
        this.setInlineEditingClass();
        if (this.cellEditorInPopup) {
            this.addPopupCellEditor();
        }
        else {
            this.addInCellEditor();
        }
        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }
        var event = this.createEvent(null, events_1.Events.EVENT_CELL_EDITING_STARTED);
        this.beans.eventService.dispatchEvent(event);
    };
    CellComp.prototype.addInCellEditor = function () {
        utils_1._.removeAllChildren(this.getGui());
        this.getGui().appendChild(this.cellEditor.getGui());
        this.angular1Compile();
    };
    CellComp.prototype.addPopupCellEditor = function () {
        var _this = this;
        var ePopupGui = this.cellEditor.getGui();
        this.hideEditorPopup = this.beans.popupService.addAsModalPopup(ePopupGui, true, 
        // callback for when popup disappears
        function () {
            _this.onPopupEditorClosed();
        });
        this.beans.popupService.positionPopupOverComponent({
            column: this.column,
            rowNode: this.rowNode,
            type: 'popupCellEditor',
            eventSource: this.getGui(),
            ePopup: ePopupGui,
            keepWithinBounds: true
        });
        this.angular1Compile();
    };
    CellComp.prototype.onPopupEditorClosed = function () {
        // we only call stopEditing if we are editing, as
        // it's possible the popup called 'stop editing'
        // before this, eg if 'enter key' was pressed on
        // the editor.
        if (this.editingCell) {
            // note: this only happens when use clicks outside of the grid. if use clicks on another
            // cell, then the editing will have already stopped on this cell
            this.stopRowOrCellEdit();
            // we only focus cell again if this cell is still focused. it is possible
            // it is not focused if the user cancelled the edit by clicking on another
            // cell outside of this one
            if (this.beans.focusedCellController.isCellFocused(this.gridCell)) {
                this.focusCell(true);
            }
        }
    };
    // if we are editing inline, then we don't have the padding in the cell (set in the themes)
    // to allow the text editor full access to the entire cell
    CellComp.prototype.setInlineEditingClass = function () {
        var editingInline = this.editingCell && !this.cellEditorInPopup;
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-cell-inline-editing', editingInline);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-cell-not-inline-editing', !editingInline);
    };
    CellComp.prototype.createCellEditorParams = function (keyPress, charPress, cellStartedEdit) {
        var params = {
            value: this.getValue(),
            keyPress: keyPress,
            charPress: charPress,
            column: this.column,
            rowIndex: this.gridCell.rowIndex,
            node: this.rowNode,
            api: this.beans.gridOptionsWrapper.getApi(),
            cellStartedEdit: cellStartedEdit,
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            $scope: this.scope,
            onKeyDown: this.onKeyDown.bind(this),
            stopEditing: this.stopEditingAndFocus.bind(this),
            eGridCell: this.getGui(),
            parseValue: this.parseValue.bind(this),
            formatValue: this.formatValue.bind(this)
        };
        return params;
    };
    // cell editors call this, when they want to stop for reasons other
    // than what we pick up on. eg selecting from a dropdown ends editing.
    CellComp.prototype.stopEditingAndFocus = function () {
        this.stopRowOrCellEdit();
        this.focusCell(true);
        this.navigateAfterEdit();
    };
    CellComp.prototype.parseValue = function (newValue) {
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            oldValue: this.value,
            newValue: newValue,
            colDef: this.column.getColDef(),
            column: this.column,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };
        var valueParser = this.column.getColDef().valueParser;
        return utils_1._.exists(valueParser) ? this.beans.expressionService.evaluate(valueParser, params) : newValue;
    };
    CellComp.prototype.focusCell = function (forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        this.beans.focusedCellController.setFocusedCell(this.gridCell.rowIndex, this.column, this.rowNode.rowPinned, forceBrowserFocus);
    };
    CellComp.prototype.setFocusInOnEditor = function () {
        if (this.editingCell) {
            if (this.cellEditor && this.cellEditor.focusIn) {
                // if the editor is present, then we just focus it
                this.cellEditor.focusIn();
            }
            else {
                // if the editor is not present, it means async cell editor (eg React fibre)
                // and we are trying to set focus before the cell editor is present, so we
                // focus the cell instead
                this.focusCell(true);
            }
        }
    };
    CellComp.prototype.isEditing = function () {
        return this.editingCell;
    };
    CellComp.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        // give user a chance to cancel event processing
        if (this.doesUserWantToCancelKeyboardEvent(event)) {
            return;
        }
        switch (key) {
            case constants_1.Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case constants_1.Constants.KEY_F2:
                this.onF2KeyDown();
                break;
            case constants_1.Constants.KEY_ESCAPE:
                this.onEscapeKeyDown();
                break;
            case constants_1.Constants.KEY_TAB:
                this.onTabKeyDown(event);
                break;
            case constants_1.Constants.KEY_BACKSPACE:
            case constants_1.Constants.KEY_DELETE:
                this.onBackspaceOrDeleteKeyPressed(key);
                break;
            case constants_1.Constants.KEY_DOWN:
            case constants_1.Constants.KEY_UP:
            case constants_1.Constants.KEY_RIGHT:
            case constants_1.Constants.KEY_LEFT:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    };
    CellComp.prototype.doesUserWantToCancelKeyboardEvent = function (event) {
        var callback = this.column.getColDef().suppressKeyboardEvent;
        if (utils_1._.missing(callback)) {
            return false;
        }
        else {
            // if editing is null or undefined, this sets it to false
            var params = {
                event: event,
                editing: this.editingCell,
                column: this.column,
                api: this.beans.gridOptionsWrapper.getApi(),
                node: this.rowNode,
                data: this.rowNode.data,
                colDef: this.column.getColDef(),
                context: this.beans.gridOptionsWrapper.getContext(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi()
            };
            return callback(params);
        }
    };
    CellComp.prototype.setFocusOutOnEditor = function () {
        if (this.editingCell && this.cellEditor && this.cellEditor.focusOut) {
            this.cellEditor.focusOut();
        }
    };
    CellComp.prototype.onNavigationKeyPressed = function (event, key) {
        if (this.editingCell) {
            this.stopRowOrCellEdit();
        }
        this.beans.rowRenderer.navigateToNextCell(event, key, this.gridCell, true);
        // if we don't prevent default, the grid will scroll with the navigation keys
        event.preventDefault();
    };
    CellComp.prototype.onTabKeyDown = function (event) {
        if (this.beans.gridOptionsWrapper.isSuppressTabbing()) {
            return;
        }
        this.beans.rowRenderer.onTabKeyDown(this, event);
    };
    CellComp.prototype.onBackspaceOrDeleteKeyPressed = function (key) {
        if (!this.editingCell) {
            this.startRowOrCellEdit(key);
        }
    };
    CellComp.prototype.onEnterKeyDown = function () {
        if (this.editingCell || this.rowComp.isEditing()) {
            this.stopEditingAndFocus();
        }
        else {
            this.startRowOrCellEdit(constants_1.Constants.KEY_ENTER);
        }
    };
    CellComp.prototype.navigateAfterEdit = function () {
        var fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (fullRowEdit) {
            return;
        }
        var enterMovesDownAfterEdit = this.beans.gridOptionsWrapper.isEnterMovesDownAfterEdit();
        if (enterMovesDownAfterEdit) {
            this.beans.rowRenderer.navigateToNextCell(null, constants_1.Constants.KEY_DOWN, this.gridCell, false);
        }
    };
    CellComp.prototype.onF2KeyDown = function () {
        if (!this.editingCell) {
            this.startRowOrCellEdit(constants_1.Constants.KEY_F2);
        }
    };
    CellComp.prototype.onEscapeKeyDown = function () {
        if (this.editingCell) {
            this.stopRowOrCellEdit(true);
            this.focusCell(true);
        }
    };
    CellComp.prototype.onKeyPress = function (event) {
        // check this, in case focus is on a (for example) a text field inside the cell,
        // in which cse we should not be listening for these key pressed
        var eventTarget = utils_1._.getTarget(event);
        var eventOnChildComponent = eventTarget !== this.getGui();
        if (eventOnChildComponent) {
            return;
        }
        if (!this.editingCell) {
            var pressedChar = String.fromCharCode(event.charCode);
            if (pressedChar === ' ') {
                this.onSpaceKeyPressed(event);
            }
            else {
                if (utils_1._.isEventFromPrintableCharacter(event)) {
                    this.startRowOrCellEdit(null, pressedChar);
                    // if we don't prevent default, then the keypress also gets applied to the text field
                    // (at least when doing the default editor), but we need to allow the editor to decide
                    // what it wants to do. we only do this IF editing was started - otherwise it messes
                    // up when the use is not doing editing, but using rendering with text fields in cellRenderer
                    // (as it would block the the user from typing into text fields).
                    event.preventDefault();
                }
            }
        }
    };
    CellComp.prototype.onSpaceKeyPressed = function (event) {
        if (!this.editingCell && this.beans.gridOptionsWrapper.isRowSelection()) {
            var selected = this.rowNode.isSelected();
            this.rowNode.setSelected(!selected);
        }
        // prevent default as space key, by default, moves browser scroll down
        event.preventDefault();
    };
    CellComp.prototype.onMouseDown = function () {
        // we pass false to focusCell, as we don't want the cell to focus
        // also get the browser focus. if we did, then the cellRenderer could
        // have a text field in it, for example, and as the user clicks on the
        // text field, the text field, the focus doesn't get to the text
        // field, instead to goes to the div behind, making it impossible to
        // select the text field.
        this.focusCell(false);
        // if it's a right click, then if the cell is already in range,
        // don't change the range, however if the cell is not in a range,
        // we set a new range
        if (this.beans.rangeController) {
            var thisCell = this.gridCell;
            var cellAlreadyInRange = this.beans.rangeController.isCellInAnyRange(thisCell);
            if (!cellAlreadyInRange) {
                this.beans.rangeController.setRangeToCell(thisCell);
            }
        }
    };
    // returns true if on iPad and this is second 'click' event in 200ms
    CellComp.prototype.isDoubleClickOnIPad = function () {
        if (!utils_1._.isUserAgentIPad()) {
            return false;
        }
        var nowMillis = new Date().getTime();
        var res = nowMillis - this.lastIPadMouseClickEvent < 200;
        this.lastIPadMouseClickEvent = nowMillis;
        return res;
    };
    CellComp.prototype.onCellClicked = function (mouseEvent) {
        // iPad doesn't have double click - so we need to mimic it do enable editing for
        // iPad.
        if (this.isDoubleClickOnIPad()) {
            this.onCellDoubleClicked(mouseEvent);
            mouseEvent.preventDefault(); // if we don't do this, then ipad zooms in
            return;
        }
        var cellClickedEvent = this.createEvent(mouseEvent, events_1.Events.EVENT_CELL_CLICKED);
        this.beans.eventService.dispatchEvent(cellClickedEvent);
        var colDef = this.column.getColDef();
        if (colDef.onCellClicked) {
            // to make callback async, do in a timeout
            setTimeout(function () { return colDef.onCellClicked(cellClickedEvent); }, 0);
        }
        var editOnSingleClick = this.beans.gridOptionsWrapper.isSingleClickEdit()
            && !this.beans.gridOptionsWrapper.isSuppressClickEdit();
        if (editOnSingleClick) {
            this.startRowOrCellEdit();
        }
        this.doIeFocusHack();
    };
    // https://ag-grid.com/forum/showthread.php?tid=4362
    // when in IE or Edge, when you are editing a cell, then click on another cell,
    // the other cell doesn't keep focus, so navigation keys, type to start edit etc
    // don't work. appears that when you update the dom in IE it looses focus
    CellComp.prototype.doIeFocusHack = function () {
        if (utils_1._.isBrowserIE() || utils_1._.isBrowserEdge()) {
            if (utils_1._.missing(document.activeElement) || document.activeElement === document.body) {
                // console.log('missing focus');
                this.getGui().focus();
            }
        }
    };
    CellComp.prototype.createGridCellVo = function () {
        var gridCellDef = {
            rowIndex: this.rowNode.rowIndex,
            floating: this.rowNode.rowPinned,
            column: this.column
        };
        this.gridCell = new gridCell_1.GridCell(gridCellDef);
    };
    CellComp.prototype.getGridCell = function () {
        return this.gridCell;
    };
    CellComp.prototype.getParentRow = function () {
        return this.eParentRow;
    };
    CellComp.prototype.setParentRow = function (eParentRow) {
        this.eParentRow = eParentRow;
    };
    CellComp.prototype.getColumn = function () {
        return this.column;
    };
    CellComp.prototype.detach = function () {
        this.eParentRow.removeChild(this.getGui());
    };
    // if the row is also getting destroyed, then we don't need to remove from dom,
    // as the row will also get removed, so no need to take out the cells from the row
    // if the row is going (removing is an expensive operation, so only need to remove
    // the top part)
    CellComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.cellEditor && this.cellEditor.destroy) {
            this.cellEditor.destroy();
            this.cellEditor = null;
        }
        if (this.cellRenderer && this.cellRenderer.destroy) {
            this.cellRenderer.destroy();
            this.cellRenderer = null;
        }
    };
    CellComp.prototype.onLeftChanged = function () {
        var left = this.getCellLeft();
        this.getGui().style.left = left + 'px';
    };
    CellComp.prototype.onWidthChanged = function () {
        var width = this.getCellWidth();
        this.getGui().style.width = width + 'px';
    };
    CellComp.prototype.getRangeClasses = function () {
        var res = [];
        if (!this.rangeSelectionEnabled) {
            return res;
        }
        if (this.rangeCount !== 0) {
            res.push('ag-cell-range-selected');
        }
        if (this.rangeCount === 1) {
            res.push('ag-cell-range-selected-1');
        }
        if (this.rangeCount === 2) {
            res.push('ag-cell-range-selected-2');
        }
        if (this.rangeCount === 3) {
            res.push('ag-cell-range-selected-3');
        }
        if (this.rangeCount >= 4) {
            res.push('ag-cell-range-selected-4');
        }
        return res;
    };
    CellComp.prototype.onRowIndexChanged = function () {
        // when index changes, this influences items that need the index, so we update the
        // grid cell so they are working off the new index.
        this.createGridCellVo();
        // when the index of the row changes, ie means the cell may have lost or gained focus
        this.onCellFocused();
        // check range selection
        this.onRangeSelectionChanged();
    };
    CellComp.prototype.onRangeSelectionChanged = function () {
        if (!this.beans.enterprise) {
            return;
        }
        var newRangeCount = this.beans.rangeController.getCellRangeCount(this.gridCell);
        var element = this.getGui();
        if (this.rangeCount !== newRangeCount) {
            utils_1._.addOrRemoveCssClass(element, 'ag-cell-range-selected', newRangeCount !== 0);
            utils_1._.addOrRemoveCssClass(element, 'ag-cell-range-selected-1', newRangeCount === 1);
            utils_1._.addOrRemoveCssClass(element, 'ag-cell-range-selected-2', newRangeCount === 2);
            utils_1._.addOrRemoveCssClass(element, 'ag-cell-range-selected-3', newRangeCount === 3);
            utils_1._.addOrRemoveCssClass(element, 'ag-cell-range-selected-4', newRangeCount >= 4);
            this.rangeCount = newRangeCount;
        }
    };
    CellComp.prototype.onFirstRightPinnedChanged = function () {
        var firstRightPinned = this.column.isFirstRightPinned();
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-cell-first-right-pinned', firstRightPinned);
        }
    };
    CellComp.prototype.onLastLeftPinnedChanged = function () {
        var lastLeftPinned = this.column.isLastLeftPinned();
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-cell-last-left-pinned', lastLeftPinned);
        }
    };
    CellComp.prototype.populateTemplate = function () {
        if (this.usingWrapper) {
            this.eParentOfValue = this.getRefElement('eCellValue');
            this.eCellWrapper = this.getRefElement('eCellWrapper');
            if (this.includeRowDraggingComponent) {
                this.addRowDragging();
            }
            if (this.includeSelectionComponent) {
                this.addSelectionCheckbox();
            }
        }
        else {
            this.eParentOfValue = this.getGui();
        }
    };
    CellComp.prototype.addRowDragging = function () {
        // row dragging only available in default row model
        if (!this.beans.gridOptionsWrapper.isRowModelDefault()) {
            utils_1._.doOnce(function () { return console.warn('ag-Grid: row dragging is only allowed in the In Memory Row Model'); }, 'CellComp.addRowDragging');
            return;
        }
        if (this.beans.gridOptionsWrapper.isPagination()) {
            utils_1._.doOnce(function () { return console.warn('ag-Grid: row dragging is not possible when doing pagination'); }, 'CellComp.addRowDragging');
            return;
        }
        var rowDraggingComp = new rowDragComp_1.RowDragComp(this.rowNode, this.column, this.getValueToUse(), this.beans);
        this.addFeature(this.beans.context, rowDraggingComp);
        // let visibleFunc = this.column.getColDef().checkboxSelection;
        // visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;
        // cbSelectionComponent.init({rowNode: this.rowNode, column: this.column, visibleFunc: visibleFunc});
        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(rowDraggingComp.getGui(), this.eParentOfValue);
    };
    CellComp.prototype.addSelectionCheckbox = function () {
        var cbSelectionComponent = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
        this.beans.context.wireBean(cbSelectionComponent);
        var visibleFunc = this.column.getColDef().checkboxSelection;
        visibleFunc = typeof visibleFunc === 'function' ? visibleFunc : null;
        cbSelectionComponent.init({ rowNode: this.rowNode, column: this.column, visibleFunc: visibleFunc });
        this.addDestroyFunc(function () { return cbSelectionComponent.destroy(); });
        // put the checkbox in before the value
        this.eCellWrapper.insertBefore(cbSelectionComponent.getGui(), this.eParentOfValue);
    };
    CellComp.prototype.addDomData = function () {
        var _this = this;
        var element = this.getGui();
        this.beans.gridOptionsWrapper.setDomData(element, CellComp.DOM_DATA_KEY_CELL_COMP, this);
        this.addDestroyFunc(function () {
            return _this.beans.gridOptionsWrapper.setDomData(element, CellComp.DOM_DATA_KEY_CELL_COMP, null);
        });
    };
    CellComp.prototype.onCellFocused = function (event) {
        var cellFocused = this.beans.focusedCellController.isCellFocused(this.gridCell);
        // see if we need to change the classes on this cell
        if (cellFocused !== this.cellFocused) {
            utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-cell-focus', cellFocused);
            utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-cell-no-focus', !cellFocused);
            this.cellFocused = cellFocused;
        }
        // if this cell was just focused, see if we need to force browser focus, his can
        // happen if focus is programmatically set.
        if (cellFocused && event && event.forceBrowserFocus) {
            this.getGui().focus();
        }
        // if another cell was focused, and we are editing, then stop editing
        var fullRowEdit = this.beans.gridOptionsWrapper.isFullRowEdit();
        if (!cellFocused && !fullRowEdit && this.editingCell) {
            this.stopRowOrCellEdit();
        }
    };
    // pass in 'true' to cancel the editing.
    CellComp.prototype.stopRowOrCellEdit = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            this.rowComp.stopRowEditing(cancel);
        }
        else {
            this.stopEditing(cancel);
        }
    };
    CellComp.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        if (!this.editingCell) {
            return;
        }
        // if no cell editor, this means due to async, that the cell editor never got initialised,
        // so we just carry on regardless as if the editing was never started.
        if (!this.cellEditor) {
            this.editingCell = false;
            return;
        }
        if (!cancel) {
            // also have another option here to cancel after editing, so for example user could have a popup editor and
            // it is closed by user clicking outside the editor. then the editor will close automatically (with false
            // passed above) and we need to see if the editor wants to accept the new value.
            var userWantsToCancel = this.cellEditor.isCancelAfterEnd && this.cellEditor.isCancelAfterEnd();
            if (!userWantsToCancel) {
                var newValue = this.cellEditor.getValue();
                this.rowNode.setDataValue(this.column, newValue);
                this.getValueAndFormat();
            }
        }
        // it is important we set this after setValue() above, as otherwise the cell will flash
        // when editing stops. the 'refresh' method checks editing, and doesn't refresh editing cells.
        // thus it will skip the refresh on this cell until the end of this method where we call
        // refresh directly and we suppress the flash.
        this.editingCell = false;
        if (this.cellEditor.destroy) {
            this.cellEditor.destroy();
        }
        // important to clear this out - as parts of the code will check for
        // this to see if an async cellEditor has yet to be created
        this.cellEditor = null;
        if (this.cellEditorInPopup) {
            this.hideEditorPopup();
            this.hideEditorPopup = null;
        }
        else {
            utils_1._.removeAllChildren(this.getGui());
            // put the cell back the way it was before editing
            if (this.usingWrapper) {
                // if wrapper, then put the wrapper back
                this.getGui().appendChild(this.eCellWrapper);
            }
            else {
                // if cellRenderer, then put the gui back in. if the renderer has
                // a refresh, it will be called. however if it doesn't, then later
                // the renderer will be destroyed and a new one will be created.
                if (this.cellRenderer) {
                    // we know it's a dom element (not a string) because we converted
                    // it after the gui was attached if it was a string.
                    var eCell = this.cellRendererGui;
                    // can be null if cell was previously null / contained empty string,
                    // this will result in new value not being rendered.
                    if (eCell) {
                        this.getGui().appendChild(eCell);
                    }
                }
            }
        }
        this.setInlineEditingClass();
        // we suppress the flash, as it is not correct to flash the cell the user has finished editing,
        // the user doesn't need to flash as they were the one who did the edit, the flash is pointless
        // (as the flash is meant to draw the user to a change that they didn't manually do themselves).
        this.refreshCell({ forceRefresh: true, suppressFlash: true });
        var event = this.createEvent(null, events_1.Events.EVENT_CELL_EDITING_STOPPED);
        this.beans.eventService.dispatchEvent(event);
    };
    CellComp.DOM_DATA_KEY_CELL_COMP = 'cellComp';
    return CellComp;
}(component_1.Component));
exports.CellComp = CellComp;
