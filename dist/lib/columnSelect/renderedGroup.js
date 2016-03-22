// ag-grid-enterprise v4.0.7
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
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var renderedItem_1 = require("./renderedItem");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var svgFactory = main_2.SvgFactory.getInstance();
var RenderedGroup = (function (_super) {
    __extends(RenderedGroup, _super);
    function RenderedGroup(columnGroup, columnDept, expandedCallback) {
        _super.call(this, RenderedGroup.TEMPLATE);
        this.expanded = true;
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.expandedCallback = expandedCallback;
    }
    RenderedGroup.prototype.init = function () {
        var eText = this.queryForHtmlElement('#eText');
        var headerName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        if (main_1.Utils.missing(headerName)) {
            headerName = '>>';
        }
        eText.innerHTML = headerName;
        eText.addEventListener('dblclick', this.onExpandOrContractClicked.bind(this));
        this.setupExpandContract();
        var eIndent = this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';
        this.setIconVisibility();
    };
    RenderedGroup.prototype.setupExpandContract = function () {
        this.eGroupClosedIcon = this.queryForHtmlElement('#eGroupClosedIcon');
        this.eGroupClosedArrow = this.queryForHtmlElement('#eGroupClosedArrow');
        this.eGroupOpenedIcon = this.queryForHtmlElement('#eGroupOpenedIcon');
        this.eGroupOpenedArrow = this.queryForHtmlElement('#eGroupOpenedArrow');
        this.eGroupClosedArrow.appendChild(svgFactory.createSmallArrowRightSvg());
        this.eGroupClosedIcon.appendChild(main_1.Utils.createIcon('columnSelectClosed', this.gridOptionsWrapper, null, svgFactory.createFolderClosed));
        this.eGroupOpenedArrow.appendChild(svgFactory.createSmallArrowDownSvg());
        this.eGroupOpenedIcon.appendChild(main_1.Utils.createIcon('columnSelectOpen', this.gridOptionsWrapper, null, svgFactory.createFolderOpen));
        this.eGroupClosedIcon.addEventListener('click', this.onExpandOrContractClicked.bind(this));
        this.eGroupClosedArrow.addEventListener('click', this.onExpandOrContractClicked.bind(this));
        this.eGroupOpenedIcon.addEventListener('click', this.onExpandOrContractClicked.bind(this));
        this.eGroupOpenedArrow.addEventListener('click', this.onExpandOrContractClicked.bind(this));
    };
    RenderedGroup.prototype.onExpandOrContractClicked = function () {
        this.expanded = !this.expanded;
        this.setIconVisibility();
        this.expandedCallback();
    };
    RenderedGroup.prototype.setIconVisibility = function () {
        var folderOpen = this.expanded;
        main_1.Utils.setVisible(this.eGroupClosedArrow, !folderOpen);
        main_1.Utils.setVisible(this.eGroupClosedIcon, !folderOpen);
        main_1.Utils.setVisible(this.eGroupOpenedArrow, folderOpen);
        main_1.Utils.setVisible(this.eGroupOpenedIcon, folderOpen);
    };
    RenderedGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    RenderedGroup.TEMPLATE = '<div class="ag-column-select-column-group">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-arrows">' +
        '    <span id="eGroupClosedArrow" class="ag-column-group-closed-arrow"></span>' +
        '    <span id="eGroupOpenedArrow" class="ag-column-group-opened-arrow"></span>' +
        '  </span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eGroupOpenedIcon" class="ag-column-group-closed-icon"></span>' +
        '    <span id="eGroupClosedIcon" class="ag-column-group-opened-icon"></span>' +
        '  </span>' +
        '    <span id="eText" class="ag-column-select-column-group-label"></span>' +
        '</div>';
    __decorate([
        main_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_4.GridOptionsWrapper)
    ], RenderedGroup.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_3.Autowired('columnController'), 
        __metadata('design:type', main_5.ColumnController)
    ], RenderedGroup.prototype, "columnController", void 0);
    __decorate([
        main_3.Autowired('gridPanel'), 
        __metadata('design:type', main_6.GridPanel)
    ], RenderedGroup.prototype, "gridPanel", void 0);
    __decorate([
        main_7.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedGroup.prototype, "init", null);
    return RenderedGroup;
})(renderedItem_1.RenderedItem);
exports.RenderedGroup = RenderedGroup;
