/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Constants } from "../../constants/constants";
import { KeyCode } from "../../constants/keyCode";
import { BeanStub } from "../../context/beanStub";
import { Autowired } from "../../context/context";
import { RowNode } from "../../entities/rowNode";
import { isElementInEventPath, isStopPropagationForAgGrid, stopPropagationForAgGrid } from "../../utils/event";
import { doOnce } from "../../utils/function";
import { missing } from "../../utils/generic";
import { createIconNoSpan } from "../../utils/icon";
import { isKeyPressed } from "../../utils/keyboard";
import { cloneObject } from "../../utils/object";
import { CheckboxSelectionComponent } from "../checkboxSelectionComponent";
import { RowDragComp } from "../row/rowDragComp";
var GroupCellRendererCtrl = /** @class */ (function (_super) {
    __extends(GroupCellRendererCtrl, _super);
    function GroupCellRendererCtrl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupCellRendererCtrl.prototype.init = function (comp, eGui, eCheckbox, eExpanded, eContracted, compClass, params) {
        this.params = params;
        this.eGui = eGui;
        this.eCheckbox = eCheckbox;
        this.eExpanded = eExpanded;
        this.eContracted = eContracted;
        this.comp = comp;
        this.compClass = compClass;
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
        this.setupShowingValueForOpenedParent();
        this.findDisplayedGroupNode();
        this.addFullWidthRowDraggerIfNeeded();
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.setupIndent();
    };
    GroupCellRendererCtrl.prototype.isTopLevelFooter = function () {
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
        var rowGroupCols = this.columnModel.getRowGroupColumns();
        // this is a sanity check, rowGroupCols should always be present
        if (!rowGroupCols || rowGroupCols.length === 0) {
            return true;
        }
        var firstRowGroupCol = rowGroupCols[0];
        return firstRowGroupCol.getId() === colDef.showRowGroup;
    };
    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    GroupCellRendererCtrl.prototype.isEmbeddedRowMismatch = function () {
        if (!this.params.fullWidth || !this.gridOptionsWrapper.isEmbedFullWidthRows()) {
            return false;
        }
        var pinnedLeftCell = this.params.pinned === Constants.PINNED_LEFT;
        var pinnedRightCell = this.params.pinned === Constants.PINNED_RIGHT;
        var bodyCell = !pinnedLeftCell && !pinnedRightCell;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            if (this.columnModel.isPinningLeft()) {
                return !pinnedRightCell;
            }
            return !bodyCell;
        }
        if (this.columnModel.isPinningLeft()) {
            return !pinnedLeftCell;
        }
        return !bodyCell;
    };
    GroupCellRendererCtrl.prototype.findDisplayedGroupNode = function () {
        var column = this.params.column;
        var rowNode = this.params.node;
        if (this.showingValueForOpenedParent) {
            var pointer = rowNode.parent;
            while (pointer != null) {
                if (pointer.rowGroupColumn && column.isRowGroupDisplayed(pointer.rowGroupColumn.getId())) {
                    this.displayedGroupNode = pointer;
                    break;
                }
                pointer = pointer.parent;
            }
        }
        // if we didn't find a displayed group, set it to the row node
        if (missing(this.displayedGroupNode)) {
            this.displayedGroupNode = rowNode;
        }
    };
    GroupCellRendererCtrl.prototype.setupShowingValueForOpenedParent = function () {
        // note - this code depends on sortService.updateGroupDataForHiddenOpenParents, where group data
        // is updated to reflect the dragged down parents
        var rowNode = this.params.node;
        var column = this.params.column;
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            this.showingValueForOpenedParent = false;
            return;
        }
        // hideOpenParents means rowNode.groupData can have data for the group this column is displaying, even though
        // this rowNode isn't grouping by the column we are displaying
        // if no groupData at all, we are not showing a parent value
        if (!rowNode.groupData) {
            this.showingValueForOpenedParent = false;
            return;
        }
        // this is the normal case, in that we are showing a group for which this column is configured. note that
        // this means the Row Group is closed (if it was open, we would not be displaying it)
        var showingGroupNode = rowNode.rowGroupColumn != null;
        if (showingGroupNode) {
            var keyOfGroupingColumn = rowNode.rowGroupColumn.getId();
            var configuredToShowThisGroupLevel = column.isRowGroupDisplayed(keyOfGroupingColumn);
            // if showing group as normal, we didn't take group info from parent
            if (configuredToShowThisGroupLevel) {
                this.showingValueForOpenedParent = false;
                return;
            }
        }
        // see if we are showing a Group Value for the Displayed Group. if we are showing a group value, and this Row Node
        // is not grouping by this Displayed Group, we must of gotten the value from a parent node
        var valPresent = rowNode.groupData[column.getId()] != null;
        this.showingValueForOpenedParent = valPresent;
    };
    GroupCellRendererCtrl.prototype.addValueElement = function () {
        if (this.displayedGroupNode.footer) {
            this.addFooterValue();
        }
        else {
            this.addGroupValue();
            this.addChildCount();
        }
    };
    GroupCellRendererCtrl.prototype.addGroupValue = function () {
        // we try and use the cellRenderer of the column used for the grouping if we can
        var paramsAdjusted = this.adjustParamsWithDetailsFromRelatedColumn();
        var innerCompDetails = this.getInnerCompDetails(paramsAdjusted);
        var valueFormatted = paramsAdjusted.valueFormatted, value = paramsAdjusted.value;
        var valueWhenNoRenderer = valueFormatted != null ? valueFormatted : value;
        this.comp.setInnerRenderer(innerCompDetails, valueWhenNoRenderer);
    };
    GroupCellRendererCtrl.prototype.adjustParamsWithDetailsFromRelatedColumn = function () {
        var relatedColumn = this.displayedGroupNode.rowGroupColumn;
        var column = this.params.column;
        if (!relatedColumn) {
            return this.params;
        }
        // column is missing when doing full width
        if (!column || !column.isRowGroupDisplayed(relatedColumn.getId())) {
            return this.params;
        }
        var params = this.params;
        var _a = this.params, value = _a.value, scope = _a.scope, node = _a.node;
        var valueFormatted = this.valueFormatterService.formatValue(relatedColumn, node, scope, value);
        // we don't update the original params, as they could of come through React,
        // as react has RowGroupCellRenderer, which means the params could be props which
        // would be read only
        var paramsAdjusted = __assign(__assign({}, params), { valueFormatted: valueFormatted });
        return paramsAdjusted;
    };
    GroupCellRendererCtrl.prototype.addFooterValue = function () {
        var footerValueGetter = this.params.footerValueGetter;
        var footerValue = '';
        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            var paramsClone = cloneObject(this.params);
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
        var innerCompDetails = this.getInnerCompDetails(this.params);
        this.comp.setInnerRenderer(innerCompDetails, footerValue);
    };
    GroupCellRendererCtrl.prototype.getInnerCompDetails = function (params) {
        var _this = this;
        // for full width rows, we don't do any of the below
        if (params.fullWidth) {
            return this.userComponentFactory.getFullWidthGroupRowInnerCellRenderer(this.gridOptions.groupRowRendererParams, params);
        }
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
        // we check if cell renderer provided for the group cell renderer, eg colDef.cellRendererParams.innerRenderer
        var innerCompDetails = this.userComponentFactory
            .getInnerRendererDetails(params, params);
        // avoid using GroupCellRenderer again, otherwise stack overflow, as we insert same renderer again and again.
        // this covers off chance user is grouping by a column that is also configured with GroupCellRenderer
        var isGroupRowRenderer = function (details) { return details && details.componentClass == _this.compClass; };
        if (innerCompDetails && !isGroupRowRenderer(innerCompDetails)) {
            // use the renderer defined in cellRendererParams.innerRenderer
            return innerCompDetails;
        }
        var relatedColumn = this.displayedGroupNode.rowGroupColumn;
        var relatedColDef = relatedColumn ? relatedColumn.getColDef() : undefined;
        if (!relatedColDef) {
            return;
        }
        // otherwise see if we can use the cellRenderer of the column we are grouping by
        var relatedCompDetails = this.userComponentFactory
            .getCellRendererDetails(relatedColDef, params);
        if (relatedCompDetails && !isGroupRowRenderer(relatedCompDetails)) {
            // Only if the original column is using a specific renderer, it it is a using a DEFAULT one ignore it
            return relatedCompDetails;
        }
        if (isGroupRowRenderer(relatedCompDetails) &&
            relatedColDef.cellRendererParams &&
            relatedColDef.cellRendererParams.innerRenderer) {
            // edge case - this comes from a column which has been grouped dynamically, that has a renderer 'group'
            // and has an inner cell renderer
            var res = this.userComponentFactory.getInnerRendererDetails(relatedColDef.cellRendererParams, params);
            return res;
        }
    };
    GroupCellRendererCtrl.prototype.addChildCount = function () {
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) {
            return;
        }
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, this.updateChildCount.bind(this));
        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    };
    GroupCellRendererCtrl.prototype.updateChildCount = function () {
        var allChildrenCount = this.displayedGroupNode.allChildrenCount;
        var showingGroupForThisNode = this.isShowRowGroupForThisRow();
        var showCount = showingGroupForThisNode && allChildrenCount != null && allChildrenCount >= 0;
        var countString = showCount ? "(" + allChildrenCount + ")" : "";
        this.comp.setChildCount(countString);
    };
    GroupCellRendererCtrl.prototype.isShowRowGroupForThisRow = function () {
        if (this.gridOptionsWrapper.isTreeData()) {
            return true;
        }
        var rowGroupColumn = this.displayedGroupNode.rowGroupColumn;
        if (!rowGroupColumn) {
            return false;
        }
        // column is null for fullWidthRows
        var column = this.params.column;
        var thisColumnIsInterested = column == null || column.isRowGroupDisplayed(rowGroupColumn.getId());
        return thisColumnIsInterested;
    };
    GroupCellRendererCtrl.prototype.addExpandAndContract = function () {
        var params = this.params;
        var eExpandedIcon = createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null);
        var eContractedIcon = createIconNoSpan('groupContracted', this.gridOptionsWrapper, null);
        if (eExpandedIcon) {
            this.eExpanded.appendChild(eExpandedIcon);
        }
        if (eContractedIcon) {
            this.eContracted.appendChild(eContractedIcon);
        }
        var eGroupCell = params.eGridCell;
        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit() && this.isExpandable() && !params.suppressDoubleClickExpand) {
            this.addManagedListener(eGroupCell, 'dblclick', this.onCellDblClicked.bind(this));
        }
        this.addManagedListener(this.eExpanded, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eContracted, 'click', this.onExpandClicked.bind(this));
        // expand / contract as the user hits enter
        this.addManagedListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(params.node, RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();
        // because we don't show the expand / contract when there are no children, we need to check every time
        // the number of children change.
        var expandableChangedListener = this.onRowNodeIsExpandableChanged.bind(this);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_MASTER_CHANGED, expandableChangedListener);
        this.addManagedListener(this.displayedGroupNode, RowNode.EVENT_HAS_CHILDREN_CHANGED, expandableChangedListener);
    };
    GroupCellRendererCtrl.prototype.onExpandClicked = function (mouseEvent) {
        if (isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        // so if we expand a node, it does not also get selected.
        stopPropagationForAgGrid(mouseEvent);
        this.onExpandOrContract();
    };
    GroupCellRendererCtrl.prototype.onExpandOrContract = function () {
        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        var rowNode = this.displayedGroupNode;
        var nextExpandState = !rowNode.expanded;
        rowNode.setExpanded(nextExpandState);
    };
    GroupCellRendererCtrl.prototype.isExpandable = function () {
        if (this.showingValueForOpenedParent) {
            return true;
        }
        var rowNode = this.displayedGroupNode;
        var reducedLeafNode = this.columnModel.isPivotMode() && rowNode.leafGroup;
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
    GroupCellRendererCtrl.prototype.showExpandAndContractIcons = function () {
        var _a = this, params = _a.params, displayedGroup = _a.displayedGroupNode, columnModel = _a.columnModel;
        var node = params.node;
        var isExpandable = this.isExpandable();
        if (isExpandable) {
            // if expandable, show one based on expand state.
            // if we were dragged down, means our parent is always expanded
            var expanded = this.showingValueForOpenedParent ? true : node.expanded;
            this.comp.setExpandedDisplayed(expanded);
            this.comp.setContractedDisplayed(!expanded);
        }
        else {
            // it not expandable, show neither
            this.comp.setExpandedDisplayed(false);
            this.comp.setContractedDisplayed(false);
        }
        // compensation padding for leaf nodes, so there is blank space instead of the expand icon
        var pivotMode = columnModel.isPivotMode();
        var pivotModeAndLeafGroup = pivotMode && displayedGroup.leafGroup;
        var addExpandableCss = isExpandable && !pivotModeAndLeafGroup;
        var isTotalFooterNode = node.footer && node.level === -1;
        this.comp.addOrRemoveCssClass('ag-cell-expandable', addExpandableCss);
        this.comp.addOrRemoveCssClass('ag-row-group', addExpandableCss);
        if (pivotMode) {
            this.comp.addOrRemoveCssClass('ag-pivot-leaf-group', pivotModeAndLeafGroup);
        }
        else if (!isTotalFooterNode) {
            this.comp.addOrRemoveCssClass('ag-row-group-leaf-indent', !addExpandableCss);
        }
    };
    GroupCellRendererCtrl.prototype.onRowNodeIsExpandableChanged = function () {
        // maybe if no children now, we should hide the expand / contract icons
        this.showExpandAndContractIcons();
        // if we have no children, this impacts the indent
        this.setIndent();
    };
    GroupCellRendererCtrl.prototype.setupIndent = function () {
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        var node = this.params.node;
        var suppressPadding = this.params.suppressPadding;
        if (!suppressPadding) {
            this.addManagedListener(node, RowNode.EVENT_UI_LEVEL_CHANGED, this.setIndent.bind(this));
            this.setIndent();
        }
    };
    GroupCellRendererCtrl.prototype.setIndent = function () {
        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        var params = this.params;
        var rowNode = params.node;
        // if we are only showing one group column, we don't want to be indenting based on level
        var fullWithRow = !!params.colDef;
        var treeData = this.gridOptionsWrapper.isTreeData();
        var manyDimensionThisColumn = !fullWithRow || treeData || params.colDef.showRowGroup === true;
        var paddingCount = manyDimensionThisColumn ? rowNode.uiLevel : 0;
        var userProvidedPaddingPixelsTheDeprecatedWay = params.padding >= 0;
        if (userProvidedPaddingPixelsTheDeprecatedWay) {
            doOnce(function () { return console.warn('AG Grid: cellRendererParams.padding no longer works, it was deprecated in since v14.2 and removed in v26, configuring padding for groupCellRenderer should be done with Sass variables and themes. Please see the AG Grid documentation page for Themes, in particular the property $row-group-indent-size.'); }, 'groupCellRenderer->doDeprecatedWay');
        }
        if (this.indentClass) {
            this.comp.addOrRemoveCssClass(this.indentClass, false);
        }
        this.indentClass = 'ag-row-group-indent-' + paddingCount;
        this.comp.addOrRemoveCssClass(this.indentClass, true);
    };
    GroupCellRendererCtrl.prototype.addFullWidthRowDraggerIfNeeded = function () {
        var _this = this;
        if (!this.params.fullWidth || !this.params.rowDrag) {
            return;
        }
        var rowDragComp = new RowDragComp(function () { return _this.params.value; }, this.params.node);
        this.createManagedBean(rowDragComp, this.context);
        this.eGui.insertAdjacentElement('afterbegin', rowDragComp.getGui());
    };
    GroupCellRendererCtrl.prototype.isUserWantsSelected = function () {
        var paramsCheckbox = this.params.checkbox;
        if (typeof paramsCheckbox === 'function') {
            return paramsCheckbox(this.params);
        }
        return paramsCheckbox === true;
    };
    GroupCellRendererCtrl.prototype.addCheckboxIfNeeded = function () {
        var _this = this;
        var rowNode = this.displayedGroupNode;
        var checkboxNeeded = this.isUserWantsSelected() &&
            // footers cannot be selected
            !rowNode.footer &&
            // pinned rows cannot be selected
            !rowNode.rowPinned &&
            // details cannot be selected
            !rowNode.detail;
        if (checkboxNeeded) {
            var cbSelectionComponent_1 = new CheckboxSelectionComponent();
            this.getContext().createBean(cbSelectionComponent_1);
            cbSelectionComponent_1.init({ rowNode: rowNode, column: this.params.column });
            this.eCheckbox.appendChild(cbSelectionComponent_1.getGui());
            this.addDestroyFunc(function () { return _this.getContext().destroyBean(cbSelectionComponent_1); });
        }
        this.comp.setCheckboxVisible(checkboxNeeded);
    };
    GroupCellRendererCtrl.prototype.onKeyDown = function (event) {
        var enterKeyPressed = isKeyPressed(event, KeyCode.ENTER);
        if (!enterKeyPressed || this.params.suppressEnterExpand) {
            return;
        }
        var cellEditable = this.params.column && this.params.column.isCellEditable(this.params.node);
        if (cellEditable) {
            return;
        }
        this.onExpandOrContract();
    };
    GroupCellRendererCtrl.prototype.onCellDblClicked = function (mouseEvent) {
        if (isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        // we want to avoid acting on double click events on the expand / contract icon,
        // as that icons already has expand / collapse functionality on it. otherwise if
        // the icon was double clicked, we would get 'click', 'click', 'dblclick' which
        // is open->close->open, however double click should be open->close only.
        var targetIsExpandIcon = isElementInEventPath(this.eExpanded, mouseEvent)
            || isElementInEventPath(this.eContracted, mouseEvent);
        if (!targetIsExpandIcon) {
            this.onExpandOrContract();
        }
    };
    __decorate([
        Autowired('expressionService')
    ], GroupCellRendererCtrl.prototype, "expressionService", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], GroupCellRendererCtrl.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('columnModel')
    ], GroupCellRendererCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], GroupCellRendererCtrl.prototype, "userComponentFactory", void 0);
    __decorate([
        Autowired('gridOptions')
    ], GroupCellRendererCtrl.prototype, "gridOptions", void 0);
    return GroupCellRendererCtrl;
}(BeanStub));
export { GroupCellRendererCtrl };
