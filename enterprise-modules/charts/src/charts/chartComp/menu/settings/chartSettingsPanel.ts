import { _, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { AgChartThemePalette } from "ag-charts-community";
import { ChartController } from "../../chartController";

type AnimationDirection = 'left' | 'right';

export class ChartSettingsPanel extends Component {

    public static TEMPLATE = /* html */
        `<div class="ag-chart-settings-wrapper">
            <div ref="eMiniChartsContainer" class="ag-chart-settings-mini-charts-container"></div>
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

    @RefSelector('eMiniChartsContainer') private readonly eMiniChartsContainer: HTMLElement;
    @RefSelector('eNavBar') private readonly eNavBar: HTMLElement;
    @RefSelector('eCardSelector') private readonly eCardSelector: HTMLElement;
    @RefSelector('ePrevBtn') private readonly ePrevBtn: HTMLElement;
    @RefSelector('eNextBtn') private readonly eNextBtn: HTMLElement;

    private miniCharts: MiniChartsContainer[] = [];
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

        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsWrapper)!);
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsWrapper)!);

        this.addManagedListener(this.ePrevBtn, 'click', () => this.setActivePalette(this.getPrev(), 'left'));
        this.addManagedListener(this.eNextBtn, 'click', () => this.setActivePalette(this.getNext(), 'right'));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.resetPalettes.bind(this));
    }

    private resetPalettes(): void {
        const palettes = this.chartController.getPalettes();

        if (_.shallowCompare(palettes, this.palettes)) {
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
            const miniChartsContainer = this.createBean(new MiniChartsContainer(this.chartController, fills, strokes));

            this.miniCharts.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(index);

            if (isActivePalette) {
                miniChartsContainer.refreshSelected();
            } else {
                miniChartsContainer.addCssClass('ag-hidden');
            }
        });

        this.eNavBar.classList.toggle('ag-hidden', this.palettes.length <= 1);
        _.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
    }

    private addCardLink(index: number): void {
        const link = document.createElement('div');
        link.classList.add('ag-chart-settings-card-item');

        this.addManagedListener(link, 'click', () => {
            const { activePaletteIndex } = this;

            this.setActivePalette(index, index < activePaletteIndex ? 'left' : 'right');
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

        const currentPalette = this.miniCharts[this.activePaletteIndex];
        const currentGui = currentPalette.getGui();
        const futurePalette = this.miniCharts[index];
        const nextGui = futurePalette.getGui();

        currentPalette.refreshSelected();
        futurePalette.refreshSelected();

        const multiplier = animationDirection === 'left' ? -1 : 1;
        const final = nextGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;

        const animatingClass = 'ag-animating';

        futurePalette.removeCssClass('ag-hidden');
        currentPalette.addCssClass(animatingClass);
        futurePalette.addCssClass(animatingClass);

        this.activePaletteIndex = index;

        this.chartController.setChartThemeName(this.themes[index]);

        this.isAnimating = true;

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

    private destroyMiniCharts(): void {
        _.clearElement(this.eMiniChartsContainer);

        this.miniCharts = this.destroyBeans(this.miniCharts);
    }

    protected destroy(): void {
        this.destroyMiniCharts();
        super.destroy();
    }
}
