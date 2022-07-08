var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, RefSelector, } from '@ag-grid-community/core';
import { AgSparkline } from './sparkline/agSparkline';
export class SparklineCellRenderer extends Component {
    constructor() {
        super(SparklineCellRenderer.TEMPLATE);
    }
    init(params) {
        let firstTimeIn = true;
        const updateSparkline = () => {
            const { clientWidth, clientHeight } = this.getGui();
            if (clientWidth === 0 || clientHeight === 0) {
                return;
            }
            if (firstTimeIn) {
                const options = Object.assign({ data: params.value, width: clientWidth, height: clientHeight, context: {
                        data: params.data,
                    } }, params.sparklineOptions);
                // create new instance of sparkline
                this.sparkline = AgSparkline.create(options, this.sparklineTooltipSingleton.getSparklineTooltip());
                // append sparkline canvas to cell renderer element
                this.eSparkline.appendChild(this.sparkline.canvasElement);
                firstTimeIn = false;
            }
            else {
                this.sparkline.width = clientWidth;
                this.sparkline.height = clientHeight;
            }
        };
        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparkline);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }
    refresh(params) {
        if (this.sparkline) {
            this.sparkline.data = params.value;
            return true;
        }
        return false;
    }
    destroy() {
        if (this.sparkline) {
            this.sparkline.destroy();
        }
        super.destroy();
    }
}
SparklineCellRenderer.TEMPLATE /* html */ = `<div class="ag-sparkline-wrapper">
            <span ref="eSparkline"></span>
        </div>`;
__decorate([
    RefSelector('eSparkline')
], SparklineCellRenderer.prototype, "eSparkline", void 0);
__decorate([
    Autowired('resizeObserverService')
], SparklineCellRenderer.prototype, "resizeObserverService", void 0);
__decorate([
    Autowired('sparklineTooltipSingleton')
], SparklineCellRenderer.prototype, "sparklineTooltipSingleton", void 0);
