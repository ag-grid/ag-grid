// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var toolPanelFilterComp_1 = require("./toolPanelFilterComp");
var FiltersToolPanel = /** @class */ (function (_super) {
    __extends(FiltersToolPanel, _super);
    function FiltersToolPanel() {
        var _this = _super.call(this, FiltersToolPanel.TEMPLATE) || this;
        _this.initialised = false;
        return _this;
    }
    FiltersToolPanel.prototype.init = function () {
        var _this = this;
        this.initialised = true;
        this.eventService.addEventListener('newColumnsLoaded', function () { return _this.onColumnsChanged(); });
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    };
    FiltersToolPanel.prototype.onColumnsChanged = function () {
        var _this = this;
        var eGui = this.getGui();
        ag_grid_community_1._.clearElement(eGui);
        var primaryCols = this.columnController.getAllPrimaryColumns();
        if (!primaryCols) {
            return;
        }
        var primaryColsWithFilter = primaryCols.filter(function (col) { return col.isFilterAllowed(); });
        primaryColsWithFilter.forEach(function (col) { return _this.addColumnComps(col); });
    };
    // we don't support refreshing, but must implement because it's on the tool panel interface
    FiltersToolPanel.prototype.refresh = function () {
    };
    // lazy initialise the panel
    FiltersToolPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init();
        }
    };
    FiltersToolPanel.prototype.addColumnComps = function (column) {
        var toolPanelFilterComp = new toolPanelFilterComp_1.ToolPanelFilterComp();
        this.getContext().wireBean(toolPanelFilterComp);
        toolPanelFilterComp.setColumn(column);
        this.appendChild(toolPanelFilterComp);
    };
    FiltersToolPanel.TEMPLATE = "<div class=\"ag-filter-panel\" ref=\"ePanelContainer\" />";
    __decorate([
        ag_grid_community_1.Autowired("eventService"),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], FiltersToolPanel.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], FiltersToolPanel.prototype, "columnController", void 0);
    return FiltersToolPanel;
}(ag_grid_community_1.Component));
exports.FiltersToolPanel = FiltersToolPanel;
