import {
    Autowired,
    Component,
    ICellRenderer,
    ISparklineCellRendererParams,
    RefSelector,
    ResizeObserverService
} from "@ag-grid-community/core";
import { MiniLineChart } from "./sparkline/miniLineChart";
import { MiniAreaChart } from "./sparkline/miniAreaChart";
import { MiniColumnChart } from "./sparkline/miniColumnChart";
import { AgSparkline } from "./sparkline/agSparkline";

export class SparklineCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-sparkline-wrapper">
            <span ref="eSparkline"></span>
        </div>`;

    @RefSelector('eSparkline') private eSparkline: HTMLElement;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    private sparkline: MiniLineChart | MiniAreaChart | MiniColumnChart;

    constructor() {
        super(SparklineCellRenderer.TEMPLATE);
    }

    public init(params: ISparklineCellRendererParams): void {
        const { clientWidth, clientHeight } = this.getGui();
        const options = {
            type: params.sparklineType,
            data: params.value,
            width: clientWidth,
            height: clientHeight,
        }

        this.sparkline = AgSparkline.create(options as any);
        this.eSparkline.appendChild(this.sparkline.canvasElement);

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

    public refresh(params: ISparklineCellRendererParams): boolean {
        this.sparkline.data = params.value;
        return true;
    }

    public destroy() {
        super.destroy();
    }
}
