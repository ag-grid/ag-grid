// ag-grid-enterprise v4.2.7
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
var main_1 = require("ag-grid/main");
var svgFactory = main_1.SvgFactory.getInstance();
var RenderedGroup = (function (_super) {
    __extends(RenderedGroup, _super);
    function RenderedGroup(columnGroup, columnDept, expandedCallback, allowDragging) {
        _super.call(this, RenderedGroup.TEMPLATE);
        this.expanded = true;
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.expandedCallback = expandedCallback;
        this.allowDragging = allowDragging;
    }
    RenderedGroup.prototype.init = function () {
        var eText = this.queryForHtmlElement('#eText');
        this.displayName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        if (main_1.Utils.missing(this.displayName)) {
            this.displayName = '>>';
        }
        eText.innerHTML = this.displayName;
        eText.addEventListener('dblclick', this.onExpandOrContractClicked.bind(this));
        this.setupExpandContract();
        var eIndent = this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';
        this.setOpenClosedIcons();
        if (this.allowDragging) {
            this.addDragSource();
        }
        this.setupVisibleIcons();
        this.addVisibilityListenersToAllChildren();
    };
    RenderedGroup.prototype.addVisibilityListenersToAllChildren = function () {
        var _this = this;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_VISIBLE_CHANGED, _this.setVisibleIcons.bind(_this));
        });
    };
    RenderedGroup.prototype.setupVisibleIcons = function () {
        this.eAllHiddenIcon = this.queryForHtmlElement('.ag-column-hidden-icon');
        this.eAllVisibleIcon = this.queryForHtmlElement('.ag-column-visible-icon');
        this.eHalfVisibleIcon = this.queryForHtmlElement('.ag-column-half-icon');
        this.eAllHiddenIcon.appendChild(svgFactory.createColumnHiddenIcon());
        this.eAllVisibleIcon.appendChild(svgFactory.createColumnVisibleIcon());
        this.eHalfVisibleIcon.appendChild(svgFactory.createColumnIndeterminateIcon());
        this.eAllHiddenIcon.addEventListener('click', this.setChildrenVisible.bind(this, true));
        this.eAllVisibleIcon.addEventListener('click', this.setChildrenVisible.bind(this, false));
        this.eHalfVisibleIcon.addEventListener('click', this.setChildrenVisible.bind(this, true));
        // var columnStateChangedListener = this.onColumnStateChangedListener.bind(this);
        // this.column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        // this.addDestroyFunc( ()=> this.column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener) );
        this.setVisibleIcons();
        // this.setIconVisibility();
    };
    RenderedGroup.prototype.addDragSource = function () {
        var dragSource = {
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: this.columnGroup.getLeafColumns()
        };
        this.dragAndDropService.addDragSource(dragSource);
    };
    RenderedGroup.prototype.setupExpandContract = function () {
        this.eGroupClosedIcon = this.queryForHtmlElement('#eGroupClosedIcon');
        this.eGroupOpenedIcon = this.queryForHtmlElement('#eGroupOpenedIcon');
        this.eGroupClosedIcon.appendChild(main_1.Utils.createIcon('columnSelectClosed', this.gridOptionsWrapper, null, svgFactory.createFolderClosed));
        this.eGroupOpenedIcon.appendChild(main_1.Utils.createIcon('columnSelectOpen', this.gridOptionsWrapper, null, svgFactory.createFolderOpen));
        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
    };
    RenderedGroup.prototype.setChildrenVisible = function (visible) {
        var childColumns = this.columnGroup.getLeafColumns();
        this.columnController.setColumnsVisible(childColumns, visible);
    };
    RenderedGroup.prototype.setVisibleIcons = function () {
        var visibleChildCount = 0;
        var hiddenChildCount = 0;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            if (column.isVisible()) {
                visibleChildCount++;
            }
            else {
                hiddenChildCount++;
            }
        });
        main_1.Utils.setVisible(this.eAllHiddenIcon, visibleChildCount === 0);
        main_1.Utils.setVisible(this.eAllVisibleIcon, hiddenChildCount === 0);
        main_1.Utils.setVisible(this.eHalfVisibleIcon, hiddenChildCount !== 0 && visibleChildCount !== 0);
    };
    RenderedGroup.prototype.onExpandOrContractClicked = function () {
        this.expanded = !this.expanded;
        this.setOpenClosedIcons();
        this.expandedCallback();
    };
    RenderedGroup.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.expanded;
        main_1.Utils.setVisible(this.eGroupClosedIcon, !folderOpen);
        main_1.Utils.setVisible(this.eGroupOpenedIcon, folderOpen);
    };
    RenderedGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    RenderedGroup.TEMPLATE = '<div class="ag-column-select-column-group">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eGroupOpenedIcon" class="ag-column-group-closed-icon"></span>' +
        '    <span id="eGroupClosedIcon" class="ag-column-group-opened-icon"></span>' +
        '    <span class="ag-column-visible-icon"></span>' +
        '    <span class="ag-column-hidden-icon"></span>' +
        '    <span class="ag-column-half-icon"></span>' +
        '  </span>' +
        '  <span id="eText" class="ag-column-select-column-group-label"></span>' +
        '</div>';
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], RenderedGroup.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], RenderedGroup.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('gridPanel'), 
        __metadata('design:type', main_1.GridPanel)
    ], RenderedGroup.prototype, "gridPanel", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'), 
        __metadata('design:type', main_1.DragAndDropService)
    ], RenderedGroup.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedGroup.prototype, "init", null);
    return RenderedGroup;
})(main_1.Component);
exports.RenderedGroup = RenderedGroup;
