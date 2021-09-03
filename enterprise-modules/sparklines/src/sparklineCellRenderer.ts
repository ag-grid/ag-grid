import {
    Autowired,
    Component,
    ICellRenderer,
    ISparklineCellRendererParams,
    RefSelector,
    ResizeObserverService
} from "@ag-grid-community/core";
import { AgSparkline } from "./sparkline/agSparkline";

export class SparklineCellRenderer extends Component implements ICellRenderer {

    private static TEMPLATE = /* html */
        `<div class="ag-sparkline-wrapper">
            <span ref="eSparkline"></span>
        </div>`;

    @RefSelector('eSparkline') private eSparkline?: HTMLElement;
    @Autowired('resizeObserverService') private resizeObserverService!: ResizeObserverService;

    private sparkline?: any;

    constructor() {
        super(SparklineCellRenderer.TEMPLATE);
    }

    public init(params: any): void {
        const { clientWidth, clientHeight } = this.getGui();

        const options = {
            data: params.value,
            width: clientWidth,
            height: clientHeight,
            ...params.sparklineOptions
        }

        // create new instance of sparkline
        this.sparkline = AgSparkline.create(options);

        // append sparkline canvas element to this.eSparkline;
        this.sparkline.container = this.eSparkline;

        // resize sparkline when cell size changes
        // TODO: use update for this?
        const resizeSparkline = () => {
            if (this.sparkline) {
                const { clientWidth, clientHeight } = this.getGui();
                this.sparkline.width = clientWidth;
                this.sparkline.height = clientHeight;
            }
        }

        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), resizeSparkline);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public refresh(params: ISparklineCellRendererParams): boolean {
        if (this.sparkline) {
            const { clientWidth, clientHeight } = this.getGui();

            const options = {
                data: params.value,
                width: clientWidth,
                height: clientHeight,
                ...params.sparklineOptions
            }

            // AgSparkline update method returns a new instance of the sparkline if the type has changed, otherwise its return type is undefined
            const newSparkline = AgSparkline.update(this.sparkline, options);

            if (newSparkline) {
                 // remove old sparkline canvas element from parentNode: this.eSparkline
                 this.sparkline.destroy();

                 // save new instance of sparkline
                 this.sparkline = newSparkline;

                 // append new sparkline canvas element to this.eSparkline;
                 this.sparkline.container = this.eSparkline;
            }
        }

        return true;
    }

    public destroy() {
        this.sparkline.destroy();
        super.destroy();
    }
}
