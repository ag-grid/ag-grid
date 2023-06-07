import { MiniChartWithAxes } from "../miniChartWithAxes";
import { createColumnRects } from "../miniChartHelpers";
export class MiniColumn extends MiniChartWithAxes {
    constructor(container, fills, strokes) {
        super(container, "groupedColumnTooltip");
        this.columnData = [2, 3, 4];
        const { root, columnData, size, padding } = this;
        this.columns = createColumnRects({
            stacked: false,
            root,
            data: columnData,
            size,
            padding,
            xScaleDomain: [0, 1, 2],
            yScaleDomain: [0, 4],
            xScalePadding: 0.3
        });
        root.append(this.columns);
        this.updateColors(fills, strokes);
    }
    updateColors(fills, strokes) {
        this.columns.forEach((column, i) => {
            column.fill = fills[i];
            column.stroke = strokes[i];
        });
    }
}
MiniColumn.chartType = 'groupedColumn';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaUNvbHVtbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvc2V0dGluZ3MvbWluaUNoYXJ0cy9jb2x1bW4vbWluaUNvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUd6RCxPQUFPLEVBQUUsaUJBQWlCLEVBQTJCLE1BQU0scUJBQXFCLENBQUM7QUFFakYsTUFBTSxPQUFPLFVBQVcsU0FBUSxpQkFBaUI7SUFPN0MsWUFBWSxTQUFzQixFQUFFLEtBQWUsRUFBRSxPQUFpQjtRQUNsRSxLQUFLLENBQUMsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFIckMsZUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUszQixNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWpELElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUM7WUFDN0IsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJO1lBQ0osSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSTtZQUNKLE9BQU87WUFDUCxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QixZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLGFBQWEsRUFBRSxHQUFHO1NBQ00sQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBZSxFQUFFLE9BQWlCO1FBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBbUIsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7O0FBaENNLG9CQUFTLEdBQWMsZUFBZSxDQUFDIn0=