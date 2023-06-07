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
import { ChartController } from "../chartController";
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
        _this.buttonListenersDestroyFuncs = [];
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.createButtons.bind(this));
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
        this.buttonListenersDestroyFuncs.forEach(function (func) { return func(); });
        this.buttonListenersDestroyFuncs = [];
        this.chartToolbarOptions = this.getToolbarOptions();
        var menuEl = this.eMenu;
        _.clearElement(menuEl);
        this.chartToolbarOptions.forEach(function (button) {
            var buttonConfig = _this.buttons[button];
            var _a = __read(buttonConfig, 2), iconName = _a[0], callback = _a[1];
            var buttonEl = _.createIconNoSpan(iconName, _this.gridOptionsService, undefined, true);
            buttonEl.classList.add('ag-chart-menu-icon');
            var tooltipTitle = _this.chartTranslationService.translate(button + 'ToolbarTooltip');
            if (tooltipTitle && buttonEl instanceof HTMLElement) {
                buttonEl.title = tooltipTitle;
            }
            _this.buttonListenersDestroyFuncs.push(_this.addManagedListener(buttonEl, 'click', callback));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9jaGFydE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFFRCxPQUFPLEVBQ1AsU0FBUyxFQUNULFNBQVMsRUFDVCwyQkFBMkIsRUFDM0IsNkJBQTZCLEVBQzdCLHdCQUF3QixFQUl4QixTQUFTLEVBQ1QsTUFBTSxFQUVOLGFBQWEsRUFDYixXQUFXLEVBRWQsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBU3JEO0lBQStCLDZCQUFTO0lBaUNwQyxtQkFDcUIsZUFBNEIsRUFDNUIsbUJBQWdDLEVBQ2hDLGVBQWdDLEVBQ2hDLG1CQUF3QztRQUo3RCxZQUtJLGtCQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FDNUI7UUFMb0IscUJBQWUsR0FBZixlQUFlLENBQWE7UUFDNUIseUJBQW1CLEdBQW5CLG1CQUFtQixDQUFhO1FBQ2hDLHFCQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyx5QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBaENyRCxhQUFPLEdBQXdCO1lBQ25DLGFBQWEsRUFBRSxDQUFDLE1BQU0sRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLEVBQWhDLENBQWdDLENBQUM7WUFDL0QsU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUExQixDQUEwQixDQUFDO1lBQ3JELFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFBRSxjQUFN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