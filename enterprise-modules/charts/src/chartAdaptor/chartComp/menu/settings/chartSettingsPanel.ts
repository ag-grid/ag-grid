import {
    _,
    Autowired,
    Component,
    GridOptionsWrapper,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartThemeName, getChartTheme } from "ag-charts-community";
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

    private activeTheme?: ChartThemeName;
    private themes: ChartThemeName[];
    private themeNames: (ChartThemeName | undefined)[];

    private isAnimating: boolean;

    constructor(chartController: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);

        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct() {
        this.resetThemes();

        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsWrapper));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsWrapper));

        this.addManagedListener(this.ePrevBtn, 'click', this.prev.bind(this));
        this.addManagedListener(this.eNextBtn, 'click', this.next.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.resetThemes.bind(this));
    }

    private resetThemes(): void {
        const themes = this.chartController.getThemes();

        if (themes === this.themes) {
            return;
        }

        this.themes = themes;
        this.activeTheme = this.chartController.getThemeName();

        if (this.themes.indexOf(this.activeTheme) < 0) {
            this.activeTheme = undefined;
        }

        this.themeNames = [];
        this.cardItems = [];

        _.clearElement(this.eCardSelector);

        this.destroyMiniCharts();

        this.themes.forEach(name => {
            if (!this.activeTheme) {
                this.activeTheme = name;
            }

            this.themeNames.push(name);

            const isActiveTheme = this.activeTheme === name;
            const activeTheme = getChartTheme(this.activeTheme);
            const { fills, strokes } = activeTheme.palette;
            const miniChartsContainer = this.createBean(new MiniChartsContainer(this.chartController, fills, strokes));

            this.miniCharts.push(miniChartsContainer);
            this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            this.addCardLink(name);

            if (isActiveTheme) {
                miniChartsContainer.refreshSelected();
            } else {
                _.addCssClass(miniChartsContainer.getGui(), 'ag-hidden');
            }
        });

        _.addOrRemoveCssClass(this.eNavBar, 'ag-hidden', this.themes.length <= 1);

        const themeIndex = this.themeNames.indexOf(this.activeTheme);
        _.radioCssClass(this.cardItems[themeIndex], 'ag-selected', 'ag-not-selected');
    }

    private addCardLink(themeName: ChartThemeName): void {
        const link = document.createElement('div');
        _.addCssClass(link, 'ag-chart-settings-card-item');

        this.addManagedListener(link, 'click', () => {
            const { themeNames, activeTheme, isAnimating } = this;

            if (themeName === activeTheme || isAnimating) {
                return;
            }

            this.setActiveTheme(themeName, themeNames.indexOf(themeName) < themeNames.indexOf(activeTheme) ? 'left' : 'right');
        });

        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    }

    private getPrev(): number {
        let prev = this.themeNames.indexOf(this.activeTheme) - 1;

        if (prev < 0) {
            prev = this.themeNames.length - 1;
        }

        return prev;
    }

    private prev() {
        if (this.isAnimating) {
            return;
        }

        this.setActiveTheme(this.themeNames[this.getPrev()], 'left');
    }

    private getNext(): number {
        let next = this.themeNames.indexOf(this.activeTheme) + 1;

        if (next >= this.themeNames.length) {
            next = 0;
        }

        return next;
    }

    private next() {
        if (this.isAnimating) {
            return;
        }

        this.setActiveTheme(this.themeNames[this.getNext()], 'right');
    }

    private setActiveTheme(themeName: ChartThemeName, animationDirection: AnimationDirection) {
        const themeIndex = this.themeNames.indexOf(themeName);

        _.radioCssClass(this.cardItems[themeIndex], 'ag-selected', 'ag-not-selected');

        const currentTheme = this.miniCharts[this.themeNames.indexOf(this.activeTheme)];
        const currentGui = currentTheme.getGui();
        const futureTheme = this.miniCharts[themeIndex];
        const futureGui = futureTheme.getGui();

        currentTheme.refreshSelected();
        futureTheme.refreshSelected();

        const multiplier = animationDirection === 'left' ? -1 : 1;
        const final = futureGui.style.left = `${(_.getAbsoluteWidth(this.getGui()) * multiplier)}px`;
        _.removeCssClass(futureGui, 'ag-hidden');

        _.addCssClass(currentGui, 'ag-animating');
        _.addCssClass(futureGui, 'ag-animating');

        this.activeTheme = themeName;
        this.chartController.setChartThemeName(this.activeTheme);

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
