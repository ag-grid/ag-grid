import {
    Autowired,
    Component,
    GridOptionsWrapper,
    _
} from "ag-grid-community";


export class ChartSettingsPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-settings-wrapper"></div>`;

    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super(ChartSettingsPanel.TEMPLATE);
    }

}