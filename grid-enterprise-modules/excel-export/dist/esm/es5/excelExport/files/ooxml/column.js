// https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-column-widths
var getExcelCellWidth = function (width) { return Math.ceil((width - 12) / 7 + 1); };
var columnFactory = {
    getTemplate: function (config) {
        var min = config.min, max = config.max, outlineLevel = config.outlineLevel, s = config.s, width = config.width, hidden = config.hidden, bestFit = config.bestFit;
        var excelWidth = 1;
        var customWidth = '0';
        if (width > 1) {
            excelWidth = getExcelCellWidth(width);
            customWidth = '1';
        }
        return {
            name: 'col',
            properties: {
                rawMap: {
                    min: min,
                    max: max,
                    outlineLevel: outlineLevel != null ? outlineLevel : undefined,
                    width: excelWidth,
                    style: s,
                    hidden: hidden ? '1' : '0',
                    bestFit: bestFit ? '1' : '0',
                    customWidth: customWidth
                }
            }
        };
    }
};
export default columnFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL2NvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxxRkFBcUY7QUFDckYsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEtBQWEsSUFBYSxPQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUEvQixDQUErQixDQUFDO0FBRXJGLElBQU0sYUFBYSxHQUF1QjtJQUN0QyxXQUFXLEVBQVgsVUFBWSxNQUFtQjtRQUNuQixJQUFBLEdBQUcsR0FBbUQsTUFBTSxJQUF6RCxFQUFFLEdBQUcsR0FBOEMsTUFBTSxJQUFwRCxFQUFFLFlBQVksR0FBZ0MsTUFBTSxhQUF0QyxFQUFFLENBQUMsR0FBNkIsTUFBTSxFQUFuQyxFQUFFLEtBQUssR0FBc0IsTUFBTSxNQUE1QixFQUFFLE1BQU0sR0FBYyxNQUFNLE9BQXBCLEVBQUUsT0FBTyxHQUFLLE1BQU0sUUFBWCxDQUFZO1FBQ3JFLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFFdEIsSUFBSSxLQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ1osVUFBVSxHQUFHLGlCQUFpQixDQUFDLEtBQU0sQ0FBQyxDQUFDO1lBQ3ZDLFdBQVcsR0FBRyxHQUFHLENBQUM7U0FDckI7UUFFRCxPQUFPO1lBQ0gsSUFBSSxFQUFFLEtBQUs7WUFDWCxVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxHQUFHO29CQUNSLEdBQUcsRUFBRSxHQUFHO29CQUNSLFlBQVksRUFBRSxZQUFZLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQzdELEtBQUssRUFBRSxVQUFVO29CQUNqQixLQUFLLEVBQUUsQ0FBQztvQkFDUixNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUc7b0JBQzFCLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRztvQkFDNUIsV0FBVyxFQUFFLFdBQVc7aUJBQzNCO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLGFBQWEsQ0FBQyJ9