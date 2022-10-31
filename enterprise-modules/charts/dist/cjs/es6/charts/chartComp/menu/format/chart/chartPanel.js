"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const paddingPanel_1 = require("./paddingPanel");
const backgroundPanel_1 = require("./backgroundPanel");
const titlePanel_1 = require("./titlePanel");
class ChartPanel extends core_1.Component {
    constructor({ chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: groupParams });
        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    }
    initGroup() {
        this.chartGroup
            .setTitle(this.chartTranslationService.translate('chart'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
    }
    initTitles() {
        const titlePanelComp = this.createBean(new titlePanel_1.default(this.chartOptionsService));
        this.chartGroup.addItem(titlePanelComp);
        this.activePanels.push(titlePanelComp);
    }
    initPaddingPanel() {
        const paddingPanelComp = this.createBean(new paddingPanel_1.PaddingPanel(this.chartOptionsService));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    }
    initBackgroundPanel() {
        const backgroundPanelComp = this.createBean(new backgroundPanel_1.BackgroundPanel(this.chartOptionsService));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            core_1._.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
ChartPanel.TEMPLATE = `<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;
__decorate([
    core_1.RefSelector('chartGroup')
], ChartPanel.prototype, "chartGroup", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], ChartPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], ChartPanel.prototype, "init", null);
exports.ChartPanel = ChartPanel;
