import {
    _,
    Autowired,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    PreDestroy,
    RefSelector
} from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import {ChartPalette, ChartPaletteName} from "ag-charts-community";
import {ChartController} from "../../chartController";

type AnimationDirection = 'left' | 'right';

export class ChartSettingsPanel extends Component {

    public static TEMPLATE =
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

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eMiniChartsContainer') eMiniChartsContainer: HTMLElement;
    @RefSelector('eNavBar') private eNavBar: HTMLElement;
    @RefSelector('eCardSelector') private eCardSelector: HTMLElement;
    @RefSelector('ePrevBtn') private ePrevBtn: HTMLElement;
    @RefSelector('eNextBtn') private eNextBtn: HTMLElement;

    private miniCharts: MiniChartsContainer[] = [];
    private cardItems: HTMLElement[] = [];

    private readonly chartController: ChartController;

    private activePalette?: ChartPaletteName;
    private palettes: Map<ChartPaletteName | undefined, ChartPalette>;
    private paletteNames: (ChartPaletteName | undefined)[];

    private isAnimating: boolean;

    constructor(chartController: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);

        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct() {
        this.resetPalettes();

        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsWrapper));

        this.addDestroyableEventListener(this.ePrevBtn, 'click', this.prev.bind(this));
        this.addDestroyableEventListener(this.eNextBtn, 'click', this.next.bind(this));
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.resetPalettes.bind(this));
    }

    private resetPalettes(): void {
        const palettes = this.chartController.getPalettes();

        if (palettes === this.palettes) {
            return;
        }

        this.palettes = palettes;
        this.activePalette = this.chartController.getPaletteName();

        if (!this.palettes.has(this.activePalette)) {
            this.activePalette = undefined;
        }

        this.paletteNames = [];
        this.cardItems = [];

        _.clearElement(this.eCardSelector);

        this.destroyMiniCharts();

        this.palettes.forEach((palette, name) => {
            if (!this.activePalette) {
                this.activePalette = name;
            }

            this.paletteNames.push(name);

            const isActivePalette = this.activePalette === name;
            const { fills, strokes } = palette;
            const miniChartsContainer = this.wireBean(new MiniChartsContainer(this.chartController, fills, strokes));

            this.miniCharts.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(name);

            if (isActivePalette) {
                miniChartsContainer.refreshSelected();
            } else {
                _.addCssClass(miniChartsContainer.getGui(), 'ag-hidden');
            }
        });

        _.addOrRemoveCssClass(this.eNavBar, 'ag-hidden', this.palettes.size <= 1);

        const paletteIndex = this.paletteNames.indexOf(this.activePalette);
        _.radioCssClass(this.cardItems[paletteIndex], 'ag-selected', 'ag-not-selected');
    }

    private addCardLink(paletteName: ChartPaletteName): void {
        const link = document.createElement('div');
        _.addCssClass(link, 'ag-chart-settings-card-item');

        this.addDestroyableEventListener(link, 'click', () => {
            const { activePalette, isAnimating, paletteNames } = this;

            if (paletteName === activePalette || isAnimating) {
                return;
            }

            this.setActivePalette(paletteName, paletteNames.indexOf(paletteName) < paletteNames.indexOf(activePalette) ? 'left' : 'right');
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

        this.setActivePalette(this.paletteNames[this.getPrev()], 'left');
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

        this.setActivePalette(this.paletteNames[this.getNext()], 'right');
    }

    private setActivePalette(paletteName: ChartPaletteName, animationDirection: AnimationDirection) {
        const paletteIndex = this.paletteNames.indexOf(paletteName);

        _.radioCssClass(this.cardItems[paletteIndex], 'ag-selected', 'ag-not-selected');

        const currentPalette = this.miniCharts[this.paletteNames.indexOf(this.activePalette)];
        const currentGui = currentPalette.getGui();
        const futurePalette = this.miniCharts[paletteIndex];
        const futureGui = futurePalette.getGui();

        currentPalette.refreshSelected();
        futurePalette.refreshSelected();

        const multiplier = animationDirection === 'left' ? -1 : 1;
        const final = futureGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
        _.removeCssClass(futureGui, 'ag-hidden');

        _.addCssClass(currentGui, 'ag-animating');
        _.addCssClass(futureGui, 'ag-animating');

        this.activePalette = paletteName;
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

    private destroyMiniCharts(): void {
        _.clearElement(this.eMiniChartsContainer);

        this.miniCharts = this.destroyBeans(this.miniCharts);
    }

    protected destroy(): void {
        this.destroyMiniCharts();
        super.destroy();
    }
}
