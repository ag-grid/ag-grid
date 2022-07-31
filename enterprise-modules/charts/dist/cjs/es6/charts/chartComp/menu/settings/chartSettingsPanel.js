"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const miniChartsContainer_1 = require("./miniChartsContainer");
const chartController_1 = require("../../chartController");
class ChartSettingsPanel extends core_1.Component {
    constructor(chartController) {
        super(ChartSettingsPanel.TEMPLATE);
        this.miniCharts = [];
        this.cardItems = [];
        this.activePaletteIndex = 0;
        this.palettes = [];
        this.themes = [];
        this.chartController = chartController;
    }
    postConstruct() {
        this.resetPalettes();
        this.ePrevBtn.insertAdjacentElement('afterbegin', core_1._.createIconNoSpan('previous', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', core_1._.createIconNoSpan('next', this.gridOptionsWrapper));
        this.addManagedListener(this.ePrevBtn, 'click', () => this.setActivePalette(this.getPrev(), 'left'));
        this.addManagedListener(this.eNextBtn, 'click', () => this.setActivePalette(this.getNext(), 'right'));
        // change the selected chart when a combo chart is modified via the data panel, i.e. the custom combo should be selected
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_TYPE_CHANGED, () => this.resetPalettes(true));
        this.scrollSelectedIntoView();
    }
    scrollSelectedIntoView() {
        // the panel is not immediately visible due to the slide animation, so we add a
        // setTimeout to wait until the panel animation is over and is able to scroll
        setTimeout(() => {
            const currentPallet = this.miniCharts.find(pallet => !pallet.getGui().classList.contains('ag-hidden'));
            const currentChart = currentPallet.getGui().querySelector('.ag-selected');
            if (currentChart) {
                currentChart.scrollIntoView({ block: 'nearest' });
            }
        }, 250);
    }
    resetPalettes(forceReset) {
        const palettes = this.chartController.getPalettes();
        if ((core_1._.shallowCompare(palettes, this.palettes) && !forceReset) || this.isAnimating) {
            return;
        }
        this.palettes = palettes;
        this.themes = this.chartController.getThemes();
        this.activePaletteIndex = this.themes.findIndex(name => name === this.chartController.getChartThemeName());
        this.cardItems = [];
        core_1._.clearElement(this.eCardSelector);
        this.destroyMiniCharts();
        this.palettes.forEach((palette, index) => {
            const isActivePalette = this.activePaletteIndex === index;
            const { fills, strokes } = palette;
            const miniChartsContainer = this.createBean(new miniChartsContainer_1.MiniChartsContainer(this.chartController, fills, strokes));
            this.miniCharts.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(index);
            if (isActivePalette) {
                miniChartsContainer.updateSelectedMiniChart();
            }
            else {
                miniChartsContainer.addCssClass('ag-hidden');
            }
        });
        this.eNavBar.classList.toggle('ag-hidden', this.palettes.length <= 1);
        core_1._.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
    }
    addCardLink(index) {
        const link = document.createElement('div');
        link.classList.add('ag-chart-settings-card-item');
        this.addManagedListener(link, 'click', () => {
            this.setActivePalette(index, index < this.activePaletteIndex ? 'left' : 'right');
        });
        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    }
    getPrev() {
        let prev = this.activePaletteIndex - 1;
        if (prev < 0) {
            prev = this.palettes.length - 1;
        }
        return prev;
    }
    getNext() {
        let next = this.activePaletteIndex + 1;
        if (next >= this.palettes.length) {
            next = 0;
        }
        return next;
    }
    setActivePalette(index, animationDirection) {
        if (this.isAnimating || this.activePaletteIndex === index) {
            return;
        }
        core_1._.radioCssClass(this.cardItems[index], 'ag-selected', 'ag-not-selected');
        const currentPalette = this.miniCharts[this.activePaletteIndex];
        const currentGui = currentPalette.getGui();
        const futurePalette = this.miniCharts[index];
        const nextGui = futurePalette.getGui();
        currentPalette.updateSelectedMiniChart();
        futurePalette.updateSelectedMiniChart();
        const multiplier = animationDirection === 'left' ? -1 : 1;
        const final = nextGui.style.left = `${(core_1._.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
        this.activePaletteIndex = index;
        this.isAnimating = true;
        const animatingClass = 'ag-animating';
        futurePalette.removeCssClass('ag-hidden');
        currentPalette.addCssClass(animatingClass);
        futurePalette.addCssClass(animatingClass);
        this.chartController.setChartThemeName(this.themes[index]);
        window.setTimeout(() => {
            currentGui.style.left = `${-parseFloat(final)}px`;
            nextGui.style.left = '0px';
        }, 0);
        window.setTimeout(() => {
            this.isAnimating = false;
            currentPalette.removeCssClass(animatingClass);
            futurePalette.removeCssClass(animatingClass);
            currentPalette.addCssClass('ag-hidden');
        }, 300);
    }
    destroyMiniCharts() {
        core_1._.clearElement(this.eMiniChartsContainer);
        this.miniCharts = this.destroyBeans(this.miniCharts);
    }
    destroy() {
        this.destroyMiniCharts();
        super.destroy();
    }
}
ChartSettingsPanel.TEMPLATE = `<div class="ag-chart-settings-wrapper">
            <div ref="eMiniChartsContainer" class="ag-chart-settings-mini-charts-container ag-scrollable-container"></div>
            <div ref="eNavBar" class="ag-chart-settings-nav-bar">
                <div ref="ePrevBtn" class="ag-chart-settings-prev">
                    <button type="button" class="ag-chart-settings-prev-button"></button>
                </div>
                <div ref="eCardSelector" class="ag-chart-settings-card-selector"></div>
                <div ref="eNextBtn" class="ag-chart-settings-next">
                    <button type="button" class="ag-chart-settings-next-button"></button>
                </div>
            </div>
        </div>`;
__decorate([
    core_1.Autowired('resizeObserverService')
], ChartSettingsPanel.prototype, "resizeObserverService", void 0);
__decorate([
    core_1.RefSelector('eMiniChartsContainer')
], ChartSettingsPanel.prototype, "eMiniChartsContainer", void 0);
__decorate([
    core_1.RefSelector('eNavBar')
], ChartSettingsPanel.prototype, "eNavBar", void 0);
__decorate([
    core_1.RefSelector('eCardSelector')
], ChartSettingsPanel.prototype, "eCardSelector", void 0);
__decorate([
    core_1.RefSelector('ePrevBtn')
], ChartSettingsPanel.prototype, "ePrevBtn", void 0);
__decorate([
    core_1.RefSelector('eNextBtn')
], ChartSettingsPanel.prototype, "eNextBtn", void 0);
__decorate([
    core_1.PostConstruct
], ChartSettingsPanel.prototype, "postConstruct", null);
exports.ChartSettingsPanel = ChartSettingsPanel;
