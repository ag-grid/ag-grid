var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { _, AgPanel, AgPromise, Autowired, CHART_TOOL_PANEL_ALLOW_LIST, CHART_TOOL_PANEL_MENU_OPTIONS, CHART_TOOLBAR_ALLOW_LIST, Component, Events, PostConstruct, RefSelector } from "@ag-grid-community/core";
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
        var _this = this;
        this.createButtons();
        this.addManagedListener(this.eventService, Events.EVENT_CHART_CREATED, function (e) {
            var _a;
            if (e.chartId === _this.chartController.getChartId()) {
                var showDefaultToolPanel = Boolean((_a = _this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.defaultToolPanel);
                if (showDefaultToolPanel) {
                    _this.showMenu(_this.defaultPanel, false);
                }
            }
        });
        this.refreshMenuClasses();
        if (!this.gridOptionsService.is('suppressChartToolPanelsButton') && this.panels.length > 0) {
            this.getGui().classList.add('ag-chart-tool-panel-button-enable');
            this.addManagedListener(this.eHideButton, 'click', this.toggleMenu.bind(this));
        }
    };
    ChartMenu.prototype.isVisible = function () {
        return this.menuVisible;
    };
    ChartMenu.prototype.getExtraPaddingDirections = function () {
        var _this = this;
        var topItems = ['chartLink', 'chartUnlink', 'chartDownload'];
        var rightItems = ['chartSettings', 'chartData', 'chartFormat'];
        var result = [];
        if (topItems.some(function (v) { return _this.chartToolbarOptions.includes(v); })) {
            result.push('top');
        }
        if (rightItems.some(function (v) { return _this.chartToolbarOptions.includes(v); })) {
            result.push(this.gridOptionsService.is('enableRtl') ? 'left' : 'right');
        }
        return result;
    };
    ChartMenu.prototype.getToolbarOptions = function () {
        var _this = this;
        var _a, _b, _c;
        var useChartToolPanelCustomisation = Boolean(this.gridOptionsService.get('chartToolPanelsDef'));
        if (useChartToolPanelCustomisation) {
            var defaultChartToolbarOptions = [
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            var toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
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
            var panelsOverride = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.panels) === null || _b === void 0 ? void 0 : _b.map(function (panel) {
                var menuOption = CHART_TOOL_PANEL_MENU_OPTIONS[panel];
                if (!menuOption) {
                    console.warn("AG Grid - invalid panel in chartToolPanelsDef.panels: '" + panel + "'");
                }
                return menuOption;
            }).filter(function (panel) { return Boolean(panel); });
            this.panels = panelsOverride
                ? panelsOverride
                : Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);
            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                this.panels = this.panels.filter(function (panel) { return panel !== 'chartData'; });
            }
            var defaultToolPanel = (_c = this.gridOptionsService.get('chartToolPanelsDef')) === null || _c === void 0 ? void 0 : _c.defaultToolPanel;
            this.defaultPanel = (defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || this.panels[0];
            return this.panels.length > 0
                // Only one panel is required to display menu icon in toolbar
                ? __spreadArray([this.panels[0]], __read(chartToolbarOptions)) : chartToolbarOptions;
        }
        else { // To be deprecated in future. Toolbar options will be different to chart tool panels.
            var tabOptions = [
                'chartSettings',
                'chartData',
                'chartFormat',
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            var toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
            if (toolbarItemsFunc) {
                var isLegacyToolbar_1 = this.gridOptionsService.is('suppressChartToolPanelsButton');
                var params = {
                    defaultItems: isLegacyToolbar_1 ? tabOptions : CHART_TOOLBAR_ALLOW_LIST
                };
                tabOptions = toolbarItemsFunc(params).filter(function (option) {
                    if (!_this.buttons[option]) {
                        console.warn("AG Grid: '" + option + "' is not a valid Chart Toolbar Option");
                        return false;
                    }
                    // If not legacy, remove chart tool panel options here,
                    // and add them all in one go below
                    else if (!isLegacyToolbar_1 && CHART_TOOL_PANEL_ALLOW_LIST.includes(option)) {
                        var msg = "AG Grid: '" + option + "' is a Chart Tool Panel option and will be ignored. Please use 'chartToolPanelsDef.panels' grid option instead";
                        console.warn(msg);
                        return false;
                    }
                    return true;
                });
                if (!isLegacyToolbar_1) {
                    // Add all the chart tool panels, as `chartToolPanelsDef.panels`
                    // should be used for configuration
                    tabOptions = tabOptions.concat(CHART_TOOL_PANEL_ALLOW_LIST);
                }
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
        this.chartToolbarOptions = this.getToolbarOptions();
        var menuEl = this.eMenu;
        this.chartToolbarOptions.forEach(function (button) {
            var buttonConfig = _this.buttons[button];
            var _a = __read(buttonConfig, 2), iconName = _a[0], callback = _a[1];
            var buttonEl = _.createIconNoSpan(iconName, _this.gridOptionsService, undefined, true);
            buttonEl.classList.add('ag-chart-menu-icon');
            var tooltipTitle = _this.chartTranslationService.translate(button + 'ToolbarTooltip');
            if (tooltipTitle && buttonEl instanceof HTMLElement) {
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
        var width = this.environment.chartMenuPanelWidth();
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
                res(menuPanel);
                _this.addManagedListener(_this.eChartContainer, 'click', function (event) {
                    if (_this.getGui().contains(event.target)) {
                        return;
                    }
                    if (_this.menuVisible) {
                        _this.hideMenu();
                    }
                });
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
    ChartMenu.prototype.showMenu = function (
    /**
     * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
     */
    panel, 
    /**
     * Whether to animate the menu opening
     */
    animate) {
        var _this = this;
        if (animate === void 0) { animate = true; }
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }
        if (this.menuPanel && !panel) {
            this.showContainer();
        }
        else {
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
        if (!this.gridOptionsService.is('suppressChartToolPanelsButton')) {
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
        if (this.tabbedMenu && this.tabbedMenu.isAlive()) {
            this.destroyBean(this.tabbedMenu);
        }
    };
    ChartMenu.EVENT_DOWNLOAD_CHART = "downloadChart";
    ChartMenu.TEMPLATE = "<div>\n        <div class=\"ag-chart-menu\" ref=\"eMenu\"></div>\n        <button class=\"ag-button ag-chart-menu-close\" ref=\"eHideButton\">\n            <span class=\"ag-icon ag-icon-contracted\" ref=\"eHideButtonIcon\"></span>\n        </button>\n    </div>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9jaGFydE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFFRCxPQUFPLEVBQ1AsU0FBUyxFQUNULFNBQVMsRUFDVCwyQkFBMkIsRUFDM0IsNkJBQTZCLEVBQzdCLHdCQUF3QixFQUl4QixTQUFTLEVBQ1QsTUFBTSxFQUVOLGFBQWEsRUFDYixXQUFXLEVBRWQsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFVcEQ7SUFBK0IsNkJBQVM7SUFnQ3BDLG1CQUNxQixlQUE0QixFQUM1QixtQkFBZ0MsRUFDaEMsZUFBZ0MsRUFDaEMsbUJBQXdDO1FBSjdELFlBS0ksa0JBQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUM1QjtRQUxvQixxQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUM1Qix5QkFBbUIsR0FBbkIsbUJBQW1CLENBQWE7UUFDaEMscUJBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLHlCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUEvQnJELGFBQU8sR0FBd0I7WUFDbkMsYUFBYSxFQUFFLENBQUMsTUFBTSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztZQUMvRCxTQUFTLEVBQUUsQ0FBQyxNQUFNLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQTFCLENBQTBCLENBQUM7WUFDckQsV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUE1QixD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