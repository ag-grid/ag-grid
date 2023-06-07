import { Series, SeriesNodePickMode } from '../series';
export class HierarchySeries extends Series {
    constructor(moduleCtx) {
        super({ moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }
    getLabelData() {
        return [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGllcmFyY2h5U2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9oaWVyYXJjaHkvaGllcmFyY2h5U2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxNQUFNLEVBQTBDLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9GLE1BQU0sT0FBZ0IsZUFBMkMsU0FBUSxNQUFnQztJQUdyRyxZQUFZLFNBQXdCO1FBQ2hDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztDQUNKIn0=