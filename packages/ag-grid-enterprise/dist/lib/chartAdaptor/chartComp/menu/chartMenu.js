// ag-grid-enterprise v21.0.1
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
var tabbedChartMenu_1 = require("./tabbedChartMenu");
var ChartMenu = /** @class */ (function (_super) {
    __extends(ChartMenu, _super);
    function ChartMenu(chartController) {
        var _this = _super.call(this, ChartMenu.TEMPLATE) || this;
        _this.buttons = {
            chartSettings: ['ag-icon-chart', function () { return _this.showMenu('chartSettings'); }],
            chartData: ['ag-icon-data', function () { return _this.showMenu('chartData'); }],
            chartDownload: ['ag-icon-save', function () { return _this.saveChart(); }]
        };
        _this.tabs = [];
        _this.chartController = chartController;
        return _this;
    }
    ChartMenu.prototype.postConstruct = function () {
        this.createButtons();
    };
    ChartMenu.prototype.getToolbarOptions = function () {
        var _this = this;
        var chartToolbarOptions = ['chartSettings', 'chartData', 'chartDownload'];
        var toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();
        if (toolbarItemsFunc) {
            var params = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                defaultItems: chartToolbarOptions
            };
            chartToolbarOptions = toolbarItemsFunc(params).filter(function (option) {
                if (!_this.buttons[option]) {
                    console.warn("ag-Grid: '" + option + " is not a valid Chart Toolbar Option");
                    return false;
                }
                return true;
            });
        }
        this.tabs = chartToolbarOptions.filter(function (option) { return option !== 'chartDownload'; });
        return chartToolbarOptions;
    };
    ChartMenu.prototype.createButtons = function () {
        var _this = this;
        var chartToolbarOptions = this.getToolbarOptions();
        chartToolbarOptions.forEach(function (button) {
            var buttonConfig = _this.buttons[button];
            var iconCls = buttonConfig[0], callback = buttonConfig[1];
            var buttonEl = document.createElement('span');
            ag_grid_community_1._.addCssClass(buttonEl, 'ag-icon');
            ag_grid_community_1._.addCssClass(buttonEl, iconCls);
            _this.addDestroyableEventListener(buttonEl, 'click', callback);
            _this.getGui().appendChild(buttonEl);
        });
    };
    ChartMenu.prototype.saveChart = function () {
        var event = {
            type: ChartMenu.EVENT_DOWNLOAD_CHART
        };
        this.dispatchEvent(event);
    };
    ChartMenu.prototype.showMenu = function (tabName) {
        var _this = this;
        var chartComp = this.parentComponent;
        var parentGui = chartComp.getGui();
        var parentRect = parentGui.getBoundingClientRect();
        var tab = this.tabs.indexOf(tabName);
        this.menuDialog = new ag_grid_community_1.Dialog({
            alwaysOnTop: true,
            movable: true,
            resizable: {
                bottom: true,
                top: true
            },
            maximizable: false,
            minWidth: 220,
            width: 220,
            height: Math.min(390, parentRect.height),
            x: parentRect.right - 225,
            y: parentRect.top + 5
        });
        this.tabbedMenu = new tabbedChartMenu_1.TabbedChartMenu({
            controller: this.chartController,
            type: chartComp.getCurrentChartType(),
            panels: this.tabs
        });
        new ag_grid_community_1.Promise(function (res) {
            window.setTimeout(function () {
                _this.menuDialog.setBodyComponent(_this.tabbedMenu);
                _this.tabbedMenu.showTab(tab);
            }, 100);
        });
        this.menuDialog.addDestroyableEventListener(this.menuDialog, ag_grid_community_1.Component.EVENT_DESTROYED, function () {
            _this.tabbedMenu.destroy();
        });
        var context = this.getContext();
        context.wireBean(this.menuDialog);
        context.wireBean(this.tabbedMenu);
        this.menuDialog.setParentComponent(this);
    };
    ChartMenu.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.tabbedMenu) {
            this.menuDialog.destroy();
        }
    };
    ChartMenu.EVENT_DOWNLOAD_CHART = 'downloadChart';
    ChartMenu.TEMPLATE = "<div class=\"ag-chart-menu\"></div>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ChartMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartMenu.prototype, "postConstruct", null);
    return ChartMenu;
}(ag_grid_community_1.Component));
exports.ChartMenu = ChartMenu;
