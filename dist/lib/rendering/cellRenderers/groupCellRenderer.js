/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var svgFactory_1 = require("../../svgFactory");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var expressionService_1 = require("../../expressionService");
var eventService_1 = require("../../eventService");
var constants_1 = require("../../constants");
var utils_1 = require("../../utils");
var events_1 = require("../../events");
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var cellRendererService_1 = require("../cellRendererService");
var valueFormatterService_1 = require("../valueFormatterService");
var checkboxSelectionComponent_1 = require("../checkboxSelectionComponent");
var columnController_1 = require("../../columnController/columnController");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var GroupCellRenderer = (function (_super) {
    __extends(GroupCellRenderer, _super);
    function GroupCellRenderer() {
        _super.call(this, GroupCellRenderer.TEMPLATE);
        this.eExpanded = this.queryForHtmlElement('.ag-group-expanded');
        this.eContracted = this.queryForHtmlElement('.ag-group-contracted');
        this.eCheckbox = this.queryForHtmlElement('.ag-group-checkbox');
        this.eValue = this.queryForHtmlElement('.ag-group-value');
        this.eChildCount = this.queryForHtmlElement('.ag-group-child-count');
    }
    GroupCellRenderer.prototype.init = function (params) {
        this.rowNode = params.node;
        this.rowIndex = params.rowIndex;
        this.gridApi = params.api;
        this.addExpandAndContract(params.eGridCell);
        this.addCheckboxIfNeeded(params);
        this.addValueElement(params);
        this.addPadding(params);
    };
    GroupCellRenderer.prototype.addPadding = function (params) {
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        var node = this.rowNode;
        var suppressPadding = params.suppressPadding;
        if (!suppressPadding && (node.footer || node.level > 0)) {
            var paddingFactor;
            if (params.colDef && params.padding >= 0) {
                paddingFactor = params.padding;
            }
            else {
                paddingFactor = 10;
            }
            var paddingPx = node.level * paddingFactor;
            var reducedLeafNode = this.columnController.isPivotMode() && this.rowNode.leafGroup;
            if (node.footer) {
                paddingPx += 15;
            }
            else if (!node.group || reducedLeafNode) {
                paddingPx += 10;
            }
            this.getGui().style.paddingLeft = paddingPx + 'px';
        }
    };
    GroupCellRenderer.prototype.addValueElement = function (params) {
        if (params.innerRenderer) {
            this.createFromInnerRenderer(params);
        }
        else if (this.rowNode.footer) {
            this.createFooterCell(params);
        }
        else if (this.rowNode.group) {
            this.createGroupCell(params);
            this.addChildCount(params);
        }
        else {
            this.createLeafCell(params);
        }
    };
    GroupCellRenderer.prototype.createFromInnerRenderer = function (params) {
        this.cellRendererService.useCellRenderer(params.innerRenderer, this.eValue, params);
    };
    GroupCellRenderer.prototype.createFooterCell = function (params) {
        var footerValue;
        var groupName = this.getGroupName(params);
        if (params.footerValueGetter) {
            var footerValueGetter = params.footerValueGetter;
            // params is same as we were given, except we set the value as the item to display
            var paramsClone = utils_1.Utils.cloneObject(params);
            paramsClone.value = groupName;
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
            footerValue = 'Total ' + groupName;
        }
        this.eValue.innerHTML = footerValue;
    };
    GroupCellRenderer.prototype.createGroupCell = function (params) {
        // pull out the column that the grouping is on
        var rowGroupColumns = params.columnApi.getRowGroupColumns();
        // if we are using in memory grid grouping, then we try to look up the column that
        // we did the grouping on. however if it is not possible (happens when user provides
        // the data already grouped) then we just the current col, ie use cellrenderer of current col
        var columnOfGroupedCol = rowGroupColumns[params.node.level];
        if (utils_1.Utils.missing(columnOfGroupedCol)) {
            columnOfGroupedCol = params.column;
        }
        var colDefOfGroupedCol = columnOfGroupedCol.getColDef();
        var groupName = this.getGroupName(params);
        var valueFormatted = this.valueFormatterService.formatValue(columnOfGroupedCol, params.node, params.scope, this.rowIndex, groupName);
        // reuse the params but change the value
        if (colDefOfGroupedCol && typeof colDefOfGroupedCol.cellRenderer === 'function') {
            // reuse the params but change the value
            params.value = groupName;
            params.valueFormatted = valueFormatted;
            // because we are talking about the different column to the original, any user provided params
            // are for the wrong column, so need to copy them in again.
            if (colDefOfGroupedCol.cellRendererParams) {
                utils_1.Utils.assign(params, colDefOfGroupedCol.cellRendererParams);
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
    GroupCellRenderer.prototype.addChildCount = function (params) {
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        var suppressCount = params.suppressCount;
        if (!suppressCount && params.node.allChildrenCount >= 0) {
            this.eChildCount.innerHTML = "(" + params.node.allChildrenCount + ")";
        }
    };
    GroupCellRenderer.prototype.getGroupName = function (params) {
        if (params.keyMap && typeof params.keyMap === 'object') {
            var valueFromMap = params.keyMap[params.node.key];
            if (valueFromMap) {
                return valueFromMap;
            }
            else {
                return params.node.key;
            }
        }
        else {
            return params.node.key;
        }
    };
    GroupCellRenderer.prototype.createLeafCell = function (params) {
        if (utils_1.Utils.exists(params.value)) {
            this.eValue.innerHTML = params.value;
        }
    };
    GroupCellRenderer.prototype.addCheckboxIfNeeded = function (params) {
        var checkboxNeeded = params.checkbox && !this.rowNode.footer && !this.rowNode.floating;
        if (checkboxNeeded) {
            var cbSelectionComponent = new checkboxSelectionComponent_1.CheckboxSelectionComponent();
            this.context.wireBean(cbSelectionComponent);
            cbSelectionComponent.init({ rowNode: this.rowNode });
            this.eCheckbox.appendChild(cbSelectionComponent.getGui());
            this.addDestroyFunc(function () { return cbSelectionComponent.destroy(); });
        }
    };
    GroupCellRenderer.prototype.addExpandAndContract = function (eGroupCell) {
        var eExpandedIcon = utils_1.Utils.createIconNoSpan('groupExpanded', this.gridOptionsWrapper, null, svgFactory.createGroupContractedIcon);
        var eContractedIcon = utils_1.Utils.createIconNoSpan('groupContracted', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedIcon);
        this.eExpanded.appendChild(eExpandedIcon);
        this.eContracted.appendChild(eContractedIcon);
        this.addDestroyableEventListener(this.eExpanded, 'click', this.onExpandOrContract.bind(this));
        this.addDestroyableEventListener(this.eContracted, 'click', this.onExpandOrContract.bind(this));
        this.addDestroyableEventListener(eGroupCell, 'dblclick', this.onExpandOrContract.bind(this));
        // expand / contract as the user hits enter
        this.addDestroyableEventListener(eGroupCell, 'keydown', this.onKeyDown.bind(this));
        this.showExpandAndContractIcons();
    };
    GroupCellRenderer.prototype.onKeyDown = function (event) {
        if (utils_1.Utils.isKeyPressed(event, constants_1.Constants.KEY_ENTER)) {
            this.onExpandOrContract();
            event.preventDefault();
        }
    };
    GroupCellRenderer.prototype.onExpandOrContract = function () {
        this.rowNode.expanded = !this.rowNode.expanded;
        var refreshIndex = this.getRefreshFromIndex();
        this.gridApi.onGroupExpandedOrCollapsed(refreshIndex);
        this.showExpandAndContractIcons();
        var event = { node: this.rowNode };
        this.eventService.dispatchEvent(events_1.Events.EVENT_ROW_GROUP_OPENED, event);
    };
    GroupCellRenderer.prototype.showExpandAndContractIcons = function () {
        var reducedLeafNode = this.columnController.isPivotMode() && this.rowNode.leafGroup;
        var expandable = this.rowNode.group && !this.rowNode.footer && !reducedLeafNode;
        if (expandable) {
            // if expandable, show one based on expand state
            utils_1.Utils.setVisible(this.eExpanded, this.rowNode.expanded);
            utils_1.Utils.setVisible(this.eContracted, !this.rowNode.expanded);
        }
        else {
            // it not expandable, show neither
            utils_1.Utils.setVisible(this.eExpanded, false);
            utils_1.Utils.setVisible(this.eContracted, false);
        }
    };
    // if we are showing footers, then opening / closing the group also changes the group
    // row, as the 'summaries' move to and from the header and footer. if not using footers,
    // then we only need to refresh from this row down.
    GroupCellRenderer.prototype.getRefreshFromIndex = function () {
        if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
            return this.rowIndex;
        }
        else {
            return this.rowIndex + 1;
        }
    };
    GroupCellRenderer.TEMPLATE = '<span>' +
        '<span class="ag-group-expanded"></span>' +
        '<span class="ag-group-contracted"></span>' +
        '<span class="ag-group-checkbox"></span>' +
        '<span class="ag-group-value"></span>' +
        '<span class="ag-group-child-count"></span>' +
        '</span>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], GroupCellRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'), 
        __metadata('design:type', expressionService_1.ExpressionService)
    ], GroupCellRenderer.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], GroupCellRenderer.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('cellRendererService'), 
        __metadata('design:type', cellRendererService_1.CellRendererService)
    ], GroupCellRenderer.prototype, "cellRendererService", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService'), 
        __metadata('design:type', valueFormatterService_1.ValueFormatterService)
    ], GroupCellRenderer.prototype, "valueFormatterService", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], GroupCellRenderer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], GroupCellRenderer.prototype, "columnController", void 0);
    return GroupCellRenderer;
})(component_1.Component);
exports.GroupCellRenderer = GroupCellRenderer;
