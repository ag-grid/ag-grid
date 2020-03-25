/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Constants } from "../../constants";
import { Autowired } from "../../context/context";
import { Component } from "../../widgets/component";
import { RowNode } from "../../entities/rowNode";
import { CheckboxSelectionComponent } from "../checkboxSelectionComponent";
import { RefSelector } from "../../widgets/componentAnnotations";
import { ComponentSource } from "../../components/framework/userComponentFactory";
import { _ } from "../../utils";
var GroupCellRenderer = /** @class */ (function (_super) {
    __extends(GroupCellRenderer, _super);
    function GroupCellRenderer() {
        return _super.call(this, GroupCellRenderer.TEMPLATE) || this;
    }
    GroupCellRenderer.prototype.init = function (params) {
        this.params = params;
        if (this.gridOptionsWrapper.isGroupIncludeTotalFooter()) {
            this.assignBlankValueToGroupFooterCell(params);
        }
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
        this.cellIsBlank = embeddedRowMismatch || nullValue || skipCell;
        if (this.cellIsBlank) {
            return;
        }
        this.setupDragOpenParents();
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.setupIndent();
    };
    GroupCellRenderer.prototype.assignBlankValueToGroupFooterCell = function (params) {
        // this is not ideal, but it was the only way we could get footer working for the root node
        if (!params.value && params.node.level == -1) {
            params.value = '';
        }
    };
    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    GroupCellRenderer.prototype.isEmbeddedRowMismatch = function () {
        if (!this.params.fullWidth || !this.gridOptionsWrapper.isEmbedFullWidthRows()) {
            return false;
        }
        var pinnedLeftCell = this.params.pinned === Constants.PINNED_LEFT;
        var pinnedRightCell = this.params.pinned === Constants.PINNED_RIGHT;
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
        var paddingCount = rowNode.uiLevel;
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
        _.doOnce(function () { return console.warn('ag-Grid: since v14.2, configuring padding for groupCellRenderer should be done with Sass variables and themes. Please see the ag-Grid documentation page for Themes, in particular the property $row-group-indent-size.'); }, 'groupCellRenderer->doDeprecatedWay');
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
            this.addDestroyableEventListener(node, RowNode.EVENT_UI_LEVEL_CHANGED, this.setIndent.bind(this));
            this.setIndent();
        }
    };
    GroupCellRenderer.prototype.addValueElement = function () {
        var params = this.params;
        var rowNode = this.displayedGroup;
        if (rowNode.footer) {
            this.createFooterCell();
        }
        else if (rowNode.hasChildren() ||
            _.get(params.colDef, 'cellRendererParams.innerRenderer', null) ||
            _.get(params.colDef, 'cellRendererParams.innerRendererFramework', null)) {
            this.createGroupCell();
            if (rowNode.hasChildren()) {
                this.addChildCount();
            }
        }
        else {
            this.createLeafCell();
        }
    };
    GroupCellRenderer.prototype.createFooterCell = function () {
        var footerValueGetter = this.params.footerValueGetter;
        var footerValue;
        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            var paramsClone = _.cloneObject(this.params);
            paramsClone.value = this.params.value;
            if (typeof footerValueGetter === 'function') {
                footerValue = footerValueGetter(paramsClone);
            }
            else if (typeof footerValueGetter === 'string') {
                footerValue = this.expressionService.evaluate(footerValueGetter, paramsClone);
            }
            else {
                console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
            }
        }
        else {
            footerValue = 'Total ' + this.params.value;
        }
        this.eValue.innerHTML = footerValue;
    };
    GroupCellRenderer.prototype.createGroupCell = function () {
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
            && groupInnerRendererClass.source != ComponentSource.DEFAULT) {
            // use the renderer defined in cellRendererParams.innerRenderer
            cellRendererPromise = this.userComponentFactory.newInnerCellRenderer(groupCellRendererParams, params);
        }
        else {
            // otherwise see if we can use the cellRenderer of the column we are grouping by
            var groupColumnRendererClass = this.userComponentFactory
                .lookupComponentClassDef(groupedColumnDef, "cellRenderer");
            if (groupColumnRendererClass &&
                groupColumnRendererClass.source != ComponentSource.DEFAULT) {
                // Only if the original column is using a specific renderer, it it is a using a DEFAULT one ignore it
                cellRendererPromise = this.userComponentFactory.newCellRenderer(groupedColumnDef, params);
            }
            else if (groupColumnRendererClass &&
                groupColumnRendererClass.source == ComponentSource.DEFAULT &&
                (_.get(groupedColumnDef, 'cellRendererParams.innerRenderer', null))) {
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
                _.bindCellRendererToHtmlElement(cellRendererPromise, _this.eValue);
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
            _.bindCellRendererToHtmlElement(cellRendererPromise, this.eValue);
        }
        else {
            this.eValue.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    };
    GroupCellRenderer.prototype.addChildCount = function () {
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) {
            return;
        }
        this.addDestroyableEventListener(this.displayedGroup, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, this.updateChildCount.bind(this));
        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    };
    GroupCellRenderer.prototype.updateChildCount = function () {
        var allChildrenCount = this.displayedGroup.allChildrenCount;
        this.eChildCount.innerHTML = allChildrenCount >= 0 ? "(" + allChildrenCount + ")" : "";
    };
    GroupCellRenderer.prototype.createLeafCell = function () {
        if (_.exists(this.params.value)) {
            this.eValue.innerText = this.params.valueFormatted ? this.params.valueFormatted : this.params.value;
        }
    };
    GroupCellRenderer.prototype.isUserWantsSelected = function () {
        var paramsCheckbox = this.params.checkbox;
        if (typeof paramsCheckbox === 'function') {
            return paramsCheckbox(this.params);
        }
        return paramsCheckbox === true;
    };
    GroupCellRenderer.prototype.addCheckboxIfNeeded = function () {
        var rowNode = this.displayedGroup;
        var checkboxNeeded = this.isUserWantsSelected() &&
            // footers cannot be selected
            !rowNode.footer &&
            // pinned rows cannot be selected
            !rowNode.rowPinned &&
            // details cannot be selected
            !rowNode.detail;
        if (checkboxNeeded) {
            var cbSelectionComponent_1 = new CheckboxSelectionComponent();
            this.getContext().wireBean(cbSelectionComponent_1);
            cbSelectionComponent_1.init({ rowNode: rowNode, column: this.params.column });
            this.eCheckbox.appendChild(cbSelectionComponent_1.getGui());
            this.addDestroyFunc(function () { return cbSelectionComponent_1.destroy(); });
        }
        _.addOrRemoveCssClass(this.eCheckbox, 'ag-invisible', !checkboxNeeded);
    };
    GroupCellRenderer.prototype.addExpandAndContract = function () {
        var params = this.params;
        var eGroupCell = params.eGridCell;
        var eExpandedIcon = _.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null);
        var eContractedIcon = _.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null);
        this.eExpanded.appendChild(eExpandedIcon);
        this.eContracted.appendChild(eContractedIcon);
        this.addDestroyableEventListener(this.eExpanded, 'click', this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eContracted, 'click', this.onExpandClicked.bind(this));
        // expand / contract as the user hits enter
        this.addDestroyableEventListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(params.node, RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();
        // because we don't show the expand / contract when there are no children, we need to check every time
        // the number of children change.
        this.addDestroyableEventListener(this.displayedGroup, RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED, this.onAllChildrenCountChanged.bind(this));
        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit() && this.isExpandable() && !params.suppressDoubleClickExpand) {
            this.addDestroyableEventListener(eGroupCell, 'dblclick', this.onCellDblClicked.bind(this));
        }
    };
    GroupCellRenderer.prototype.onAllChildrenCountChanged = function () {
        // maybe if no children now, we should hide the expand / contract icons
        this.showExpandAndContractIcons();
        // if we have no children, this impacts the indent
        this.setIndent();
    };
    GroupCellRenderer.prototype.onKeyDown = function (event) {
        var enterKeyPressed = _.isKeyPressed(event, Constants.KEY_ENTER);
        if (!enterKeyPressed || this.params.suppressEnterExpand) {
            return;
        }
        var cellEditable = this.params.column && this.params.column.isCellEditable(this.params.node);
        if (cellEditable) {
            return;
        }
        event.preventDefault();
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
                if (_.missing(pointer)) {
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
        if (_.missing(this.displayedGroup)) {
            this.displayedGroup = rowNode;
        }
    };
    GroupCellRenderer.prototype.onExpandClicked = function (mouseEvent) {
        if (_.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        // so if we expand a node, it does not also get selected.
        _.stopPropagationForAgGrid(mouseEvent);
        this.onExpandOrContract();
    };
    GroupCellRenderer.prototype.onCellDblClicked = function (mouseEvent) {
        if (_.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        // we want to avoid acting on double click events on the expand / contract icon,
        // as that icons already has expand / collapse functionality on it. otherwise if
        // the icon was double clicked, we would get 'click', 'click', 'dblclick' which
        // is open->close->open, however double click should be open->close only.
        var targetIsExpandIcon = _.isElementInEventPath(this.eExpanded, mouseEvent)
            || _.isElementInEventPath(this.eContracted, mouseEvent);
        if (!targetIsExpandIcon) {
            this.onExpandOrContract();
        }
    };
    GroupCellRenderer.prototype.onExpandOrContract = function () {
        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        var rowNode = this.displayedGroup;
        rowNode.setExpanded(!rowNode.expanded);
    };
    GroupCellRenderer.prototype.isExpandable = function () {
        var rowNode = this.params.node;
        var reducedLeafNode = this.columnController.isPivotMode() && rowNode.leafGroup;
        return this.draggedFromHideOpenParents ||
            (rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode);
    };
    GroupCellRenderer.prototype.showExpandAndContractIcons = function () {
        var rowNode = this.params.node;
        if (this.isExpandable()) {
            // if expandable, show one based on expand state.
            // if we were dragged down, means our parent is always expanded
            var expanded = this.draggedFromHideOpenParents ? true : rowNode.expanded;
            _.setDisplayed(this.eContracted, !expanded);
            _.setDisplayed(this.eExpanded, expanded);
        }
        else {
            // it not expandable, show neither
            _.setDisplayed(this.eExpanded, false);
            _.setDisplayed(this.eContracted, false);
        }
        var displayedGroup = this.displayedGroup;
        // compensation padding for leaf nodes, so there is blank space instead of the expand icon
        var pivotModeAndLeafGroup = this.columnController.isPivotMode() && displayedGroup.leafGroup;
        var notExpandable = !displayedGroup.isExpandable();
        var addLeafIndentClass = displayedGroup.footer || notExpandable || pivotModeAndLeafGroup;
        this.addOrRemoveCssClass('ag-row-group', !addLeafIndentClass);
        this.addOrRemoveCssClass('ag-row-group-leaf-indent', addLeafIndentClass);
    };
    GroupCellRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.innerCellRenderer && this.innerCellRenderer.destroy) {
            this.innerCellRenderer.destroy();
        }
    };
    GroupCellRenderer.prototype.refresh = function () {
        return false;
    };
    GroupCellRenderer.TEMPLATE = '<span class="ag-cell-wrapper">' +
        '<span class="ag-group-expanded" ref="eExpanded"></span>' +
        '<span class="ag-group-contracted" ref="eContracted"></span>' +
        '<span class="ag-group-checkbox ag-invisible" ref="eCheckbox"></span>' +
        '<span class="ag-group-value" ref="eValue"></span>' +
        '<span class="ag-group-child-count" ref="eChildCount"></span>' +
        '</span>';
    __decorate([
        Autowired('gridOptionsWrapper')
    ], GroupCellRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('expressionService')
    ], GroupCellRenderer.prototype, "expressionService", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], GroupCellRenderer.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('columnController')
    ], GroupCellRenderer.prototype, "columnController", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], GroupCellRenderer.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eExpanded')
    ], GroupCellRenderer.prototype, "eExpanded", void 0);
    __decorate([
        RefSelector('eContracted')
    ], GroupCellRenderer.prototype, "eContracted", void 0);
    __decorate([
        RefSelector('eCheckbox')
    ], GroupCellRenderer.prototype, "eCheckbox", void 0);
    __decorate([
        RefSelector('eValue')
    ], GroupCellRenderer.prototype, "eValue", void 0);
    __decorate([
        RefSelector('eChildCount')
    ], GroupCellRenderer.prototype, "eChildCount", void 0);
    return GroupCellRenderer;
}(Component));
export { GroupCellRenderer };
