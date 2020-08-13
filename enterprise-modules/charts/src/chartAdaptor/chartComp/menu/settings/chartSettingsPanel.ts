import {
    _,
    Autowired,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { AgChartThemePalette, AgChartTheme, ChartTheme } from "ag-charts-community";
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

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eMiniChartsContainer') eMiniChartsContainer: HTMLElement;
    @RefSelector('eNavBar') private eNavBar: HTMLElement;
    @RefSelector('eCardSelector') private eCardSelector: HTMLElement;
    @RefSelector('ePrevBtn') private ePrevBtn: HTMLElement;
    @RefSelector('eNextBtn') private eNextBtn: HTMLElement;

    private miniCharts: MiniChartsContainer[] = [];
    private cardItems: HTMLElement[] = [];

    private readonly chartController: ChartController;

    private activeThemeIndex?: number;
    private themes: ChartTheme[] = [];

    private isAnimating: boolean;

    constructor(chartController: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);

        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct() {
        this.resetPalettes();
        this.resetThemes();

        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsWrapper));

        this.addManagedListener(this.ePrevBtn, 'click', this.prev.bind(this));
        this.addManagedListener(this.eNextBtn, 'click', this.next.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.resetPalettes.bind(this));
    }

    private resetThemes() {
        
    }

    private resetPalettes(): void {
        const themes = this.chartController.getThemes();

        if (themes === this.themes) {
            return;
        }

        this.themes = themes;
        this.activeThemeIndex = this.chartController.getThemeIndex();

        if (this.activeThemeIndex < 0 || this.activeThemeIndex >= this.themes.length) {
            this.activeThemeIndex = undefined;
        }

        this.cardItems = [];

        _.clearElement(this.eCardSelector);

        this.destroyMiniCharts();

        this.themes.forEach((theme, index) => {
            if (!this.activeThemeIndex) {
                this.activeThemeIndex = index;
            }

            const isActivePalette = this.activeThemeIndex === index;
            const { fills, strokes } = theme.palette;
            const miniChartsContainer = this.createBean(new MiniChartsContainer(this.chartController, fills, strokes));

            this.miniCharts.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(index);

            if (isActivePalette) {
                miniChartsContainer.refreshSelected();
            } else {
                _.addCssClass(miniChartsContainer.getGui(), 'ag-hidden');
            }
        });

        _.addOrRemoveCssClass(this.eNavBar, 'ag-hidden', this.themes.length <= 1);

        _.radioCssClass(this.cardItems[this.activeThemeIndex], 'ag-selected', 'ag-not-selected');
    }

    private addCardLink(themeIndex: number): void {
        const link = document.createElement('div');
        _.addCssClass(link, 'ag-chart-settings-card-item');

        this.addManagedListener(link, 'click', () => {
            const { activeThemeIndex, isAnimating } = this;

            if (themeIndex === activeThemeIndex || isAnimating) {
                return;
            }

            this.setActivePalette(themeIndex, themeIndex < activeThemeIndex ? 'left' : 'right');
        });

        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    }

    private getPrev(): number {
        let prev = this.activeThemeIndex - 1;

        if (prev < 0) {
            prev = this.themes.length - 1;
        }

        return prev;
    }

    private prev() {
        if (this.isAnimating) {
            return;
        }

        this.setActivePalette(this.getPrev(), 'left');
    }

    private getNext(): number {
        let next = this.activeThemeIndex + 1;

        if (next >= this.themes.length) {
            next = 0;
        }

        return next;
    }

    private next() {
        if (this.isAnimating) {
            return;
        }

        this.setActivePalette(this.getNext(), 'right');
    }

    private setActivePalette(themeIndex: number, animationDirection: AnimationDirection) {
        _.radioCssClass(this.cardItems[themeIndex], 'ag-selected', 'ag-not-selected');

        const currentPalette = this.miniCharts[this.activeThemeIndex];
        const currentGui = currentPalette.getGui();
        const futurePalette = this.miniCharts[themeIndex];
        const futureGui = futurePalette.getGui();

        currentPalette.refreshSelected();
        futurePalette.refreshSelected();

        const multiplier = animationDirection === 'left' ? -1 : 1;
        const final = futureGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
        _.removeCssClass(futureGui, 'ag-hidden');

        _.addCssClass(currentGui, 'ag-animating');
        _.addCssClass(futureGui, 'ag-animating');

        this.activeThemeIndex = themeIndex;
        this.chartController.setChartThemeIndex(this.activeThemeIndex);

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
