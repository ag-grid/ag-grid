import { convertLegacyColor } from '../../../assets/excelLegacyConvert';
const getBorderColor = (color) => {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000')
            }
        }
    };
};
const borderFactory = {
    getTemplate(border) {
        const { left, right, top, bottom, diagonal } = border;
        const leftChildren = left ? [getBorderColor(left.color)] : undefined;
        const rightChildren = right ? [getBorderColor(right.color)] : undefined;
        const topChildren = top ? [getBorderColor(top.color)] : undefined;
        const bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        const diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9ib3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFeEUsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFjLEVBQWMsRUFBRTtJQUNsRCxPQUFPO1FBQ0gsSUFBSSxFQUFFLE9BQU87UUFDYixVQUFVLEVBQUU7WUFDUixNQUFNLEVBQUU7Z0JBQ0osR0FBRyxFQUFFLGtCQUFrQixDQUFDLEtBQUssSUFBSSxTQUFTLENBQUM7YUFDOUM7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBdUI7SUFDdEMsV0FBVyxDQUFDLE1BQWlCO1FBQ3pCLE1BQU0sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3BELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNyRSxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEUsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2xFLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMzRSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNqRixPQUFPO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsTUFBTTtvQkFDWixVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDckQsUUFBUSxFQUFFLFlBQVk7aUJBQ3pCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLE9BQU87b0JBQ2IsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ3ZELFFBQVEsRUFBRSxhQUFhO2lCQUMxQixFQUFFO29CQUNDLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUNuRCxRQUFRLEVBQUUsV0FBVztpQkFDeEIsRUFBRTtvQkFDQyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFDekQsUUFBUSxFQUFFLGNBQWM7aUJBQzNCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUM3RCxRQUFRLEVBQUUsZ0JBQWdCO2lCQUM3QixDQUFDO1NBQ0wsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==