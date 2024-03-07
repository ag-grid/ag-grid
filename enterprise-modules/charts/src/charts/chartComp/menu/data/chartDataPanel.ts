import {
    _,
    AutoScrollService,
    ChartDataPanel as ChartDataPanelType,
    ChartType,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { CategoriesDataPanel } from "./categoriesDataPanel";
import { SeriesDataPanel } from "./seriesDataPanel";
import { SeriesChartTypePanel } from "./seriesChartTypePanel";

const DefaultDataPanelDef: ChartDataPanelType = {
    groups: [
        { type: 'categories', isOpen: true },
        { type: 'series', isOpen: true },
        { type: 'seriesChartType', isOpen: true }
    ]
};

export class ChartDataPanel extends Component {
    public static TEMPLATE = /* html */ `<div class="ag-chart-data-wrapper ag-scrollable-container"></div>`;

    private autoScrollService: AutoScrollService;
    private chartType?: ChartType;
    private categoriesDataPanel: CategoriesDataPanel;
    private seriesDataPanel: SeriesDataPanel;
    private seriesChartTypePanel?: SeriesChartTypePanel;

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService,
    ) {
        super(ChartDataPanel.TEMPLATE);
    }

    @PostConstruct
    public init() {
        this.createAutoScrollService();
        this.updatePanels();
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATE, this.updatePanels.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.updatePanels.bind(this));
    }

    protected destroy(): void {
        this.clearComponents();
        super.destroy();
    }

    private updatePanels() {
        const currentChartType = this.chartType;
        const { dimensionCols, valueCols } = this.chartController.getColStateForMenu();

        this.chartType = this.chartController.getChartType();

        if (this.canRefresh(currentChartType, this.chartType)) {
            this.categoriesDataPanel.refresh(dimensionCols);
            this.seriesDataPanel.refresh(valueCols);
            this.seriesChartTypePanel?.refresh(valueCols);
        } else {
            this.recreatePanels(dimensionCols, valueCols);
        }
    }

    private canRefresh(oldChartType: ChartType | undefined, newChartType: ChartType): boolean {
        if (oldChartType === newChartType) {
            return true;
        }
        const isCombo = (chartType: ChartType) => ['columnLineCombo', 'areaColumnCombo', 'customCombo'].includes(chartType);
        if (isCombo(oldChartType!) && isCombo(newChartType)) {
            return true;
        }
        return false;
    }

    private recreatePanels(dimensionCols: ColState[], valueCols: ColState[]): void {
        this.clearComponents();

        this.getDataPanelDef().groups?.forEach(({ type, isOpen }) => {
            if (type === 'categories') {
                this.categoriesDataPanel = this.addComponent(new CategoriesDataPanel(
                    this.chartController,
                    this.autoScrollService,
                    dimensionCols,
                    isOpen
                ));
            } else if (type === 'series') {
                this.seriesDataPanel = this.addComponent(new SeriesDataPanel(
                    this.chartController,
                    this.autoScrollService,
                    this.chartOptionsService,
                    valueCols,
                    isOpen
                ));
            } else if (type === 'seriesChartType') {
                if (this.chartController.isComboChart()) {
                    this.seriesChartTypePanel = this.addComponent(new SeriesChartTypePanel(this.chartController, valueCols, isOpen));
                }
            } else {
                _.warnOnce(`Invalid charts data panel group name supplied: '${type}'`);
            }
        })
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
        this.createBean(component);
        component.addCssClass('ag-chart-data-section');
        this.getGui().appendChild(component.getGui());
        return component;
    }

    private getDataPanelDef() {
        return this.gridOptionsService.get('chartToolPanelsDef')?.dataPanel ?? DefaultDataPanelDef;
    }

    private clearComponents() {
        _.clearElement(this.getGui());
        this.categoriesDataPanel = this.destroyBean(this.categoriesDataPanel)!;
        this.seriesDataPanel = this.destroyBean(this.seriesDataPanel)!;
        this.seriesChartTypePanel = this.destroyBean(this.seriesChartTypePanel);
    }
}
