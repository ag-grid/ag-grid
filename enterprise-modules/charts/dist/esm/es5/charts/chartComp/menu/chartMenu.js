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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { _, AgPanel, AgPromise, Autowired, Component, PostConstruct, RefSelector, CHART_TOOL_PANEL_MENU_OPTIONS, CHART_TOOLBAR_ALLOW_LIST, CHART_TOOL_PANEL_ALLOW_LIST } from "@ag-grid-community/core";
import { TabbedChartMenu } from "./tabbedChartMenu";
var ChartMenu = /** @class */ (function (_super) {
    __extends(ChartMenu, _super);
    function ChartMenu(eChartContainer, eMenuPanelContainer, chartController, chartOptionsService) {
        var _this = _super.call(this, ChartMenu.TEMPLATE) || this;
        _this.eChartContainer = eChartContainer;
        _this.eMenuPanelContainer = eMenuPanelContainer;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.buttons = {
            chartSettings: ['menu', function () { return _this.showMenu(_this.defaultPanel); }],
            chartData: ['menu', function () { return _this.showMenu("chartData"); }],
            chartFormat: ['menu', function () { return _this.showMenu("chartFormat"); }],
            chartLink: ['linked', function (e) { return _this.toggleDetached(e); }],
            chartUnlink: ['unlinked', function (e) { return _this.toggleDetached(e); }],
            chartDownload: ['save', function () { return _this.saveChart(); }]
        };
        _this.panels = [];
        _this.menuVisible = false;
        return _this;
    }
    ChartMenu.prototype.postConstruct = function () {
        var _a;
        this.createButtons();
        var showDefaultToolPanel = Boolean((_a = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _a === void 0 ? void 0 : _a.defaultToolPanel);
        if (showDefaultToolPanel) {
            this.showMenu(this.defaultPanel, false);
        }
        this.refreshMenuClasses();
        // TODO requires a better solution as this causes the docs the 'jump' when pages are reloaded
        // this.addManagedListener(this.eventService, Events.EVENT_CHART_CREATED, (e: ChartCreated) => {
        //     // creating settings panel ahead of time to prevent an undesirable 'jitter' when the canvas resizes
        //     // caused as a result of scrollIntoView() when the selected chart type is scrolled into view
        //     if (e.chartId === this.chartController.getChartId()) {
        //         this.createMenuPanel(0);
        //     }
        // });
        if (this.gridOptionsWrapper.isEnableChartToolPanelsButton()) {
            this.getGui().classList.add('ag-chart-tool-panel-button-enable');
            this.addManagedListener(this.eHideButton, 'click', this.toggleMenu.bind(this));
        }
    };
    ChartMenu.prototype.isVisible = function () {
        return this.menuVisible;
    };
    ChartMenu.prototype.getToolbarOptions = function () {
        var _this = this;
        var _a, _b;
        var useChartToolPanelCustomisation = Boolean(this.gridOptionsWrapper.getChartToolPanelsDef());
        if (useChartToolPanelCustomisation) {
            var defaultChartToolbarOptions = [
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            var toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();
            var params = {
                defaultItems: defaultChartToolbarOptions
            };
            var chartToolbarOptions = toolbarItemsFunc
                ? toolbarItemsFunc(params).filter(function (option) {
                    if (!CHART_TOOLBAR_ALLOW_LIST.includes(option)) {
                        var msg = CHART_TOOL_PANEL_ALLOW_LIST.includes(option)
                            ? "AG Grid: '" + option + "' is a Chart Tool Panel option and will be ignored since 'chartToolPanelsDef' is used. Please use 'chartToolPanelsDef.panels' grid option instead"
                            : "AG Grid: '" + option + "' is not a valid Chart Toolbar Option";
                        console.warn(msg);
                        return false;
                    }
                    return true;
                })
                : defaultChartToolbarOptions;
            var panelsOverride = (_a = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _a === void 0 ? void 0 : _a.panels;
            this.panels = panelsOverride
                ? panelsOverride.map(function (panel) { return CHART_TOOL_PANEL_MENU_OPTIONS[panel]; })
                : Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);
            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                this.panels = this.panels.filter(function (panel) { return panel !== 'chartData'; });
            }
            var defaultToolPanel = (_b = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _b === void 0 ? void 0 : _b.defaultToolPanel;
            this.defaultPanel = (defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || this.panels[0];
            return this.panels.length > 0
                // Only one panel is required to display menu icon in toolbar
                ? __spread([this.panels[0]], chartToolbarOptions) : chartToolbarOptions;
        }
        else { // To be deprecated in future. Toolbar options will be different to chart tool panels.
            var tabOptions = [
                'chartSettings',
                'chartData',
                'chartFormat',
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            var toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();
            if (toolbarItemsFunc) {
                var params = {
                    defaultItems: tabOptions
                };
                tabOptions = toolbarItemsFunc(params).filter(function (option) {
                    if (!_this.buttons[option]) {
                        console.warn("AG Grid: '" + option + "' is not a valid Chart Toolbar Option");
                        return false;
                    }
                    return true;
                });
            }
            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                tabOptions = tabOptions.filter(function (option) { return option !== 'chartData'; });
            }
            var ignoreOptions_1 = ['chartUnlink', 'chartLink', 'chartDownload'];
            this.panels = tabOptions.filter(function (option) { return ignoreOptions_1.indexOf(option) === -1; });
            this.defaultPanel = this.panels[0];
            return tabOptions.filter(function (value) {
                return ignoreOptions_1.indexOf(value) !== -1 ||
                    (_this.panels.length && value === _this.panels[0]);
            });
        }
    };
    ChartMenu.prototype.toggleDetached = function (e) {
        var target = e.target;
        var active = target.classList.contains('ag-icon-linked');
        target.classList.toggle('ag-icon-linked', !active);
        target.classList.toggle('ag-icon-unlinked', active);
        var tooltipKey = active ? 'chartUnlinkToolbarTooltip' : 'chartLinkToolbarTooltip';
        var tooltipTitle = this.chartTranslationService.translate(tooltipKey);
        if (tooltipTitle) {
            target.title = tooltipTitle;
        }
        this.chartController.detachChartRange();
    };
    ChartMenu.prototype.createButtons = function () {
        var _this = this;
        var chartToolbarOptions = this.getToolbarOptions();
        var menuEl = this.eMenu;
        chartToolbarOptions.forEach(function (button) {
            var buttonConfig = _this.buttons[button];
            var _a = __read(buttonConfig, 2), iconName = _a[0], callback = _a[1];
            var buttonEl = _.createIconNoSpan(iconName, _this.gridOptionsWrapper, undefined, true);
            buttonEl.classList.add('ag-chart-menu-icon');
            var tooltipTitle = _this.chartTranslationService.translate(button + 'ToolbarTooltip');
            if (tooltipTitle) {
                buttonEl.title = tooltipTitle;
            }
            _this.addManagedListener(buttonEl, 'click', callback);
            menuEl.appendChild(buttonEl);
        });
    };
    ChartMenu.prototype.saveChart = function () {
        var event = { type: ChartMenu.EVENT_DOWNLOAD_CHART };
        this.dispatchEvent(event);
    };
    ChartMenu.prototype.createMenuPanel = function (defaultTab) {
        var _this = this;
        var width = this.gridOptionsWrapper.chartMenuPanelWidth();
        var menuPanel = this.menuPanel = this.createBean(new AgPanel({
            minWidth: width,
            width: width,
            height: '100%',
            closable: true,
            hideTitleBar: true,
            cssIdentifier: 'chart-menu'
        }));
        menuPanel.setParentComponent(this);
        this.eMenuPanelContainer.appendChild(menuPanel.getGui());
        this.tabbedMenu = this.createBean(new TabbedChartMenu({
            controller: this.chartController,
            type: this.chartController.getChartType(),
            panels: this.panels,
            chartOptionsService: this.chartOptionsService
        }));
        this.addManagedListener(menuPanel, Component.EVENT_DESTROYED, function () { return _this.destroyBean(_this.tabbedMenu); });
        return new AgPromise(function (res) {
            window.setTimeout(function () {
                menuPanel.setBodyComponent(_this.tabbedMenu);
                _this.tabbedMenu.showTab(defaultTab);
                _this.addManagedListener(_this.eChartContainer, 'click', function (event) {
                    if (_this.getGui().contains(event.target)) {
                        return;
                    }
                    if (_this.menuVisible) {
                        _this.hideMenu();
                    }
                });
                res(menuPanel);
            }, 100);
        });
    };
    ChartMenu.prototype.showContainer = function () {
        if (!this.menuPanel) {
            return;
        }
        this.menuVisible = true;
        this.showParent(this.menuPanel.getWidth());
        this.refreshMenuClasses();
    };
    ChartMenu.prototype.toggleMenu = function () {
        this.menuVisible ? this.hideMenu() : this.showMenu();
    };
    ChartMenu.prototype.showMenu = function (panel, animate) {
        var _this = this;
        if (animate === void 0) { animate = true; }
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }
        var menuPanel = panel || this.defaultPanel;
        var tab = this.panels.indexOf(menuPanel);
        if (tab < 0) {
            console.warn("AG Grid: '" + panel + "' is not a valid Chart Tool Panel name");
            tab = this.panels.indexOf(this.defaultPanel);
        }
        if (this.menuPanel) {
            this.tabbedMenu.showTab(tab);
            this.showContainer();
        }
        else {
            this.createMenuPanel(tab).then(this.showContainer.bind(this));
        }
        if (!animate) {
            // Wait for menu to render
            setTimeout(function () {
                if (!_this.isAlive()) {
                    return;
                }
                _this.eMenuPanelContainer.classList.remove('ag-no-transition');
            }, 500);
        }
    };
    ChartMenu.prototype.hideMenu = function () {
        var _this = this;
        this.hideParent();
        window.setTimeout(function () {
            _this.menuVisible = false;
            _this.refreshMenuClasses();
        }, 500);
    };
    ChartMenu.prototype.refreshMenuClasses = function () {
        this.eChartContainer.classList.toggle('ag-chart-menu-visible', this.menuVisible);
        this.eChartContainer.classList.toggle('ag-chart-menu-hidden', !this.menuVisible);
        if (this.gridOptionsWrapper.isEnableChartToolPanelsButton()) {
            this.eHideButtonIcon.classList.toggle('ag-icon-contracted', this.menuVisible);
            this.eHideButtonIcon.classList.toggle('ag-icon-expanded', !this.menuVisible);
        }
    };
    ChartMenu.prototype.showParent = function (width) {
        this.eMenuPanelContainer.style.minWidth = width + "px";
    };
    ChartMenu.prototype.hideParent = function () {
        this.eMenuPanelContainer.style.minWidth = '0';
    };
    ChartMenu.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.destroyBean(this.menuPanel);
        }
    };
    ChartMenu.EVENT_DOWNLOAD_CHART = "downloadChart";
    ChartMenu.TEMPLATE = "<div>\n        <div class=\"ag-chart-menu\" ref=\"eMenu\"></div>\n        <button class=\"ag-chart-menu-close\" ref=\"eHideButton\">\n            <span class=\"ag-icon ag-icon-contracted\" ref=\"eHideButtonIcon\"></span>\n        </button>\n    </div>";
    __decorate([
        Autowired('chartTranslationService')
    ], ChartMenu.prototype, "chartTranslationService", void 0);
    __decorate([
        RefSelector("eMenu")
    ], ChartMenu.prototype, "eMenu", void 0);
    __decorate([
        RefSelector("eHideButton")
    ], ChartMenu.prototype, "eHideButton", void 0);
    __decorate([
        RefSelector("eHideButtonIcon")
    ], ChartMenu.prototype, "eHideButtonIcon", void 0);
    __decorate([
        PostConstruct
    ], ChartMenu.prototype, "postConstruct", null);
    return ChartMenu;
}(Component));
export { ChartMenu };
