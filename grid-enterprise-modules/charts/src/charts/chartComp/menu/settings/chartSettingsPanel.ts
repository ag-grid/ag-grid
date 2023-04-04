import { _, Autowired, Component, PostConstruct, RefSelector, ResizeObserverService } from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { AgChartThemePalette } from "ag-charts-community";
import { ChartController } from "../../chartController";

type AnimationDirection = 'left' | 'right';

export class ChartSettingsPanel extends Component {

    public static TEMPLATE = /* html */
        `<div class="ag-chart-settings-wrapper">
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

    @Autowired('resizeObserverService') private readonly resizeObserverService: ResizeObserverService;
    @RefSelector('eMiniChartsContainer') private readonly eMiniChartsContainer: HTMLElement;
    @RefSelector('eNavBar') private readonly eNavBar: HTMLElement;
    @RefSelector('eCardSelector') private readonly eCardSelector: HTMLElement;
    @RefSelector('ePrevBtn') private readonly ePrevBtn: HTMLElement;
    @RefSelector('eNextBtn') private readonly eNextBtn: HTMLElement;

    private miniChartsContainers: MiniChartsContainer[] = [];
    private cardItems: HTMLElement[] = [];

    private readonly chartController: ChartController;

    private activePaletteIndex = 0;
    private palettes: AgChartThemePalette[] = [];
    private themes: string[] = [];

    private isAnimating: boolean;

    constructor(chartController: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);

        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct() {
        this.resetPalettes();

        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsService)!);
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsService)!);

        this.addManagedListener(this.ePrevBtn, 'click', () => this.setActivePalette(this.getPrev(), 'left'));
        this.addManagedListener(this.eNextBtn, 'click', () => this.setActivePalette(this.getNext(), 'right'));

        // change the selected chart when a combo chart is modified via the data panel, i.e. the custom combo should be selected
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_TYPE_CHANGED, () => this.resetPalettes(true));
        this.scrollSelectedIntoView();
    }

    private scrollSelectedIntoView(): void {
        // the panel is not immediately visible due to the slide animation, so we add a
        // setTimeout to wait until the panel animation is over and is able to scroll
        setTimeout(() => {
            const isMiniChartsContainerVisible = (miniChartsContainers: MiniChartsContainer) => {
                return !miniChartsContainers.getGui().classList.contains('ag-hidden');
            }
            const currentMiniChartContainer = this.miniChartsContainers.find(isMiniChartsContainerVisible);
            const currentChart = currentMiniChartContainer!.getGui().querySelector('.ag-selected') as HTMLElement;

            if (currentChart) {
                const parent = currentChart.offsetParent as HTMLElement;
                this.eMiniChartsContainer.scrollTo(0, parent.offsetTop);
            }
        }, 250);
    }

    private resetPalettes(forceReset?: boolean): void {
        const palettes = this.chartController.getPalettes();
        const chartGroups = this.gridOptionsService.get('chartToolPanelsDef')?.settingsPanel?.chartGroupsDef;

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
            } else {
                miniChartsContainer.setDisplayed(false);
            }
        });

        _.setDisplayed(this.eNavBar, this.palettes.length > 1);
        _.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
    }

    private addCardLink(index: number): void {
        const link = document.createElement('div');
        link.classList.add('ag-chart-settings-card-item');

        this.addManagedListener(link, 'click', () => {
            this.setActivePalette(index, index < this.activePaletteIndex ? 'left' : 'right');
        });

        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    }

    private getPrev(): number {
        let prev = this.activePaletteIndex - 1;

        if (prev < 0) {
            prev = this.palettes.length - 1;
        }

        return prev;
    }

    private getNext(): number {
        let next = this.activePaletteIndex + 1;

        if (next >= this.palettes.length) {
            next = 0;
        }

        return next;
    }

    private setActivePalette(index: number, animationDirection: AnimationDirection) {
        if (this.isAnimating || this.activePaletteIndex === index) { return; }

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

    private destroyMiniCharts(): void {
        _.clearElement(this.eMiniChartsContainer);

        this.miniChartsContainers = this.destroyBeans(this.miniChartsContainers);
    }

    protected destroy(): void {
        this.destroyMiniCharts();
        super.destroy();
    }
}
