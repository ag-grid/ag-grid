var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BBox } from '../scene/bbox';
import { Chart } from './chart';
export class HierarchyChart extends Chart {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        super(document, overrideDevicePixelRatio, resources);
        this._data = {};
    }
    performLayout() {
        const _super = Object.create(null, {
            performLayout: { get: () => super.performLayout }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const shrinkRect = yield _super.performLayout.call(this);
            const { seriesAreaPadding } = this;
            const fullSeriesRect = shrinkRect.clone();
            shrinkRect.shrink(seriesAreaPadding.left, 'left');
            shrinkRect.shrink(seriesAreaPadding.top, 'top');
            shrinkRect.shrink(seriesAreaPadding.right, 'right');
            shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');
            this.seriesRect = shrinkRect;
            const hoverRectPadding = 20;
            const hoverRect = shrinkRect.clone().grow(hoverRectPadding);
            this.hoverRect = hoverRect;
            yield Promise.all(this.series.map((series) => __awaiter(this, void 0, void 0, function* () {
                series.rootGroup.translationX = Math.floor(shrinkRect.x);
                series.rootGroup.translationY = Math.floor(shrinkRect.y);
                yield series.update({ seriesRect: shrinkRect }); // this has to happen after the `updateAxes` call
            })));
            const { seriesRoot } = this;
            seriesRoot.setClipRectInGroupCoordinateSpace(new BBox(shrinkRect.x, shrinkRect.y, shrinkRect.width, shrinkRect.height));
            this.layoutService.dispatchLayoutComplete({
                type: 'layout-complete',
                chart: { width: this.scene.width, height: this.scene.height },
                series: { rect: fullSeriesRect, paddedRect: shrinkRect, hoverRect, visible: true },
                axes: [],
            });
            return shrinkRect;
        });
    }
}
HierarchyChart.className = 'HierarchyChart';
HierarchyChart.type = 'hierarchy';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGllcmFyY2h5Q2hhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvaGllcmFyY2h5Q2hhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyQyxPQUFPLEVBQUUsS0FBSyxFQUF5QixNQUFNLFNBQVMsQ0FBQztBQUV2RCxNQUFNLE9BQU8sY0FBZSxTQUFRLEtBQUs7SUFJckMsWUFBWSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSx3QkFBaUMsRUFBRSxTQUFpQztRQUN4RyxLQUFLLENBQUMsUUFBUSxFQUFFLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRy9DLFVBQUssR0FBUSxFQUFFLENBQUM7SUFGMUIsQ0FBQztJQUlLLGFBQWE7Ozs7O1lBQ2YsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFNLGFBQWEsV0FBRSxDQUFDO1lBRS9DLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxHQUFHLElBQUksQ0FBQztZQUVuQyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDMUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDcEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFFN0IsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7WUFDNUIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBRTNCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFPLE1BQU0sRUFBRSxFQUFFO2dCQUM3QixNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsaURBQWlEO1lBQ3RHLENBQUMsQ0FBQSxDQUFDLENBQ0wsQ0FBQztZQUVGLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDNUIsVUFBVSxDQUFDLGlDQUFpQyxDQUN4QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQzVFLENBQUM7WUFFRixJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDO2dCQUN0QyxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUM3RCxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7Z0JBQ2xGLElBQUksRUFBRSxFQUFFO2FBQ1gsQ0FBQyxDQUFDO1lBRUgsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUFBOztBQS9DTSx3QkFBUyxHQUFHLGdCQUFnQixDQUFDO0FBQzdCLG1CQUFJLEdBQUcsV0FBb0IsQ0FBQyJ9