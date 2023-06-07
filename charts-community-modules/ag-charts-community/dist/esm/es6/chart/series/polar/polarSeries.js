import { Series, SeriesNodePickMode } from '../series';
import { ChartAxisDirection } from '../../chartAxisDirection';
export class PolarSeries extends Series {
    constructor({ moduleCtx, useLabelLayer = false, pickModes = [SeriesNodePickMode.EXACT_SHAPE_MATCH], }) {
        super({
            moduleCtx,
            useLabelLayer,
            pickModes,
            directionKeys: {
                [ChartAxisDirection.X]: ['angleKey'],
                [ChartAxisDirection.Y]: ['radiusKey'],
            },
            directionNames: {
                [ChartAxisDirection.X]: ['angleName'],
                [ChartAxisDirection.Y]: ['radiusName'],
            },
        });
        /**
         * The center of the polar series (for example, the center of a pie).
         * If the polar chart has multiple series, all of them will have their
         * center set to the same value as a result of the polar chart layout.
         * The center coordinates are not supposed to be set by the user.
         */
        this.centerX = 0;
        this.centerY = 0;
        /**
         * The maximum radius the series can use.
         * This value is set automatically as a result of the polar chart layout
         * and is not supposed to be set by the user.
         */
        this.radius = 0;
    }
    getLabelData() {
        return [];
    }
    computeLabelsBBox(_options, _seriesRect) {
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sYXJTZXJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvc2VyaWVzL3BvbGFyL3BvbGFyU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQTBDLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSzlELE1BQU0sT0FBZ0IsV0FBdUMsU0FBUSxNQUFnQztJQW9CakcsWUFBWSxFQUNSLFNBQVMsRUFDVCxhQUFhLEdBQUcsS0FBSyxFQUNyQixTQUFTLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxHQUtyRDtRQUNHLEtBQUssQ0FBQztZQUNGLFNBQVM7WUFDVCxhQUFhO1lBQ2IsU0FBUztZQUNULGFBQWEsRUFBRTtnQkFDWCxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNwQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDO2FBQ3hDO1lBQ0QsY0FBYyxFQUFFO2dCQUNaLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7YUFDekM7U0FDSixDQUFDLENBQUM7UUF4Q1A7Ozs7O1dBS0c7UUFDSCxZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFFcEI7Ozs7V0FJRztRQUNILFdBQU0sR0FBVyxDQUFDLENBQUM7SUEyQm5CLENBQUM7SUFFRCxZQUFZO1FBQ1IsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsaUJBQWlCLENBQUMsUUFBd0MsRUFBRSxXQUFpQjtRQUN6RSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0oifQ==