import { convertLegacyColor } from '../../../assets/excelLegacyConvert';
var getBorderColor = function (color) {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000')
            }
        }
    };
};
var borderFactory = {
    getTemplate: function (border) {
        var left = border.left, right = border.right, top = border.top, bottom = border.bottom, diagonal = border.diagonal;
        var leftChildren = left ? [getBorderColor(left.color)] : undefined;
        var rightChildren = right ? [getBorderColor(right.color)] : undefined;
        var topChildren = top ? [getBorderColor(top.color)] : undefined;
        var bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        var diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
        return {
            name: 'border',
            children: [{
                    name: 'left',
                    properties: { rawMap: { style: left && left.style } },
                    children: leftChildren
                }, {
                    name: 'right',
                    properties: { rawMap: { style: right && right.style } },
                    children: rightChildren
                }, {
                    name: 'top',
                    properties: { rawMap: { style: top && top.style } },
                    children: topChildren
                }, {
                    name: 'bottom',
                    properties: { rawMap: { style: bottom && bottom.style } },
                    children: bottomChildren
                }, {
                    name: 'diagonal',
                    properties: { rawMap: { style: diagonal && diagonal.style } },
                    children: diagonalChildren
                }]
        };
    }
};
export default borderFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9ib3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFeEUsSUFBTSxjQUFjLEdBQUcsVUFBQyxLQUFjO0lBQ2xDLE9BQU87UUFDSCxJQUFJLEVBQUUsT0FBTztRQUNiLFVBQVUsRUFBRTtZQUNSLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQzthQUM5QztTQUNKO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQztBQUVGLElBQU0sYUFBYSxHQUF1QjtJQUN0QyxXQUFXLEVBQVgsVUFBWSxNQUFpQjtRQUNsQixJQUFBLElBQUksR0FBa0MsTUFBTSxLQUF4QyxFQUFFLEtBQUssR0FBMkIsTUFBTSxNQUFqQyxFQUFFLEdBQUcsR0FBc0IsTUFBTSxJQUE1QixFQUFFLE1BQU0sR0FBYyxNQUFNLE9BQXBCLEVBQUUsUUFBUSxHQUFJLE1BQU0sU0FBVixDQUFXO1FBQ3BELElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNyRSxJQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEUsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2xFLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMzRSxJQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNqRixPQUFPO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsTUFBTTtvQkFDWixVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDckQsUUFBUSxFQUFFLFlBQVk7aUJBQ3pCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLE9BQU87b0JBQ2IsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ3ZELFFBQVEsRUFBRSxhQUFhO2lCQUMxQixFQUFFO29CQUNDLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUNuRCxRQUFRLEVBQUUsV0FBVztpQkFDeEIsRUFBRTtvQkFDQyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDekQsUUFBUSxFQUFFLGNBQWM7aUJBQzNCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUM3RCxRQUFRLEVBQUUsZ0JBQWdCO2lCQUM3QixDQUFDO1NBQ0wsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==