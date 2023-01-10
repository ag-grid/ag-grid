"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabbedChartMenu = void 0;
const core_1 = require("@ag-grid-community/core");
const chartDataPanel_1 = require("./data/chartDataPanel");
const formatPanel_1 = require("./format/formatPanel");
const chartSettingsPanel_1 = require("./settings/chartSettingsPanel");
class TabbedChartMenu extends core_1.Component {
    constructor(params) {
        super();
        this.tabs = [];
        const { controller, panels, chartOptionsService } = params;
        this.chartController = controller;
        this.chartOptionsService = chartOptionsService;
        this.panels = panels;
    }
    init() {
        this.panels.forEach(panel => {
            const panelType = panel.replace('chart', '').toLowerCase();
            const { comp, tab } = this.createTab(panel, panelType, this.getPanelClass(panelType));
            this.tabs.push(tab);
            this.addDestroyFunc(() => this.destroyBean(comp));
        });
        this.tabbedLayout = new core_1.TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu',
            keepScrollPosition: true
        });
        this.getContext().createBean(this.tabbedLayout);
    }
    createTab(name, title, TabPanelClass) {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-chart-tab', `ag-chart-${title}`);
        const comp = new TabPanelClass(this.chartController, this.chartOptionsService);
        this.getContext().createBean(comp);
        eWrapperDiv.appendChild(comp.getGui());
        const titleEl = document.createElement('div');
        const translatedTitle = this.chartTranslationService.translate(title);
        titleEl.innerText = translatedTitle;
        return {
            comp,
            tab: {
                title: titleEl,
                titleLabel: translatedTitle,
                bodyPromise: core_1.AgPromise.resolve(eWrapperDiv),
                getScrollableContainer: () => {
                    const scrollableContainer = eWrapperDiv.querySelector('.ag-scrollable-container');
                    return (scrollableContainer || eWrapperDiv);
                },
                name
            }
        };
    }
    showTab(tab) {
        const tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    }
    getGui() {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    }
    destroy() {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.destroyBean(this.parentComponent);
        }
        super.destroy();
    }
    getPanelClass(panelType) {
        switch (panelType) {
            case TabbedChartMenu.TAB_DATA:
                return chartDataPanel_1.ChartDataPanel;
            case TabbedChartMenu.TAB_FORMAT:
                return formatPanel_1.FormatPanel;
            default:
                return chartSettingsPanel_1.ChartSettingsPanel;
        }
    }
}
TabbedChartMenu.TAB_DATA = 'data';
TabbedChartMenu.TAB_FORMAT = 'format';
__decorate([
    core_1.Autowired('chartTranslationService')
], TabbedChartMenu.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], TabbedChartMenu.prototype, "init", null);
exports.TabbedChartMenu = TabbedChartMenu;
