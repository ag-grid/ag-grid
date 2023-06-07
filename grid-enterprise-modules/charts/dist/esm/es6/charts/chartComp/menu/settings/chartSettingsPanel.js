var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartController } from "../../chartController";
export class ChartSettingsPanel extends Component {
    constructor(chartController) {
        super(ChartSettingsPanel.TEMPLATE);
        this.miniChartsContainers = [];
        this.cardItems = [];
        this.activePaletteIndex = 0;
        this.palettes = [];
        this.themes = [];
        this.chartController = chartController;
    }
    postConstruct() {
        this.resetPalettes();
        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsService));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsService));
        this.addManagedListener(this.ePrevBtn, 'click', () => this.setActivePalette(this.getPrev(), 'left'));
        this.addManagedListener(this.eNextBtn, 'click', () => this.setActivePalette(this.getNext(), 'right'));
        // change the selected chart when a combo chart is modified via the data panel, i.e. the custom combo should be selected
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_TYPE_CHANGED, () => this.resetPalettes(true));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, () => this.resetPalettes(true));
        this.scrollSelectedIntoView();
    }
    scrollSelectedIntoView() {
        // the panel is not immediately visible due to the slide animation, so we add a
        // setTimeout to wait until the panel animation is over and is able to scroll
        setTimeout(() => {
            const isMiniChartsContainerVisible = (miniChartsContainers) => {
                return !miniChartsContainers.getGui().classList.contains('ag-hidden');
            };
            const currentMiniChartContainer = this.miniChartsContainers.find(isMiniChartsContainerVisible);
            const currentChart = currentMiniChartContainer.getGui().querySelector('.ag-selected');
            if (currentChart) {
                const parent = currentChart.offsetParent;
                if (parent) {
                    this.eMiniChartsContainer.scrollTo(0, parent.offsetTop);
                }
            }
        }, 250);
    }
    resetPalettes(forceReset) {
        var _a, _b;
        const palettes = this.chartController.getPalettes();
        const chartGroups = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if ((_.shallowCompare(palettes, this.palettes) && !forceReset) || this.isAnimating) {
            return;
        }
        this.palettes = palettes;
        this.themes = this.chartController.getThemes();
        this.activePaletteIndex = this.themes.findIndex(name => name === this.chartController.getChartThemeName());
        this.cardItems = [];
        _.clearElement(this.eCardSelector);
        this.destroyMiniCharts();
        this.palettes.forEach((palette, index) => {
            const isActivePalette = this.activePaletteIndex === index;
            const { fills, strokes } = palette;
            const miniChartsContainer = this.createBean(new MiniChartsContainer(this.chartController, fills, strokes, chartGroups));
            this.miniChartsContainers.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(index);
            if (isActivePalette) {
                miniChartsContainer.updateSelectedMiniChart();
            }
            else {
                miniChartsContainer.setDisplayed(false);
            }
        });
        _.setDisplayed(this.eNavBar, this.palettes.length > 1);
        _.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
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
        _.radioCssClass(this.cardItems[index], 'ag-selected', 'ag-not-selected');
        const currentPalette = this.miniChartsContainers[this.activePaletteIndex];
        const currentGui = currentPalette.getGui();
        const futurePalette = this.miniChartsContainers[index];
        const nextGui = futurePalette.getGui();
        currentPalette.updateSelectedMiniChart();
        futurePalette.updateSelectedMiniChart();
        const multiplier = animationDirection === 'left' ? -1 : 1;
        const final = nextGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
        this.activePaletteIndex = index;
        this.isAnimating = true;
        const animatingClass = 'ag-animating';
        futurePalette.setDisplayed(true);
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
            currentPalette.setDisplayed(false);
        }, 300);
    }
    destroyMiniCharts() {
        _.clearElement(this.eMiniChartsContainer);
        this.miniChartsContainers = this.destroyBeans(this.miniChartsContainers);
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
                    <button type="button" class="ag-button ag-chart-settings-prev-button"></button>
                </div>
                <div ref="eCardSelector" class="ag-chart-settings-card-selector"></div>
                <div ref="eNextBtn" class="ag-chart-settings-next">
                    <button type="button" class="ag-button ag-chart-settings-next-button"></button>
                </div>
            </div>
        </div>`;
__decorate([
    Autowired('resizeObserverService')
], ChartSettingsPanel.prototype, "resizeObserverService", void 0);
__decorate([
    RefSelector('eMiniChartsContainer')
], ChartSettingsPanel.prototype, "eMiniChartsContainer", void 0);
__decorate([
    RefSelector('eNavBar')
], ChartSettingsPanel.prototype, "eNavBar", void 0);
__decorate([
    RefSelector('eCardSelector')
], ChartSettingsPanel.prototype, "eCardSelector", void 0);
__decorate([
    RefSelector('ePrevBtn')
], ChartSettingsPanel.prototype, "ePrevBtn", void 0);
__decorate([
    RefSelector('eNextBtn')
], ChartSettingsPanel.prototype, "eNextBtn", void 0);
__decorate([
    PostConstruct
], ChartSettingsPanel.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRTZXR0aW5nc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9zZXR0aW5ncy9jaGFydFNldHRpbmdzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQXlCLE1BQU0seUJBQXlCLENBQUM7QUFDckgsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBSXhELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxTQUFTO0lBa0M3QyxZQUFZLGVBQWdDO1FBQ3hDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQVovQix5QkFBb0IsR0FBMEIsRUFBRSxDQUFDO1FBQ2pELGNBQVMsR0FBa0IsRUFBRSxDQUFDO1FBSTlCLHVCQUFrQixHQUFHLENBQUMsQ0FBQztRQUN2QixhQUFRLEdBQTBCLEVBQUUsQ0FBQztRQUNyQyxXQUFNLEdBQWEsRUFBRSxDQUFDO1FBTzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzNDLENBQUM7SUFHTyxhQUFhO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDLENBQUM7UUFDNUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUUsQ0FBQyxDQUFDO1FBRXhH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