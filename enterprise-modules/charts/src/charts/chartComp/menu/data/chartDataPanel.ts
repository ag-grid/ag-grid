import {
    AutoScrollService,
    Autowired,
    ChartDataPanel as ChartDataPanelType,
    ChartType,
    Component,
    PostConstruct,
    _warnOnce
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { ChartTranslationService } from '../../services/chartTranslationService';
import { CategoriesDataPanel } from "./categoriesDataPanel";
import { SeriesDataPanel } from "./seriesDataPanel";
import { SeriesChartTypePanel } from "./seriesChartTypePanel";
import { SwitchCategorySeriesDataPanel } from './switchCategorySeriesDataPanel';
import { getMaxNumCategories, getMaxNumSeries, supportsInvertedCategorySeries } from '../../utils/seriesTypeMapper';
import { ChartService } from "../../../chartService";

const DefaultDataPanelDef: ChartDataPanelType = {
    groups: [
        { type: 'categories', isOpen: true },
        { type: 'series', isOpen: true },
        { type: 'seriesChartType', isOpen: true }
    ]
};

export class ChartDataPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-data-wrapper ag-scrollable-container"></div>`;
    
    @Autowired('chartTranslationService') protected readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartService') private chartService: ChartService;

    private autoScrollService: AutoScrollService;
    private chartType?: ChartType;
    private isSwitchCategorySeriesToggled = false;
    private categoriesDataPanel?: CategoriesDataPanel;
    private seriesDataPanel?: SeriesDataPanel;
    private seriesChartTypePanel?: SeriesChartTypePanel;
    private switchCategorySeriesPanel?: SwitchCategorySeriesDataPanel;

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService,
    ) {
        super(ChartDataPanel.TEMPLATE);
    }

    @PostConstruct
    public init() {
        this.switchCategorySeriesPanel = this.addComponent(this.createManagedBean(new SwitchCategorySeriesDataPanel(
            () => this.chartController.isCategorySeriesSwitched(),
            (value: boolean) => this.chartController.switchCategorySeries(value)
        )));
        this.isSwitchCategorySeriesToggled = this.chartController.isCategorySeriesSwitched();

        this.createAutoScrollService();
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.updatePanels.bind(this));
    }

    protected destroy(): void {
        this.clearPanelComponents();
        super.destroy();
    }

    private updatePanels() {
        const currentChartType = this.chartType;
        const isSwitchCategorySeriesToggledCurrent = this.isSwitchCategorySeriesToggled;
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();

        this.chartType = this.chartController.getChartType();

        // Determine the state of the category/series toggle
        this.isSwitchCategorySeriesToggled = this.chartController.isCategorySeriesSwitched();
        const hasChangedSwitchCategorySeries = (
            this.isSwitchCategorySeriesToggled !== isSwitchCategorySeriesToggledCurrent
        );

        // Attempt to re-use existing panels where possible in order to maintain keyboard focus
        if (this.canRefresh(currentChartType, this.chartType) && !hasChangedSwitchCategorySeries) {
            this.categoriesDataPanel?.refresh(dimensionCols);
            this.seriesDataPanel?.refresh(valueCols);
            this.seriesChartTypePanel?.refresh(valueCols);
        } else {
            this.recreatePanels(dimensionCols, valueCols);
        }

        // Ensure the category/series toggle UI control is up-to-date
        this.switchCategorySeriesPanel?.setDisplayed(
            supportsInvertedCategorySeries(this.chartType) && this.chartService.isEnterprise() && !this.chartController.isGrouping()
        );
        if (hasChangedSwitchCategorySeries) {
            this.switchCategorySeriesPanel?.refresh();
        }
    }

    private canRefresh(oldChartType: ChartType | undefined, newChartType: ChartType): boolean {
        if (oldChartType === undefined) return false;
        if (oldChartType === newChartType) {
            return true;
        }
        const isCombo = (chartType: ChartType) => ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(chartType);
        if (isCombo(oldChartType) && isCombo(newChartType)) {
            return true;
        }
        return false;
    }

    private recreatePanels(dimensionCols: ColState[], valueCols: ColState[]): void {
        this.clearPanelComponents();

        const { chartType } = this;
        if (!chartType) return;

        const isCategorySeriesSwitched = this.chartController.isCategorySeriesSwitched();

        const panels = this.getDataPanelDef().groups?.map(({ type, isOpen }): Component | null => {
            if (type === (isCategorySeriesSwitched ? 'series' : 'categories')) {
                return this.categoriesDataPanel = this.createBean(new CategoriesDataPanel(
                    this.chartController,
                    this.autoScrollService,
                    this.getCategoryGroupTitle(isCategorySeriesSwitched),
                    this.getCategoryGroupMultipleSelect(chartType, isCategorySeriesSwitched),
                    dimensionCols,
                    isOpen
                ));
            } else if (type === (isCategorySeriesSwitched ? 'categories' : 'series')) {
                return this.seriesDataPanel = this.createBean(new SeriesDataPanel(
                    this.chartController,
                    this.autoScrollService,
                    this.chartOptionsService,
                    this.getSeriesGroupTitle(isCategorySeriesSwitched),
                    this.getSeriesGroupMultipleSelect(chartType, isCategorySeriesSwitched),
                    this.getSeriesGroupMaxSelection(chartType, isCategorySeriesSwitched),
                    valueCols,
                    isOpen
                ));
            } else if (type === 'seriesChartType') {
                if (this.chartController.isComboChart()) {
                    return this.seriesChartTypePanel = this.createBean(new SeriesChartTypePanel(
                        this.chartController,
                        valueCols,
                        isOpen
                    ));
                }
                return null;
            } else {
                _warnOnce(`Invalid charts data panel group name supplied: '${type}'`);
                return null;
            }
        }).filter((value): value is NonNullable<typeof value> => value != null);

        if (panels) this.addPanelComponents(panels);
    }

    private addPanelComponents<T extends Component[]>(panels: T): T {
        const fragment = document.createDocumentFragment();
        for (const panel of panels) {
            this.registerComponent(panel);
            fragment.appendChild(panel.getGui());
        }
        const afterPanelElement = this.switchCategorySeriesPanel?.getGui();
        this.getGui().insertBefore(fragment, afterPanelElement ?? null);
        return panels;
    }

    private clearPanelComponents() {
        const eGui = this.getGui();

        if (this.categoriesDataPanel) eGui.removeChild(this.categoriesDataPanel.getGui());
        if (this.seriesDataPanel) eGui.removeChild(this.seriesDataPanel.getGui());
        if (this.seriesChartTypePanel) eGui.removeChild(this.seriesChartTypePanel.getGui());

        this.categoriesDataPanel = this.destroyBean(this.categoriesDataPanel);
        this.seriesDataPanel = this.destroyBean(this.seriesDataPanel);
        this.seriesChartTypePanel = this.destroyBean(this.seriesChartTypePanel);
    }

    private createAutoScrollService(): void {
        const eGui = this.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: eGui,
            scrollAxis: 'y',
            getVerticalPosition: () => eGui.scrollTop,
            setVerticalPosition: (position) => eGui.scrollTop = position
        });
    }

    private addComponent<T extends Component>(component: T): T {
        this.registerComponent(component);
        this.getGui().appendChild(component.getGui());
        return component;
    }

    private registerComponent<T extends Component>(component: T): void {
        component.addCssClass('ag-chart-data-section');
    }

    private getDataPanelDef() {
        return this.gos.get('chartToolPanelsDef')?.dataPanel ?? DefaultDataPanelDef;
    }

    private getCategoryGroupTitle(isCategorySeriesSwitched: boolean): string {
        if (isCategorySeriesSwitched) return this.chartTranslationService.translate('seriesLabels');
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'labels' : 'categories');
    }

    private getCategoryGroupMultipleSelect(chartType: ChartType, isCategorySeriesSwitched: boolean): boolean {
        if (isCategorySeriesSwitched) return false;
        return getMaxNumCategories(chartType) !== 1;
    }

    private getSeriesGroupTitle(isCategorySeriesSwitched: boolean): string {
        if (isCategorySeriesSwitched) return this.chartTranslationService.translate('categoryValues');
        return this.chartTranslationService.translate(this.chartController.isActiveXYChart() ? 'xyValues' : 'series');
    }

    private getSeriesGroupMultipleSelect(chartType: ChartType, isCategorySeriesSwitched: boolean): boolean {
        return this.getSeriesGroupMaxSelection(chartType, isCategorySeriesSwitched) !== 1;
    }

    private getSeriesGroupMaxSelection(chartType: ChartType, isCategorySeriesSwitched: boolean): number | undefined {
        if (isCategorySeriesSwitched) return undefined;
        return getMaxNumSeries(chartType);
    }
}
