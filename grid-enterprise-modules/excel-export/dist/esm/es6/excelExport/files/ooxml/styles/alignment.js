import { convertLegacyHorizontalAlignment, convertLegacyVerticalAlignment } from '../../../assets/excelLegacyConvert';
const getReadingOrderId = (readingOrder) => {
    const order = ['Context', 'LeftToRight', 'RightToLeft'];
    const pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};
const alignmentFactory = {
    getTemplate(alignment) {
        const { horizontal, indent, readingOrder, rotate, shrinkToFit, vertical, wrapText } = alignment;
        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && convertLegacyHorizontalAlignment(horizontal),
                    indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit,
                    vertical: vertical && convertLegacyVerticalAlignment(vertical),
                    wrapText
                }
            }
        };
    }
};
export default alignmentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9hbGlnbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFdEgsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLFlBQW9CLEVBQVUsRUFBRTtJQUN2RCxNQUFNLEtBQUssR0FBRyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDeEQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN4QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQXVCO0lBQ3pDLFdBQVcsQ0FBQyxTQUF5QjtRQUNqQyxNQUFNLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLEdBQUcsU0FBUyxDQUFDO1FBRTlGLE9BQU87WUFDSCxJQUFJLEVBQUUsV0FBVztZQUNqQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLFVBQVUsRUFBRSxVQUFVLElBQUksZ0NBQWdDLENBQUMsVUFBVSxDQUFDO29CQUN0RSxNQUFNO29CQUNOLFlBQVksRUFBRSxZQUFZLElBQUksaUJBQWlCLENBQUMsWUFBWSxDQUFDO29CQUM3RCxZQUFZLEVBQUUsTUFBTTtvQkFDcEIsV0FBVztvQkFDWCxRQUFRLEVBQUUsUUFBUSxJQUFJLDhCQUE4QixDQUFDLFFBQVEsQ0FBQztvQkFDOUQsUUFBUTtpQkFDWDthQUNKO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxnQkFBZ0IsQ0FBQyJ9