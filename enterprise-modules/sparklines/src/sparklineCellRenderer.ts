import {
    Autowired,
    Component,
    ICellRenderer,
    RefSelector,
    ResizeObserverService
} from "@ag-grid-community/core";
import { AgSparkline, AgSparklineOptions } from "ag-charts-community";
import { MiniLineChart } from "ag-charts-community/dist/cjs/sparkline/miniLineChart";
import { MiniAreaChart } from "ag-charts-community/dist/cjs/sparkline/miniAreaChart";
import { MiniColumnChart } from "ag-charts-community/dist/cjs/sparkline/miniColumnChart";

export class SparklineCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-sparkline-wrapper">
            <span ref="eSparkline"></span>
        </div>`;

    @RefSelector('eSparkline') private eSparkline: HTMLElement;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    // private TIMER: number;
    private sparkline: MiniLineChart | MiniAreaChart | MiniColumnChart;

    constructor() {
        super(SparklineCellRenderer.TEMPLATE);
    }

    public init(params: any): void {
        // this.TIMER = window.setTimeout(() => {
            const { clientWidth, clientHeight } = this.getGui();

            const options: AgSparklineOptions = {
                type: params.sparklineType,
                data: params.value,
                width: clientWidth,
                height: clientHeight,
            }

            this.sparkline = AgSparkline.create(options);
            this.eSparkline.appendChild(this.sparkline.canvasElement);
        // }, 100);

        const updateSparklineWidthFunc = () => {
            if (this.sparkline) {
                const { clientWidth, clientHeight } = this.getGui();
                this.sparkline.width = clientWidth;
                this.sparkline.height = clientHeight;
            }
        }

        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparklineWidthFunc);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public refresh(): boolean {
        return false;
    }

    public destroy() {
        // window.clearTimeout(this.TIMER);
        super.destroy();
    }
}
