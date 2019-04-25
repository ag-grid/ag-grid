import {
    Autowired,
    Component,
    GridOptionsWrapper,
    _,
    PostConstruct
} from "ag-grid-community";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartController } from "../chartController";


export class ChartSettingsPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-settings-wrapper"></div>`;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    private chartController: ChartController;

    constructor(chartModel: ChartController) {
        super(ChartSettingsPanel.TEMPLATE);
        this.chartController = chartModel;
    }

    @PostConstruct
    private init() {
        const miniChartsContainer = new MiniChartsContainer(this.chartController.getPalette(), this.chartController);
        this.getContext().wireBean(miniChartsContainer);

        this.getGui().appendChild(miniChartsContainer.getGui());
    }
}