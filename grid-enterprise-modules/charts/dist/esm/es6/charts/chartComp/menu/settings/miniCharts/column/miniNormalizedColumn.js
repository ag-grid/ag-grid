import { MiniStackedColumn } from "./miniStackedColumn";
export class MiniNormalizedColumn extends MiniStackedColumn {
    constructor(container, fills, strokes) {
        super(container, fills, strokes, MiniNormalizedColumn.data, [0, 10], "normalizedColumnTooltip");
    }
}
MiniNormalizedColumn.chartType = 'normalizedColumn';
MiniNormalizedColumn.data = [
    [10, 10, 10],
    [6, 7, 8],
    [2, 4, 6]
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaU5vcm1hbGl6ZWRDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L3NldHRpbmdzL21pbmlDaGFydHMvY29sdW1uL21pbmlOb3JtYWxpemVkQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBR3hELE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxpQkFBaUI7SUFTdkQsWUFBWSxTQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFpQjtRQUNsRSxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDcEcsQ0FBQzs7QUFUTSw4QkFBUyxHQUFjLGtCQUFrQixDQUFDO0FBQzFDLHlCQUFJLEdBQUc7SUFDVixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDWixDQUFDIn0=