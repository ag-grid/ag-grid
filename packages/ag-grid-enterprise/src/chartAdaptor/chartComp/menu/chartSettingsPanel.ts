import {
    Component,
    PostConstruct,
    RefSelector,
    _
} from "ag-grid-community";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartController } from "../chartController";
import { Palette } from "../../../charts/chart/palettes";

export class ChartSettingsPanel extends Component {

    public static TEMPLATE =
        `<div class="ag-chart-settings-wrapper">
            <div class="ag-chart-settings-nav-bar">
                <div ref="ePrevBtn" class="ag-chart-settings-prev-btn ag-icon ag-icon-small-left">
                    <button type="button"></button>
                </div>
                <div ref="eCardSelector" class="ag-nav-card-selector"></div>
                <div ref="eNextBtn" class="ag-chart-settings-next-btn ag-icon ag-icon-small-right">
                    <button type="button"></button>
                </div>
            </div>
        </div>`;

    @RefSelector("eCardSelector") private eCardSelector: HTMLElement;
    @RefSelector("ePrevBtn") private ePrevBtn: HTMLElement;
    @RefSelector("eNextBtn") private eNextBtn: HTMLElement;

    private miniCharts: MiniChartsContainer[] = [];
    private cardItems: HTMLElement[] = [];

    private readonly chartController: ChartController;

    private activePalette: number;
    private palettes: Palette[];

    private isAnimating: boolean;

    constructor(chartController: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);
        this.chartController = chartController;
        this.activePalette = this.chartController.getActivePalette();
        this.palettes = this.chartController.getPalettes();
    }

    @PostConstruct
    private init() {
        this.palettes.forEach((palette, idx) => {
            const miniChartsContainer = new MiniChartsContainer(idx, this.chartController);
            this.getContext().wireBean(miniChartsContainer);

            this.miniCharts.push(miniChartsContainer);
            this.getGui().appendChild(miniChartsContainer.getGui());
            this.addCardLink(idx);
        });

        this.addDestroyableEventListener(this.ePrevBtn, 'click', this.prev.bind(this));
        this.addDestroyableEventListener(this.eNextBtn, 'click', this.next.bind(this));

        this.setActivePalette(this.activePalette, 0);
    }

    private addCardLink(idx: number): void {
        const link = document.createElement('div');
        _.addCssClass(link, 'ag-nav-card-item');
        link.innerHTML = '\u25CF';
        this.addDestroyableEventListener(link, 'click', () => {
            if (idx === this.activePalette || this.isAnimating) { return; }
            this.setActivePalette(idx, idx < this.activePalette ? 1 : 2);
        });
        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    }

    private getPrev(): number {
        let prev = this.activePalette - 1;

        if (prev < 0) {
            prev = this.palettes.length - 1;
        }

        return prev;
    }

    private prev() {
        if (this.isAnimating) { return; }
        const prev = this.getPrev();
        this.setActivePalette(prev, 1);
    }

    private getNext(): number {
        let next = this.activePalette + 1;

        if (next === this.palettes.length) {
            next = 0;
        }
        return next;
    }

    private next() {
        if (this.isAnimating) { return; }
        const next = this.getNext();
        this.setActivePalette(next, 2);
    }

    private setActivePalette(palette: number, animate?: number) {
        _.radioCssClass(this.cardItems[palette], 'ag-selected');

        if (!animate) {
            this.miniCharts.forEach((miniChart, idx) => {
                _.addOrRemoveCssClass(miniChart.getGui(), 'ag-hidden', idx !== palette);
            });
            this.miniCharts[this.activePalette].refreshSelected();
            this.activePalette = palette;
        } else {
            const currentPalette = this.miniCharts[this.activePalette];
            const currentGui = currentPalette.getGui();
            const futurePalette = this.miniCharts[palette];
            const futureGui = futurePalette.getGui();

            currentPalette.refreshSelected();
            futurePalette.refreshSelected();

            const multiplier = animate === 1 ? -1 : 1;
            const final = futureGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
            _.removeCssClass(futureGui, 'ag-hidden');

            _.addCssClass(currentGui, 'ag-animating');
            _.addCssClass(futureGui, 'ag-animating');

            this.activePalette = palette;
            this.chartController.setChartWithPalette(
                this.chartController.getChartType(),
                this.activePalette
            );

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