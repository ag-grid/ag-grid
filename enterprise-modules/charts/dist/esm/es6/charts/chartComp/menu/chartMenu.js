var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgPanel, AgPromise, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { TabbedChartMenu } from "./tabbedChartMenu";
export class ChartMenu extends Component {
    constructor(eChartContainer, eMenuPanelContainer, chartController, chartOptionsService) {
        super(ChartMenu.TEMPLATE);
        this.eChartContainer = eChartContainer;
        this.eMenuPanelContainer = eMenuPanelContainer;
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.buttons = {
            chartSettings: ['menu', () => this.showMenu("chartSettings")],
            chartData: ['menu', () => this.showMenu("chartData")],
            chartFormat: ['menu', () => this.showMenu("chartFormat")],
            chartLink: ['linked', e => this.toggleDetached(e)],
            chartUnlink: ['unlinked', e => this.toggleDetached(e)],
            chartDownload: ['save', () => this.saveChart()]
        };
        this.tabs = [];
        this.menuVisible = false;
    }
    postConstruct() {
        this.createButtons();
        this.refreshMenuClasses();
        // TODO requires a better solution as this causes the docs the 'jump' when pages are reloaded
        // this.addManagedListener(this.eventService, Events.EVENT_CHART_CREATED, (e: ChartCreated) => {
        //     // creating settings panel ahead of time to prevent an undesirable 'jitter' when the canvas resizes
        //     // caused as a result of scrollIntoView() when the selected chart type is scrolled into view
        //     if (e.chartId === this.chartController.getChartId()) {
        //         this.createMenuPanel(0);
        //     }
        // });
    }
    isVisible() {
        return this.menuVisible;
    }
    getToolbarOptions() {
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
                    console.warn(`AG Grid: '${option} is not a valid Chart Toolbar Option`);
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
        this.tabs = tabOptions.filter(option => ignoreOptions.indexOf(option) === -1);
        return tabOptions.filter(value => ignoreOptions.indexOf(value) !== -1 ||
            (this.tabs.length && value === this.tabs[0]));
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
        const gui = this.getGui();
        chartToolbarOptions.forEach(button => {
            const buttonConfig = this.buttons[button];
            const [iconName, callback] = buttonConfig;
            const buttonEl = _.createIconNoSpan(iconName, this.gridOptionsWrapper, undefined, true);
            buttonEl.classList.add('ag-chart-menu-icon');
            const tooltipTitle = this.chartTranslationService.translate(button + 'ToolbarTooltip');
            if (tooltipTitle) {
                buttonEl.title = tooltipTitle;
            }
            this.addManagedListener(buttonEl, 'click', callback);
            gui.appendChild(buttonEl);
        });
    }
    saveChart() {
        const event = { type: ChartMenu.EVENT_DOWNLOAD_CHART };
        this.dispatchEvent(event);
    }
    createMenuPanel(defaultTab) {
        const width = this.gridOptionsWrapper.chartMenuPanelWidth();
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
            panels: this.tabs,
            chartOptionsService: this.chartOptionsService
        }));
        this.addManagedListener(menuPanel, Component.EVENT_DESTROYED, () => this.destroyBean(this.tabbedMenu));
        return new AgPromise((res) => {
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
    showMenu(tabName) {
        const tab = this.tabs.indexOf(tabName);
        if (!this.menuPanel) {
            this.createMenuPanel(tab).then(this.showContainer.bind(this));
        }
        else {
            this.showContainer();
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
ChartMenu.TEMPLATE = `<div class="ag-chart-menu"></div>`;
__decorate([
    Autowired('chartTranslationService')
], ChartMenu.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], ChartMenu.prototype, "postConstruct", null);
