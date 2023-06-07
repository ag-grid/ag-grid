var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgPanel, AgPromise, Autowired, CHART_TOOL_PANEL_ALLOW_LIST, CHART_TOOL_PANEL_MENU_OPTIONS, CHART_TOOLBAR_ALLOW_LIST, Component, Events, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";
export class ChartMenu extends Component {
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
        this.buttonListenersDestroyFuncs = [];
        this.menuVisible = false;
    }
    postConstruct() {
        this.createButtons();
        this.addManagedListener(this.eventService, Events.EVENT_CHART_CREATED, (e) => {
            var _a;
            if (e.chartId === this.chartController.getChartId()) {
                const showDefaultToolPanel = Boolean((_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.defaultToolPanel);
                if (showDefaultToolPanel) {
                    this.showMenu(this.defaultPanel, false);
                }
            }
        });
        this.refreshMenuClasses();
        if (!this.gridOptionsService.is('suppressChartToolPanelsButton') && this.panels.length > 0) {
            this.getGui().classList.add('ag-chart-tool-panel-button-enable');
            this.addManagedListener(this.eHideButton, 'click', this.toggleMenu.bind(this));
        }
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.createButtons.bind(this));
    }
    isVisible() {
        return this.menuVisible;
    }
    getExtraPaddingDirections() {
        const topItems = ['chartLink', 'chartUnlink', 'chartDownload'];
        const rightItems = ['chartSettings', 'chartData', 'chartFormat'];
        const result = [];
        if (topItems.some(v => this.chartToolbarOptions.includes(v))) {
            result.push('top');
        }
        if (rightItems.some(v => this.chartToolbarOptions.includes(v))) {
            result.push(this.gridOptionsService.is('enableRtl') ? 'left' : 'right');
        }
        return result;
    }
    getToolbarOptions() {
        var _a, _b, _c;
        const useChartToolPanelCustomisation = Boolean(this.gridOptionsService.get('chartToolPanelsDef'));
        if (useChartToolPanelCustomisation) {
            const defaultChartToolbarOptions = [
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
            const toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
            const params = {
                defaultItems: defaultChartToolbarOptions
            };
            let chartToolbarOptions = toolbarItemsFunc
                ? toolbarItemsFunc(params).filter(option => {
                    if (!CHART_TOOLBAR_ALLOW_LIST.includes(option)) {
                        const msg = CHART_TOOL_PANEL_ALLOW_LIST.includes(option)
                            ? `AG Grid: '${option}' is a Chart Tool Panel option and will be ignored since 'chartToolPanelsDef' is used. Please use 'chartToolPanelsDef.panels' grid option instead`
                            : `AG Grid: '${option}' is not a valid Chart Toolbar Option`;
                        console.warn(msg);
                        return false;
                    }
                    return true;
                })
                : defaultChartToolbarOptions;
            const panelsOverride = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.panels) === null || _b === void 0 ? void 0 : _b.map(panel => {
                const menuOption = CHART_TOOL_PANEL_MENU_OPTIONS[panel];
                if (!menuOption) {
                    console.warn(`AG Grid - invalid panel in chartToolPanelsDef.panels: '${panel}'`);
                }
                return menuOption;
            }).filter(panel => Boolean(panel));
            this.panels = panelsOverride
                ? panelsOverride
                : Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);
            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                this.panels = this.panels.filter(panel => panel !== 'chartData');
            }
            const defaultToolPanel = (_c = this.gridOptionsService.get('chartToolPanelsDef')) === null || _c === void 0 ? void 0 : _c.defaultToolPanel;
            this.defaultPanel = (defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || this.panels[0];
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
            const toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
            if (toolbarItemsFunc) {
                const isLegacyToolbar = this.gridOptionsService.is('suppressChartToolPanelsButton');
                const params = {
                    defaultItems: isLegacyToolbar ? tabOptions : CHART_TOOLBAR_ALLOW_LIST
                };
                tabOptions = toolbarItemsFunc(params).filter(option => {
                    if (!this.buttons[option]) {
                        console.warn(`AG Grid: '${option}' is not a valid Chart Toolbar Option`);
                        return false;
                    }
                    // If not legacy, remove chart tool panel options here,
                    // and add them all in one go below
                    else if (!isLegacyToolbar && CHART_TOOL_PANEL_ALLOW_LIST.includes(option)) {
                        const msg = `AG Grid: '${option}' is a Chart Tool Panel option and will be ignored. Please use 'chartToolPanelsDef.panels' grid option instead`;
                        console.warn(msg);
                        return false;
                    }
                    return true;
                });
                if (!isLegacyToolbar) {
                    // Add all the chart tool panels, as `chartToolPanelsDef.panels`
                    // should be used for configuration
                    tabOptions = tabOptions.concat(CHART_TOOL_PANEL_ALLOW_LIST);
                }
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
        this.buttonListenersDestroyFuncs.forEach(func => func());
        this.buttonListenersDestroyFuncs = [];
        this.chartToolbarOptions = this.getToolbarOptions();
        const menuEl = this.eMenu;
        _.clearElement(menuEl);
        this.chartToolbarOptions.forEach(button => {
            const buttonConfig = this.buttons[button];
            const [iconName, callback] = buttonConfig;
            const buttonEl = _.createIconNoSpan(iconName, this.gridOptionsService, undefined, true);
            buttonEl.classList.add('ag-chart-menu-icon');
            const tooltipTitle = this.chartTranslationService.translate(button + 'ToolbarTooltip');
            if (tooltipTitle && buttonEl instanceof HTMLElement) {
                buttonEl.title = tooltipTitle;
            }
            this.buttonListenersDestroyFuncs.push(this.addManagedListener(buttonEl, 'click', callback));
            menuEl.appendChild(buttonEl);
        });
    }
    saveChart() {
        const event = { type: ChartMenu.EVENT_DOWNLOAD_CHART };
        this.dispatchEvent(event);
    }
    createMenuPanel(defaultTab) {
        const width = this.environment.chartMenuPanelWidth();
        const menuPanel = this.menuPanel = this.createBean(new AgPanel({
            minWidth: width,
            width,
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
        this.addManagedListener(menuPanel, Component.EVENT_DESTROYED, () => this.destroyBean(this.tabbedMenu));
        return new AgPromise((res) => {
            window.setTimeout(() => {
                menuPanel.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(defaultTab);
                res(menuPanel);
                this.addManagedListener(this.eChartContainer, 'click', (event) => {
                    if (this.getGui().contains(event.target)) {
                        return;
                    }
                    if (this.menuVisible) {
                        this.hideMenu();
                    }
                });
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
    showMenu(
    /**
     * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
     */
    panel, 
    /**
     * Whether to animate the menu opening
     */
    animate = true) {
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }
        if (this.menuPanel && !panel) {
            this.showContainer();
        }
        else {
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
        if (!this.gridOptionsService.is('suppressChartToolPanelsButton')) {
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
        if (this.tabbedMenu && this.tabbedMenu.isAlive()) {
            this.destroyBean(this.tabbedMenu);
        }
    }
}
ChartMenu.EVENT_DOWNLOAD_CHART = "downloadChart";
ChartMenu.TEMPLATE = `<div>
        <div class="ag-chart-menu" ref="eMenu"></div>
        <button class="ag-button ag-chart-menu-close" ref="eHideButton">
            <span class="ag-icon ag-icon-contracted" ref="eHideButtonIcon"></span>
        </button>
    </div>`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9jaGFydE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFFRCxPQUFPLEVBQ1AsU0FBUyxFQUNULFNBQVMsRUFDVCwyQkFBMkIsRUFDM0IsNkJBQTZCLEVBQzdCLHdCQUF3QixFQUl4QixTQUFTLEVBQ1QsTUFBTSxFQUVOLGFBQWEsRUFDYixXQUFXLEVBRWQsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBU3JELE1BQU0sT0FBTyxTQUFVLFNBQVEsU0FBUztJQWlDcEMsWUFDcUIsZUFBNEIsRUFDNUIsbUJBQWdDLEVBQ2hDLGVBQWdDLEVBQ2hDLG1CQUF3QztRQUN6RCxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBSlQsb0JBQWUsR0FBZixlQUFlLENBQWE7UUFDNUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFhO1FBQ2hDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBaENyRCxZQUFPLEdBQXdCO1lBQ25DLGFBQWEsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvRCxTQUFTLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyRCxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMs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