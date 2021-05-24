/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../constants/constants");
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var rowNode_1 = require("../../entities/rowNode");
var checkboxSelectionComponent_1 = require("../checkboxSelectionComponent");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var userComponentFactory_1 = require("../../components/framework/userComponentFactory");
var function_1 = require("../../utils/function");
var object_1 = require("../../utils/object");
var general_1 = require("../../utils/general");
var dom_1 = require("../../utils/dom");
var icon_1 = require("../../utils/icon");
var keyboard_1 = require("../../utils/keyboard");
var generic_1 = require("../../utils/generic");
var event_1 = require("../../utils/event");
var aria_1 = require("../../utils/aria");
var keyCode_1 = require("../../constants/keyCode");
var rowDragComp_1 = require("../row/rowDragComp");
var GroupCellRenderer = /** @class */ (function (_super) {
    __extends(GroupCellRenderer, _super);
    function GroupCellRenderer() {
        return _super.call(this, GroupCellRenderer.TEMPLATE) || this;
    }
    GroupCellRenderer.prototype.isTopLevelFooter = function () {
        if (!this.gridOptionsWrapper.isGroupIncludeTotalFooter()) {
            return false;
        }
        if (this.params.value != null || this.params.node.level != -1) {
            return false;
        }
        // at this point, we know it's the root node and there is no value present, so it's a footer cell.
        // the only thing to work out is if we are displaying groups  across multiple
        // columns (groupMultiAutoColumn=true), we only want 'total' to appear in the first column.
        var colDef = this.params.colDef;
        var doingFullWidth = colDef == null;
        if (doingFullWidth) {
            return true;
        }
        if (colDef.showRowGroup === true) {
            return true;
        }
        var rowGroupCols = this.columnController.getRowGroupColumns();
        // this is a sanity check, rowGroupCols should always be present
        if (!rowGroupCols || rowGroupCols.length === 0) {
            return true;
        }
        var firstRowGroupCol = rowGroupCols[0];
        return firstRowGroupCol.getId() === colDef.showRowGroup;
    };
    GroupCellRenderer.prototype.init = function (params) {
        this.params = params;
        var topLevelFooter = this.isTopLevelFooter();
        var embeddedRowMismatch = this.isEmbeddedRowMismatch();
        // This allows for empty strings to appear as groups since
        // it will only return for null or undefined.
        var nullValue = params.value == null;
        var skipCell = false;
        // if the groupCellRenderer is inside of a footer and groupHideOpenParents is true
        // we should only display the groupCellRenderer if the current column is the rowGroupedColumn
        if (this.gridOptionsWrapper.isGroupIncludeFooter() && this.gridOptionsWrapper.isGroupHideOpenParents()) {
            var node = params.node;
            if (node.footer) {
                var showRowGroup = params.colDef && params.colDef.showRowGroup;
                var rowGroupColumnId = node.rowGroupColumn && node.rowGroupColumn.getColId();
                skipCell = showRowGroup !== rowGroupColumnId;
            }
        }
        this.cellIsBlank = topLevelFooter ? false : (embeddedRowMismatch || nullValue || skipCell);
        if (this.cellIsBlank) {
            return;
        }
        this.setupDragOpenParents();
        this.addFullWidthRowDraggerIfNeeded();
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.setupIndent();
    };
    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    GroupCellRenderer.prototype.isEmbeddedRowMismatch = function () {
        if (!this.params.fullWidth || !this.gridOptionsWrapper.isEmbedFullWidthRows()) {
            return false;
        }
        var pinnedLeftCell = this.params.pinned === constants_1.Constants.PINNED_LEFT;
        var pinnedRightCell = this.params.pinned === constants_1.Constants.PINNED_RIGHT;
        var bodyCell = !pinnedLeftCell && !pinnedRightCell;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            if (this.columnController.isPinningLeft()) {
                return !pinnedRightCell;
            }
            return !bodyCell;
        }
        if (this.columnController.isPinningLeft()) {
            return !pinnedLeftCell;
        }
        return !bodyCell;
    };
    GroupCellRenderer.prototype.setIndent = function () {
        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        var params = this.params;
        var rowNode = params.node;
        // if we are only showing one group column, we don't want to be indenting based on level
        var fullWithRow = !!params.colDef;
        var manyDimensionThisColumn = !fullWithRow || params.colDef.showRowGroup === true;
        var paddingCount = manyDimensionThisColumn ? rowNode.uiLevel : 0;
        var userProvidedPaddingPixelsTheDeprecatedWay = params.padding >= 0;
        if (userProvidedPaddingPixelsTheDeprecatedWay) {
            this.setPaddingDeprecatedWay(paddingCount, params.padding);
            return;
        }
        if (this.indentClass) {
            this.removeCssClass(this.indentClass);
        }
        this.indentClass = 'ag-row-group-indent-' + paddingCount;
        this.addCssClass(this.indentClass);
    };
    GroupCellRenderer.prototype.setPaddingDeprecatedWay = function (paddingCount, padding) {
        function_1.doOnce(function () { return console.warn('AG Grid: since v14.2, configuring padding for groupCellRenderer should be done with Sass variables and themes. Please see the AG Grid documentation page for Themes, in particular the property $row-group-indent-size.'); }, 'groupCellRenderer->doDeprecatedWay');
        var paddingPx = paddingCount * padding;
        var eGui = this.getGui();
        var paddingSide = this.gridOptionsWrapper.isEnableRtl() ? 'paddingRight' : 'paddingLeft';
        eGui.style[paddingSide] = paddingPx + "px";
    };
    GroupCellRenderer.prototype.setupIndent = function () {
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        var node = this.params.node;
        var suppressPadding = this.params.suppressPadding;
        if (!suppressPadding) {
            this.addManagedListener(node, rowNode_1.RowNode.EVENT_UI_LEVEL_CHANGED, this.setIndent.bind(this));
            this.setIndent();
        }
    };
    GroupCellRenderer.prototype.addValueElement = function () {
        if (this.displayedGroup.footer) {
            this.addFooterValue();
        }
        else {
            this.addGroupValue();
            this.addChildCount();
        }
    };
    GroupCellRenderer.prototype.addFooterValue = function () {
        var footerValueGetter = this.params.footerValueGetter;
        var footerValue;
        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            var paramsClone = object_1.cloneObject(this.params);
            paramsClone.value = this.params.value;
            if (typeof footerValueGetter === 'function') {
                footerValue = footerValueGetter(paramsClone);
            }
            else if (typeof footerValueGetter === 'string') {
                footerValue = this.expressionService.evaluate(footerValueGetter, paramsClone);
            }
            else {
                console.warn('AG Grid: footerValueGetter should be either a function or a string (expression)');
            }
        }
        else {
            footerValue = 'Total ' + (this.params.value != null ? this.params.value : '');
        }
        this.eValue.innerHTML = footerValue;
    };
    GroupCellRenderer.prototype.addGroupValue = function () {
        var _this = this;
        var params = this.params;
        var rowGroupColumn = this.displayedGroup.rowGroupColumn;
        // we try and use the cellRenderer of the column used for the grouping if we can
        var columnToUse = rowGroupColumn ? rowGroupColumn : params.column;
        var groupName = this.params.value;
        var valueFormatted = columnToUse ?
            this.valueFormatterService.formatValue(columnToUse, params.node, params.scope, groupName) : null;
        params.valueFormatted = valueFormatted;
        var rendererPromise;
        rendererPromise = params.fullWidth
            ? this.useFullWidth(params)
            : this.useInnerRenderer(this.params.colDef.cellRendererParams, columnToUse.getColDef(), params);
        // retain a reference to the created renderer - we'll use this later for cleanup (in destroy)
        if (rendererPromise) {
            rendererPromise.then(function (value) {
                _this.innerCellRenderer = value;
            });
        }
    };
    GroupCellRenderer.prototype.useInnerRenderer = function (groupCellRendererParams, groupedColumnDef, // the column this group row is for, eg 'Country'
    params) {
        var _this = this;
        // when grouping, the normal case is we use the cell renderer of the grouped column. eg if grouping by country
        // and then rating, we will use the country cell renderer for each country group row and likewise the rating
        // cell renderer for each rating group row.
        //
        // however if the user has innerCellRenderer defined, this gets preference and we don't use cell renderers
        // of the grouped columns.
        //
        // so we check and use in the following order:
        //
        // 1) thisColDef.cellRendererParams.innerRenderer of the column showing the groups (eg auto group column)
        // 2) groupedColDef.cellRenderer of the grouped column
        // 3) groupedColDef.cellRendererParams.innerRenderer
        var cellRendererPromise = null;
        // we check if cell renderer provided for the group cell renderer, eg colDef.cellRendererParams.innerRenderer
        var groupInnerRendererClass = this.userComponentFactory
            .lookupComponentClassDef(groupCellRendererParams, "innerRenderer");
        if (groupInnerRendererClass && groupInnerRendererClass.component != null
            && groupInnerRendererClass.source != userComponentFactory_1.ComponentSource.DEFAULT) {
            // use the renderer defined in cellRendererParams.innerRenderer
            cellRendererPromise = this.userComponentFactory.newInnerCellRenderer(groupCellRendererParams, params);
        }
        else {
            // otherwise see if we can use the cellRenderer of the column we are grouping by
            var groupColumnRendererClass = this.userComponentFactory
                .lookupComponentClassDef(groupedColumnDef, "cellRenderer");
            if (groupColumnRendererClass &&
                groupColumnRendererClass.source != userComponentFactory_1.ComponentSource.DEFAULT) {
                // Only if the original column is using a specific renderer, it it is a using a DEFAULT one ignore it
                cellRendererPromise = this.userComponentFactory.newCellRenderer(groupedColumnDef, params);
            }
            else if (groupColumnRendererClass &&
                groupColumnRendererClass.source == userComponentFactory_1.ComponentSource.DEFAULT &&
                (object_1.get(groupedColumnDef, 'cellRendererParams.innerRenderer', null))) {
                // EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                // AND HAS A INNER CELL RENDERER
                cellRendererPromise = this.userComponentFactory.newInnerCellRenderer(groupedColumnDef.cellRendererParams, params);
            }
            else {
                // This forces the retrieval of the default plain cellRenderer that just renders the values.
                cellRendererPromise = this.userComponentFactory.newCellRenderer({}, params);
            }
        }
        if (cellRendererPromise != null) {
            cellRendererPromise.then(function (rendererToUse) {
                if (rendererToUse == null) {
                    _this.eValue.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
                    return;
                }
                general_1.bindCellRendererToHtmlElement(cellRendererPromise, _this.eValue);
            });
        }
        else {
            this.eValue.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    };
    GroupCellRenderer.prototype.useFullWidth = function (params) {
        var cellRendererPromise = this.userComponentFactory.newFullWidthGroupRowInnerCellRenderer(params);
        if (cellRendererPromise != null) {
            general_1.bindCellRendererToHtmlElement(cellRendererPromise, this.eValue);
        }
        else {
            this.eValue.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    };
    GroupCellRenderer.prototype.addFullWidthRowDraggerIfNeeded = function () {
        var _this = this;
        if (!this.params.fullWidth || !this.params.rowDrag) {
            return;
        }
        var rowDragComp = new rowDragComp_1.RowDragComp(function () { return _this.params.value; }, this.params.node);
        this.createManagedBean(rowDragComp, this.context);
        this.getGui().insertAdjacentElement('afterbegin', rowDragComp.getGui());
    };
    GroupCellRenderer.prototype.addChildCount = function () {
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) {
            return;
        }
        this.addManagedListener(this.displayedGroup, rowNode_1.RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, this.updateChildCount.bind(this));
        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    };
    GroupCellRenderer.prototype.updateChildCount = function () {
        var allChildrenCount = this.displayedGroup.allChildrenCount;
        var showingGroupForThisNode = this.isShowRowGroupForThisRow();
        var showCount = showingGroupForThisNode && allChildrenCount != null && allChildrenCount >= 0;
        var countString = showCount ? "(" + allChildrenCount + ")" : "";
        this.eChildCount.innerHTML = countString;
    };
    GroupCellRenderer.prototype.isUserWantsSelected = function () {
        var paramsCheckbox = this.params.checkbox;
        if (typeof paramsCheckbox === 'function') {
            return paramsCheckbox(this.params);
        }
        return paramsCheckbox === true;
    };
    GroupCellRenderer.prototype.addCheckboxIfNeeded = function () {
        var _this = this;
        var rowNode = this.displayedGroup;
        var checkboxNeeded = this.isUserWantsSelected() &&
            // footers cannot be selected
            !rowNode.footer &&
            // pinned rows cannot be selected
            !rowNode.rowPinned &&
            // details cannot be selected
            !rowNode.detail;
        if (checkboxNeeded) {
            var cbSelectionComponent_1 = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
            this.getContext().createBean(cbSelectionComponent_1);
            cbSelectionComponent_1.init({ rowNode: rowNode, column: this.params.column });
            this.eCheckbox.appendChild(cbSelectionComponent_1.getGui());
            this.addDestroyFunc(function () { return _this.getContext().destroyBean(cbSelectionComponent_1); });
        }
        dom_1.addOrRemoveCssClass(this.eCheckbox, 'ag-invisible', !checkboxNeeded);
    };
    GroupCellRenderer.prototype.addExpandAndContract = function () {
        var params = this.params;
        var eGroupCell = params.eGridCell;
        var eExpandedIcon = icon_1.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null);
        var eContractedIcon = icon_1.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null);
        aria_1.setAriaExpanded(eGroupCell, !!params.node.expanded);
        if (eExpandedIcon) {
            this.eExpanded.appendChild(eExpandedIcon);
        }
        if (eContractedIcon) {
            this.eContracted.appendChild(eContractedIcon);
        }
        this.addManagedListener(this.eExpanded, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eContracted, 'click', this.onExpandClicked.bind(this));
        // expand / contract as the user hits enter
        this.addManagedListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(params.node, rowNode_1.RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();
        // because we don't show the expand / contract when there are no children, we need to check every time
        // the number of children change.
        var expandableChangedListener = this.onRowNodeIsExpandableChanged.bind(this);
        this.addManagedListener(this.displayedGroup, rowNode_1.RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroup, rowNode_1.RowNode.EVENT_MASTER_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroup, rowNode_1.RowNode.EVENT_HAS_CHILDREN_CHANGED, expandableChangedListener);
        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit() && this.isExpandable() && !params.suppressDoubleClickExpand) {
            this.addManagedListener(eGroupCell, 'dblclick', this.onCellDblClicked.bind(this));
        }
    };
    GroupCellRenderer.prototype.onRowNodeIsExpandableChanged = function () {
        // maybe if no children now, we should hide the expand / contract icons
        this.showExpandAndContractIcons();
        // if we have no children, this impacts the indent
        this.setIndent();
    };
    GroupCellRenderer.prototype.onKeyDown = function (event) {
        var enterKeyPressed = keyboard_1.isKeyPressed(event, keyCode_1.KeyCode.ENTER);
        if (!enterKeyPressed || this.params.suppressEnterExpand) {
            return;
        }
        var cellEditable = this.params.column && this.params.column.isCellEditable(this.params.node);
        if (cellEditable) {
            return;
        }
        this.onExpandOrContract();
    };
    GroupCellRenderer.prototype.setupDragOpenParents = function () {
        var column = this.params.column;
        var rowNode = this.params.node;
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            this.draggedFromHideOpenParents = false;
        }
        else if (!rowNode.hasChildren()) {
            // if we are here, and we are not a group, then we must of been dragged down,
            // as otherwise the cell would be blank, and if cell is blank, this method is never called.
            this.draggedFromHideOpenParents = true;
        }
        else {
            var rowGroupColumn = rowNode.rowGroupColumn;
            if (rowGroupColumn) {
                // if the displayGroup column for this col matches the rowGroupColumn we grouped by for this node,
                // then nothing was dragged down
                this.draggedFromHideOpenParents = !column.isRowGroupDisplayed(rowGroupColumn.getId());
            }
            else {
                // the only way we can end up here (no column, but a group) is if we are at the root node,
                // which only happens when 'groupIncludeTotalFooter' is true. here, we are never dragging
                this.draggedFromHideOpenParents = false;
            }
        }
        if (this.draggedFromHideOpenParents) {
            var pointer = rowNode.parent;
            while (true) {
                if (generic_1.missing(pointer)) {
                    break;
                }
                if (pointer.rowGroupColumn && column.isRowGroupDisplayed(pointer.rowGroupColumn.getId())) {
                    this.displayedGroup = pointer;
                    break;
                }
                pointer = pointer.parent;
            }
        }
        // if we didn't find a displayed group, set it to the row node
        if (generic_1.missing(this.displayedGroup)) {
            this.displayedGroup = rowNode;
        }
    };
    GroupCellRenderer.prototype.onExpandClicked = function (mouseEvent) {
        if (event_1.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        // so if we expand a node, it does not also get selected.
        event_1.stopPropagationForAgGrid(mouseEvent);
        this.onExpandOrContract();
    };
    GroupCellRenderer.prototype.onCellDblClicked = function (mouseEvent) {
        if (event_1.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        // we want to avoid acting on double click events on the expand / contract icon,
        // as that icons already has expand / collapse functionality on it. otherwise if
        // the icon was double clicked, we would get 'click', 'click', 'dblclick' which
        // is open->close->open, however double click should be open->close only.
        var targetIsExpandIcon = event_1.isElementInEventPath(this.eExpanded, mouseEvent)
            || event_1.isElementInEventPath(this.eContracted, mouseEvent);
        if (!targetIsExpandIcon) {
            this.onExpandOrContract();
        }
    };
    GroupCellRenderer.prototype.onExpandOrContract = function () {
        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        var rowNode = this.displayedGroup;
        var params = this.params;
        var nextExpandState = !rowNode.expanded;
        rowNode.setExpanded(nextExpandState);
        aria_1.setAriaExpanded(params.eGridCell, nextExpandState);
    };
    GroupCellRenderer.prototype.isShowRowGroupForThisRow = function () {
        if (this.gridOptionsWrapper.isTreeData()) {
            return true;
        }
        var rowGroupColumn = this.displayedGroup.rowGroupColumn;
        if (!rowGroupColumn) {
            return false;
        }
        // column is null for fullWidthRows
        var column = this.params.column;
        var thisColumnIsInterested = column == null || column.isRowGroupDisplayed(rowGroupColumn.getId());
        return thisColumnIsInterested;
    };
    GroupCellRenderer.prototype.isExpandable = function () {
        if (this.draggedFromHideOpenParents) {
            return true;
        }
        var rowNode = this.displayedGroup;
        var reducedLeafNode = this.columnController.isPivotMode() && rowNode.leafGroup;
        var expandableGroup = rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode;
        if (!expandableGroup) {
            return false;
        }
        // column is null for fullWidthRows
        var column = this.params.column;
        var displayingForOneColumnOnly = column != null && typeof column.getColDef().showRowGroup === 'string';
        if (displayingForOneColumnOnly) {
            var showing = this.isShowRowGroupForThisRow();
            return showing;
        }
        return true;
    };
    GroupCellRenderer.prototype.showExpandAndContractIcons = function () {
        var _a = this, eContracted = _a.eContracted, eExpanded = _a.eExpanded, params = _a.params, displayedGroup = _a.displayedGroup, columnController = _a.columnController;
        var eGridCell = params.eGridCell, node = params.node;
        var isExpandable = this.isExpandable();
        if (isExpandable) {
            // if expandable, show one based on expand state.
            // if we were dragged down, means our parent is always expanded
            var expanded = this.draggedFromHideOpenParents ? true : node.expanded;
            dom_1.setDisplayed(eContracted, !expanded);
            dom_1.setDisplayed(eExpanded, expanded);
        }
        else {
            // it not expandable, show neither
            aria_1.removeAriaExpanded(eGridCell);
            dom_1.setDisplayed(eExpanded, false);
            dom_1.setDisplayed(eContracted, false);
        }
        // compensation padding for leaf nodes, so there is blank space instead of the expand icon
        var pivotMode = columnController.isPivotMode();
        var pivotModeAndLeafGroup = pivotMode && displayedGroup.leafGroup;
        var addExpandableCss = isExpandable && !pivotModeAndLeafGroup;
        var isTotalFooterNode = node.footer && node.level === -1;
        this.addOrRemoveCssClass('ag-cell-expandable', addExpandableCss);
        this.addOrRemoveCssClass('ag-row-group', addExpandableCss);
        if (pivotMode) {
            this.addOrRemoveCssClass('ag-pivot-leaf-group', pivotModeAndLeafGroup);
        }
        else if (!isTotalFooterNode) {
            this.addOrRemoveCssClass('ag-row-group-leaf-indent', !addExpandableCss);
        }
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to have public here instead of private or protected
    GroupCellRenderer.prototype.destroy = function () {
        this.getContext().destroyBean(this.innerCellRenderer);
        _super.prototype.destroy.call(this);
    };
    GroupCellRenderer.prototype.refresh = function () {
        return false;
    };
    GroupCellRenderer.TEMPLATE = "<span class=\"ag-cell-wrapper\">\n            <span class=\"ag-group-expanded\" ref=\"eExpanded\"></span>\n            <span class=\"ag-group-contracted\" ref=\"eContracted\"></span>\n            <span class=\"ag-group-checkbox ag-invisible\" ref=\"eCheckbox\"></span>\n            <span class=\"ag-group-value\" ref=\"eValue\"></span>\n            <span class=\"ag-group-child-count\" ref=\"eChildCount\"></span>\n        </span>";
    __decorate([
        context_1.Autowired('rowRenderer')
    ], GroupCellRenderer.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('expressionService')
    ], GroupCellRenderer.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService')
    ], GroupCellRenderer.prototype, "valueFormatterService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], GroupCellRenderer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], GroupCellRenderer.prototype, "userComponentFactory", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eExpanded')
    ], GroupCellRenderer.prototype, "eExpanded", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContracted')
    ], GroupCellRenderer.prototype, "eContracted", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCheckbox')
    ], GroupCellRenderer.prototype, "eCheckbox", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue')
    ], GroupCellRenderer.prototype, "eValue", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eChildCount')
    ], GroupCellRenderer.prototype, "eChildCount", void 0);
    return GroupCellRenderer;
}(component_1.Component));
exports.GroupCellRenderer = GroupCellRenderer;

//# sourceMappingURL=groupCellRenderer.js.map
