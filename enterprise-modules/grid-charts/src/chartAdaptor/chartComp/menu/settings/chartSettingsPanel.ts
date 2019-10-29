import { _, Autowired, Component, GridOptionsWrapper, PostConstruct, RefSelector } from "@ag-community/grid-core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartController } from "../../chartController";
import { ChartPaletteName } from "../../../../charts/chart/palettes";

export class ChartSettingsPanel extends Component {

    public static TEMPLATE =
        `<div class="ag-chart-settings-wrapper">
            <div ref="eMiniChartsContainer" class="ag-chart-settings-mini-charts-container"></div>
            <div class="ag-chart-settings-nav-bar">
                <div ref="ePrevBtn" class="ag-chart-settings-prev-btn">
                    <button type="button"></button>
                </div>
                <div ref="eCardSelector" class="ag-nav-card-selector"></div>
                <div ref="eNextBtn" class="ag-chart-settings-next-btn">
                    <button type="button"></button>
                </div>
            </div>
        </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eMiniChartsContainer') eMiniChartsContainer: HTMLElement;
    @RefSelector("eCardSelector") private eCardSelector: HTMLElement;
    @RefSelector("ePrevBtn") private ePrevBtn: HTMLElement;
    @RefSelector("eNextBtn") private eNextBtn: HTMLElement;

    private miniCharts: MiniChartsContainer[] = [];
    private cardItems: HTMLElement[] = [];

    private readonly chartController: ChartController;

    private activePalette: ChartPaletteName;
    private paletteNames: ChartPaletteName[] = [];

    private isAnimating: boolean;

    constructor(chartController: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);
        this.chartController = chartController;
        this.activePalette = this.chartController.getPaletteName();
        this.chartController.getPalettes().forEach((_, key) => this.paletteNames.push(key));
    }

    @PostConstruct
    private postConstruct() {
        this.paletteNames.forEach(n => {
            const miniChartsContainer = this.wireBean(new MiniChartsContainer(n, this.chartController));

            this.miniCharts.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(n);
        });

        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('smallLeft', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('smallRight', this.gridOptionsWrapper));

        this.addDestroyableEventListener(this.ePrevBtn, 'click', this.prev.bind(this));
        this.addDestroyableEventListener(this.eNextBtn, 'click', this.next.bind(this));

        this.setActivePalette(this.activePalette, 0);
    }

    private addCardLink(name: ChartPaletteName): void {
        const link = document.createElement('div');
        _.addCssClass(link, 'ag-nav-card-item');

        this.addDestroyableEventListener(link, 'click', () => {
            const { activePalette, isAnimating, paletteNames } = this;

            if (name === activePalette || isAnimating) {
                return;
            }

            this.setActivePalette(name, paletteNames.indexOf(name) < paletteNames.indexOf(activePalette) ? 1 : 2);
        });

        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    }

    private getPrev(): number {
        let prev = this.paletteNames.indexOf(this.activePalette) - 1;

        if (prev < 0) {
            prev = this.paletteNames.length - 1;
        }

        return prev;
    }

    private prev() {
        if (this.isAnimating) {
            return;
        }

        this.setActivePalette(this.paletteNames[this.getPrev()], 1);
    }

    private getNext(): number {
        let next = this.paletteNames.indexOf(this.activePalette) + 1;

        if (next >= this.paletteNames.length) {
            next = 0;
        }

        return next;
    }

    private next() {
        if (this.isAnimating) {
            return;
        }

        this.setActivePalette(this.paletteNames[this.getNext()], 2);
    }

    private setActivePalette(palette: ChartPaletteName, animate?: number) {
        const paletteIndex = this.paletteNames.indexOf(palette);

        _.radioCssClass(this.cardItems[paletteIndex], 'ag-selected');

        if (!animate) {
            this.miniCharts.forEach((miniChart, idx) => {
                _.addOrRemoveCssClass(miniChart.getGui(), 'ag-hidden', idx !== paletteIndex);
            });

            this.miniCharts[paletteIndex].refreshSelected();
            this.activePalette = palette;
        } else {
            const currentPalette = this.miniCharts[this.paletteNames.indexOf(this.activePalette)];
            const currentGui = currentPalette.getGui();
            const futurePalette = this.miniCharts[paletteIndex];
            const futureGui = futurePalette.getGui();

            currentPalette.refreshSelected();
            futurePalette.refreshSelected();

            const multiplier = animate === 1 ? -1 : 1;
            const final = futureGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
            _.removeCssClass(futureGui, 'ag-hidden');

            _.addCssClass(currentGui, 'ag-animating');
            _.addCssClass(futureGui, 'ag-animating');

            this.activePalette = palette;
            this.chartController.setChartPaletteName(this.activePalette);

            this.isAnimating = true;

            window.setTimeout(() => {
                currentGui.style.left = `${parseFloat(final) * -1}px`;
                futureGui.style.left = '0px';
            }, 50);

            window.setTimeout(() => {
                this.isAnimating = false;
                _.removeCssClass(currentGui, 'ag-animating');
                _.removeCssClass(futureGui, 'ag-animating');
                _.addCssClass(currentGui, 'ag-hidden');
            }, 500);
        }
    }
}
