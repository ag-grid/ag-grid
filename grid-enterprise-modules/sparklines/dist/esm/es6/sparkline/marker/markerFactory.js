import { _Scene } from 'ag-charts-community';
export function getMarker(shape) {
    switch (shape) {
        case 'circle':
            return _Scene.Circle;
        case 'square':
            return _Scene.Square;
        case 'diamond':
            return _Scene.Diamond;
        default:
            return _Scene.Circle;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zcGFya2xpbmUvbWFya2VyL21hcmtlckZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTdDLE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBYTtJQUNuQyxRQUFRLEtBQUssRUFBRTtRQUNYLEtBQUssUUFBUTtZQUNULE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN6QixLQUFLLFFBQVE7WUFDVCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDekIsS0FBSyxTQUFTO1lBQ1YsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQzFCO1lBQ0ksT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO0tBQzVCO0FBQ0wsQ0FBQyJ9