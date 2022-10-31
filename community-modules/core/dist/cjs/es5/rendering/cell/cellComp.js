/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var popupEditorWrapper_1 = require("./../cellEditors/popupEditorWrapper");
var aria_1 = require("../../utils/aria");
var string_1 = require("../../utils/string");
var generic_1 = require("../../utils/generic");
var dom_1 = require("../../utils/dom");
var browser_1 = require("../../utils/browser");
var CellComp = /** @class */ (function (_super) {
    __extends(CellComp, _super);
    function CellComp(beans, cellCtrl, printLayout, eRow, editingRow) {
        var _this = _super.call(this) || this;
        // every time we go into edit mode, or back again, this gets incremented.
        // it's the components way of dealing with the async nature of framework components,
        // so if a framework component takes a while to be created, we know if the object
        // is still relevant when creating is finished. eg we could click edit / un-edit 20
        // times before the first React edit component comes back - we should discard
        // the first 19.
        _this.rendererVersion = 0;
        _this.editorVersion = 0;
        _this.beans = beans;
        _this.column = cellCtrl.getColumn();
        _this.rowNode = cellCtrl.getRowNode();
        _this.rowCtrl = cellCtrl.getRowCtrl();
        _this.eRow = eRow;
        _this.setTemplate(/* html */ "<div comp-id=\"" + _this.getCompId() + "\"/>");
        var eGui = _this.getGui();
        _this.forceWrapper = cellCtrl.isForceWrapper();
        _this.refreshWrapper(false);
        var setAttribute = function (name, value, element) {
            var actualElement = element ? element : eGui;
            if (value != null && value != '') {
                actualElement.setAttribute(name, value);
            }
            else {
                actualElement.removeAttribute(name);
            }
        };
        var compProxy = {
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            setUserStyles: function (styles) { return dom_1.addStylesToElement(eGui, styles); },
            getFocusableElement: function () { return _this.getFocusableElement(); },
            setTabIndex: function (tabIndex) { return setAttribute('tabindex', tabIndex.toString()); },
            setRole: function (role) { return aria_1.setAriaRole(eGui, role); },
            setColId: function (colId) { return setAttribute('col-id', colId); },
            setTitle: function (title) { return setAttribute('title', title); },
            setIncludeSelection: function (include) { return _this.includeSelection = include; },
            setIncludeRowDrag: function (include) { return _this.includeRowDrag = include; },
            setIncludeDndSource: function (include) { return _this.includeDndSource = include; },
            setRenderDetails: function (compDetails, valueToDisplay, force) {
                return _this.setRenderDetails(compDetails, valueToDisplay, force);
            },
            setEditDetails: function (compDetails, popup, position) {
                return _this.setEditDetails(compDetails, popup, position);
            },
            getCellEditor: function () { return _this.cellEditor || null; },
            getCellRenderer: function () { return _this.cellRenderer || null; },
            getParentOfValue: function () { return _this.getParentOfValue(); }
        };
        _this.cellCtrl = cellCtrl;
        cellCtrl.setComp(compProxy, _this.getGui(), _this.eCellWrapper, printLayout, editingRow);
        return _this;
    }
    CellComp.prototype.getParentOfValue = function () {
        if (this.eCellValue) {
            // if not editing, and using wrapper, then value goes in eCellValue
            return this.eCellValue;
        }
        if (this.eCellWrapper) {
            // if editing, and using wrapper, value (cell editor) goes in eCellWrapper
            return this.eCellWrapper;
        }
        // if editing or rendering, and not using wrapper, value (or comp) is directly inside cell
        return this.getGui();
    };
    CellComp.prototype.setRenderDetails = function (compDetails, valueToDisplay, forceNewCellRendererInstance) {
        // this can happen if the users asks for the cell to refresh, but we are not showing the vale as we are editing
        var isInlineEditing = this.cellEditor && !this.cellEditorPopupWrapper;
        if (isInlineEditing) {
            return;
        }
        // this means firstRender will be true for one pass only, as it's initialised to undefined
        this.firstRender = this.firstRender == null;
        // if display template has changed, means any previous Cell Renderer is in the wrong location
        var controlWrapperChanged = this.refreshWrapper(false);
        // all of these have dependencies on the eGui, so only do them after eGui is set
        if (compDetails) {
            var neverRefresh = forceNewCellRendererInstance || controlWrapperChanged;
            var cellRendererRefreshSuccessful = neverRefresh ? false : this.refreshCellRenderer(compDetails);
            if (!cellRendererRefreshSuccessful) {
                this.destroyRenderer();
                this.createCellRendererInstance(compDetails);
            }
        }
        else {
            this.destroyRenderer();
            this.insertValueWithoutCellRenderer(valueToDisplay);
        }
    };
    CellComp.prototype.setEditDetails = function (compDetails, popup, position) {
        if (compDetails) {
            this.createCellEditorInstance(compDetails, popup, position);
        }
        else {
            this.destroyEditor();
        }
    };
    CellComp.prototype.removeControls = function () {
        this.checkboxSelectionComp = this.beans.context.destroyBean(this.checkboxSelectionComp);
        this.dndSourceComp = this.beans.context.destroyBean(this.dndSourceComp);
        this.rowDraggingComp = this.beans.context.destroyBean(this.rowDraggingComp);
    };
    // returns true if wrapper was changed
    CellComp.prototype.refreshWrapper = function (editing) {
        var providingControls = this.includeRowDrag || this.includeDndSource || this.includeSelection;
        var usingWrapper = providingControls || this.forceWrapper;
        var putWrapperIn = usingWrapper && this.eCellWrapper == null;
        if (putWrapperIn) {
            this.eCellWrapper = dom_1.loadTemplate("<div class=\"ag-cell-wrapper\" role=\"presentation\"></div>");
            this.getGui().appendChild(this.eCellWrapper);
        }
        var takeWrapperOut = !usingWrapper && this.eCellWrapper != null;
        if (takeWrapperOut) {
            dom_1.removeFromParent(this.eCellWrapper);
            this.eCellWrapper = undefined;
        }
        this.addOrRemoveCssClass('ag-cell-value', !usingWrapper);
        var usingCellValue = !editing && usingWrapper;
        var putCellValueIn = usingCellValue && this.eCellValue == null;
        if (putCellValueIn) {
            this.eCellValue = dom_1.loadTemplate("<span class=\"ag-cell-value\" role=\"presentation\"></span>");
            this.eCellWrapper.appendChild(this.eCellValue);
        }
        var takeCellValueOut = !usingCellValue && this.eCellValue != null;
        if (takeCellValueOut) {
            dom_1.removeFromParent(this.eCellValue);
            this.eCellValue = undefined;
        }
        var templateChanged = putWrapperIn || takeWrapperOut || putCellValueIn || takeCellValueOut;
        if (templateChanged) {
            this.removeControls();
        }
        if (!editing && providingControls) {
            this.addControls();
        }
        return templateChanged;
    };
    CellComp.prototype.addControls = function () {
        var id = this.eCellValue.id = "cell-" + this.getCompId();
        var describedByIds = [];
        aria_1.setAriaHidden(this.eCellWrapper, true);
        if (this.includeRowDrag) {
            if (this.rowDraggingComp == null) {
                this.rowDraggingComp = this.cellCtrl.createRowDragComp();
                if (this.rowDraggingComp) {
                    // put the checkbox in before the value
                    this.eCellWrapper.insertBefore(this.rowDraggingComp.getGui(), this.eCellValue);
                }
            }
        }
        if (this.includeDndSource) {
            if (this.dndSourceComp == null) {
                this.dndSourceComp = this.cellCtrl.createDndSource();
                // put the checkbox in before the value
                this.eCellWrapper.insertBefore(this.dndSourceComp.getGui(), this.eCellValue);
            }
        }
        if (this.includeSelection) {
            if (this.checkboxSelectionComp == null) {
                this.checkboxSelectionComp = this.cellCtrl.createSelectionCheckbox();
                this.eCellWrapper.insertBefore(this.checkboxSelectionComp.getGui(), this.eCellValue);
            }
            describedByIds.push(this.checkboxSelectionComp.getCheckboxId());
        }
        describedByIds.push(id);
        aria_1.setAriaDescribedBy(this.getGui(), describedByIds.join(' '));
    };
    CellComp.prototype.createCellEditorInstance = function (compDetails, popup, position) {
        var _this = this;
        var versionCopy = this.editorVersion;
        var cellEditorPromise = compDetails.newAgStackInstance();
        if (!cellEditorPromise) {
            return;
        } // if empty, userComponentFactory already did a console message
        var params = compDetails.params;
        cellEditorPromise.then(function (c) { return _this.afterCellEditorCreated(versionCopy, c, params, popup, position); });
        // if we don't do this, and editor component is async, then there will be a period
        // when the component isn't present and keyboard navigation won't work - so example
        // of user hitting tab quickly (more quickly than renderers getting created) won't work
        var cellEditorAsync = generic_1.missing(this.cellEditor);
        if (cellEditorAsync && params.cellStartedEdit) {
            this.cellCtrl.focusCell(true);
        }
    };
    CellComp.prototype.insertValueWithoutCellRenderer = function (valueToDisplay) {
        var eParent = this.getParentOfValue();
        dom_1.clearElement(eParent);
        var escapedValue = valueToDisplay != null ? string_1.escapeString(valueToDisplay) : null;
        if (escapedValue != null) {
            eParent.innerHTML = escapedValue;
        }
    };
    CellComp.prototype.destroyEditorAndRenderer = function () {
        this.destroyRenderer();
        this.destroyEditor();
    };
    CellComp.prototype.destroyRenderer = function () {
        var context = this.beans.context;
        this.cellRenderer = context.destroyBean(this.cellRenderer);
        dom_1.removeFromParent(this.cellRendererGui);
        this.cellRendererGui = null;
        this.rendererVersion++;
    };
    CellComp.prototype.destroyEditor = function () {
        var context = this.beans.context;
        if (this.hideEditorPopup) {
            this.hideEditorPopup();
        }
        this.hideEditorPopup = undefined;
        this.cellEditor = context.destroyBean(this.cellEditor);
        this.cellEditorPopupWrapper = context.destroyBean(this.cellEditorPopupWrapper);
        dom_1.removeFromParent(this.cellEditorGui);
        this.cellEditorGui = null;
        this.editorVersion++;
    };
    CellComp.prototype.refreshCellRenderer = function (compClassAndParams) {
        if (this.cellRenderer == null || this.cellRenderer.refresh == null) {
            return false;
        }
        // if different Cell Renderer configured this time (eg user is using selector, and
        // returns different component) then don't refresh, force recreate of Cell Renderer
        if (this.cellRendererClass !== compClassAndParams.componentClass) {
            return false;
        }
        // take any custom params off of the user
        var result = this.cellRenderer.refresh(compClassAndParams.params);
        // NOTE on undefined: previous version of the cellRenderer.refresh() interface
        // returned nothing, if the method existed, we assumed it refreshed. so for
        // backwards compatibility, we assume if method exists and returns nothing,
        // that it was successful.
        return result === true || result === undefined;
    };
    CellComp.prototype.createCellRendererInstance = function (compDetails) {
        var _this = this;
        // never use task service if angularCompileRows=true, as that assume the cell renderers
        // are finished when the row is created. also we never use it if animation frame service
        // is turned off.
        // and lastly we never use it if doing auto-height, as the auto-height service checks the
        // row height directly after the cell is created, it doesn't wait around for the tasks to complete
        var angularCompileRows = this.beans.gridOptionsWrapper.isAngularCompileRows();
        var suppressAnimationFrame = this.beans.gridOptionsWrapper.isSuppressAnimationFrame();
        var useTaskService = !angularCompileRows && !suppressAnimationFrame;
        var displayComponentVersionCopy = this.rendererVersion;
        var componentClass = compDetails.componentClass;
        var createCellRendererFunc = function () {
            var staleTask = _this.rendererVersion !== displayComponentVersionCopy || !_this.isAlive();
            if (staleTask) {
                return;
            }
            // this can return null in the event that the user has switched from a renderer component to nothing, for example
            // when using a cellRendererSelect to return a component or null depending on row data etc
            var componentPromise = compDetails.newAgStackInstance();
            var callback = _this.afterCellRendererCreated.bind(_this, displayComponentVersionCopy, componentClass);
            if (componentPromise) {
                componentPromise.then(callback);
            }
        };
        // we only use task service when rendering for first time, which means it is not used when doing edits.
        // if we changed this (always use task service) would make sense, however it would break tests, possibly
        // test of users.
        if (useTaskService && this.firstRender) {
            this.beans.animationFrameService.createTask(createCellRendererFunc, this.rowNode.rowIndex, 'createTasksP2');
        }
        else {
            createCellRendererFunc();
        }
    };
    CellComp.prototype.getCtrl = function () {
        return this.cellCtrl;
    };
    CellComp.prototype.getRowCtrl = function () {
        return this.rowCtrl;
    };
    CellComp.prototype.getCellRenderer = function () {
        return this.cellRenderer;
    };
    CellComp.prototype.getCellEditor = function () {
        return this.cellEditor;
    };
    CellComp.prototype.afterCellRendererCreated = function (cellRendererVersion, cellRendererClass, cellRenderer) {
        var staleTask = !this.isAlive() || cellRendererVersion !== this.rendererVersion;
        if (staleTask) {
            this.beans.context.destroyBean(cellRenderer);
            return;
        }
        this.cellRenderer = cellRenderer;
        this.cellRendererClass = cellRendererClass;
        this.cellRendererGui = this.cellRenderer.getGui();
        if (this.cellRendererGui != null) {
            var eParent = this.getParentOfValue();
            dom_1.clearElement(eParent);
            eParent.appendChild(this.cellRendererGui);
        }
    };
    CellComp.prototype.afterCellEditorCreated = function (requestVersion, cellEditor, params, popup, position) {
        // if editingCell=false, means user cancelled the editor before component was ready.
        // if versionMismatch, then user cancelled the edit, then started the edit again, and this
        //   is the first editor which is now stale.
        var staleComp = requestVersion !== this.editorVersion;
        if (staleComp) {
            this.beans.context.destroyBean(cellEditor);
            return;
        }
        var editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        if (editingCancelledByUserComp) {
            this.beans.context.destroyBean(cellEditor);
            this.cellCtrl.stopEditing();
            return;
        }
        if (!cellEditor.getGui) {
            console.warn("AG Grid: cellEditor for column " + this.column.getId() + " is missing getGui() method");
            this.beans.context.destroyBean(cellEditor);
            return;
        }
        this.cellEditor = cellEditor;
        this.cellEditorGui = cellEditor.getGui();
        var cellEditorInPopup = popup || (cellEditor.isPopup !== undefined && cellEditor.isPopup());
        if (cellEditorInPopup) {
            if (!popup) {
                this.cellCtrl.hackSayEditingInPopup();
            }
            this.addPopupCellEditor(params, position);
        }
        else {
            this.addInCellEditor();
        }
        if (cellEditor.afterGuiAttached) {
            cellEditor.afterGuiAttached();
        }
    };
    CellComp.prototype.addInCellEditor = function () {
        var eGui = this.getGui();
        // if focus is inside the cell, we move focus to the cell itself
        // before removing it's contents, otherwise errors could be thrown.
        var eDocument = this.beans.gridOptionsWrapper.getDocument();
        if (eGui.contains(eDocument.activeElement)) {
            eGui.focus();
        }
        this.destroyRenderer();
        this.refreshWrapper(true);
        this.clearParentOfValue();
        if (this.cellEditorGui) {
            var eParent = this.getParentOfValue();
            eParent.appendChild(this.cellEditorGui);
        }
    };
    CellComp.prototype.addPopupCellEditor = function (params, position) {
        var _this = this;
        if (this.beans.gridOptionsWrapper.isFullRowEdit()) {
            console.warn('AG Grid: popup cellEditor does not work with fullRowEdit - you cannot use them both ' +
                '- either turn off fullRowEdit, or stop using popup editors.');
        }
        var cellEditor = this.cellEditor;
        // if a popup, then we wrap in a popup editor and return the popup
        this.cellEditorPopupWrapper = this.beans.context.createBean(new popupEditorWrapper_1.PopupEditorWrapper(params));
        var ePopupGui = this.cellEditorPopupWrapper.getGui();
        if (this.cellEditorGui) {
            ePopupGui.appendChild(this.cellEditorGui);
        }
        var popupService = this.beans.popupService;
        var useModelPopup = this.beans.gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
        // see if position provided by colDef, if not then check old way of method on cellComp
        var positionToUse = position != null ? position : cellEditor.getPopupPosition ? cellEditor.getPopupPosition() : 'over';
        var positionParams = {
            column: this.column,
            rowNode: this.rowNode,
            type: 'popupCellEditor',
            eventSource: this.getGui(),
            ePopup: ePopupGui,
            keepWithinBounds: true
        };
        var positionCallback = positionToUse === 'under' ?
            popupService.positionPopupUnderComponent.bind(popupService, positionParams)
            : popupService.positionPopupOverComponent.bind(popupService, positionParams);
        var translate = this.beans.gridOptionsWrapper.getLocaleTextFunc();
        var addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: function () { _this.cellCtrl.onPopupEditorClosed(); },
            anchorToElement: this.getGui(),
            positionCallback: positionCallback,
            ariaLabel: translate('ariaLabelCellEditor', 'Cell Editor')
        });
        if (addPopupRes) {
            this.hideEditorPopup = addPopupRes.hideFunc;
        }
    };
    CellComp.prototype.detach = function () {
        this.eRow.removeChild(this.getGui());
    };
    // if the row is also getting destroyed, then we don't need to remove from dom,
    // as the row will also get removed, so no need to take out the cells from the row
    // if the row is going (removing is an expensive operation, so only need to remove
    // the top part)
    //
    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    CellComp.prototype.destroy = function () {
        this.cellCtrl.stopEditing();
        this.destroyEditorAndRenderer();
        this.removeControls();
        _super.prototype.destroy.call(this);
    };
    CellComp.prototype.clearParentOfValue = function () {
        var eGui = this.getGui();
        // if focus is inside the cell, we move focus to the cell itself
        // before removing it's contents, otherwise errors could be thrown.
        var eDocument = this.beans.gridOptionsWrapper.getDocument();
        if (eGui.contains(eDocument.activeElement) && browser_1.browserSupportsPreventScroll()) {
            eGui.focus({ preventScroll: true });
        }
        dom_1.clearElement(this.getParentOfValue());
    };
    return CellComp;
}(component_1.Component));
exports.CellComp = CellComp;
