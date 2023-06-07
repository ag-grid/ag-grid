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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmtsaW5lQ2VsbFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NwYXJrbGluZUNlbGxSZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULFNBQVMsRUFHVCxXQUFXLEdBRWQsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUEyQixNQUFNLHlCQUF5QixDQUFDO0FBRy9FLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxTQUFTO0lBWWhEO1FBQ0ksS0FBSyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxJQUFJLENBQUMsTUFBb0M7UUFDNUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRTtZQUN6QixNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwRCxJQUFJLFdBQVcsS0FBSyxDQUFDLElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtnQkFDekMsT0FBTzthQUNWO1lBRUQsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsTUFBTSxPQUFPLG1CQUNULElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxFQUNsQixLQUFLLEVBQUUsV0FBVyxFQUNsQixNQUFNLEVBQUUsWUFBWSxFQUNwQixPQUFPLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO3FCQUNwQixJQUNFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FDN0IsQ0FBQztnQkFFRixtQ0FBbUM7Z0JBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFFbkcsbURBQW1EO2dCQUNuRCxJQUFJLENBQUMsVUFBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUUzRCxXQUFXLEdBQUcsS0FBSyxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO2FBQ3hDO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN2RyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sT0FBTyxDQUFDLE1BQW9DO1FBQy9DLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sT0FBTztRQUNWLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzVCO1FBQ0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLENBQUM7O0FBaEVjLDhCQUFRLENBQUMsVUFBVSxHQUFHOztlQUUxQixDQUFDO0FBRWU7SUFBMUIsV0FBVyxDQUFDLFlBQVksQ0FBQzt5REFBa0M7QUFFeEI7SUFBbkMsU0FBUyxDQUFDLHVCQUF1QixDQUFDO29FQUF1RDtBQUNsRDtJQUF2QyxTQUFTLENBQUMsMkJBQTJCLENBQUM7d0VBQStEIn0=