"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const tabbedChartMenu_1 = require("./tabbedChartMenu");
class ChartMenu extends core_1.Component {
    constructor(eChartContainer, eMenuPanelContainer, chartController, chartOptionsService) {
        super(ChartMenu.TEMPLATE);
        this.eChartContainer = eChartContainer;
        this.eMenuPanelContainer = eMenuPanelContainer;
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.buttons = {
            chartSettings: ['menu', () => this.showMenu(this.defaultPanel)],
            chartData: ['menu', () => this.showMenu("chartData")],
            chartFormat: ['menu', () => this.showMenu("chartFormat")],
            chartLink: ['linked', e => this.toggleDetached(e)],
            chartUnlink: ['unlinked', e => this.toggleDetached(e)],
            chartDownload: ['save', () => this.saveChart()]
        };
        this.panels = [];
        this.menuVisible = false;
    }
    postConstruct() {
        var _a;
        this.createButtons();
        const showDefaultToolPanel = Boolean((_a = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _a === void 0 ? void 0 : _a.defaultToolPanel);
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
    }
    isVisible() {
        return this.menuVisible;
    }
    getToolbarOptions() {
        var _a, _b, _c;
        const useChartToolPanelCustomisation = Boolean(this.gridOptionsWrapper.getChartToolPanelsDef());
        if (useChartToolPanelCustomisation) {
            const defaultChartToolbarOptions = [
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            const toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();
            const params = {
                defaultItems: defaultChartToolbarOptions
            };
            let chartToolbarOptions = toolbarItemsFunc
                ? toolbarItemsFunc(params).filter(option => {
                    if (!core_1.CHART_TOOLBAR_ALLOW_LIST.includes(option)) {
                        const msg = core_1.CHART_TOOL_PANEL_ALLOW_LIST.includes(option)
                            ? `AG Grid: '${option}' is a Chart Tool Panel option and will be ignored since 'chartToolPanelsDef' is used. Please use 'chartToolPanelsDef.panels' grid option instead`
                            : `AG Grid: '${option}' is not a valid Chart Toolbar Option`;
                        console.warn(msg);
                        return false;
                    }
                    return true;
                })
                : defaultChartToolbarOptions;
            const panelsOverride = (_b = (_a = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _a === void 0 ? void 0 : _a.panels) === null || _b === void 0 ? void 0 : _b.map(panel => {
                const menuOption = core_1.CHART_TOOL_PANEL_MENU_OPTIONS[panel];
                if (!menuOption) {
                    console.warn(`AG Grid - invalid panel in chartToolPanelsDef.panels: '${panel}'`);
                }
                return menuOption;
            }).filter(panel => Boolean(panel));
            this.panels = panelsOverride
                ? panelsOverride
                : Object.values(core_1.CHART_TOOL_PANEL_MENU_OPTIONS);
            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                this.panels = this.panels.filter(panel => panel !== 'chartData');
            }
            const defaultToolPanel = (_c = this.gridOptionsWrapper.getChartToolPanelsDef()) === null || _c === void 0 ? void 0 : _c.defaultToolPanel;
            this.defaultPanel = (defaultToolPanel && core_1.CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || this.panels[0];
            return this.panels.length > 0
                // Only one panel is required to display menu icon in toolbar
                ? [this.panels[0], ...chartToolbarOptions]
                : chartToolbarOptions;
        }
        else { // To be deprecated in future. Toolbar options will be different to chart tool panels.
            let tabOptions = [
                'chartSettings',
                'chartData',
                'chartFormat',
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            const toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();
            if (toolbarItemsFunc) {
                const params = {
                    defaultItems: tabOptions
                };
                tabOptions = toolbarItemsFunc(params).filter(option => {
                    if (!this.buttons[option]) {
                        console.warn(`AG Grid: '${option}' is not a valid Chart Toolbar Option`);
                        return false;
                    }
                    return true;
                });
            }
            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                tabOptions = tabOptions.filter(option => option !== 'chartData');
            }
            const ignoreOptions = ['chartUnlink', 'chartLink', 'chartDownload'];
            this.panels = tabOptions.filter(option => ignoreOptions.indexOf(option) === -1);
            this.defaultPanel = this.panels[0];
            return tabOptions.filter(value => ignoreOptions.indexOf(value) !== -1 ||
                (this.panels.length && value === this.panels[0]));
        }
    }
    toggleDetached(e) {
        const target = e.target;
        const active = target.classList.contains('ag-icon-linked');
        target.classList.toggle('ag-icon-linked', !active);
        target.classList.toggle('ag-icon-unlinked', active);
        const tooltipKey = active ? 'chartUnlinkToolbarTooltip' : 'chartLinkToolbarTooltip';
        const tooltipTitle = this.chartTranslationService.translate(tooltipKey);
        if (tooltipTitle) {
            target.title = tooltipTitle;
        }
        this.chartController.detachChartRange();
    }
    createButtons() {
        const chartToolbarOptions = this.getToolbarOptions();
        const menuEl = this.eMenu;
        chartToolbarOptions.forEach(button => {
            const buttonConfig = this.buttons[button];
            const [iconName, callback] = buttonConfig;
            const buttonEl = core_1._.createIconNoSpan(iconName, this.gridOptionsWrapper, undefined, true);
            buttonEl.classList.add('ag-chart-menu-icon');
            const tooltipTitle = this.chartTranslationService.translate(button + 'ToolbarTooltip');
            if (tooltipTitle) {
                buttonEl.title = tooltipTitle;
            }
            this.addManagedListener(buttonEl, 'click', callback);
            menuEl.appendChild(buttonEl);
        });
    }
    saveChart() {
        const event = { type: ChartMenu.EVENT_DOWNLOAD_CHART };
        this.dispatchEvent(event);
    }
    createMenuPanel(defaultTab) {
        const width = this.gridOptionsWrapper.chartMenuPanelWidth();
        const menuPanel = this.menuPanel = this.createBean(new core_1.AgPanel({
            minWidth: width,
            width,
            height: '100%',
            closable: true,
            hideTitleBar: true,
            cssIdentifier: 'chart-menu'
        }));
        menuPanel.setParentComponent(this);
        this.eMenuPanelContainer.appendChild(menuPanel.getGui());
        this.tabbedMenu = this.createBean(new tabbedChartMenu_1.TabbedChartMenu({
            controller: this.chartController,
            type: this.chartController.getChartType(),
            panels: this.panels,
            chartOptionsService: this.chartOptionsService
        }));
        this.addManagedListener(menuPanel, core_1.Component.EVENT_DESTROYED, () => this.destroyBean(this.tabbedMenu));
        return new core_1.AgPromise((res) => {
            window.setTimeout(() => {
                menuPanel.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(defaultTab);
                this.addManagedListener(this.eChartContainer, 'click', (event) => {
                    if (this.getGui().contains(event.target)) {
                        return;
                    }
                    if (this.menuVisible) {
                        this.hideMenu();
                    }
                });
                res(menuPanel);
            }, 100);
        });
    }
    showContainer() {
        if (!this.menuPanel) {
            return;
        }
        this.menuVisible = true;
        this.showParent(this.menuPanel.getWidth());
        this.refreshMenuClasses();
    }
    toggleMenu() {
        this.menuVisible ? this.hideMenu() : this.showMenu();
    }
    showMenu(panel, animate = true) {
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }
        const menuPanel = panel || this.defaultPanel;
        let tab = this.panels.indexOf(menuPanel);
        if (tab < 0) {
            console.warn(`AG Grid: '${panel}' is not a valid Chart Tool Panel name`);
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
            setTimeout(() => {
                if (!this.isAlive()) {
                    return;
                }
                this.eMenuPanelContainer.classList.remove('ag-no-transition');
            }, 500);
        }
    }
    hideMenu() {
        this.hideParent();
        window.setTimeout(() => {
            this.menuVisible = false;
            this.refreshMenuClasses();
        }, 500);
    }
    refreshMenuClasses() {
        this.eChartContainer.classList.toggle('ag-chart-menu-visible', this.menuVisible);
        this.eChartContainer.classList.toggle('ag-chart-menu-hidden', !this.menuVisible);
        if (this.gridOptionsWrapper.isEnableChartToolPanelsButton()) {
            this.eHideButtonIcon.classList.toggle('ag-icon-contracted', this.menuVisible);
            this.eHideButtonIcon.classList.toggle('ag-icon-expanded', !this.menuVisible);
        }
    }
    showParent(width) {
        this.eMenuPanelContainer.style.minWidth = `${width}px`;
    }
    hideParent() {
        this.eMenuPanelContainer.style.minWidth = '0';
    }
    destroy() {
        super.destroy();
        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.destroyBean(this.menuPanel);
        }
    }
}
ChartMenu.EVENT_DOWNLOAD_CHART = "downloadChart";
ChartMenu.TEMPLATE = `<div>
        <div class="ag-chart-menu" ref="eMenu"></div>
        <button class="ag-chart-menu-close" ref="eHideButton">
            <span class="ag-icon ag-icon-contracted" ref="eHideButtonIcon"></span>
        </button>
    </div>`;
__decorate([
    core_1.Autowired('chartTranslationService')
], ChartMenu.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.RefSelector("eMenu")
], ChartMenu.prototype, "eMenu", void 0);
__decorate([
    core_1.RefSelector("eHideButton")
], ChartMenu.prototype, "eHideButton", void 0);
__decorate([
    core_1.RefSelector("eHideButtonIcon")
], ChartMenu.prototype, "eHideButtonIcon", void 0);
__decorate([
    core_1.PostConstruct
], ChartMenu.prototype, "postConstruct", null);
exports.ChartMenu = ChartMenu;
