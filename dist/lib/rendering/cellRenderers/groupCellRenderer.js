/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var svgFactory_1 = require("../../svgFactory");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var expressionService_1 = require("../../valueService/expressionService");
var eventService_1 = require("../../eventService");
var constants_1 = require("../../constants");
var utils_1 = require("../../utils");
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var rowNode_1 = require("../../entities/rowNode");
var cellRendererService_1 = require("../cellRendererService");
var valueFormatterService_1 = require("../valueFormatterService");
var checkboxSelectionComponent_1 = require("../checkboxSelectionComponent");
var columnController_1 = require("../../columnController/columnController");
var column_1 = require("../../entities/column");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var GroupCellRenderer = (function (_super) {
    __extends(GroupCellRenderer, _super);
    function GroupCellRenderer() {
        return _super.call(this, GroupCellRenderer.TEMPLATE) || this;
    }
    GroupCellRenderer.prototype.init = function (params) {
        this.params = params;
        var embeddedRowMismatch = this.embeddedRowMismatch();
        if (embeddedRowMismatch) {
            return;
        }
        //This allows for empty strings to appear as groups since
        //it will only return for null or undefined.
        if (params.value == null) {
            return;
        }
        this.setupDragOpenParents();
        this.setupComponents();
    };
    GroupCellRenderer.prototype.setupComponents = function () {
        this.addExpandAndContract();
        this.addCheckboxIfNeeded();
        this.addValueElement();
        this.addPadding();
    };
    // if we are doing embedded full width rows, we only show the renderer when
    // in the body, or if pinning in the pinned section, or if pinning and RTL,
    // in the right section. otherwise we would have the cell repeated in each section.
    GroupCellRenderer.prototype.embeddedRowMismatch = function () {
        if (this.gridOptionsWrapper.isEmbedFullWidthRows()) {
            var pinnedLeftCell = this.params.pinned === column_1.Column.PINNED_LEFT;
            var pinnedRightCell = this.params.pinned === column_1.Column.PINNED_RIGHT;
            var bodyCell = !pinnedLeftCell && !pinnedRightCell;
            if (this.gridOptionsWrapper.isEnableRtl()) {
                if (this.columnController.isPinningLeft()) {
                    return !pinnedRightCell;
                }
                else {
                    return !bodyCell;
                }
            }
            else {
                if (this.columnController.isPinningLeft()) {
                    return !pinnedLeftCell;
                }
                else {
                    return !bodyCell;
                }
            }
        }
        else {
            return false;
        }
    };
    GroupCellRenderer.prototype.setPadding = function () {
        if (this.gridOptionsWrapper.isGroupHideOpenParents()) {
            return;
        }
        var params = this.params;
        var rowNode = params.node;
        var paddingPx;
        // never any padding on top level nodes
        if (rowNode.uiLevel <= 0) {
            paddingPx = 0;
        }
        else {
            var paddingFactor = (params.padding >= 0) ? params.padding : 10;
            paddingPx = rowNode.uiLevel * paddingFactor;
            var reducedLeafNode = this.columnController.isPivotMode() && params.node.leafGroup;
            if (rowNode.footer) {
                paddingPx += 15;
            }
            else if (!rowNode.isExpandable() || reducedLeafNode) {
                paddingPx += 10;
            }
        }
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // if doing rtl, padding is on the right
            this.getGui().style.paddingRight = paddingPx + 'px';
        }
        else {
            // otherwise it is on the left
            this.getGui().style.paddingLeft = paddingPx + 'px';
        }
    };
    GroupCellRenderer.prototype.addPadding = function () {
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        var node = this.params.node;
        var suppressPadding = this.params.suppressPadding;
        if (!suppressPadding) {
            this.addDestroyableEventListener(node, rowNode_1.RowNode.EVENT_UI_LEVEL_CHANGED, this.setPadding.bind(this));
            this.setPadding();
        }
    };
    GroupCellRenderer.prototype.addValueElement = function () {
        var params = this.params;
        var rowNode = this.displayedGroup;
        if (params.innerRenderer) {
            this.createFromInnerRenderer();
        }
        else if (rowNode.footer) {
            this.createFooterCell();
        }
        else if (rowNode.group) {
            this.createGroupCell();
            this.addChildCount();
        }
        else {
            this.createLeafCell();
        }
    };
    GroupCellRenderer.prototype.createFromInnerRenderer = function () {
        var innerComponent = this.cellRendererService.useCellRenderer(this.params.innerRenderer, this.eValue, this.params);
        this.addDestroyFunc(function () {
            if (innerComponent && innerComponent.destroy) {
                innerComponent.destroy();
            }
        });
    };
    GroupCellRenderer.prototype.createFooterCell = function () {
        var footerValue;
        var footerValueGetter = this.params.footerValueGetter;
        if (footerValueGetter) {
            // params is same as we were given, except we set the value as the item to display
            var paramsClone = utils_1.Utils.cloneObject(this.params);
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
        var params = this.params;
        var rowGroupColumn = this.displayedGroup.rowGroupColumn;
        // we try and use the cellRenderer of the column used for the grouping if we can
        var columnToUse = rowGroupColumn ? rowGroupColumn : params.column;
        var groupName = this.params.value;
        var valueFormatted = this.valueFormatterService.formatValue(columnToUse, params.node, params.scope, groupName);
        var groupedColCellRenderer = columnToUse.getCellRenderer();
        // reuse the params but change the value
        if (typeof groupedColCellRenderer === 'function') {
            // reuse the params but change the value
            params.value = groupName;
            params.valueFormatted = valueFormatted;
            var colDefOfGroupedCol = columnToUse.getColDef();
            var groupedColCellRendererParams = colDefOfGroupedCol ? colDefOfGroupedCol.cellRendererParams : null;
            // because we are talking about the different column to the original, any user provided params
            // are for the wrong column, so need to copy them in again.
            if (groupedColCellRendererParams) {
                utils_1.Utils.assign(params, groupedColCellRenderer);
            }
            this.cellRendererService.useCellRenderer(colDefOfGroupedCol.cellRenderer, this.eValue, params);
        }
        else {
            var valueToRender = utils_1.Utils.exists(valueFormatted) ? valueFormatted : groupName;
            if (utils_1.Utils.exists(valueToRender) && valueToRender !== '') {
                this.eValue.appendChild(document.createTextNode(valueToRender));
            }
        }
    };
    GroupCellRenderer.prototype.addChildCount = function () {
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (this.params.suppressCount) {
            return;
        }
        this.addDestroyableEventListener(this.displayedGroup, rowNode_1.RowNode.EVENT_ALL_CHILDREN_COUNT_CELL_CHANGED, this.updateChildCount.bind(this));
        // filtering changes the child count, so need to cater for it
        this.updateChildCount();
    };
    GroupCellRenderer.prototype.updateChildCount = function () {
        var allChildrenCount = this.displayedGroup.allChildrenCount;
        this.eChildCount.innerHTML = allChildrenCount >= 0 ? "(" + allChildrenCount + ")" : "";
    };
    GroupCellRenderer.prototype.createLeafCell = function () {
        if (utils_1.Utils.exists(this.params.value)) {
            this.eValue.innerHTML = this.params.value;
        }
    };
    GroupCellRenderer.prototype.isUserWantsSelected = function () {
        var paramsCheckbox = this.params.checkbox;
        if (typeof paramsCheckbox === 'function') {
            return paramsCheckbox(this.params);
        }
        else {
            return paramsCheckbox === true;
        }
    };
    GroupCellRenderer.prototype.addCheckboxIfNeeded = function () {
        var rowNode = this.params.node;
        var checkboxNeeded = this.isUserWantsSelected()
            && !rowNode.footer
            && !rowNode.rowPinned
            && !rowNode.flower;
        if (checkboxNeeded) {
            var cbSelectionComponent_1 = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent_1);
            cbSelectionComponent_1.init({ rowNode: rowNode });
            this.eCheckbox.appendChild(cbSelectionComponent_1.getGui());
            this.addDestroyFunc(function () { return cbSelectionComponent_1.destroy(); });
        }
    };
    GroupCellRenderer.prototype.addExpandAndContract = function () {
        var params = this.params;
        var eGroupCell = params.eGridCell;
        var eExpandedIcon = utils_1.Utils.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createGroupContractedIcon);
        var eContractedIcon = utils_1.Utils.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedIcon);
        this.eExpanded.appendChild(eExpandedIcon);
        this.eContracted.appendChild(eContractedIcon);
        var expandOrContractListener = this.onExpandOrContract.bind(this);
        this.addDestroyableEventListener(this.eExpanded, 'click', expandOrContractListener);
        this.addDestroyableEventListener(this.eContracted, 'click', expandOrContractListener);
        // if editing groups, then double click is to start editing
        if (!this.gridOptionsWrapper.isEnableGroupEdit()) {
            this.addDestroyableEventListener(eGroupCell, 'dblclick', expandOrContractListener);
        }
        // expand / contract as the user hits enter
        this.addDestroyableEventListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(params.node, rowNode_1.RowNode.EVENT_EXPANDED_CHANGED, this.showExpandAndContractIcons.bind(this));
        this.showExpandAndContractIcons();
    };
    GroupCellRenderer.prototype.onKeyDown = function (event) {
        if (utils_1.Utils.isKeyPressed(event, constants_1.Constants.KEY_ENTER)) {
            var cellEditable = this.params.column.isCellEditable(this.params.node);
            if (cellEditable) {
                return;
            }
            event.preventDefault();
            this.onExpandOrContract();
        }
    };
    GroupCellRenderer.prototype.setupDragOpenParents = function () {
        var column = this.params.column;
        var rowNode = this.params.node;
        if (!this.gridOptionsWrapper.isGroupHideOpenParents()) {
            this.draggedFromHideOpenParents = false;
        }
        else if (!rowNode.group) {
            // if we are here, and we are not a group, then we must of been dragged down,
            // as otherwise the cell would be blank, and if cell is blank, this method is never called.
            this.draggedFromHideOpenParents = true;
        }
        else {
            var rowGroupColumn = rowNode.rowGroupColumn;
            // if the displayGroup column for this col matches the rowGroupColumn we grouped by for this node,
            // then nothing was dragged down
            this.draggedFromHideOpenParents = !column.isRowGroupDisplayed(rowGroupColumn.getId());
        }
        if (this.draggedFromHideOpenParents) {
            var pointer = rowNode.parent;
            while (true) {
                if (utils_1.Utils.missing(pointer)) {
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
        if (utils_1.Utils.missing(this.displayedGroup)) {
            this.displayedGroup = rowNode;
        }
    };
    GroupCellRenderer.prototype.onExpandOrContract = function () {
        // must use the displayedGroup, so if data was dragged down, we expand the parent, not this row
        var rowNode = this.displayedGroup;
        rowNode.setExpanded(!rowNode.expanded);
        if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
            this.params.api.redrawRows({ rowNodes: [rowNode] });
        }
    };
    GroupCellRenderer.prototype.showExpandAndContractIcons = function () {
        var rowNode = this.params.node;
        var reducedLeafNode = this.columnController.isPivotMode() && rowNode.leafGroup;
        var expandable = this.draggedFromHideOpenParents || (rowNode.isExpandable() && !rowNode.footer && !reducedLeafNode);
        if (expandable) {
            // if expandable, show one based on expand state.
            // if we were dragged down, means our parent is always expanded
            var expanded = this.draggedFromHideOpenParents ? true : rowNode.expanded;
            utils_1.Utils.setVisible(this.eContracted, !expanded);
            utils_1.Utils.setVisible(this.eExpanded, expanded);
        }
        else {
            // it not expandable, show neither
            utils_1.Utils.setVisible(this.eExpanded, false);
            utils_1.Utils.setVisible(this.eContracted, false);
        }
    };
    GroupCellRenderer.prototype.refresh = function () {
        return false;
    };
    GroupCellRenderer.TEMPLATE = '<span>' +
        '<span class="ag-group-expanded" ref="eExpanded"></span>' +
        '<span class="ag-group-contracted" ref="eContracted"></span>' +
        '<span class="ag-group-checkbox" ref="eCheckbox"></span>' +
        '<span class="ag-group-value" ref="eValue"></span>' +
        '<span class="ag-group-child-count" ref="eChildCount"></span>' +
        '</span>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], GroupCellRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'),
        __metadata("design:type", expressionService_1.ExpressionService)
    ], GroupCellRenderer.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], GroupCellRenderer.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('cellRendererService'),
        __metadata("design:type", cellRendererService_1.CellRendererService)
    ], GroupCellRenderer.prototype, "cellRendererService", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService'),
        __metadata("design:type", valueFormatterService_1.ValueFormatterService)
    ], GroupCellRenderer.prototype, "valueFormatterService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], GroupCellRenderer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], GroupCellRenderer.prototype, "columnController", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eExpanded'),
        __metadata("design:type", HTMLElement)
    ], GroupCellRenderer.prototype, "eExpanded", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContracted'),
        __metadata("design:type", HTMLElement)
    ], GroupCellRenderer.prototype, "eContracted", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCheckbox'),
        __metadata("design:type", HTMLElement)
    ], GroupCellRenderer.prototype, "eCheckbox", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValue'),
        __metadata("design:type", HTMLElement)
    ], GroupCellRenderer.prototype, "eValue", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eChildCount'),
        __metadata("design:type", HTMLElement)
    ], GroupCellRenderer.prototype, "eChildCount", void 0);
    return GroupCellRenderer;
}(component_1.Component));
exports.GroupCellRenderer = GroupCellRenderer;
